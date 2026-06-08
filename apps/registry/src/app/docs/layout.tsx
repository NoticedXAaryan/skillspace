import DocsSidebar from './DocsSidebar';
import TableOfContents from '@/components/TableOfContents';
import styles from './page.module.css';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container">
      <div className={styles.layout}>
        <DocsSidebar />
        <div className={styles.content}>
          {children}
        </div>
        <TableOfContents />
      </div>
    </main>
  );
}
