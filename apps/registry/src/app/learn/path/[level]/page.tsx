import { notFound } from 'next/navigation';
import LearningClient from './LearningClient';

const PATHS = {
  beginner: {
    title: 'Beginner Path',
    description: 'Learn the basics of SkillSpace, from installing to running your first AI capability.',
    modules: [
      { id: '1', title: 'What is SkillSpace?', content: '<h1>What is SkillSpace?</h1><p>SkillSpace is a package manager for AI.</p>' },
      { id: '2', title: 'Installing the CLI', content: '<h1>Installing the CLI</h1><p>Run <code>npm i -g skillspace-cli</code> to get started.</p>' },
      { id: '3', title: 'Running a Skill', content: '<h1>Running a Skill</h1><p>Use <code>skillspace run @core/summarizer</code>.</p>' },
    ]
  },
  intermediate: {
    title: 'Intermediate Path',
    description: 'Build and publish your own AI capabilities to the registry.',
    modules: [
      { id: '1', title: 'The Manifest', content: '<h1>The skillspace.yaml Manifest</h1><p>Define inputs, outputs, and models.</p>' },
      { id: '2', title: 'Sandboxing', content: '<h1>Execution Sandboxing</h1><p>Permissions and filesystem access.</p>' },
      { id: '3', title: 'Publishing', content: '<h1>Publishing</h1><p>Run <code>skillspace publish</code> to share your work.</p>' },
    ]
  },
  advanced: {
    title: 'Advanced Path',
    description: 'Master autonomous agents and multi-step workflows.',
    modules: [
      { id: '1', title: 'Agents', content: '<h1>Building Agents</h1><p>Give your skill access to tools.</p>' },
      { id: '2', title: 'Workflows', content: '<h1>Workflows</h1><p>Chain multiple skills together in a DAG.</p>' },
      { id: '3', title: 'Runtime SDK', content: '<h1>Runtime SDK</h1><p>Embed the engine in your own Next.js app.</p>' },
    ]
  }
};

export default async function LearningPathPage({ params }: { params: Promise<{ level: string }> }) {
  const resolvedParams = await params;
  const level = resolvedParams.level;
  const pathData = PATHS[level as keyof typeof PATHS];

  if (!pathData) {
    notFound();
  }

  return (
    <main className="container" style={{ padding: 'var(--space-12) 0' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{pathData.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>{pathData.description}</p>
      </div>

      <LearningClient level={level} modules={pathData.modules} />
    </main>
  );
}
