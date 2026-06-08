import { createHighlighter } from 'shiki';
import CodeBlockClient from './CodeBlockClient';

let highlighter: any = null;

export default async function CodeBlock({ children, className }: { children: any; className?: string }) {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'bash', 'json', 'yaml', 'markdown'],
    });
  }

  // Extract language from className (e.g. "language-typescript")
  const language = className ? className.replace(/language-/, '') : 'text';
  
  // React elements passed from MDX often have the code inside children.props.children
  let rawCode = '';
  if (typeof children === 'string') {
    rawCode = children;
  } else if (children?.props?.children) {
    rawCode = children.props.children;
  }

  // Trim trailing newline
  rawCode = rawCode.replace(/\n$/, '');

  let html = rawCode;
  try {
    // We tell Shiki to just return the inner HTML without wrapper, or we can just parse it
    html = highlighter.codeToHtml(rawCode, { lang: language, theme: 'github-dark' });
  } catch (e) {
    // Fallback if language not loaded
    html = `<pre><code>${rawCode}</code></pre>`;
  }

  return <CodeBlockClient html={html} rawCode={rawCode} language={language} />;
}
