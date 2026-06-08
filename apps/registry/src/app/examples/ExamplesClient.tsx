'use client';

import { useState } from 'react';
import styles from './Examples.module.css';
import { Terminal, Download, Star, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';
import CodeBlockClient from '@/components/CodeBlockClient';

interface Example {
  id: string;
  name: string;
  category: string;
  author: string;
  downloads: number;
  stars: number;
  installCmd: string;
  input: string;
  output: string;
}

export default function ExamplesClient({ examples }: { examples: Example[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(examples.map((e) => e.category)))];

  const filteredExamples = activeCategory === 'All' 
    ? examples 
    : examples.filter((e) => e.category === activeCategory);

  return (
    <>
      <div className={styles.filterBar}>
        <Filter size={16} className={styles.filterIcon} />
        <div className={styles.categoryTabs}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.tabBtn} ${activeCategory === cat ? styles.tabActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredExamples.map(ex => (
          <div key={ex.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.titleRow}>
                <h2>{ex.name}</h2>
                <div className={styles.stats}>
                  <span><Download size={12} /> {ex.downloads.toLocaleString()}</span>
                  <span><Star size={12} /> {ex.stars.toLocaleString()}</span>
                </div>
              </div>
              <Link href={`/packages/${ex.name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.authorLink}>
                @{ex.author}
              </Link>
            </div>

            <div className={styles.installBox}>
              <Terminal size={14} className={styles.termIcon} />
              <code>{ex.installCmd}</code>
            </div>

            <div className={styles.ioWrapper}>
              <div className={styles.ioBox}>
                <div className={styles.ioHeader}>Input</div>
                <CodeBlockClient html={`<pre><code>${ex.input}</code></pre>`} rawCode={ex.input} language="text" />
              </div>
              <div className={styles.ioBox}>
                <div className={styles.ioHeader}>Output</div>
                <CodeBlockClient html={`<pre><code>${ex.output}</code></pre>`} rawCode={ex.output} language="markdown" />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button className="btn btnSecondary" style={{ width: '100%', fontSize: 'var(--text-sm)' }}>
                View Source Code <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
