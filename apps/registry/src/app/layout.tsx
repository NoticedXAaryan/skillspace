import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
