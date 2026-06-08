'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    router.push('/');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="navLogo">
        SkillSpace
      </Link>
      <div className="navLinks">
        <Link href="/">Explore</Link>
        <Link href="/docs">Docs</Link>
        {isAuth ? (
          <>
            <Link href="/profile">Profile</Link>
            <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Sign In</Link>
            <Link href="/register" className="btn btnPrimary">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
