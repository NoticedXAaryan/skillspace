'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import styles from './Learning.module.css';

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
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <div className={styles.progressBox}>
          <div className={styles.progressHeader}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          {progress === 100 && (
            <div className={styles.achievement}>
              <Trophy size={16} className={styles.trophy} />
              <span>{level} Master Achieved!</span>
            </div>
          )}
        </div>

        <div className={styles.moduleList}>
          {modules.map((m, i) => {
            const isCompleted = completed.includes(m.id);
            return (
              <button 
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`${styles.moduleBtn} ${activeModule === m.id ? styles.moduleActive : ''}`}
              >
                <div 
                  className={styles.checkWrap}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(m.id);
                  }}
                >
                  {isCompleted ? <CheckCircle size={16} className={styles.checkSuccess} /> : <Circle size={16} />}
                </div>
                <span>{i + 1}. {m.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentCard}>
          <div dangerouslySetInnerHTML={{ __html: activeContent || '' }} />
          
          <div className={styles.contentFooter}>
            <button 
              className={`btn ${completed.includes(activeModule) ? 'btnSecondary' : 'btnPrimary'}`}
              onClick={() => toggleComplete(activeModule)}
            >
              {completed.includes(activeModule) ? 'Mark Incomplete' : 'Mark Complete & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
