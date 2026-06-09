import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import CodeBlock from '@/components/CodeBlock';
import ArchitectureDiagram from '@/components/ArchitectureDiagram';

const components = {
  pre: CodeBlock,
  ArchitectureDiagram,
};

export default async function DocPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Default to getting-started if no slug
  const docSlug = slug ? slug.join('/') : 'getting-started';
  
  try {
    const filePath = path.join(process.cwd(), 'src/content/docs', `${docSlug}.mdx`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Quick and dirty frontmatter parsing
    let content = fileContent;
    let title = '';
    let description = '';
    
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) {
        const frontmatter = parts[1];
        content = parts.slice(2).join('---').trim();
        
        const titleMatch = frontmatter.match(/title:\s*(.*)/);
        if (titleMatch) title = titleMatch[1].trim();
        
        const descMatch = frontmatter.match(/description:\s*(.*)/);
        if (descMatch) description = descMatch[1].trim();
      }
    }

    return (
      <>
        {title && (
          <div className="mb-10">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>}
          </div>
        )}
        
        <div id="mdx-wrapper" className="prose prose-invert max-w-none text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-code:text-foreground">
          <MDXRemote source={content} components={components} />
        </div>
      </>
    );
  } catch (e) {
    notFound();
  }
}
