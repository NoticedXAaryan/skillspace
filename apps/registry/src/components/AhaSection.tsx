import React from 'react';

export function AhaSection() {
  const jsonCode = `{
  "name": "@core/summary",
  "version": "1.2.0",
  "runtime": "claude-3-5-haiku",
  "entrypoint": "index.ts",
  "inputs": {
    "text": { "type": "string", "required": true }
  },
  "outputs": {
    "summary": { "type": "string" },
    "tokens_used": { "type": "number" }
  },
  "permissions": ["read:text"],
  "author": "skillspace-core"
}`;

  return (
    <section className="py-24 max-w-6xl mx-auto px-4">
      <div className="mb-12 text-center md:text-left md:px-8">
        <div className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-3">What&apos;s inside a skill?</div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">A skill is a versioned, runnable unit of AI logic.</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Panel: JSON Manifest */}
        <div className="rounded-xl border border-white/10 bg-neutral-950 p-6 shadow-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
            <div className="h-2 w-2 rounded-full bg-neutral-600"></div>
            <div className="text-xs font-mono text-neutral-400">skill.json</div>
          </div>
          <pre className="text-sm font-mono text-neutral-300 overflow-x-auto">
            <code dangerouslySetInnerHTML={{
              __html: jsonCode
                .replace(/"(.*?)":/g, '<span class="text-cyan-300">"$1"</span>:')
                .replace(/: "(.*?)"/g, ': <span class="text-green-300">"$1"</span>')
                .replace(/: (true|false)/g, ': <span class="text-yellow-400">$1</span>')
                .replace(/: ([0-9]+)/g, ': <span class="text-yellow-300">$1</span>')
                .replace(/\["(.*?)"\]/g, '[<span class="text-green-300">"$1"</span>]')
            }} />
          </pre>
        </div>

        {/* Right Panel: Short Animated Terminal */}
        <div className="rounded-xl border border-white/10 bg-neutral-950 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex h-12 items-center px-4 border-b border-white/5 bg-black/50 shrink-0">
             <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
              </div>
          </div>
          <div className="p-6 font-mono text-sm flex flex-col gap-3">
            <div className="flex gap-2 text-neutral-300">
              <span className="text-cyan-400">~</span>
              <span>skillspace run @core/summary --text "Hello world"</span>
            </div>
            <div className="text-neutral-400 ml-4 animate-pulse">
              ⠸ Executing via claude-3-5-haiku...
            </div>
            <div className="text-neutral-300 ml-4 mt-2">
              <span className="text-neutral-500">Output:</span><br/>
              {"{"}<br/>
              &nbsp;&nbsp;<span className="text-cyan-300">"summary"</span>: <span className="text-green-300">"A brief greeting."</span>,<br/>
              &nbsp;&nbsp;<span className="text-cyan-300">"tokens_used"</span>: <span className="text-yellow-300">14</span><br/>
              {"}"}
            </div>
            <div className="flex gap-2 text-neutral-300 mt-2">
              <span className="text-cyan-400">~</span>
              <div className="h-4 w-2 bg-neutral-400 animate-pulse" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
