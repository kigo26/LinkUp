import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";

// Setup Gemini
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Basic API route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Socket.io Real-time Logic
  const rooms = new Map<string, {
    id: string;
    name: string;
    members: any[];
    history: any[]; // store last 100 messages in memory for simplicity
  }>();

  io.on("connection", (socket) => {
    // console.log("Client connected:", socket.id);

    socket.on("join_room", ({ roomId, user }) => {
      socket.join(roomId);
      
      // Initialize room if not exists
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { id: roomId, name: 'Chat Room', members: [], history: [] });
      }
      
      const room = rooms.get(roomId)!;
      
      // Add user to room
      const existingUser = room.members.find(m => m.id === user.id);
      if (!existingUser) {
        room.members.push({ ...user, socketId: socket.id });
      } else {
        existingUser.socketId = socket.id; // update socket id
      }

      // Mark all past history as seen by this user
      room.history.forEach(msg => {
        if (!msg.seenBy) {
          msg.seenBy = [msg.userId];
        }
        if (!msg.seenBy.includes(user.id)) {
          msg.seenBy.push(user.id);
        }
      });

      // Broadcast user joined
      io.to(roomId).emit("user_joined", room.members);
      
      // Send updated chat history to everyone so they see the updated seenBy checkmarks immediately
      io.to(roomId).emit("room_history", room.history);
      socket.emit("room_info", { name: room.name });
    });

    socket.on("mark_as_read", ({ roomId, userId }) => {
      const room = rooms.get(roomId);
      if (room) {
        let updated = false;
        room.history.forEach(msg => {
          if (!msg.seenBy) {
            msg.seenBy = [msg.userId];
          }
          if (!msg.seenBy.includes(userId)) {
            msg.seenBy.push(userId);
            updated = true;
          }
        });
        if (updated) {
          io.to(roomId).emit("room_history", room.history);
        }
      }
    });

    socket.on("send_message", async ({ roomId, message }) => {
      const room = rooms.get(roomId);
      if (room) {
        message.seenBy = [message.userId];
        room.history.push(message);
        if (room.history.length > 200) room.history.shift(); // keep it bounded
        io.to(roomId).emit("new_message", message);

        // Intercept AI trigger
        if (message.text.startsWith("@AI")) {
          if (!ai) {
            const errorMsg = {
               id: uuidv4(),
               userId: 'ai-assistant',
               text: "I am offline. The server admin hasn't configured GEMINI_API_KEY.",
               timestamp: Date.now(),
               isAiResponse: true,
               seenBy: ['ai-assistant']
            };
            room.history.push(errorMsg);
            io.to(roomId).emit("new_message", errorMsg);
            return;
          }

          try {
             // Create conversation context for the model up to last 20 messages
             const recentMessages = room.history.slice(-20);
             let contextText = recentMessages.map(m => {
               const u = room.members.find(usr => usr.id === m.userId);
               return `${u ? u.name : 'AI'}: ${m.text}`;
             }).join('\n');

             const prompt = `You are the LinkUp AI assistant integrated into a real-time chat room. 
User's prompt directed at you: "${message.text.replace('@AI', '').trim()}"

Recent chat history for context:
${contextText}

Respond clearly, concisely, and playfully in plain text.`;

             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
             });

             if (response.text) {
               const aiMsg = {
                 id: uuidv4(),
                 userId: 'ai-assistant',
                 text: response.text,
                 timestamp: Date.now(),
                 isAiResponse: true
               };
               room.history.push(aiMsg);
               io.to(roomId).emit("new_message", aiMsg);
             }
          } catch (error) {
             console.error("Gemini Error:", error);
          }
        }
      }
    });

    socket.on("disconnect", () => {
      // console.log("Client disconnected:", socket.id);
      // Clean up membership (naive)
      rooms.forEach((room, roomId) => {
        const index = room.members.findIndex(m => m.socketId === socket.id);
        if (index !== -1) {
          room.members.splice(index, 1);
          io.to(roomId).emit("user_left", room.members);
        }
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
