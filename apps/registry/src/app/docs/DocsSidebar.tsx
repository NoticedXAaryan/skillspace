'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function DocsSidebar() {
  const [activeId, setActiveId] = useState('introduction');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['introduction', 'publishing', 'workflows'];
      let current = sections[0];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.navGroup}>
        <div className={styles.navTitle}>Getting Started</div>
        <ul className={styles.navList}>
          <li>
            <Link href="#introduction" className={`${styles.navLink} ${activeId === 'introduction' ? styles.navLinkActive : ''}`}>
              Introduction
            </Link>
          </li>
          <li><Link href="#installation" className={styles.navLink}>Installation</Link></li>
          <li><Link href="#concepts" className={styles.navLink}>Core Concepts</Link></li>
        </ul>
      </div>
      
      <div className={styles.navGroup}>
        <div className={styles.navTitle}>Developers</div>
        <ul className={styles.navList}>
          <li>
            <Link href="#publishing" className={`${styles.navLink} ${activeId === 'publishing' ? styles.navLinkActive : ''}`}>
              Publishing
            </Link>
          </li>
          <li><Link href="#manifest" className={styles.navLink}>Manifest Format</Link></li>
          <li><Link href="#security" className={styles.navLink}>Security</Link></li>
        </ul>
      </div>

      <div className={styles.navGroup}>
        <div className={styles.navTitle}>Guides</div>
        <ul className={styles.navList}>
          <li>
            <Link href="#workflows" className={`${styles.navLink} ${activeId === 'workflows' ? styles.navLinkActive : ''}`}>
              Workflows
            </Link>
          </li>
          <li><Link href="#agents" className={styles.navLink}>Agents</Link></li>
        </ul>
      </div>
    </aside>
  );
}
