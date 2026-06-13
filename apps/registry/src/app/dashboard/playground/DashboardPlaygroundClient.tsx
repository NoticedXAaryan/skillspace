'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, Box, User, Globe } from 'lucide-react';
import { AIChat } from '@/components/ui/ai-chat';

interface SkillOption { name: string; description: string; }

export default function DashboardPlaygroundClient({
  initialSkills,
  userSkills,
}: {
  initialSkills: SkillOption[];
  userSkills: SkillOption[];
}) {
  const [selectedSkill, setSelectedSkill] = useState<string>(userSkills[0]?.name || initialSkills[0]?.name || '');
  const [copiedCli, setCopiedCli] = useState(false);
  const [tab, setTab] = useState<'my' | 'public'>(userSkills.length > 0 ? 'my' : 'public');

  const skills = tab === 'my' ? userSkills : initialSkills;

  const handleExportCli = () => {
    if (!selectedSkill) return;
    const cmd = `skillspace run ${selectedSkill} --interactive`;
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-500" /> Playground
        </h1>
        <p className="text-neutral-400 mt-1">Test skills interactively before installing them locally.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar Config */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Box className="w-4 h-4 text-neutral-400" /> Skill Selection
            </h2>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-neutral-900 rounded-lg mb-4">
              <button
                onClick={() => { setTab('my'); setSelectedSkill(userSkills[0]?.name || ''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === 'my' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" /> My Skills
              </button>
              <button
                onClick={() => { setTab('public'); setSelectedSkill(initialSkills[0]?.name || ''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === 'public' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" /> Public
              </button>
            </div>

            {/* Skill List */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {skills.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">
                  {tab === 'my' ? 'No published skills yet.' : 'No public skills available.'}
                </p>
              ) : (
                skills.map(s => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSkill(s.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSkill === s.name
                        ? 'bg-white/10 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <p className="font-mono text-xs truncate">{s.name}</p>
                    {s.description && (
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">{s.description}</p>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Export */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-neutral-500 mb-3 leading-relaxed">
                Testing in cloud sandbox. For full access, run locally via CLI.
              </p>
              <button
                onClick={handleExportCli}
                disabled={!selectedSkill}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-40 font-medium text-sm"
              >
                {copiedCli ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copiedCli ? 'Copied!' : 'Copy CLI Command'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div>
          {selectedSkill ? (
            <AIChat
              skillName={selectedSkill}
              initialMessages={[
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: `Ready to test **${selectedSkill}**. Send a message to start the session.`,
                }
              ]}
            />
          ) : (
            <div className="h-[500px] w-full rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-neutral-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Select a Skill</h3>
              <p className="text-neutral-500 text-sm max-w-xs">Choose a skill from the panel to start testing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
