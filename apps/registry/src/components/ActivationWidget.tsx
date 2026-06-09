'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingState {
  walkthroughCompleted: boolean;
  firstSkillInstalled: boolean;
  firstSkillRun: boolean;
  firstSkillPublished: boolean;
  onboardingCompleted: boolean;
}

export default function ActivationWidget() {
  const [data, setData] = useState<OnboardingState | null>(null);
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('skillspace_token');
    if (!token) return;

    fetch('/api/onboarding', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.data && !res.data.onboardingCompleted) {
          setData(res.data);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!visible || !data) return null;

  const steps = [
    { label: 'Create Account', completed: true },
    { label: 'Complete Walkthrough', completed: data.walkthroughCompleted },
    { label: 'Install First Skill', completed: data.firstSkillInstalled },
    { label: 'Run First Skill', completed: data.firstSkillRun },
    { label: 'Publish First Skill', completed: data.firstSkillPublished },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 overflow-hidden rounded-lg border bg-background/85 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-sm font-semibold">Getting Started</h3>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <button 
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" 
                onClick={() => setOpen(false)}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            <div className="h-0.5 w-full bg-muted">
              <motion.div 
                className="h-full bg-green-500" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="flex flex-col gap-3 p-4">
              {steps.map((step, i) => (
                <div key={i} className={cn("flex items-center gap-3 text-sm transition-colors", step.completed ? "text-foreground" : "text-muted-foreground")}>
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                    step.completed ? "border-green-500 bg-green-500 text-background" : "border-muted-foreground"
                  )}>
                    {step.completed && <Check className="h-3 w-3" />}
                  </div>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-full border bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-xl transition-all hover:border-primary hover:bg-muted"
          onClick={() => setOpen(true)}
        >
          <span className="flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" className="rotate-[-90deg]">
              <circle cx="12" cy="12" r="10" fill="none" className="stroke-muted" strokeWidth="2" />
              <circle 
                cx="12" cy="12" r="10" fill="none" className="stroke-green-500" strokeWidth="2" 
                strokeDasharray="62.8" strokeDashoffset={62.8 - (62.8 * progress) / 100}
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
          </span>
          Getting Started
          <ChevronUp className="h-4 w-4" />
        </motion.button>
      )}
    </div>
  );
}
