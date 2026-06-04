import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Zap, Shield, Sparkles, ArrowRight, LinkIcon, Hash, X, Copy, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Landing() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newRoomId, setNewRoomId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomPrivacy, setNewRoomPrivacy] = useState("public");

  const [mockMessages, setMockMessages] = useState([
    { id: 1, text: "Hey team!", sender: "other", time: "10:01 AM", name: "Sarah" },
  ]);

  useEffect(() => {
    const sequence = [
      { delay: 1500, msg: { id: 2, text: "Did everyone see the new UI?", sender: "other", time: "10:02 AM", name: "Sarah" } },
      { delay: 3500, msg: { id: 3, text: "Yes, it looks incredible on dark mode. 🚀", sender: "me", time: "10:03 AM", name: "You" } },
      { delay: 5500, msg: { id: 4, text: "I've added the Aurora palette to the design system.", sender: "other", time: "10:04 AM", name: "John" } }
    ];

    let timeouts = sequence.map(({ delay, msg }) => 
      setTimeout(() => setMockMessages(prev => [...prev, msg]), delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
    setCreateStep(1);
    setNewRoomName("");
    setNewRoomPrivacy("public");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setTimeout(() => {
       setNewRoomId(uuidv4().substring(0, 8));
       setIsCreating(false);
       setCreateStep(2);
    }, 800);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInput.trim()) return;
    
    let roomId = joinInput.trim();
    // Parse URL if provided
    try {
      if (roomId.includes('http')) {
        const url = new URL(roomId);
        const parts = url.pathname.split('/');
        roomId = parts[parts.length - 1];
      } else if (roomId.includes('localhost:') || roomId.includes('.run.app')) { // dirty URL catch
        const parts = roomId.split('/');
        roomId = parts[parts.length - 1];
      }
    } catch (e) {
      // Ignore, treat as raw ID
    }
    
    if (roomId) navigate(`/r/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] relative flex flex-col font-sans overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-pink-900/10 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(168,85,247,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl w-full mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
             <span className="font-bold text-white tracking-tighter text-sm">LU</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">LinkUp</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" className="hidden md:flex text-slate-300 hover:text-white hover:bg-white/5">Sign In</Button>
          <Button onClick={handleOpenCreate} className="bg-white/10 hover:bg-white/20 text-white border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)] border">
            Create Free Room
          </Button>
        </motion.div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 pt-12 pb-24 gap-16 max-w-7xl mx-auto w-full">
        
        {/* Left Content - Hero */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-8"
          >
            <Sparkles size={12} className="text-pink-400" />
            <span>LinkUp Protocol 2.0</span>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed"
          >
            Generate a private, secure chat space in seconds. No tedious onboarding, no mandatory apps. Just share a link and start collaborating.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 px-8 text-base bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_4px_25px_rgba(147,51,234,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 group" 
              onClick={handleOpenCreate} 
              disabled={isCreating}
            >
              {isCreating ? 'Provisioning Environment...' : 'Start Chatting Now'}
              {!isCreating && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setIsJoinModalOpen(true)}
              className="w-full sm:w-auto h-14 px-8 text-base rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
            >
              <LinkIcon className="mr-2 w-4 h-4 text-slate-400" />
              Join Existing Room
            </Button>
          </motion.div>
        </div>

        {/* Right Content - Mock Chat GUI */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="flex-1 w-full max-w-md lg:max-w-xl relative"
        >
          {/* Glassmorphic Container */}
          <div className="bg-[#0c0c0e]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative shadow-purple-900/20">
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-slate-500" />
                <span className="font-bold text-sm text-white tracking-tight">Project Supernova</span>
                <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-bold rounded uppercase tracking-wider">Live</span>
              </div>
              <div className="flex -space-x-2 opacity-80">
                 <div className="w-6 h-6 rounded-full bg-purple-900 border border-[#0c0c0e] flex items-center justify-center text-[8px] text-white">SA</div>
                 <div className="w-6 h-6 rounded-full bg-blue-900 border border-[#0c0c0e] flex items-center justify-center text-[8px] text-white">JD</div>
                 <div className="w-6 h-6 rounded-full bg-slate-800 border border-[#0c0c0e] flex items-center justify-center text-[8px] text-white">Y</div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="p-6 h-[400px] flex flex-col gap-5 overflow-hidden justify-end">
              <AnimatePresence initial={false}>
                {mockMessages.map((msg, i) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`flex gap-3 w-full ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender !== "me" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                        {msg.name.charAt(0)}
                      </div>
                    )}
                    
                    <div className={`flex flex-col gap-1 ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                      <div className="flex items-baseline gap-2">
                         <span className={`text-[11px] font-bold ${msg.sender === "me" ? "text-slate-300" : "text-pink-400"}`}>{msg.name}</span>
                         <span className="text-[9px] text-slate-500">{msg.time}</span>
                      </div>
                      <div className={`
                        p-3 text-sm rounded-2xl max-w-[240px] leading-relaxed
                        ${msg.sender === "me" 
                          ? "bg-purple-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(147,51,234,0.15)]" 
                          : "bg-white/5 border border-white/5 rounded-tl-none text-slate-300"}
                      `}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Fake Input */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl h-12 flex items-center px-4"
              >
                <div className="w-4 h-4 rounded text-slate-500"><Hash size={16}/></div>
                <div className="flex-1 ml-3 h-4 bg-white/10 rounded overflow-hidden">
                   <motion.div 
                      className="h-full bg-white/20"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                   />
                </div>
              </motion.div>
            </div>
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none rounded-3xl" />
          </div>
          
          {/* Floating Accents */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-6 top-12 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl hidden md:flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             <span className="text-xs font-bold text-slate-300 tracking-wider">SECURE</span>
          </motion.div>
          
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -left-8 bottom-24 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl hidden md:flex items-center gap-3">
             <Sparkles size={16} className="text-purple-400" />
             <span className="text-xs font-bold text-slate-300 tracking-wider">AI ASSIST</span>
          </motion.div>
        </motion.div>
      </main>

      {/* Join Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm"
              onClick={() => setIsJoinModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0c0c0e] border border-white/10 p-8 rounded-3xl max-w-md w-full relative z-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] shadow-purple-900/10"
            >
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 mb-4 border border-white/10 shadow-inner">
                  <LinkIcon size={24} />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Join a Room</h2>
                <p className="text-slate-400 text-sm">Enter the room code or paste the full invitation link.</p>
              </div>
              
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <Input 
                    autoFocus
                    placeholder="e.g. X7K9PQ or https://.../r/X7K9PQ" 
                    value={joinInput}
                    onChange={e => setJoinInput(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500 rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-[0_4px_15px_rgba(147,51,234,0.2)] rounded-xl" disabled={!joinInput.trim()}>
                  Join Room
                </Button>
              </form>
            </motion.div>
          </div>
        )}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm"
              onClick={() => { if (!isCreating) setIsCreateModalOpen(false); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0c0c0e] border border-white/10 p-8 rounded-3xl max-w-md w-full relative z-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] shadow-purple-900/10"
            >
              {!isCreating && (
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              )}

              {createStep === 1 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 mb-4 border border-white/10 shadow-inner">
                      <Zap size={24} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Create a Room</h2>
                    <p className="text-slate-400 text-sm">Configure your new secure space.</p>
                  </div>
                  <form onSubmit={handleCreateSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Room Name</label>
                      <Input 
                        autoFocus
                        placeholder="e.g. Project Supernova" 
                        value={newRoomName}
                        onChange={e => setNewRoomName(e.target.value)}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-purple-500 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Privacy</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Public', 'Invite Only', 'Locked'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNewRoomPrivacy(type.toLowerCase())}
                            className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${newRoomPrivacy === type.toLowerCase() ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-[0_4px_15px_rgba(147,51,234,0.2)] rounded-xl mt-2" disabled={isCreating || !newRoomName.trim()}>
                      {isCreating ? 'Provisioning...' : 'Generate URL'}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mb-4 border border-green-500/20 shadow-inner">
                      <Check size={24} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Room Ready</h2>
                    <p className="text-slate-400 text-sm">Share this link or QR code to invite others.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex flex-col items-center">
                    <div className="w-32 h-32 bg-white rounded-lg mb-6 shadow-md flex flex-col justify-between p-2 overflow-hidden relative">
                      <div className="absolute inset-0 grid grid-cols-8 gap-0.5 opacity-90 p-1.5">
                        {Array.from({length: 64}).map((_, i) => (
                           <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-slate-800' : 'bg-transparent'}`} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-white p-1 rounded"><Hash size={16} className="text-purple-600"/></div>
                      </div>
                    </div>
                    <div className="w-full relative">
                       <input 
                         readOnly 
                         value={`${window.location.origin}/r/${newRoomId}`}
                         className="w-full bg-[#070709] border border-white/10 rounded-lg py-3 pl-3 pr-12 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50"
                       />
                       <button 
                         type="button"
                         onClick={() => {
                           navigator.clipboard.writeText(`${window.location.origin}/r/${newRoomId}`);
                         }}
                         className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white bg-white/5 rounded-md hover:bg-white/10 transition-colors"
                       >
                         <Copy size={14} />
                       </button>
                    </div>
                  </div>

                  <Button onClick={() => navigate(`/r/${newRoomId}`)} className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-[0_4px_15px_rgba(147,51,234,0.2)] rounded-xl group overflow-hidden relative">
                    <span className="relative z-10 flex items-center justify-center">
                      Enter Room <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
