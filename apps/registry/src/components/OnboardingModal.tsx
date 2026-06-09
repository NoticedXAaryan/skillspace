'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ONBOARDING_STEPS = 6;

export default function OnboardingModal() {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasSeen = localStorage.getItem('skillspace_onboarding_completed');
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (step < ONBOARDING_STEPS) {
      setStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('skillspace_onboarding_completed', 'true');
    setOpen(false);
    
    const token = localStorage.getItem('skillspace_token');
    if (token) {
      fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ walkthroughCompleted: true })
      }).catch(() => {});
    }
  };

  const TerminalStep = ({ prompt, output }: { prompt: string, output: React.ReactNode }) => (
    <div className="mt-6 overflow-hidden rounded-lg border shadow-sm">
      <div className="flex h-8 items-center gap-1.5 border-b bg-muted px-4">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </div>
      <div className="bg-zinc-950 p-4 text-zinc-300 text-left text-sm font-mono">
        <span className="text-pink-500">$</span> {prompt}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-zinc-400"
        >
          {output}
        </motion.div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to SkillSpace</h2>
            <p className="mt-2 text-muted-foreground">Package AI capabilities like software.</p>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight">What is a Skill?</h2>
            <div className="my-8 flex w-full flex-wrap items-center justify-center gap-2">
              <div className="rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">Prompt</div>
              <div className="text-muted-foreground">+</div>
              <div className="rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">Workflow</div>
              <div className="text-muted-foreground">+</div>
              <div className="rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">Logic</div>
              <div className="text-muted-foreground">+</div>
              <div className="rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">Version</div>
              <div className="font-bold text-foreground">=</div>
              <div className="rounded-md border border-primary bg-primary/10 px-4 py-2 font-bold text-primary shadow-sm">Skill</div>
            </div>
            <p className="text-muted-foreground">A completely reproducible, versioned block of AI logic.</p>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col text-center">
            <h2 className="text-2xl font-bold tracking-tight">Install A Skill</h2>
            <p className="mt-2 text-muted-foreground">Bring powerful AI into your codebase instantly.</p>
            <TerminalStep 
              prompt="skillspace install summarizer"
              output={<>[+] Resolved summarizer@1.0.0<br/>[+] Installed successfully in 0.4s</>}
            />
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col text-center">
            <h2 className="text-2xl font-bold tracking-tight">Run A Skill</h2>
            <p className="mt-2 text-muted-foreground">Execute locally across any LLM safely.</p>
            <TerminalStep 
              prompt="skillspace run summarizer 'Explain physics'"
              output={<>&gt; Executing summarizer via Claude 3.5 Sonnet...<br/>&gt; Quantum physics is the study of matter...</>}
            />
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col text-center">
            <h2 className="text-2xl font-bold tracking-tight">Publish A Skill</h2>
            <p className="mt-2 text-muted-foreground">Share your capabilities with the world.</p>
            <TerminalStep 
              prompt="skillspace publish"
              output={<>[+] Validating skill.yaml... OK<br/>[+] Uploading to registry... OK<br/>🚀 Published @yourname/myskill@1.0.0</>}
            />
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="mb-6 h-20 w-20 text-green-500" />
            <h2 className="text-2xl font-bold tracking-tight">You're Ready!</h2>
            <p className="mt-2 text-muted-foreground">Where would you like to go next?</p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => { router.push('/packages'); finishOnboarding(); }}>Explore Registry</Button>
              <Button variant="outline" className="flex-1" onClick={() => { router.push('/docs'); finishOnboarding(); }}>Read Docs</Button>
              <Button className="flex-1" onClick={() => { router.push('/create'); finishOnboarding(); }}>Create First Skill</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md [&>button:last-child]:hidden">
        <div className="flex justify-center gap-2 pt-2 pb-6">
          {Array.from({ length: ONBOARDING_STEPS }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 w-8 rounded-full transition-colors", 
                i + 1 <= step ? "bg-primary" : "bg-muted"
              )} 
            />
          ))}
        </div>

        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {step !== ONBOARDING_STEPS && (
          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(prev => prev - 1)}>Back</Button>
            ) : (
              <Button variant="ghost" onClick={finishOnboarding}>Skip</Button>
            )}
            <Button onClick={handleNext}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
