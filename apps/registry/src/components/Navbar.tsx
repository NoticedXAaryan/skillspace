'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          SkillSpace
        </Link>
        
        <div className="hidden items-center gap-6 md:flex">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search packages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-9 lg:w-[300px]"
            />
          </form>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/packages" className={cn("transition-colors hover:text-foreground", pathname === '/packages' ? 'text-foreground' : 'text-muted-foreground')}>Explore</Link>
            <Link href="/docs" className={cn("transition-colors hover:text-foreground", pathname.startsWith('/docs') ? 'text-foreground' : 'text-muted-foreground')}>Docs</Link>
            {isAuth ? (
              <>
                <Link href="/profile" className={cn("transition-colors hover:text-foreground", pathname === '/profile' ? 'text-foreground' : 'text-muted-foreground')}>Profile</Link>
                <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link href="/login" className={cn("transition-colors hover:text-foreground", pathname === '/login' ? 'text-foreground' : 'text-muted-foreground')}>Sign In</Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <button className="md:hidden" onClick={toggleMenu}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 flex flex-col gap-4 bg-background p-6 md:hidden">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search packages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </form>
          <Link href="/packages" onClick={toggleMenu} className={cn("text-lg font-medium", pathname === '/packages' ? 'text-foreground' : 'text-muted-foreground')}>Explore</Link>
          <Link href="/docs" onClick={toggleMenu} className={cn("text-lg font-medium", pathname.startsWith('/docs') ? 'text-foreground' : 'text-muted-foreground')}>Docs</Link>
          {isAuth ? (
            <>
              <Link href="/profile" onClick={toggleMenu} className={cn("text-lg font-medium", pathname === '/profile' ? 'text-foreground' : 'text-muted-foreground')}>Profile</Link>
              <Button variant="ghost" onClick={() => { handleSignOut(); toggleMenu(); }} className="justify-start px-0 text-lg">Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={toggleMenu} className={cn("text-lg font-medium", pathname === '/login' ? 'text-foreground' : 'text-muted-foreground')}>Sign In</Link>
              <Link href="/register" onClick={toggleMenu} className="mt-4">
                <Button className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
