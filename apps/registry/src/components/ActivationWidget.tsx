'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronUp, ChevronDown, X } from 'lucide-react';
import styles from './ActivationWidget.module.css';

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
    // Only show if logged in (we assume logged in if token exists in localStorage or auth flow works)
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
    { label: 'Create Account', completed: true }, // they are logged in
    { label: 'Complete Walkthrough', completed: data.walkthroughCompleted },
    { label: 'Install First Skill', completed: data.firstSkillInstalled },
    { label: 'Run First Skill', completed: data.firstSkillRun },
    { label: 'Publish First Skill', completed: data.firstSkillPublished },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className={styles.widgetContainer}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={styles.widgetPanel}
          >
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <h3>Getting Started</h3>
                <span className={styles.progressText}>{Math.round(progress)}% Complete</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                <ChevronDown size={16} />
              </button>
            </div>
            
            <div className={styles.progressBarBg}>
              <motion.div 
                className={styles.progressBarFill} 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>

            <div className={styles.stepsList}>
              {steps.map((step, i) => (
                <div key={i} className={`${styles.stepItem} ${step.completed ? styles.completed : ''}`}>
                  <div className={styles.checkbox}>
                    {step.completed && <Check size={12} className={styles.checkIcon} />}
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
          className={styles.collapsedBtn}
          onClick={() => setOpen(true)}
        >
          <span className={styles.progressRing}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border-strong)" strokeWidth="2" />
              <circle 
                cx="12" cy="12" r="10" fill="none" stroke="var(--success)" strokeWidth="2" 
                strokeDasharray="62.8" strokeDashoffset={62.8 - (62.8 * progress) / 100}
                transform="rotate(-90 12 12)"
              />
            </svg>
          </span>
          Getting Started
          <ChevronUp size={16} />
        </motion.button>
      )}
    </div>
  );
}
