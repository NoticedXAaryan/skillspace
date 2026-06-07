import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillSpace — The Universal AI Capability Registry',
  description:
    'Install, share, version, and execute AI skills, agents, and workflows. The package manager for AI capabilities.',
  keywords: ['AI', 'skills', 'agents', 'registry', 'package manager', 'LLM', 'prompts'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <a href="/" className="navLogo">
            ⚡ SkillSpace
          </a>
          <div className="navLinks">
            <a href="/">Explore</a>
            <a href="/docs">Docs</a>
            <a href="/login">Sign In</a>
            <a href="/register" className="btn btnPrimary" style={{ padding: '0.5rem 1rem' }}>
              Get Started
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
