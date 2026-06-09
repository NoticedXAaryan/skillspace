'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, StopCircle, RefreshCw, Terminal, Sparkles, Copy, CheckCircle2 } from 'lucide-react';

interface SkillOption { name: string; description: string; }

export default function PlaygroundClient({ initialSkills }: { initialSkills: SkillOption[] }) {
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSkills[0]?.name || '');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCli, setCopiedCli] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  const handleRun = async () => {
    if (!selectedSkill || !input.trim()) return;
    setStatus('running'); setOutput(''); setErrorMsg('');
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: selectedSkill, input, version: 'latest' }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error((await response.json()).error || 'Server error');
      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          if (chunk.startsWith('data: ')) {
            try {
              const data = JSON.parse(chunk.slice(6));
              if (data.type === 'token') setOutput(p => p + data.content);
              else if (data.type === 'error') throw new Error(data.content);
              else if (data.type === 'done') setStatus('done');
            } catch (e) { /* ignore parse error */ }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
      setStatus('done');
    } catch (err: any) {
      if (err.name === 'AbortError') return setStatus('idle');
      setStatus('error'); setErrorMsg(err.message || 'Execution failed');
    }
  };

  const handleExportCli = () => {
    if (!selectedSkill) return;
    const cmd = `air run ${selectedSkill} --input "${input.replace(/"/g, '\\"')}"`;
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles color="var(--accent)" /> Skill Playground
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Test public skills instantly in our serverless runtime environment. Output is streamed in real-time.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', minHeight: '600px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Select Skill</label>
            <select 
              value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: '#fff', outline: 'none' }}
            >
              <option value="" disabled>Choose a skill...</option>
              {initialSkills.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Input Context</label>
            <textarea
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={selectedSkill ? `Example context for ${selectedSkill}:\n{"text": "your input here"}` : "Choose a skill first to see example input..."}
              style={{ flex: 1, width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: '#fff', resize: 'none', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btnSecondary" onClick={handleExportCli} disabled={!selectedSkill} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              {copiedCli ? <CheckCircle2 size={16} color="var(--success)" /> : <Copy size={16} />} 
              {copiedCli ? 'Copied' : 'Export to CLI'}
            </button>
            
            {status === 'running' ? (
              <button className="btn btnSecondary" onClick={() => abortControllerRef.current?.abort()} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                <StopCircle size={18} /> Stop
              </button>
            ) : (
              <button className="btn btnPrimary" onClick={handleRun} disabled={!selectedSkill || !input.trim()}>
                <Play size={18} /> Run Execution
              </button>
            )}
          </div>
        </div>

        <div className="codeBlock" style={{ display: 'flex', flexDirection: 'column', padding: 0, background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 15, 15, 0.5)' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--error)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Terminal size={14} /> playground-tty
            </div>
            {status === 'running' ? (
              <div style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <RefreshCw size={12} className="animate-spin" /> Streaming
              </div>
            ) : <div style={{ width: '60px' }}/>}
          </div>

          <div ref={outputRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
            {!output && status === 'idle' && !errorMsg && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>
                <Terminal size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                Awaiting execution instructions...
              </div>
            )}
            {output}
            {errorMsg && (
              <div style={{ marginTop: '1rem', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
