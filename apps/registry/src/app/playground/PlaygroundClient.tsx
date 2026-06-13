'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, Box } from 'lucide-react';
import { AIChat } from '@/components/ui/ai-chat';

interface SkillOption { name: string; description: string; }

export default function PlaygroundClient({ initialSkills }: { initialSkills: SkillOption[] }) {
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSkills[0]?.name || '');
  const [copiedCli, setCopiedCli] = useState(false);

  const handleExportCli = () => {
    if (!selectedSkill) return;
    const cmd = `skillspace run ${selectedSkill} --interactive`;
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-950 p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500" /> Skill Playground
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            Test public conversational skills interactively before installing them locally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Sidebar Config */}
          <div className="flex flex-col gap-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-neutral-400" /> Skill Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Select Active Skill</label>
                  <select 
                    value={selectedSkill} 
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                  >
                    <option value="" disabled>Choose a skill...</option>
                    {initialSkills.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                    Testing {selectedSkill || "a skill"} in the cloud sandbox. API limits apply. For unrestricted access, run it locally via CLI.
                  </p>
                  <button 
                    onClick={handleExportCli} 
                    disabled={!selectedSkill} 
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 font-medium"
                  >
                    {copiedCli ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />} 
                    {copiedCli ? 'Copied to Clipboard' : 'Export to CLI'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="relative">
            {selectedSkill ? (
              <AIChat 
                initialMessages={[
                  {
                    id: 'welcome',
                    role: 'assistant',
                    content: `Hello! I'm the execution environment for ${selectedSkill}. You can interact with me here to test the workflows.`,
                  }
                ]}
              />
            ) : (
              <div className="h-[600px] w-full rounded-2xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-neutral-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a Skill to Begin</h3>
                <p className="text-neutral-500 max-w-sm">Choose a skill from the configuration panel to start an interactive test session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
