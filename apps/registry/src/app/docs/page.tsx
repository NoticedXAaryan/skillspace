import styles from './page.module.css';
import DocsSidebar from './DocsSidebar';

export const metadata = {
  title: 'Documentation — SkillSpace',
  description: 'Learn how to install, publish, and run AI capabilities on SkillSpace.',
};

export default function DocsPage() {
  return (
    <main className="container">
      <div className={styles.layout}>
        {/* Sidebar */}
        <DocsSidebar />

        {/* Main Content */}
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Documentation</h1>
            <p className={styles.subtitle}>
              Learn how to build, publish, and consume AI capabilities with SkillSpace.
            </p>
          </div>

          <section id="introduction" className={styles.section}>
            <h2 className={styles.sectionTitle}>Introduction</h2>
            <div className={styles.sectionContent}>
              <p>
                SkillSpace is a universal runtime and registry for AI capabilities. It allows you to package prompts, agents, and multi-step workflows into versioned, installable modules that run predictably across different models (Claude, OpenAI, Gemini).
              </p>
              <p>
                Instead of copying and pasting prompts or writing custom wrapper code for every new LLM integration, you can install a capability just like an npm package.
              </p>
              
              <div className="codeBlock" style={{ marginTop: '2rem' }}>
                <code>skillspace install security-review</code>
              </div>
            </div>
          </section>

          <section id="publishing" className={styles.section}>
            <h2 className={styles.sectionTitle}>Publishing</h2>
            <div className={styles.sectionContent}>
              <p>
                To publish a skill, you must first create a <code>skillspace.yaml</code> manifest file in your project directory. This file defines the capability's inputs, outputs, models, and any required permissions.
              </p>
              <h3>1. Initialize a Package</h3>
              <div className="codeBlock">
                <pre><code>{`skillspace init
# Follow the interactive prompts to generate skillspace.yaml`}</code></pre>
              </div>
              
              <h3>2. Write your Logic</h3>
              <p>
                Implement your logic in the main entrypoint file specified in your manifest. Use standard standard input and output streams for cross-platform compatibility.
              </p>

              <h3>3. Publish</h3>
              <p>
                Once you are ready, push your capability to the global registry:
              </p>
              <div className="codeBlock">
                <code>skillspace publish</code>
              </div>
            </div>
          </section>

          <section id="workflows" className={styles.section}>
            <h2 className={styles.sectionTitle}>Workflows</h2>
            <div className={styles.sectionContent}>
              <p>
                Workflows allow you to chain multiple capabilities together into a single execution graph. Outputs from one skill can be piped directly into the inputs of another.
              </p>
              <p>
                To create a workflow, specify the <code>type: workflow</code> in your manifest and define the step sequence:
              </p>
              <div className="codeBlock">
                <pre><code>{`name: @my-org/summarize-and-translate
type: workflow
steps:
  - id: summarize
    uses: @core/summarizer@1.0.0
  - id: translate
    uses: @core/translator@2.0.0
    with:
      target_language: es
    input: \${steps.summarize.output}`}</code></pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
