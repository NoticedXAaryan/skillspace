import styles from './Examples.module.css';
import examplesData from '@/data/examples.json';
import ExamplesClient from './ExamplesClient';

export default function ExamplesPage() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>Production Examples</h1>
        <p>Explore 50+ real-world capabilities built and shared by the SkillSpace community.</p>
      </div>

      <ExamplesClient examples={examplesData} />
    </main>
  );
}
