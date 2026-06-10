import { BookOpen, Package, Box, GitBranch, Cpu, Database, Shield, Layers } from 'lucide-react';
import { HeroSection } from '@/components/ui/hero-odyssey';
import { Card, CardContent } from '@/components/ui/card';

export default function LearnPage() {
  const sections = [
    {
      id: 'skill',
      icon: <Package className="w-6 h-6 text-cyan-400" />,
      title: 'What Is A Skill?',
      content: (
        <>
          <p className="text-neutral-400 leading-relaxed mb-6">
            A <strong className="text-white">Skill</strong> is the smallest, most fundamental unit of AI logic in the SkillSpace ecosystem. 
            It is a highly reproducible package containing a prompt, execution workflow, and deterministic model parameters.
          </p>
          <div className="bg-neutral-900 border border-white/10 p-4 rounded-xl font-mono text-sm text-neutral-300 overflow-x-auto">
            <pre><code>{`name: @core/summarizer\ntype: skill\nversion: 1.0.0\nprompt: |\n  Summarize the following text: {{input}}`}</code></pre>
          </div>
        </>
      )
    },
    {
      id: 'agent',
      icon: <Box className="w-6 h-6 text-cyan-400" />,
      title: 'What Is An Agent?',
      content: (
        <p className="text-neutral-400 leading-relaxed">
          An <strong className="text-white">Agent</strong> is an autonomous loop that uses tools. Unlike a Skill which executes linearly, an Agent is 
          capable of reasoning, executing functions, observing results, and correcting its path until a goal is met.
        </p>
      )
    },
    {
      id: 'workflow',
      icon: <GitBranch className="w-6 h-6 text-cyan-400" />,
      title: 'What Is A Workflow?',
      content: (
        <p className="text-neutral-400 leading-relaxed">
          A <strong className="text-white">Workflow</strong> is a Directed Acyclic Graph (DAG) connecting multiple Skills and Agents. 
          Workflows allow you to build complex pipelines, such as routing an input to a Research Agent, piping the output to a Summarizer Skill, and concluding with a formatting Skill.
        </p>
      )
    },
    {
      id: 'architecture',
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      title: 'Runtime Architecture',
      content: (
        <>
          <p className="text-neutral-400 leading-relaxed mb-6">
            The SkillSpace Runtime is a lightweight execution engine that normalizes model inputs across Claude, OpenAI, Ollama, and others. 
            This ensures that your Skills run exactly the same, regardless of where they are executed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-neutral-950 p-6 rounded-xl border border-white/5">
            <div className="bg-neutral-900 border border-white/10 px-4 py-2 rounded-lg text-neutral-300 text-sm font-medium">Your App</div>
            <div className="text-neutral-600 hidden sm:block">→</div>
            <div className="text-neutral-600 sm:hidden">↓</div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-lg text-cyan-400 text-sm font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]">SkillSpace Runtime</div>
            <div className="text-neutral-600 hidden sm:block">→</div>
            <div className="text-neutral-600 sm:hidden">↓</div>
            <div className="bg-neutral-900 border border-white/10 px-4 py-2 rounded-lg text-neutral-300 text-sm font-medium">Any LLM</div>
          </div>
        </>
      )
    },
    {
      id: 'registry',
      icon: <Database className="w-6 h-6 text-cyan-400" />,
      title: 'Registry Architecture',
      content: (
        <p className="text-neutral-400 leading-relaxed">
          SkillSpace functions as the <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">npm</code> for AI. Every published package is immutable. 
          When you run <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">skillspace install @user/package</code>, the CLI downloads the exact YAML manifest, locking the dependencies in a <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">skillspace.lock</code> file.
        </p>
      )
    },
    {
      id: 'versioning',
      icon: <Layers className="w-6 h-6 text-cyan-400" />,
      title: 'Versioning',
      content: (
        <p className="text-neutral-400 leading-relaxed">
          We enforce strict <strong className="text-white">Semantic Versioning (SemVer)</strong>. 
          If you tweak a prompt to yield slightly different formatting, that's a minor release (<code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">1.1.0</code>). 
          If you add a new required input variable, that breaks compatibility and demands a major release (<code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">2.0.0</code>).
        </p>
      )
    },
    {
      id: 'security',
      icon: <Shield className="w-6 h-6 text-cyan-400" />,
      title: 'Security',
      content: (
        <p className="text-neutral-400 leading-relaxed">
          AI Agents running arbitrary code is dangerous. SkillSpace solves this by requiring explicit permission manifests.
          If a Skill needs internet access or file system reads, it must declare them. The Runtime sandboxes execution and blocks undeclared actions.
        </p>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection 
        title="Learn SkillSpace"
        subtitle="Everything you need to know about the Universal AI Capability Registry."
        align="center"
        badge={{ text: "Documentation" }}
      />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="flex flex-col gap-8">
          {sections.map((section, idx) => (
            <Card key={section.id} className="bg-neutral-950 border-white/10 overflow-hidden">
              <CardContent className="p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{section.title}</h2>
                </div>
                {section.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
