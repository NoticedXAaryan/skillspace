'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, GitBranch, Play, ChevronRight, CheckCircle2, Box, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { authClient } from '@/lib/auth-client';

type PublishMode = 'manual' | 'github';

export default function CreateWizard() {
  const { data: session } = authClient.useSession();
  const [step, setStep] = useState(1);
  const router = useRouter();

  const [mode, setMode] = useState<PublishMode>('manual');
  const [type, setType] = useState('skill');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant. Analyze the provided input and give a clear, concise response.',
  );
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testRunning, setTestRunning] = useState(false);
  const [version, setVersion] = useState('1.0.0');
  const [tags, setTags] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  // GitHub import state
  const [githubUrl, setGithubUrl] = useState('');
  const [githubPath, setGithubPath] = useState('skill.yaml');

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleTest = async () => {
    if (!testInput.trim()) return;
    setTestRunning(true);
    setTestOutput('');
    try {
      const res = await fetch('/api/playground/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: name || '@test/preview',
          version: '0.0.0',
          input: testInput,
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');
      const decoder = new TextDecoder();
      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'token') output += event.content;
              if (event.type === 'error') output += `\nError: ${event.content}`;
            } catch {}
          }
        }
        setTestOutput(output);
      }
    } catch (err) {
      setTestOutput(`Error: ${err instanceof Error ? err.message : 'Test failed'}`);
    } finally {
      setTestRunning(false);
    }
  };

  const buildSkillYaml = () => {
    const scopedName = name.startsWith('@') ? name : `@skillspace/${name}`;
    return {
      schemaVersion: 2,
      name: scopedName,
      version,
      description: desc,
      author: 'skillspace',
      license: 'MIT',
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      persona: {
        system_prompt: systemPrompt,
        behavioral_guidelines: [],
        capabilities: [],
      },
    };
  };

  /**
   * Publish via GitHub import: sends the repo URL to /api/packages/github,
   * which fetches and validates the manifest server-side.
   */
  const handlePublishGitHub = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to publish.');
      router.push('/login');
      return;
    }

    setIsPublishing(true);
    setPublishError('');
    try {
      const res = await fetch('/api/packages/github', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUrl,
          name: name.startsWith('@') ? name : name ? `@skillspace/${name}` : undefined,
          version: version || undefined,
          description: desc || undefined,
        }),
      });

      if (res.status === 401) {
        toast.error('Please log in first.');
        router.push('/login');
        setIsPublishing(false);
        return;
      }

      const result = await res.json();
      if (result.error) {
        setPublishError(result.error.message || 'Publish failed');
        setIsPublishing(false);
        return;
      }
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success('Published from GitHub!');
      setIsPublishing(false);
      setStep(6);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed');
      setIsPublishing(false);
    }
  };

  const handlePublishManual = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to publish.');
      router.push('/login');
      return;
    }

    setIsPublishing(true);
    setPublishError('');
    try {
      const skillData = buildSkillYaml();
      const yamlContent = Object.entries(skillData)
        .map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            if (key === 'persona') {
              const persona = val as any;
              let yaml = 'persona:\n';
              yaml += `  system_prompt: |\n    ${persona.system_prompt.split('\n').join('\n    ')}\n`;
              yaml += `  behavioral_guidelines: []\n`;
              yaml += `  capabilities: []\n`;
              return yaml;
            }
            if (Array.isArray(val)) {
              return val.length > 0
                ? `${key}:\n${val.map((v: string) => `  - ${v}`).join('\n')}`
                : `${key}: []`;
            }
            return `${key}: ${JSON.stringify(val)}`;
          }
          return `${key}: ${typeof val === 'string' && val.includes(' ') ? `"${val}"` : val}`;
        })
        .join('\n');

      // Encode YAML as UTF-8 bytes (Buffer is Node-only — use TextEncoder in the browser)
      const bytes = new TextEncoder().encode(yamlContent);
      const file = new File([bytes], 'package.tar.gz', { type: 'application/gzip' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'metadata',
        JSON.stringify({
          name: skillData.name,
          version: skillData.version,
          description: skillData.description,
          type: 'skill',
          tags: skillData.tags,
          isPrivate: false,
          manifest: skillData,
        }),
      );

      const res = await fetch('/api/packages', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.status === 401) {
        toast.error('Please log in first.');
        router.push('/login');
        setIsPublishing(false);
        return;
      }

      const result = await res.json();
      if (result.error) {
        setPublishError(result.error.message || 'Publish failed');
        setIsPublishing(false);
        return;
      }

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success('Published successfully!');
      setIsPublishing(false);
      setStep(6);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed');
      setIsPublishing(false);
    }
  };

  const handlePublish = () => (mode === 'github' ? handlePublishGitHub() : handlePublishManual());

  // GitHub mode skips prompt/test steps — map them onto the manual step numbers
  const visibleSteps =
    mode === 'github'
      ? [
          { num: 1, label: 'Source' },
          { num: 2, label: 'Info' },
          { num: 5, label: 'Publish' },
        ]
      : [
          { num: 1, label: 'Type' },
          { num: 2, label: 'Basic Info' },
          { num: 3, label: 'Prompt' },
          { num: 4, label: 'Test' },
          { num: 5, label: 'Publish' },
        ];

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 bg-black">
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-white tracking-tight px-4">Create</h3>
          <ul className="flex flex-col gap-1 relative before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/10 pl-4">
            {visibleSteps.map((s, i) => {
              const isActive =
                mode === 'github'
                  ? (i === 0 && step === 1) || (i === 1 && step === 2) || (i === 2 && step === 5)
                  : step === s.num;
              const isDone =
                mode === 'github' ? (i === 0 && step > 1) || (i === 1 && step === 5) : step > s.num;
              return (
                <li
                  key={s.num}
                  className={`relative flex items-center gap-4 py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-cyan-400 bg-cyan-400/10' : isDone ? 'text-neutral-400 hover:text-white' : 'text-neutral-600'}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 z-10 transition-colors ${isActive || isDone ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-neutral-800 border border-white/20'}`}
                  />
                  <span className="font-medium text-sm">
                    {i + 1}. {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex-1 min-w-0 flex flex-col bg-neutral-950/50 border border-white/10 rounded-2xl p-6 md:p-10 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_70%)] pointer-events-none" />

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step + mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {step === 1 && (
                  <div className="flex flex-col h-full justify-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Choose a source</h2>
                    <p className="text-neutral-400 mb-8">
                      Publish from a form, or import an existing manifest from GitHub.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div
                        className={`flex flex-col items-center text-center p-6 rounded-xl border cursor-pointer transition-all duration-300 ${mode === 'manual' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-white/10 bg-neutral-900/50 hover:border-white/30 hover:bg-neutral-800'}`}
                        onClick={() => setMode('manual')}
                      >
                        <Package
                          className={`w-8 h-8 mb-4 ${mode === 'manual' ? 'text-cyan-400' : 'text-neutral-500'}`}
                        />
                        <h4 className="font-bold text-white mb-2">Build Manually</h4>
                        <p className="text-sm text-neutral-400">
                          Fill out a form and publish a generated manifest.
                        </p>
                      </div>
                      <div
                        className={`flex flex-col items-center text-center p-6 rounded-xl border cursor-pointer transition-all duration-300 ${mode === 'github' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-white/10 bg-neutral-900/50 hover:border-white/30 hover:bg-neutral-800'}`}
                        onClick={() => setMode('github')}
                      >
                        <GitBranch
                          className={`w-8 h-8 mb-4 ${mode === 'github' ? 'text-cyan-400' : 'text-neutral-500'}`}
                        />
                        <h4 className="font-bold text-white mb-2">Import from GitHub</h4>
                        <p className="text-sm text-neutral-400">
                          Point at a repo with a skill.yaml — code stays on GitHub for full
                          auditability.
                        </p>
                      </div>
                    </div>

                    {mode === 'manual' && (
                      <>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                          Capability type
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            {
                              id: 'skill',
                              icon: Package,
                              title: 'Skill',
                              desc: 'A single, reproducible AI prompt or instruction block.',
                            },
                            {
                              id: 'agent',
                              icon: Box,
                              title: 'Agent',
                              desc: 'An autonomous loop capable of tool use.',
                            },
                            {
                              id: 'workflow',
                              icon: GitBranch,
                              title: 'Workflow',
                              desc: 'A multi-step DAG of skills and agents combined.',
                            },
                          ].map((t) => (
                            <div
                              key={t.id}
                              className={`flex flex-col items-center text-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${type === t.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 bg-neutral-900/50 hover:border-white/30 hover:bg-neutral-800'}`}
                              onClick={() => setType(t.id)}
                            >
                              <t.icon
                                className={`w-6 h-6 mb-2 ${type === t.id ? 'text-cyan-400' : 'text-neutral-500'}`}
                              />
                              <h4 className="font-bold text-white text-sm mb-1">{t.title}</h4>
                              <p className="text-xs text-neutral-400">{t.desc}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {mode === 'github' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-white">
                            GitHub URL or owner/repo
                          </label>
                          <Input
                            placeholder="https://github.com/owner/repo  or  owner/repo/path/to/skill.yaml"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
                          />
                          <p className="text-xs text-neutral-500">
                            Defaults to <code className="text-neutral-400">skill.yaml</code> on the{' '}
                            <code className="text-neutral-400">main</code> branch. Append a path to
                            override.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-white">
                            Manifest path (optional)
                          </label>
                          <Input
                            placeholder="skill.yaml"
                            value={githubPath}
                            onChange={(e) => setGithubPath(e.target.value)}
                            className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col">
                    {mode === 'github' ? (
                      <>
                        <h2 className="text-2xl font-bold text-white mb-2">Package details</h2>
                        <p className="text-neutral-400 mb-8">
                          Override the name, version, and description (optional — manifest values
                          are used by default).
                        </p>
                        <div className="flex flex-col gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">
                              Package Name (optional override)
                            </label>
                            <Input
                              placeholder="e.g. @yourname/text-summarizer"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="bg-neutral-900/50 border-white/10 text-white"
                            />
                            <p className="text-xs text-neutral-500">
                              Leave blank to use the name from your skill.yaml
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">
                              Version (optional override)
                            </label>
                            <Input
                              value={version}
                              onChange={(e) => setVersion(e.target.value)}
                              className="bg-neutral-900/50 border-white/10 text-white font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">
                              Description (optional override)
                            </label>
                            <Textarea
                              placeholder="What does this do?"
                              rows={3}
                              value={desc}
                              onChange={(e) => setDesc(e.target.value)}
                              className="bg-neutral-900/50 border-white/10 text-white"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                        <p className="text-neutral-400 mb-8">
                          Give your capability a name and description.
                        </p>
                        <div className="flex flex-col gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Package Name</label>
                            <Input
                              placeholder="e.g. text-summarizer"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="bg-neutral-900/50 border-white/10 text-white"
                            />
                            <p className="text-xs text-neutral-500">
                              Will be published as @skillspace/{name || 'your-name'}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Description</label>
                            <Textarea
                              placeholder="What does this do?"
                              rows={3}
                              value={desc}
                              onChange={(e) => setDesc(e.target.value)}
                              className="bg-neutral-900/50 border-white/10 text-white"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">
                              Tags (comma-separated)
                            </label>
                            <Input
                              placeholder="e.g. summarizer, text, nlp"
                              value={tags}
                              onChange={(e) => setTags(e.target.value)}
                              className="bg-neutral-900/50 border-white/10 text-white"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step === 3 && mode === 'manual' && (
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-white mb-2">System Prompt</h2>
                    <p className="text-neutral-400 mb-6">
                      Define the AI&apos;s behavior and instructions.
                    </p>
                    <Textarea
                      className="flex-1 min-h-[300px] bg-neutral-900/80 border-white/10 text-emerald-400 font-mono text-sm leading-relaxed p-4"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                    />
                  </div>
                )}

                {step === 4 && mode === 'manual' && (
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-white mb-2">Test Your Skill</h2>
                    <p className="text-neutral-400 mb-6">Try it out before publishing.</p>
                    <div className="flex flex-col gap-6 flex-1">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Test Input</label>
                        <Textarea
                          rows={3}
                          placeholder="Enter test input..."
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
                        />
                        <div className="mt-2">
                          <Button
                            variant="secondary"
                            onClick={handleTest}
                            disabled={testRunning || !testInput.trim()}
                            className="bg-white/10 text-white hover:bg-white/20"
                          >
                            {testRunning ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-2" />
                            )}
                            {testRunning ? 'Running...' : 'Run Test'}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <label className="text-sm font-medium text-white">Output</label>
                        <div className="flex-1 min-h-[150px] bg-black border border-white/10 rounded-md p-4 font-mono text-sm text-neutral-300 overflow-y-auto whitespace-pre-wrap">
                          {testOutput || 'Output will appear here...'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to Publish</h2>
                    <p className="text-neutral-400 mb-8">
                      {mode === 'github'
                        ? 'We will fetch the manifest from your repo and pin it to the latest commit.'
                        : 'Review and ship it to the registry.'}
                    </p>
                    <div className="flex flex-col gap-6">
                      {mode === 'github' && (
                        <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 flex items-center gap-4">
                          <GitBranch className="w-6 h-6 text-neutral-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white truncate">
                              {githubUrl || 'repo not set'}
                            </div>
                            <div className="text-xs text-neutral-500 font-mono">{githubPath}</div>
                          </div>
                        </div>
                      )}
                      {mode === 'manual' && (
                        <>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Version</label>
                            <Input
                              value={version}
                              onChange={(e) => setVersion(e.target.value)}
                              className="bg-neutral-900/50 border-white/10 text-white font-mono"
                            />
                          </div>
                          <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <span className="text-neutral-400">Name</span>
                              <span className="font-bold text-white font-mono">
                                @skillspace/{name || 'untitled'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <span className="text-neutral-400">Type</span>
                              <span className="font-bold text-white capitalize">{type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400">Version</span>
                              <span className="font-mono text-cyan-400">{version}</span>
                            </div>
                          </div>
                        </>
                      )}
                      {publishError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                          {publishError}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Successfully Published!</h2>
                    <p className="text-neutral-400 mb-8">
                      Your capability is now live on SkillSpace.
                    </p>
                    <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-cyan-400 text-sm mb-8 w-full max-w-md">
                      <span className="text-neutral-500 mr-2">$</span> skillspace install
                      @skillspace/{name || 'untitled'}
                    </div>
                    <Button
                      className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-6 rounded-full"
                      onClick={() => router.push('/packages')}
                    >
                      View in Registry
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {step < 6 && (
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-neutral-400 hover:text-white"
                >
                  Back
                </Button>
              ) : (
                <div />
              )}
              {step === 5 ? (
                <Button
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                  onClick={handlePublish}
                  disabled={isPublishing || (mode === 'github' && !githubUrl.trim())}
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isPublishing
                    ? 'Publishing...'
                    : mode === 'github'
                      ? 'Publish from GitHub'
                      : 'Publish Skill'}
                </Button>
              ) : (
                <Button
                  className="bg-white text-black hover:bg-neutral-200 font-semibold"
                  onClick={handleNext}
                  disabled={mode === 'github' && step === 1 && !githubUrl.trim()}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
