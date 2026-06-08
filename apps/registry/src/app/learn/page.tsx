import styles from './Learn.module.css';
import { BookOpen, Package, Box, GitBranch, Cpu, Database, Shield, Layers } from 'lucide-react';

export default function LearnPage() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <BookOpen size={48} className={styles.headerIcon} />
        <h1>Learn SkillSpace</h1>
        <p>Everything you need to know about the Universal AI Capability Registry.</p>
      </div>

      <div className={styles.content}>
        
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Package className={styles.sectionIcon} />
            <h2>What Is A Skill?</h2>
          </div>
          <p>
            A <strong>Skill</strong> is the smallest, most fundamental unit of AI logic in the SkillSpace ecosystem. 
            It is a highly reproducible package containing a prompt, execution workflow, and deterministic model parameters.
          </p>
          <div className={styles.codeBlock}>
            <code>{`name: @core/summarizer
type: skill
version: 1.0.0
prompt: |
  Summarize the following text: {{input}}`}</code>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Box className={styles.sectionIcon} />
            <h2>What Is An Agent?</h2>
          </div>
          <p>
            An <strong>Agent</strong> is an autonomous loop that uses tools. Unlike a Skill which executes linearly, an Agent is 
            capable of reasoning, executing functions, observing results, and correcting its path until a goal is met.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <GitBranch className={styles.sectionIcon} />
            <h2>What Is A Workflow?</h2>
          </div>
          <p>
            A <strong>Workflow</strong> is a Directed Acyclic Graph (DAG) connecting multiple Skills and Agents. 
            Workflows allow you to build complex pipelines, such as routing an input to a Research Agent, piping the output to a Summarizer Skill, and concluding with a formatting Skill.
          </p>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Cpu className={styles.sectionIcon} />
            <h2>Runtime Architecture</h2>
          </div>
          <p>
            The SkillSpace Runtime is a lightweight execution engine that normalizes model inputs across Claude, OpenAI, Ollama, and others. 
            This ensures that your Skills run exactly the same, regardless of where they are executed.
          </p>
          <div className={styles.diagram}>
            <div className={styles.box}>Your App</div>
            <div className={styles.arrow}>→</div>
            <div className={styles.boxHighlight}>SkillSpace Runtime</div>
            <div className={styles.arrow}>→</div>
            <div className={styles.box}>Any LLM</div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Database className={styles.sectionIcon} />
            <h2>Registry Architecture</h2>
          </div>
          <p>
            SkillSpace functions as the <code>npm</code> for AI. Every published package is immutable. 
            When you run <code>skillspace install @user/package</code>, the CLI downloads the exact YAML manifest, locking the dependencies in a <code>skillspace.lock</code> file.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Layers className={styles.sectionIcon} />
            <h2>Versioning</h2>
          </div>
          <p>
            We enforce strict <strong>Semantic Versioning (SemVer)</strong>. 
            If you tweak a prompt to yield slightly different formatting, that's a minor release (<code>1.1.0</code>). 
            If you add a new required input variable, that breaks compatibility and demands a major release (<code>2.0.0</code>).
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield className={styles.sectionIcon} />
            <h2>Security</h2>
          </div>
          <p>
            AI Agents running arbitrary code is dangerous. SkillSpace solves this by requiring explicit permission manifests.
            If a Skill needs internet access or file system reads, it must declare them. The Runtime sandboxes execution and blocks undeclared actions.
          </p>
        </section>

      </div>
    </main>
  );
}
