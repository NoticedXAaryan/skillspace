'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2, StopCircle, RefreshCw, Terminal, Sparkles } from 'lucide-react';

interface SkillOption {
  name: string;
  description: string;
}

export default function PlaygroundClient({ initialSkills }: { initialSkills: SkillOption[] }) {
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSkills[0]?.name || '');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const outputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleRun = async () => {
    if (!selectedSkill || !input.trim()) return;
    
    setStatus('running');
    setOutput('');
    setErrorMsg('');
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: selectedSkill, input, version: 'latest' }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages separated by \n\n
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          
          if (chunk.startsWith('data: ')) {
            const dataStr = chunk.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'token') {
                setOutput(prev => prev + data.content);
              } else if (data.type === 'error') {
                throw new Error(data.content);
              } else if (data.type === 'done') {
                setStatus('done');
              }
            } catch (e) {
              console.error('Error parsing SSE chunk', e);
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
      setStatus('done');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      setStatus('error');
      setErrorMsg(err.message || 'Execution failed');
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 p-6 font-sans text-zinc-100 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-pink-500" />
            Skill Playground
          </h1>
          <p className="text-zinc-400 mt-2 text-sm max-w-xl">
            Test public skills instantly in our serverless runtime environment. Output is streamed in real-time.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[600px]">
        {/* Left Pane - Configuration & Input */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-xl rounded-2xl p-6 flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="mb-6 relative z-10">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Select Skill</label>
            <select 
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
            >
              <option value="" disabled>Choose a skill...</option>
              {initialSkills.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            {selectedSkill && (
              <p className="mt-2 text-xs text-zinc-500">
                {initialSkills.find(s => s.name === selectedSkill)?.description}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col relative z-10">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Input Context</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Provide the input parameters or context the skill needs..."
              className="flex-1 w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 resize-none font-mono text-sm"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 relative z-10">
            {status === 'running' ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-300 font-medium"
              >
                <StopCircle className="w-5 h-5" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleRun}
                disabled={!selectedSkill || !input.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-5 h-5" />
                Run Execution
              </button>
            )}
          </div>
        </div>

        {/* Right Pane - Terminal Output */}
        <div className="bg-black/90 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden font-mono">
          <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-sm flex-1">
              <Terminal className="w-4 h-4" />
              <span>playground-tty</span>
            </div>
            {status === 'running' && (
              <div className="flex items-center gap-2 text-purple-400 text-xs font-sans tracking-wide uppercase animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Streaming
              </div>
            )}
          </div>

          <div 
            ref={outputRef}
            className="flex-1 p-6 overflow-y-auto text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap"
          >
            {output === '' && status === 'idle' && !errorMsg && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 select-none">
                <Terminal className="w-12 h-12 mb-4 opacity-20" />
                <p>Awaiting execution instructions...</p>
              </div>
            )}
            
            {output}
            
            {status === 'running' && (
              <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
            )}
            
            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-sans flex items-start gap-3">
                <div className="p-1 bg-red-500/20 rounded-full">
                  <StopCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Execution Error</h4>
                  <p className="opacity-90">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
