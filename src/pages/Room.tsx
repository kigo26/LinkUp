import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "motion/react";
import { Send, Users, Link as LinkIcon, AlertCircle, Copy, Sparkles, Hash, PanelRightClose, PanelRightOpen, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { useSocket } from "../components/SocketProvider";

interface User {
  id: string;
  name: string;
  color: string;
  socketId?: string;
}

interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
  isAiResponse?: boolean;
}

const COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", 
  "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
  "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected: isSocketConnected } = useSocket();
  
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [roomName, setRoomName] = useState("Loading room...");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [joinName, setJoinName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  // Scroll to bottom
  useEffect(() => {
    scrollToBottom("smooth");
    const timer = setTimeout(() => scrollToBottom("smooth"), 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Handle Socket Init
  useEffect(() => {
    if (!user || !roomId || !socket) return;

    if (isSocketConnected) {
      setIsConnected(true);
      socket.emit("join_room", { roomId, user });
    }

    const onConnect = () => {
      setIsConnected(true);
      socket.emit("join_room", { roomId, user });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onRoomHistory = (history: Message[]) => {
      setMessages(history);
    };

    const onRoomInfo = (info: { name: string }) => {
      setRoomName(info.name);
    };

    const onUserJoined = (currentMembers: User[]) => {
      setMembers(currentMembers);
    };

    const onUserLeft = (currentMembers: User[]) => {
      setMembers(currentMembers);
    };

    const onNewMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    };

    if (!isSocketConnected) {
      socket.on("connect", onConnect);
    }
    
    socket.on("disconnect", onDisconnect);
    socket.on("room_history", onRoomHistory);
    socket.on("room_info", onRoomInfo);
    socket.on("user_joined", onUserJoined);
    socket.on("user_left", onUserLeft);
    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_history", onRoomHistory);
      socket.off("room_info", onRoomInfo);
      socket.off("user_joined", onUserJoined);
      socket.off("user_left", onUserLeft);
      socket.off("new_message", onNewMessage);
    };
  }, [roomId, user, socket, isSocketConnected]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim()) return;
    
    const newUser = {
      id: uuidv4(),
      name: joinName.trim(),
      color: getRandomColor(),
    };
    
    setUser(newUser);
    setShowJoinModal(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !isConnected || !socket) return;

    const newMsg: Message = {
      id: uuidv4(),
      userId: user.id,
      text: inputValue.trim(),
      timestamp: Date.now(),
    };

    socket.emit("send_message", { roomId, message: newMsg });
    setInputValue("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // basic feedback could go here
  };

  // Join Modal
  if (showJoinModal) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0c0c0e] border border-white/5 p-8 rounded-2xl max-w-md w-full relative z-10 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 mb-4 border border-white/10">
              <Hash size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">Join Room</h1>
            <p className="text-slate-400 text-sm">Enter a nickname to join this LinkUp room.</p>
          </div>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Input 
                autoFocus
                placeholder="What should we call you?" 
                value={joinName}
                onChange={e => setJoinName(e.target.value)}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white border-0" disabled={!joinName.trim()}>
              Enter Room
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#0a0a0c] text-slate-100 flex overflow-hidden font-sans">
      
      {/* Sidebar - Rooms / Main Nav */}
      <div className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-8 bg-[#070709] shrink-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 hover:opacity-90">
          <span className="font-bold text-white tracking-tighter text-sm">LU</span>
        </Button>
        <div className="flex flex-col gap-6 w-full items-center">
          <div className="p-3 bg-white/10 rounded-2xl text-white relative flex items-center justify-center cursor-pointer">
            <Hash size={24} />
            <div className="absolute -right-[17px] top-1/2 -translate-y-1/2 w-[3px] h-8 bg-purple-500 rounded-l-full" />
          </div>
          <button className="p-3 text-slate-500 hover:text-white transition-colors" onClick={copyLink}>
            <Copy size={24} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0c] relative min-w-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(168,85,247,0.08)_0%,_transparent_50%)] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 z-10 bg-transparent shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Hash size={18} className="text-slate-500" />
              {roomId}
            </h2>
            {!isConnected ? (
               <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                 <AlertCircle size={10} /> Connecting
               </span>
            ) : (
               <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Live</span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={copyLink} className="hidden sm:flex px-4 py-1.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors h-auto">
              <LinkIcon size={14} className="mr-2" />
              Share Link
            </Button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-white flex items-center">
              {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </button>
          </div>
        </header>

        {/* Message List */}
        <div ref={scrollContainerRef} className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-700">
                <Sparkles size={32} />
              </div>
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const msgUser = msg.userId === 'ai-assistant' 
                ? { name: 'LinkUp AI', color: 'bg-indigo-500', isAi: true } 
                : members.find(m => m.id === msg.userId) || { name: 'Unknown User', color: 'bg-slate-500' };
              
              const isMe = msg.userId === user?.id;
              const showHeader = idx === 0 || messages[idx - 1].userId !== msg.userId || (msg.timestamp - messages[idx - 1].timestamp > 300000);

              return (
                <div key={msg.id} className={cn("flex gap-4 w-full", isMe ? "justify-end" : "justify-start")}>
                  {!isMe && (
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {showHeader ? (
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", msgUser.isAi ? "bg-gradient-to-tr from-pink-500 to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : msgUser.color)}>
                          {msgUser.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-10 h-10" />
                      )}
                    </div>
                  )}
                  
                  <div className={cn("flex-1 space-y-1 flex flex-col", isMe ? "items-end" : "items-start")}>
                    {showHeader && (
                       <div className="flex items-baseline gap-2">
                         <span className={cn("text-sm font-bold", isMe ? "" : (msgUser.isAi ? "text-pink-400" : "text-white"))}>
                           {msgUser.name}
                         </span>
                         <span className="text-[10px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    )}
                    <div className={cn(
                      "p-4 rounded-2xl max-w-lg text-left flex flex-col gap-1",
                      isMe ? "bg-purple-600 border border-purple-500/50 rounded-tr-none shadow-[0_4px_20px_rgba(147,51,234,0.15)] text-white" : "bg-white/5 border border-white/5 rounded-tl-none",
                      msgUser.isAi && "bg-white/5 border border-white/5 border-l-pink-500/50 !rounded-tl-none"
                    )}>
                      <p className={cn("text-sm leading-relaxed break-words", isMe ? "text-white" : "text-slate-300")}>{msg.text}</p>
                      <span className={cn("text-[9px] self-end uppercase select-none opacity-85 mt-1 font-medium", isMe ? "text-purple-200" : "text-slate-500")}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {isMe && (
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {showHeader ? (
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800")}>
                          {msgUser.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-10 h-10" />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <footer className="p-8 bg-gradient-to-t from-[#070709] to-transparent z-10 mt-auto shrink-0 w-full">
          <form onSubmit={handleSendMessage} className="relative w-full max-w-5xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-500 pointer-events-none">
              <Hash size={20} />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Message #${roomId}...`}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-16 text-sm focus:outline-none focus:border-purple-500 transition-colors text-slate-100 placeholder:text-slate-500"
              autoComplete="off"
              disabled={!isConnected}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <button 
                type="submit" 
                disabled={!inputValue.trim() || !isConnected}
                className={cn("p-2 rounded-lg transition-all", inputValue.trim() ? "bg-purple-600 text-white" : "bg-white/10 text-slate-500")}
              >
                <Send size={16} className={inputValue.trim() ? "translate-x-[1px] -translate-y-[1px]" : ""} />
              </button>
            </div>
          </form>
        </footer>
      </div>

      {/* Right Sidebar - Members */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="border-l border-white/5 bg-[#0c0c0e] flex flex-col overflow-hidden hidden sm:flex shrink-0 z-20"
          >
            <div className="p-6 border-b border-white/5 w-full flex-shrink-0 flex items-center justify-between group">
              <span className="font-medium text-sm text-slate-300">Room Members ({members.length})</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto w-full w-[280px]">
              <div className="space-y-1">
                {members.map(m => (
                  <div key={m.id} className="p-3 hover:bg-white/5 rounded-lg flex items-center gap-3 group transition-colors">
                    <div className={cn("w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-mono text-white", m.color)}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium group-hover:text-white truncate text-slate-300">
                        {m.name} {m.id === user?.id && "(You)"}
                      </p>
                      <p className="text-[11px] text-green-400 flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-[#09090b] border-t border-white/5 shrink-0">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Invitations</p>
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                <p className="text-[11px] text-purple-200 mb-2">Invite link active</p>
                <code className="block text-xs bg-black/50 p-2 rounded mb-3 text-slate-300 border border-white/5 truncate">{window.location.host}/r/{roomId}</code>
                <button onClick={copyLink} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-md transition-all">Copy URL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
