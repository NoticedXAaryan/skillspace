'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
    <aside className="static md:sticky md:top-[100px] h-auto md:h-[calc(100vh-120px)] md:overflow-y-auto border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
      {nav.map((group, i) => (
        <div key={i} className="mb-6">
          <div className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{group.title}</div>
          <ul className="flex flex-col gap-1">
            {group.items.map((item, j) => {
              const isActive = pathname === item.href || (pathname === '/docs' && item.href === '/docs/getting-started');
              return (
                <li key={j}>
                  <Link 
                    href={item.href} 
                    className={cn(
                      "block -ml-2 rounded-sm px-2 py-1 text-sm transition-colors",
                      isActive 
                        ? "bg-amber-500/10 font-medium text-amber-600" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
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
