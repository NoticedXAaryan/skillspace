'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function DocsSidebar() {
  const pathname = usePathname();

  const nav = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', href: '/docs/getting-started' },
        { label: 'Core Concepts', href: '/docs/concepts' },
        { label: 'Architecture', href: '/docs/architecture' },
      ]
    },
    {
      title: 'Developers',
      items: [
        { label: 'CLI Reference', href: '/docs/cli' },
        { label: 'TypeScript SDK', href: '/docs/sdk' },
        { label: 'Security & Sandbox', href: '/docs/security' },
        { label: 'Organizations', href: '/docs/organizations' },
      ]
    },
    {
      title: 'Guides',
      items: [
        { label: 'Building Agents', href: '/docs/agents' },
        { label: 'Chaining Workflows', href: '/docs/workflows' },
        { label: 'Examples', href: '/docs/examples' },
      ]
    },
    {
      title: 'Community',
      items: [
        { label: 'Contributing', href: '/docs/contributing' },
      ]
    }
  ];

  return (
    <aside className={styles.sidebar}>
      {nav.map((group, i) => (
        <div key={i} className={styles.navGroup}>
          <div className={styles.navTitle}>{group.title}</div>
          <ul className={styles.navList}>
            {group.items.map((item, j) => {
              const isActive = pathname === item.href || (pathname === '/docs' && item.href === '/docs/getting-started');
              return (
                <li key={j}>
                  <Link 
                    href={item.href} 
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
