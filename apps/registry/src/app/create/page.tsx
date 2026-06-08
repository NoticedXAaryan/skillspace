'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, GitBranch, Play, ChevronRight, CheckCircle2, Box, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import styles from './CreateWizard.module.css';

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
    <div className="container" style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className={styles.wizardContainer}>
        
        <div className={styles.sidebar}>
          <h3>Create</h3>
          <ul className={styles.stepper}>
            <li className={step >= 1 ? styles.activeStep : ''}>1. Type</li>
            <li className={step >= 2 ? styles.activeStep : ''}>2. Basic Info</li>
            <li className={step >= 3 ? styles.activeStep : ''}>3. Prompt</li>
            <li className={step >= 4 ? styles.activeStep : ''}>4. Sandbox</li>
            <li className={step >= 5 ? styles.activeStep : ''}>5. Publish</li>
          </ul>
        </div>

        <div className={styles.mainArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.stepWrapper}
            >
              {step === 1 && (
                <div className={styles.stepCard}>
                  <h2>What are you building?</h2>
                  <p className={styles.subtitle}>Select the type of capability to package.</p>
                  
                  <div className={styles.cardsGrid}>
                    <div 
                      className={`${styles.typeCard} ${type === 'skill' ? styles.selected : ''}`}
                      onClick={() => setType('skill')}
                    >
                      <Package size={32} className={styles.icon} />
                      <h4>Skill</h4>
                      <p>A single, reproducible AI prompt or instruction block.</p>
                    </div>
                    <div 
                      className={`${styles.typeCard} ${type === 'agent' ? styles.selected : ''}`}
                      onClick={() => setType('agent')}
                    >
                      <Box size={32} className={styles.icon} />
                      <h4>Agent</h4>
                      <p>An autonomous loop capable of tool use.</p>
                    </div>
                    <div 
                      className={`${styles.typeCard} ${type === 'workflow' ? styles.selected : ''}`}
                      onClick={() => setType('workflow')}
                    >
                      <GitBranch size={32} className={styles.icon} />
                      <h4>Workflow</h4>
                      <p>A multi-step DAG of skills and agents combined.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={styles.stepCard}>
                  <h2>Basic Information</h2>
                  <p className={styles.subtitle}>Give your capability a name and description.</p>
                  
                  <div className={styles.formGroup}>
                    <label>Package Name</label>
                    <input 
                      className="input" 
                      placeholder="e.g. text-summarizer" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea 
                      className="input" 
                      placeholder="What does this do?" 
                      rows={3}
                      value={desc} 
                      onChange={e => setDesc(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={styles.stepCard}>
                  <h2>Prompt Builder</h2>
                  <p className={styles.subtitle}>Write the core prompt. Use {"{{var}}"} for inputs.</p>
                  
                  <textarea 
                    className={`input ${styles.codeEditor}`}
                    rows={12}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  />
                </div>
              )}

              {step === 4 && (
                <div className={styles.stepCard}>
                  <h2>Sandbox Test Environment</h2>
                  <p className={styles.subtitle}>Test your logic before publishing.</p>
                  
                  <div className={styles.sandbox}>
                    <div className={styles.sandInput}>
                      <label>Input Variables</label>
                      <textarea 
                        className="input" 
                        rows={3} 
                        placeholder='{"input": "Text to summarize..."}'
                        value={testInput}
                        onChange={e => setTestInput(e.target.value)}
                      />
                      <button className="btn btnSecondary" onClick={handleTest} style={{ marginTop: '10px' }}>
                        <Play size={14} /> Run Test
                      </button>
                    </div>
                    <div className={styles.sandOutput}>
                      <label>Execution Output</label>
                      <div className={styles.terminalOutput}>
                        {testOutput || 'Output will appear here...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className={styles.stepCard}>
                  <h2>Ready to Publish</h2>
                  <p className={styles.subtitle}>Set your version and ship it to the registry.</p>
                  
                  <div className={styles.formGroup}>
                    <label>Semantic Version</label>
                    <input 
                      className="input" 
                      value={version} 
                      onChange={e => setVersion(e.target.value)} 
                    />
                    <p className={styles.helperText}>Major.Minor.Patch (e.g. 1.0.0)</p>
                  </div>

                  <div className={styles.summaryBox}>
                    <p><strong>Name:</strong> {name || 'untitled'}</p>
                    <p><strong>Type:</strong> {type}</p>
                    <p><strong>Version:</strong> {version}</p>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className={styles.stepCard} style={{ textAlign: 'center', padding: '60px 0' }}>
                  <CheckCircle2 size={64} className={styles.successIcon} />
                  <h2>Successfully Published!</h2>
                  <p className={styles.subtitle}>Your capability is now live on SkillSpace.</p>
                  
                  <div className={styles.installSnippet}>
                    <code>skillspace install {name || 'untitled'}</code>
                  </div>

                  <div className={styles.actions} style={{ justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn btnPrimary" onClick={() => router.push(`/packages`)}>
                      View in Registry
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 6 && (
            <div className={styles.footer}>
              {step > 1 ? (
                <button className="btn btnSecondary" onClick={handleBack}>Back</button>
              ) : <div />}
              
              {step === 5 ? (
                <button className="btn btnPrimary" onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? 'Publishing...' : 'Publish Skill'}
                </button>
              ) : (
                <button className="btn btnPrimary" onClick={handleNext}>
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
