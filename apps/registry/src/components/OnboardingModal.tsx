'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Terminal, Box, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './OnboardingModal.module.css';

const ONBOARDING_STEPS = 6;

export default function OnboardingModal() {
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for onboarding state
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      setVisible(true);
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
    localStorage.setItem('hasSeenOnboarding', 'true');
    setVisible(false);
    
    // Attempt to sync with db if logged in
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

  if (!visible) return null;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.iconWrapper}>
              <Package size={48} className={styles.accentIcon} />
            </div>
            <h2>Welcome to SkillSpace</h2>
            <p>Package AI capabilities like software.</p>
          </div>
        );
      case 2:
        return (
          <div className={styles.stepContent}>
            <h2>What is a Skill?</h2>
            <div className={styles.diagram}>
              <div className={styles.node}>Prompt</div>
              <div className={styles.plus}>+</div>
              <div className={styles.node}>Workflow</div>
              <div className={styles.plus}>+</div>
              <div className={styles.node}>Model Logic</div>
              <div className={styles.plus}>+</div>
              <div className={styles.node}>Versioning</div>
              <div className={styles.equals}>=</div>
              <div className={styles.resultNode}>Skill</div>
            </div>
            <p>A completely reproducible, versioned block of AI logic.</p>
          </div>
        );
      case 3:
        return (
          <div className={styles.stepContent}>
            <h2>Install A Skill</h2>
            <p>Bring powerful AI into your codebase instantly.</p>
            <div className={styles.terminal}>
              <div className={styles.termHeader}>
                <div className={styles.dots}>
                  <div className={styles.dot} style={{ background: '#FF5F56' }} />
                  <div className={styles.dot} style={{ background: '#FFBD2E' }} />
                  <div className={styles.dot} style={{ background: '#27C93F' }} />
                </div>
              </div>
              <div className={styles.termBody}>
                <span className={styles.prompt}>$</span> skillspace install summarizer
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={styles.termOutput}
                >
                  <br />[+] Resolved summarizer@1.0.0
                  <br />[+] Installed successfully in 0.4s
                </motion.div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={styles.stepContent}>
            <h2>Run A Skill</h2>
            <p>Execute locally across any LLM safely.</p>
            <div className={styles.terminal}>
              <div className={styles.termHeader}>
                <div className={styles.dots}>
                  <div className={styles.dot} style={{ background: '#FF5F56' }} />
                  <div className={styles.dot} style={{ background: '#FFBD2E' }} />
                  <div className={styles.dot} style={{ background: '#27C93F' }} />
                </div>
              </div>
              <div className={styles.termBody}>
                <span className={styles.prompt}>$</span> skillspace run summarizer "Explain quantum physics"
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={styles.termOutput}
                >
                  <br />&gt; Executing summarizer via Claude 3.5 Sonnet...
                  <br />&gt; Quantum physics is the study of matter and energy at the most fundamental level...
                </motion.div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className={styles.stepContent}>
            <h2>Publish A Skill</h2>
            <p>Share your capabilities with the world.</p>
            <div className={styles.terminal}>
              <div className={styles.termHeader}>
                <div className={styles.dots}>
                  <div className={styles.dot} style={{ background: '#FF5F56' }} />
                  <div className={styles.dot} style={{ background: '#FFBD2E' }} />
                  <div className={styles.dot} style={{ background: '#27C93F' }} />
                </div>
              </div>
              <div className={styles.termBody}>
                <span className={styles.prompt}>$</span> skillspace publish
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={styles.termOutput}
                >
                  <br />[+] Validating skill.yaml... OK
                  <br />[+] Uploading to registry... OK
                  <br />🚀 Published @yourname/myskill@1.0.0
                </motion.div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className={styles.stepContent}>
            <CheckCircle2 size={48} className={styles.successIcon} />
            <h2>You're Ready!</h2>
            <p>Where would you like to go next?</p>
            <div className={styles.pathButtons}>
              <button className="btn btnSecondary" onClick={() => { router.push('/packages'); finishOnboarding(); }}>
                Explore Registry
              </button>
              <button className="btn btnSecondary" onClick={() => { router.push('/docs'); finishOnboarding(); }}>
                Read Docs
              </button>
              <button className="btn btnPrimary" onClick={() => { router.push('/create'); finishOnboarding(); }}>
                Create First Skill
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className={styles.progressHeader}>
          {Array.from({ length: ONBOARDING_STEPS }).map((_, i) => (
            <div key={i} className={`${styles.progressDot} ${i + 1 <= step ? styles.active : ''}`} />
          ))}
        </div>

        <div className={styles.modalBody}>
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

        <div className={styles.modalFooter}>
          {step > 1 ? (
            <button className="btn btnSecondary" onClick={() => setStep(prev => prev - 1)}>
              Back
            </button>
          ) : (
            <button className="btn btnSecondary" onClick={finishOnboarding}>
              Skip
            </button>
          )}
          <button className="btn btnPrimary" onClick={handleNext}>
            {step === ONBOARDING_STEPS ? 'Get Started' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
