import type { Metadata } from 'next';
import { Inter as FontSans, JetBrains_Mono as FontMono } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import ActivationWidget from '@/components/ActivationWidget';
import OnboardingModal from '@/components/OnboardingModal';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'SkillSpace — The Universal AI Capability Registry',
  description:
    'Install, share, version, and execute AI skills, agents, and workflows. The package manager for AI capabilities.',
  keywords: ['AI', 'skills', 'agents', 'registry', 'package manager', 'LLM', 'prompts'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Navbar />
        {children}
        <Footer />
        <CommandPalette />
        <ActivationWidget />
        <OnboardingModal />
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
