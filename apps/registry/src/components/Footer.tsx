import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-background px-6 py-12">
      <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-base font-semibold text-foreground">SkillSpace</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            The universal runtime and registry for AI capabilities.
          </p>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SkillSpace
          </p>
        </div>
        
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Registry</h3>
          <div className="flex flex-col gap-3">
            <Link href="/packages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Packages</Link>
            <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Search Skills</Link>
            <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Registry Analytics</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Resources</h3>
          <div className="flex flex-col gap-3">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
            <Link href="/docs#cli-reference" className="text-sm text-muted-foreground hover:text-foreground transition-colors">CLI Reference</Link>
            <Link href="/playground" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Playground Terminal</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Community</h3>
          <div className="flex flex-col gap-3">
            <a href="https://github.com/skillspace" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
            <a href="https://discord.gg/skillspace" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Discord</a>
            <a href="https://status.skillspace.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Status page</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
