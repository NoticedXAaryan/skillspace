"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, TerminalSquare, AlertCircle } from "lucide-react";
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
  skillName,
}: {
  initialMessages?: Message[];
  className?: string;
  skillName?: string;
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
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    if (!skillName) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "No skill selected. Choose a skill from the panel to start testing.",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      return;
    }

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = { id: assistantId, role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const res = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, input }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "token" && event.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + event.content }
                    : m
                )
              );
            } else if (event.type === "error") {
              setError(event.content || "Execution failed");
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content || `Error: ${event.content}` }
                    : m
                )
              );
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      const errMsg = err.message || "Something went wrong";
      setError(errMsg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId && !m.content
            ? { ...m, content: `Error: ${errMsg}` }
            : m
        )
      );
    } finally {
      setIsTyping(false);
      abortRef.current = null;
    }
  }, [input, isTyping, skillName]);

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
            <p className="text-xs text-neutral-400">
              {skillName ? `Running: ${skillName}` : 'Select a skill to begin'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
            isTyping
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-emerald-500/10 border-emerald-500/20"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              isTyping ? "bg-amber-500" : "bg-emerald-500"
            )} />
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isTyping ? "text-amber-500" : "text-emerald-500"
            )}>
              {isTyping ? "Running" : "Ready"}
            </span>
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
              <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap", 
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

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto shrink-0 hover:text-red-300">Dismiss</button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={skillName ? `Send a message to ${skillName}...` : "Select a skill first..."}
            disabled={!skillName}
            className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all placeholder:text-neutral-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || !skillName}
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
