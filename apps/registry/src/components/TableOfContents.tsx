'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('#mdx-wrapper h2, #mdx-wrapper h3'));
      const parsedHeadings = elements.map((el) => {
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
    <div className="sticky top-20 flex flex-col gap-4">
      <div className="text-sm font-semibold">On this page</div>
      <ul className="flex flex-col gap-2.5 text-sm">
        {headings.map((h) => (
          <li 
            key={h.id} 
            className={cn(
              "transition-colors hover:text-foreground",
              h.level === 3 ? "pl-4" : "",
              activeId === h.id ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
