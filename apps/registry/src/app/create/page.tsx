'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, GitBranch, Play, ChevronRight, CheckCircle2, Box, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CreateWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  // Form State
  const [type, setType] = useState('skill');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [prompt, setPrompt] = useState('You are a helpful AI assistant. Summarize the following text:\n\n{{input}}');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleTest = () => {
    setTestOutput('Running...');
    setTimeout(() => {
      setTestOutput(`Simulated Output for: "${testInput}"\n\nThis is a mock response from the Test Environment!`);
    }, 1000);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate API request
    setTimeout(async () => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success('Achievement Unlocked: First Skill Published!');
      
      // Update activation state (mocked)
      const token = localStorage.getItem('skillspace_token');
      if (token) {
        await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ firstSkillPublished: true })
        }).catch(() => {});
      }

      setIsPublishing(false);
      setStep(6);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 bg-black">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-white tracking-tight px-4">Create</h3>
          <ul className="flex flex-col gap-1 relative before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/10 pl-4">
            {[
              { num: 1, label: 'Type' },
              { num: 2, label: 'Basic Info' },
              { num: 3, label: 'Prompt' },
              { num: 4, label: 'Sandbox' },
              { num: 5, label: 'Publish' }
            ].map((s) => (
              <li key={s.num} className={`relative flex items-center gap-4 py-2 px-3 rounded-lg transition-colors ${step === s.num ? 'text-cyan-400 bg-cyan-400/10' : step > s.num ? 'text-neutral-400 hover:text-white' : 'text-neutral-600'}`}>
                <div className={`w-3 h-3 rounded-full shrink-0 z-10 transition-colors ${step >= s.num ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-neutral-800 border border-white/20'}`} />
                <span className="font-medium text-sm">{s.num}. {s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Area */}
        <div className="flex-1 min-w-0 flex flex-col bg-neutral-950/50 border border-white/10 rounded-2xl p-6 md:p-10 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_70%)] pointer-events-none" />
          
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {step === 1 && (
                  <div className="flex flex-col h-full justify-center">
                    <h2 className="text-2xl font-bold text-white mb-2">What are you building?</h2>
                    <p className="text-neutral-400 mb-8">Select the type of capability to package.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'skill', icon: Package, title: 'Skill', desc: 'A single, reproducible AI prompt or instruction block.' },
                        { id: 'agent', icon: Box, title: 'Agent', desc: 'An autonomous loop capable of tool use.' },
                        { id: 'workflow', icon: GitBranch, title: 'Workflow', desc: 'A multi-step DAG of skills and agents combined.' }
                      ].map(t => (
                        <div 
                          key={t.id}
                          className={`flex flex-col items-center text-center p-6 rounded-xl border cursor-pointer transition-all duration-300 ${type === t.id ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-white/10 bg-neutral-900/50 hover:border-white/30 hover:bg-neutral-800'}`}
                          onClick={() => setType(t.id)}
                        >
                          <t.icon className={`w-8 h-8 mb-4 ${type === t.id ? 'text-cyan-400' : 'text-neutral-500'}`} />
                          <h4 className="font-bold text-white mb-2">{t.title}</h4>
                          <p className="text-sm text-neutral-400">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                    <p className="text-neutral-400 mb-8">Give your capability a name and description.</p>
                    
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Package Name</label>
                        <Input 
                          placeholder="e.g. text-summarizer" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          className="bg-neutral-900/50 border-white/10 text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Description</label>
                        <Textarea 
                          placeholder="What does this do?" 
                          rows={3}
                          value={desc} 
                          onChange={e => setDesc(e.target.value)} 
                          className="bg-neutral-900/50 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-white mb-2">Prompt Builder</h2>
                    <p className="text-neutral-400 mb-6">Write the core prompt. Use <code className="text-cyan-400 bg-cyan-400/10 px-1 py-0.5 rounded">{"{{var}}"}</code> for inputs.</p>
                    
                    <Textarea 
                      className="flex-1 min-h-[300px] bg-neutral-900/80 border-white/10 text-emerald-400 font-mono text-sm leading-relaxed p-4"
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-white mb-2">Sandbox Test Environment</h2>
                    <p className="text-neutral-400 mb-6">Test your logic before publishing.</p>
                    
                    <div className="flex flex-col gap-6 flex-1">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Input Variables</label>
                        <Textarea 
                          rows={3} 
                          placeholder='{"input": "Text to summarize..."}'
                          value={testInput}
                          onChange={e => setTestInput(e.target.value)}
                          className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
                        />
                        <div className="mt-2">
                          <Button variant="secondary" onClick={handleTest} className="bg-white/10 text-white hover:bg-white/20">
                            <Play className="w-4 h-4 mr-2" /> Run Test
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-medium text-white">Execution Output</label>
                        <div className="flex-1 min-h-[150px] bg-black border border-white/10 rounded-md p-4 font-mono text-sm text-neutral-300 overflow-y-auto whitespace-pre-wrap">
                          {testOutput || 'Output will appear here...'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to Publish</h2>
                    <p className="text-neutral-400 mb-8">Set your version and ship it to the registry.</p>
                    
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Semantic Version</label>
                        <Input 
                          value={version} 
                          onChange={e => setVersion(e.target.value)} 
                          className="bg-neutral-900/50 border-white/10 text-white font-mono"
                        />
                        <p className="text-xs text-neutral-500">Major.Minor.Patch (e.g. 1.0.0)</p>
                      </div>

                      <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-neutral-400">Name</span>
                          <span className="font-bold text-white">{name || 'untitled'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-neutral-400">Type</span>
                          <span className="font-bold text-white capitalize">{type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Version</span>
                          <span className="font-mono text-cyan-400">{version}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Successfully Published!</h2>
                    <p className="text-neutral-400 mb-8">Your capability is now live on SkillSpace.</p>
                    
                    <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-cyan-400 text-sm mb-8 w-full max-w-md">
                      skillspace install {name || 'untitled'}
                    </div>

                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-6 rounded-full" onClick={() => router.push(`/packages`)}>
                      View in Registry
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {step < 6 && (
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <Button variant="ghost" onClick={handleBack} className="text-neutral-400 hover:text-white">
                  Back
                </Button>
              ) : <div />}
              
              {step === 5 ? (
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold" onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? 'Publishing...' : 'Publish Skill'}
                </Button>
              ) : (
                <Button className="bg-white text-black hover:bg-neutral-200 font-semibold" onClick={handleNext}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
