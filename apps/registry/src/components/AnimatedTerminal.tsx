'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check } from 'lucide-react';
import styles from './AnimatedTerminal.module.css';

const COMMANDS = [
  'skillspace search summarizer',
  'skillspace install summarizer',
  'skillspace run summarizer'
];

export default function AnimatedTerminal() {
  const [cmdIndex, setCmdIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCmdIndex((prev) => (prev + 1) % COMMANDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(COMMANDS[cmdIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.terminalHeader}>
        <div className={styles.dots}>
          <div className={styles.dot} style={{ background: '#FF5F56' }} />
          <div className={styles.dot} style={{ background: '#FFBD2E' }} />
          <div className={styles.dot} style={{ background: '#27C93F' }} />
        </div>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? <Check size={14} className={styles.checkIcon} /> : <Copy size={14} />}
        </button>
      </div>
      <div className={styles.terminalBody}>
        <div className={styles.promptLine}>
          <Terminal size={14} className={styles.promptIcon} />
          <AnimatePresence mode="wait">
            <motion.div
              key={cmdIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={styles.commandText}
            >
              {COMMANDS[cmdIndex]}
            </motion.div>
          </AnimatePresence>
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className={styles.cursor}
          />
        </div>
      </div>
    </div>
  );
}
