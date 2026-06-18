import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black pt-20 pb-12 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-5 px-6">
        <div className="md:col-span-2">
          <Link
            href="/"
            className="mb-4 inline-block text-xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
          >
            SkillSpace
          </Link>
          <p className="mb-6 text-base text-neutral-400 max-w-xs leading-relaxed">
            The universal runtime and registry for AI capabilities. Build, share, and execute skills
            anywhere.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/NoticedXAaryan/skillspace"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white">
            Registry
          </h3>
          <div className="flex flex-col gap-4">
            <Link
              href="/packages"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Browse Packages
            </Link>
            <Link
              href="/search"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Search Skills
            </Link>
            <Link
              href="/trending"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Trending
            </Link>
            <Link
              href="/analytics"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Analytics
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white">
            Resources
          </h3>
          <div className="flex flex-col gap-4">
            <Link
              href="/docs"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/docs/api"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              API Reference
            </Link>
            <Link
              href="/playground"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Playground
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white">Legal</h3>
          <div className="flex flex-col gap-4">
            <Link
              href="/terms"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/security"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-neutral-500 mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} SkillSpace. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-neutral-500">All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
