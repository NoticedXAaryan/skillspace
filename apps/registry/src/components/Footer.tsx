import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: 'var(--space-12) var(--space-6)',
      marginTop: 'var(--space-16)',
      background: 'var(--bg-base)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-8)'
      }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', fontWeight: 'var(--weight-semibold)' }}>SkillSpace</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            The universal runtime and registry for AI capabilities.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            &copy; {new Date().getFullYear()} SkillSpace
          </p>
        </div>
        
        <div>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registry</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link href="/packages" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Browse Packages</Link>
            <Link href="/search" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Search Skills</Link>
            <Link href="/analytics" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Registry Analytics</Link>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link href="/docs" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Documentation</Link>
            <Link href="/docs#cli-reference" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>CLI Reference</Link>
            <Link href="/playground" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Playground Terminal</Link>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Community</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <a href="https://github.com/skillspace" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>GitHub</a>
            <a href="https://discord.gg/skillspace" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Discord</a>
            <a href="https://status.skillspace.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Status page</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
