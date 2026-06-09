'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    router.push('/');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navLogo">
          SkillSpace
        </Link>
        
        {/* Desktop Links & Search */}
        <div className="navLinks" style={{ display: 'none' }}>
          {/* We will handle responsiveness via an inline style hack or a generic class. 
              Let's add a style block at the bottom to handle the media queries properly. */}
        </div>

        <div className="desktopNav" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMobileMenuOpen(false); }} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', color: 'var(--text-muted)' }} />
            <input 
              className="input" 
              placeholder="Search packages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 'calc(var(--space-6) + var(--space-2))', width: '200px' }}
            />
          </form>
          <div className="navLinks">
            <Link href="/packages" className={pathname === '/packages' ? 'active' : ''}>Explore</Link>
            <Link href="/docs" className={pathname.startsWith('/docs') ? 'active' : ''}>Docs</Link>
            {isAuth ? (
              <>
                <Link href="/profile" className={pathname === '/profile' ? 'active' : ''}>Profile</Link>
                <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={pathname === '/login' ? 'active' : ''}>Sign In</Link>
                <Link href="/register" className="btn btnPrimary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button className="mobileMenuBtn" onClick={toggleMenu} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobileMenu" style={{
          position: 'fixed', top: '48px', left: 0, right: 0, bottom: 0,
          background: 'var(--bg-base)', zIndex: 40, padding: 'var(--space-6)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-4)'
        }}>
          <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMobileMenuOpen(false); }} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', color: 'var(--text-muted)' }} />
            <input 
              className="input" 
              placeholder="Search packages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 'calc(var(--space-6) + var(--space-2))', width: '100%' }}
            />
          </form>
          <Link href="/packages" onClick={toggleMenu} className={pathname === '/packages' ? 'active' : ''} style={{ fontSize: 'var(--text-lg)' }}>Explore</Link>
          <Link href="/docs" onClick={toggleMenu} className={pathname.startsWith('/docs') ? 'active' : ''} style={{ fontSize: 'var(--text-lg)' }}>Docs</Link>
          {isAuth ? (
            <>
              <Link href="/profile" onClick={toggleMenu} className={pathname === '/profile' ? 'active' : ''} style={{ fontSize: 'var(--text-lg)' }}>Profile</Link>
              <button onClick={() => { handleSignOut(); toggleMenu(); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', textAlign: 'left', padding: 0 }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={toggleMenu} className={pathname === '/login' ? 'active' : ''} style={{ fontSize: 'var(--text-lg)' }}>Sign In</Link>
              <Link href="/register" onClick={toggleMenu} className="btn btnPrimary" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktopNav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobileMenuBtn { display: none !important; }
          .mobileMenu { display: none !important; }
        }
      `}</style>
    </>
  );
}
