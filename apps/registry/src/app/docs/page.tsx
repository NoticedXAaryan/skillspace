import styles from '../page.module.css';

export default function DocsPage() {
  return (
    <main className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fff' }}>SkillSpace Documentation</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        The universal package manager and runtime for AI capabilities. Learn how it works under the hood and how to get started.
      </p>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>How It Works</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          SkillSpace solves the problem of prompt drift and platform lock-in. It operates similarly to npm, but for AI skills, agents, and workflows. 
        </p>
        <ul style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li><strong>Resolution:</strong> The CLI fetches the `skill.yaml` from the registry and caches it locally.</li>
          <li><strong>Model Adapter Layer (MAL):</strong> The runtime translates your model-agnostic instructions into the specific format required by the target model (e.g., OpenAI, Claude, Ollama).</li>
          <li><strong>Execution Sandbox:</strong> The skill runs within strict permissions. It cannot read files or access the network unless explicitly permitted by the user.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>CLI Commands</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Initialization & Setup</h3>
          <div className="codeBlock">
            <code>skillspace init</code>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Initializes skillspace.yaml in your current directory.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Model Configuration</h3>
          <div className="codeBlock">
            <code>skillspace model add [provider]</code>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Configures API keys for providers like openai, anthropic, or ollama.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Installation</h3>
          <div className="codeBlock">
            <code>skillspace install [name]@[version]</code>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Installs a capability and generates a lock file for reproducibility.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Execution</h3>
          <div className="codeBlock">
            <code>skillspace run [name] --input ./src --model anthropic/claude-3-5-sonnet</code>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Runs the installed capability securely. Override the default model using the --model flag.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Configuration (skillspace.yaml)</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.8' }}>
          The local `skillspace.yaml` file defines the default behavior of the runtime within your project.
        </p>
        <div className="codeBlock">
          <code>
{`version: 1.0
default_model: openai/gpt-4o
skills:
  security-review: ^2.1.0
  code-documenter: ^1.4.2
permissions:
  allow_read: ["./src", "./tests"]
  allow_network: false`}
          </code>
        </div>
      </div>
    </main>
  );
}
