import DocsSidebar from './DocsSidebar';
import TableOfContents from '@/components/TableOfContents';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-8 md:gap-12 py-8 pb-16">
        <DocsSidebar />
        <div className="max-w-[800px] w-full min-w-0">
          {children}
        </div>
        <TableOfContents />
      </div>
    </main>
  );
}
