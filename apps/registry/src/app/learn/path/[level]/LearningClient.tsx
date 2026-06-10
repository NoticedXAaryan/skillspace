'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Module {
  id: string;
  title: string;
  content: string;
}

interface LearningClientProps {
  level: string;
  modules: Module[];
}

export default function LearningClient({ level, modules }: LearningClientProps) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeModule, setActiveModule] = useState(modules[0]?.id || '');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`skillspace_learning_${level}`);
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch (e) {}
    }
    setMounted(true);
  }, [level]);

  const toggleComplete = (id: string) => {
    let next: string[];
    if (completed.includes(id)) {
      next = completed.filter(c => c !== id);
    } else {
      next = [...completed, id];
    }
    setCompleted(next);
    localStorage.setItem(`skillspace_learning_${level}`, JSON.stringify(next));
  };

  if (!mounted) return null;

  const progress = Math.round((completed.length / modules.length) * 100);
  const activeContent = modules.find(m => m.id === activeModule)?.content;

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-black">
      {/* Sidebar */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
        <div className="bg-neutral-950 border border-white/10 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-white">Progress</span>
            <span className="text-sm font-mono text-cyan-400">{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-cyan-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          {progress === 100 && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20 animate-in fade-in zoom-in">
              <Trophy className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">{level} Master Achieved!</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {modules.map((m, i) => {
            const isCompleted = completed.includes(m.id);
            return (
              <button 
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`flex items-center gap-4 w-full text-left p-4 rounded-xl transition-all duration-300 ${activeModule === m.id ? 'bg-cyan-500/10 border-l-4 border-cyan-400' : 'hover:bg-white/5 border-l-4 border-transparent'}`}
              >
                <div 
                  className="shrink-0 group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(m.id);
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 transition-colors" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-600 group-hover:text-cyan-400 transition-colors" />
                  )}
                </div>
                <span className={`text-sm font-medium ${activeModule === m.id ? 'text-white' : 'text-neutral-400'}`}>
                  {i + 1}. {m.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col bg-neutral-950/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-8 md:p-12 prose prose-invert prose-cyan max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-white/10">
          <div dangerouslySetInnerHTML={{ __html: activeContent || '' }} />
        </div>
        
        <div className="mt-auto p-6 md:px-12 bg-neutral-950 border-t border-white/10 flex justify-end">
          <Button 
            className={completed.includes(activeModule) ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-cyan-500 hover:bg-cyan-400 text-black font-bold"}
            onClick={() => toggleComplete(activeModule)}
          >
            {completed.includes(activeModule) ? 'Mark Incomplete' : 'Mark Complete & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
