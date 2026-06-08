'use client';

import { useEffect, useState } from 'react';
import styles from './TableOfContents.module.css';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // We add a slight delay to allow MDX to render
    const timeout = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('#mdx-wrapper h2, #mdx-wrapper h3'));
      const parsedHeadings = elements.map((el) => {
        // If rehype-slug wasn't configured properly, fallback to generating ID
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
        }
        return {
          id: el.id,
          text: el.textContent || '',
          level: Number(el.tagName.replace('H', ''))
        };
      });
      setHeadings(parsedHeadings);
    }, 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    const checkScroll = () => {
      const elements = Array.from(document.querySelectorAll('#mdx-wrapper h2, #mdx-wrapper h3'));
      elements.forEach((el) => observer.observe(el));
    };

    setTimeout(checkScroll, 200);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className={styles.tocContainer}>
      <div className={styles.tocTitle}>On this page</div>
      <ul className={styles.tocList}>
        {headings.map((h) => (
          <li 
            key={h.id} 
            className={`${styles.tocItem} ${h.level === 3 ? styles.tocItemIndented : ''} ${activeId === h.id ? styles.tocItemActive : ''}`}
          >
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
