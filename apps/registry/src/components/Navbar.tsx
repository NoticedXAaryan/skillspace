'use client';

import Link from 'next/link';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Book, Compass, Package, Box, Play, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpandingSearchDock } from '@/components/ui/expanding-search-dock-shadcnui';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

const menu: MenuItem[] = [
  {
    title: "Explore",
    url: "#",
    items: [
      {
        title: "Registry",
        description: "Browse thousands of community-built skills.",
        icon: <Package className="size-5 shrink-0 text-blue-400" />,
        url: "/packages",
      },
      {
        title: "Trending",
        description: "See what the community is downloading today.",
        icon: <Compass className="size-5 shrink-0 text-blue-400" />,
        url: "/trending",
      },
      {
        title: "Showcase",
        description: "Discover what's possible with SkillSpace.",
        icon: <Box className="size-5 shrink-0 text-blue-400" />,
        url: "/showcase",
      },
    ],
  },
  {
    title: "Developers",
    url: "#",
    items: [
      {
        title: "Documentation",
        description: "Get started building skills with our guides.",
        icon: <Book className="size-5 shrink-0 text-blue-400" />,
        url: "/docs",
      },
      {
        title: "API Reference",
        description: "Detailed API specs for integrating skills.",
        icon: <FileCode2 className="size-5 shrink-0 text-blue-400" />,
        url: "/docs/api",
      },
      {
        title: "Playground",
        description: "Test and run skills directly in your browser.",
        icon: <Play className="size-5 shrink-0 text-blue-400" />,
        url: "/playground",
      },
    ],
  },
];

export default function Navbar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isAuth = !!session;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSearchSubmit = (queryStr: string) => {
    if (queryStr.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryStr.trim())}`);
      setIsSheetOpen(false);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.items) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger className="bg-transparent text-neutral-300 hover:text-white">{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-[400px] p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-black/95 backdrop-blur-md border-white/10 grid grid-cols-2 gap-3">
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={subItem.url}
                      className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 hover:text-white text-neutral-300"
                    >
                      {subItem.icon}
                      <div>
                        <div className="text-sm font-semibold text-white mb-1">
                          {subItem.title}
                        </div>
                        {subItem.description && (
                          <p className="text-sm leading-snug text-neutral-500">
                            {subItem.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem key={item.title}>
        <Link href={item.url} legacyBehavior passHref>
          <NavigationMenuLink className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50", pathname === item.url && "text-blue-400")}>
            {item.title}
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    );
  };

  const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
      return (
        <AccordionItem key={item.title} value={item.title} className="border-b-white/10">
          <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline text-white">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="mt-2 flex flex-col gap-2">
            {item.items.map((subItem) => (
              <Link
                key={subItem.title}
                href={subItem.url}
                onClick={() => setIsSheetOpen(false)}
                className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-white/10 text-neutral-300 hover:text-white"
              >
                {subItem.icon}
                <div>
                  <div className="text-sm font-semibold text-white">{subItem.title}</div>
                  {subItem.description && (
                    <p className="text-sm leading-snug text-neutral-500 mt-1">
                      {subItem.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <Link key={item.title} href={item.url} onClick={() => setIsSheetOpen(false)} className="py-2 text-base font-semibold text-white">
        {item.title}
      </Link>
    );
  };

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-black/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          SkillSpace
        </Link>
        
        <div className="hidden items-center md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {menu.map((item) => renderMenuItem(item))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      
      <div className="hidden items-center gap-6 md:flex">
        <ExpandingSearchDock onSearch={handleSearchSubmit} placeholder="Search packages..." />
        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="https://github.com/NoticedXAaryan/skillspace" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors text-neutral-300 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            <span className="text-xs">GitHub</span>
          </a>

          {isAuth ? (
            <>
              <Link href="/dashboard" className={cn("transition-colors hover:text-blue-400", pathname === '/dashboard' ? 'text-blue-400' : 'text-neutral-300')}>Dashboard</Link>
              <Button variant="ghost" onClick={handleSignOut} className="text-neutral-300 hover:text-white hover:bg-white/10">Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/login" className={cn("transition-colors hover:text-blue-400", pathname === '/login' ? 'text-blue-400' : 'text-neutral-300')}>Sign In</Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-400 font-semibold h-8 px-3 text-xs">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden flex items-center">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-300 hover:text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-[350px] overflow-y-auto">
            <SheetHeader className="mb-6 border-b border-white/10 pb-4">
              <SheetTitle>
                <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white" onClick={() => setIsSheetOpen(false)}>
                  SkillSpace
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6">
              <div className="w-full flex justify-start">
                <ExpandingSearchDock onSearch={handleSearchSubmit} placeholder="Search packages..." />
              </div>
              
              <Accordion
                type="single"
                collapsible
                className="flex w-full flex-col gap-2"
              >
                {menu.map((item) => renderMobileMenuItem(item))}
              </Accordion>
              
              <div className="border-t border-white/10 pt-4">
                <a href="https://github.com/NoticedXAaryan/skillspace" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 text-base font-semibold text-white">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  GitHub
                </a>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {isAuth ? (
                  <>
                    <Button variant="outline" asChild className="w-full border-white/10 text-white hover:bg-white/10 hover:text-white">
                      <Link href="/dashboard" onClick={() => setIsSheetOpen(false)}>Dashboard</Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => { handleSignOut(); setIsSheetOpen(false); }} 
                      className="w-full text-neutral-300 hover:text-white hover:bg-white/10"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full border-white/10 text-white bg-transparent hover:bg-white/10 hover:text-white">
                      <Link href="/login" onClick={() => setIsSheetOpen(false)}>Log in</Link>
                    </Button>
                    <Button asChild className="w-full bg-blue-500 text-white hover:bg-blue-400 font-semibold">
                      <Link href="/register" onClick={() => setIsSheetOpen(false)}>Sign up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
