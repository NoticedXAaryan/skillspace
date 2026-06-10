"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, TerminalSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const AIChat = ({
  initialMessages = [],
  className,
}: {
  initialMessages?: Message[];
  className?: string;
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages.length > 0 ? initialMessages : [
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm the SkillSpace AI assistant. How can I help you test this package today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "That's an interesting question. Since this is a mock interface for testing the UI, I don't have access to the actual package execution environment yet. But I can tell you that this package looks great!",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={cn("flex flex-col h-[600px] w-full max-w-3xl mx-auto rounded-2xl border border-neutral-800 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <TerminalSquare className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Skill Playground <Sparkles className="w-3 h-3 text-amber-500" />
            </h3>
            <p className="text-xs text-neutral-400">Live test environment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Ready</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-4 max-w-[85%]", message.role === "user" ? "ml-auto flex-row-reverse" : "")}
            >
              <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border", 
                message.role === "user" ? "bg-neutral-800 border-neutral-700" : "bg-amber-500/10 border-amber-500/30 text-amber-500")}>
                {message.role === "user" ? <User className="w-4 h-4 text-neutral-300" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed", 
                message.role === "user" ? "bg-neutral-800 text-neutral-100 rounded-tr-sm" : "bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-tl-sm")}>
                {message.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex gap-4 max-w-[85%]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 rounded-tl-sm flex items-center gap-1.5">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-amber-500/50 rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-amber-500/50 rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-amber-500/50 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message to test this skill..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2.5 bg-white text-black rounded-full hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-3 text-center">
          <p className="text-[10px] text-neutral-600 font-medium">AI can make mistakes. Verify critical workflows before deploying to production.</p>
        </div>
      </div>
    </div>
  );
};
