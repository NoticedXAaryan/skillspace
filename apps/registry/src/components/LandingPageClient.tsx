'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Package,
  ArrowUpRight,
  Terminal,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  Globe,
  GitBranch,
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PackageCard from '@/components/PackageCard';
import { AnimatedTerminal } from '@/components/ui/animated-terminal';
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageClientProps {
  stats: {
    skillsCount: number;
    usersCount: number;
    downloadsCount: number;
  };
  packages: any[];
  recentPackages: any[];
}

export default function LandingPageClient({
  stats,
  packages,
  recentPackages,
}: LandingPageClientProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Hero Animations
      const tl = gsap.timeline();
      tl.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' })
        .from('.hero-title', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .from('.hero-desc', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .from('.hero-actions', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .from('.hero-stats', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .from('.hero-terminal', { opacity: 0, x: 20, duration: 0.8, ease: 'power3.out' }, '-=0.6');

      // Scroll Animations for sections
      gsap.utils.toArray<HTMLElement>('.fade-up-section').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
        );
      });

      // Bento Grid Stagger
      gsap.fromTo(
        '.bento-item',
        { opacity: 0, scale: 0.95, y: 20 },
        {
          scrollTrigger: {
            trigger: '.bento-container',
            start: 'top 90%',
          },
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'back.out(1.2)',
        },
      );
    },
    { scope: container },
  );

  return (
    <div ref={container} className="relative bg-black text-white selection:bg-blue-500/30">
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Hero Highlight with GSAP
          ═══════════════════════════════════════════════════════════════ */}
      <HeroHighlight containerClassName="min-h-screen border-b border-white/5" className="w-full">
        <section className="relative px-6 pt-20 overflow-hidden w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="z-10">
              <Badge
                variant="secondary"
                className="hero-badge mb-6 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium tracking-wide uppercase bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                <Zap className="h-3 w-3" />
                Open Source
              </Badge>

              <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                The package manager for <Highlight>AI capabilities</Highlight>
              </h1>

              <div className="hero-desc mb-8">
                <TypewriterEffect
                  className="text-left text-lg md:text-xl text-neutral-400 font-normal leading-relaxed"
                  words={[
                    { text: 'Install,' },
                    { text: 'share,' },
                    { text: 'and' },
                    { text: 'version' },
                    { text: 'AI' },
                    { text: 'skills' },
                    { text: 'across' },
                    { text: 'any' },
                    { text: 'model.' },
                    { text: 'One', className: 'text-blue-400' },
                    { text: 'command', className: 'text-blue-400' },
                    { text: 'to' },
                    { text: 'install.' },
                  ]}
                />
              </div>

              <div className="hero-actions flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Button
                  asChild
                  size="lg"
                  className="relative group bg-blue-500 text-white hover:bg-blue-600 h-12 px-8 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(59,130,246,0.5)] border border-blue-400/50 overflow-hidden"
                >
                  <Link href="/packages">
                    <span className="relative z-10 flex items-center">
                      Browse Registry
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="group relative border-white/20 text-white hover:bg-white/10 h-12 px-8 rounded-full text-sm font-medium bg-black/50 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <a
                    href="https://github.com/NoticedXAaryan/skillspace"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="relative z-10 flex items-center">
                      GitHub
                      <ArrowUpRight className="ml-1.5 h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                </Button>
              </div>

              {/* Stats row */}
              <div className="hero-stats flex gap-10 border-t border-white/10 pt-8">
                <div>
                  <div className="text-3xl font-semibold tracking-tight tabular-nums">
                    {stats.skillsCount}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
                    packages
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tight tabular-nums">
                    {stats.usersCount}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
                    developers
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tight tabular-nums">
                    {stats.downloadsCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
                    downloads
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Terminal Demo */}
            <div className="hero-terminal hidden lg:block z-10 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-3xl opacity-50 -z-10 rounded-full" />
              <AnimatedTerminal
                command="skillspace install @skillspace/security-review"
                output={`Resolved @skillspace/security-review@2.1.0\nDownloaded 2.3 kB in 0.4s\nInstalled to ~/.skillspace/registry/`}
              />
            </div>
          </div>
        </section>
      </HeroHighlight>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 Steps with code examples
          ═══════════════════════════════════════════════════════════════ */}
      <section className="fade-up-section px-6 py-24 border-t border-white/5 relative">
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="flex items-end justify-between mb-14">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Three commands to ship
              </h2>
              <p className="text-lg text-neutral-400">From discovery to execution in seconds.</p>
            </div>
            <Link
              href="/docs"
              className="hidden md:flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Read the docs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Install',
                desc: 'Browse the registry and install capabilities with a single command.',
                code: 'skillspace install @skillspace/code-reviewer',
              },
              {
                step: '02',
                title: 'Run',
                desc: 'Execute any installed skill against your code, text, or data.',
                code: 'skillspace run code-reviewer --input ./src',
              },
              {
                step: '03',
                title: 'Share',
                desc: 'Package and publish your own capabilities for others to use.',
                code: 'skillspace publish',
              },
            ].map((item) => (
              <div key={item.step} className="group">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 h-full hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-center gap-4 mb-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30">
                      {item.step}
                    </span>
                    <h3 className="text-lg font-bold tracking-wide text-neutral-200">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-neutral-400 text-base mb-8 leading-relaxed">{item.desc}</p>
                  <code className="block text-sm font-mono bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-neutral-300 group-hover:border-white/20 transition-colors shadow-inner">
                    <span className="text-blue-400">$</span> {item.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — Bento Grid
          ═══════════════════════════════════════════════════════════════ */}
      <section className="fade-up-section px-6 py-24 border-t border-white/5 bg-neutral-950/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-6xl relative z-10 bento-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              SkillSpace provides a comprehensive toolkit for AI agents and developers.
            </p>
          </div>

          <BentoGrid>
            <BentoGridItem
              className="bento-item md:col-span-2"
              title="Global Registry"
              description="Discover and install community-published skills for any task. From code review to log analysis, find the exact capability you need."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />
              }
              icon={<Globe className="h-6 w-6 text-blue-400" />}
            />
            <BentoGridItem
              className="bento-item md:col-span-1"
              title="Version Control"
              description="Lock files and semantic versioning ensure your AI agents behave consistently across every deployment."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />
              }
              icon={<GitBranch className="h-6 w-6 text-emerald-400" />}
            />
            <BentoGridItem
              className="bento-item md:col-span-1"
              title="Secure Sandbox"
              description="Skills run in isolated environments with strict permission boundaries. No unauthorized network or file access."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />
              }
              icon={<ShieldCheck className="h-6 w-6 text-rose-400" />}
            />
            <BentoGridItem
              className="bento-item md:col-span-2"
              title="CLI Native workflow"
              description="Feels exactly like npm, pip, or cargo. Integrate directly into your CI/CD pipelines and developer environments."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />
              }
              icon={<Terminal className="h-6 w-6 text-amber-400" />}
            />
          </BentoGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TRENDING PACKAGES
          ═══════════════════════════════════════════════════════════════ */}
      <section className="fade-up-section px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {packages.length > 0 ? 'Trending packages' : 'Registry'}
              </h2>
              <p className="text-lg text-neutral-400 mt-2">
                {packages.length > 0
                  ? 'Discover what the community is building.'
                  : 'Be the first to publish a package.'}
              </p>
            </div>
            {packages.length > 0 && (
              <Button
                asChild
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent hidden sm:flex rounded-full"
              >
                <Link href="/packages">View all</Link>
              </Button>
            )}
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <Package className="h-10 w-10 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500 mb-6 text-lg">No packages published yet.</p>
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 rounded-full"
              >
                <Link href="/create">Publish the first package</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, i) => (
                <div
                  key={pkg.name}
                  className="hover:-translate-y-1 transition-transform duration-300"
                >
                  <PackageCard pkg={{ ...(pkg as any), isNew: i < 2 }} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="fade-up-section px-6 py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(59,130,246,0.15),transparent)]" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Start building with <Highlight>SkillSpace</Highlight>
          </h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the open-source community building the future of AI capability management. Install
            your first skill in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-neutral-200 h-14 px-10 rounded-full text-base font-semibold transition-transform hover:scale-105"
            >
              <Link href="/packages">
                Browse Registry
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/50 border border-white/10 text-base text-neutral-300 font-mono shadow-2xl backdrop-blur-sm hover:border-white/20 transition-colors">
            <span className="text-blue-400">$</span>
            npx skillspace install
          </div>
        </div>
      </section>
    </div>
  );
}
