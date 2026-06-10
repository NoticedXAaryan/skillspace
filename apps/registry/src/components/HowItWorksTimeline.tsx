"use client";
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function HowItWorksTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    const elements = document.querySelectorAll('.timeline-step');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      title: "1. Install",
      content: (
        <div className="bg-neutral-950 border border-white/10 rounded-xl p-6 font-mono text-sm text-neutral-300">
          <div className="text-cyan-400 mb-4">$ skillspace install @core/summary</div>
          <div className="text-neutral-500">
            └─ node_modules/<br />
            &nbsp;&nbsp; └─ @skillspace/<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; └─ core-summary/ (v1.2.0)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ├─ skill.json<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; └─ index.ts
          </div>
        </div>
      )
    },
    {
      title: "2. Configure",
      content: (
        <div className="bg-neutral-950 border border-white/10 rounded-xl p-6 font-mono text-sm text-neutral-300">
          <div className="text-neutral-500 mb-2">// skillspace.config.ts</div>
          <div><span className="text-cyan-300">import</span> {"{"} defineWorkspace {"}"} <span className="text-cyan-300">from</span> <span className="text-green-300">'skillspace'</span>;</div>
          <br/>
          <div><span className="text-cyan-300">export default</span> defineWorkspace({"{"}</div>
          <div>&nbsp;&nbsp;provider: <span className="text-green-300">'openai'</span>,</div>
          <div>&nbsp;&nbsp;model: <span className="text-green-300">'gpt-4o'</span>,</div>
          <div>{"}"});</div>
        </div>
      )
    },
    {
      title: "3. Publish",
      content: (
        <div className="bg-neutral-950 border border-white/10 rounded-xl p-6 font-mono text-sm text-neutral-300">
          <div className="text-cyan-400 mb-2">$ skillspace publish</div>
          <div className="text-neutral-400 mb-1">Building package...</div>
          <div className="text-green-400 mb-4">✓ Packed 4 files (12KB)</div>
          <div className="text-white">🚀 Published @my-org/my-skill@1.0.0</div>
          <div className="text-cyan-500 mt-2 hover:underline cursor-pointer">https://skillspace.sh/my-org/my-skill</div>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 w-full relative" ref={containerRef}>
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">How It Works</h2>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 px-4">
        
        {/* Sticky Timeline Rail (Desktop) */}
        <div className="hidden md:block w-1/3 relative">
          <div className="sticky top-1/3 flex flex-col gap-8">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-center gap-4 transition-all duration-300",
                  activeIndex === idx ? "text-cyan-400" : "text-neutral-600"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border font-bold text-lg transition-colors duration-300",
                  activeIndex === idx ? "border-cyan-400 bg-cyan-400/10" : "border-neutral-800 bg-black"
                )}>
                  {idx + 1}
                </div>
                <div className={cn(
                  "text-xl font-medium",
                  activeIndex === idx ? "text-white" : "text-neutral-500"
                )}>
                  {step.title.split('. ')[1]}
                </div>
              </div>
            ))}
            {/* Connecting line */}
            <div className="absolute left-[19px] top-10 bottom-10 w-[2px] bg-neutral-800 -z-10">
              <div 
                className="w-full bg-cyan-400 transition-all duration-500" 
                style={{ height: `${(activeIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Rail */}
        <div className="md:hidden flex items-center justify-between mb-8 sticky top-14 bg-black/80 backdrop-blur-md z-40 py-4 px-2 border-b border-white/10">
          {steps.map((step, idx) => (
            <div key={idx} className={cn(
              "text-sm font-medium transition-colors",
              activeIndex === idx ? "text-cyan-400" : "text-neutral-500"
            )}>
              {step.title}
            </div>
          ))}
        </div>

        {/* Content Scrolling Area */}
        <div className="w-full md:w-2/3 flex flex-col gap-32 pb-32">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              data-index={idx}
              className={cn(
                "timeline-step transition-opacity duration-500 min-h-[300px] flex flex-col justify-center",
                activeIndex === idx ? "opacity-100" : "opacity-30"
              )}
            >
              <h3 className="text-2xl font-bold text-white mb-6 md:hidden">{step.title.split('. ')[1]}</h3>
              {step.content}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
