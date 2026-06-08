'use client';

import { useState } from 'react';
import { Check, Copy, Play, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CodeBlock.module.css';

interface CodeBlockClientProps {
  html: string;
  rawCode: string;
  language: string;
  hasOutput?: boolean;
}

export default function CodeBlockClient({ html, rawCode, language, hasOutput }: CodeBlockClientProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setSimulatedOutput('Running capability...');
    setTimeout(() => {
      setSimulatedOutput('> Successfully executed.\n> Output: Simulated response from LLM.');
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.lang}>{language}</span>
        <div className={styles.actions}>
          {language === 'bash' && rawCode.includes('skillspace run') && (
            <button onClick={handleRun} className={styles.actionBtn}>
              <Play size={14} /> Run
            </button>
          )}
          <button onClick={handleCopy} className={styles.actionBtn}>
            {copied ? <Check size={14} className={styles.success} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      
      <div 
        className={`${styles.codeWrapper} ${expanded ? styles.expanded : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      {rawCode.split('\n').length > 10 && (
        <button className={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
          {expanded ? <><ChevronUp size={14}/> Collapse</> : <><ChevronDown size={14}/> Expand</>}
        </button>
      )}

      {simulatedOutput && (
        <div className={styles.outputBox}>
          <div className={styles.outputHeader}>Terminal Output</div>
          <pre>{simulatedOutput}</pre>
        </div>
      )}
    </div>
  );
}
