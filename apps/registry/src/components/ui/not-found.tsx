'use client';

import { Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface NotFoundProps {
  title?: string
  description?: string
}

export function Illustration(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 362 145" {...props}>
      <path
        fill="currentColor"
        d="M62.6 142c-2.133 0-3.2-1.067-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.333.4-2.733 1.2-4.2L58.2 4c.8-1.333 2.067-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c.933 0 1.733.333 2.4 1 .667.533 1 1.267 1 2.2v21.2c0 .933-.333 1.733-1 2.4-.667.533-1.467.8-2.4.8H93v20.8c0 2.133-1.067 3.2-3.2 3.2H62.6zM33 90.4h26.4V51.2L33 90.4zM181.67 144.6c-7.333 0-14.333-1.333-21-4-6.666-2.667-12.866-6.733-18.6-12.2-5.733-5.467-10.266-13-13.6-22.6-3.333-9.6-5-20.667-5-33.2 0-12.533 1.667-23.6 5-33.2 3.334-9.6 7.867-17.133 13.6-22.6 5.734-5.467 11.934-9.533 18.6-12.2 6.667-2.8 13.667-4.2 21-4.2 7.467 0 14.534 1.4 21.2 4.2 6.667 2.667 12.8 6.733 18.4 12.2 5.734 5.467 10.267 13 13.6 22.6 3.334 9.6 5 20.667 5 33.2 0 12.533-1.666 23.6-5 33.2-3.333 9.6-7.866 17.133-13.6 22.6-5.6 5.467-11.733 9.533-18.4 12.2-6.666 2.667-13.733 4-21.2 4zm0-31c9.067 0 15.6-3.733 19.6-11.2 4.134-7.6 6.2-17.533 6.2-29.8s-2.066-22.2-6.2-29.8c-4.133-7.6-10.666-11.4-19.6-11.4-8.933 0-15.466 3.8-19.6 11.4-4 7.6-6 17.533-6 29.8s2 22.2 6 29.8c4.134 7.467 10.667 11.2 19.6 11.2zM316.116 142c-2.134 0-3.2-1.067-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.333.4-2.733 1.2-4.2l56.6-84.6c.8-1.333 2.066-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c.933 0 1.733.333 2.4 1 .666.533 1 1.267 1 2.2v21.2c0 .933-.334 1.733-1 2.4-.667.533-1.467.8-2.4.8h-11.2v20.8c0 2.133-1.067 3.2-3.2 3.2h-27.2zm-29.6-51.6h26.4V51.2l-26.4 39.2z"
      />
    </svg>
  )
}

export function NotFoundContent({
  title = "Page not found",
  description = "The capability or page you are looking for does not exist in the registry or may have been removed.",
}: NotFoundProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative text-center z-[1] pt-32 pb-32">
      <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl">
        {title}
      </h1>
      <p className="mt-6 text-pretty text-lg font-medium text-neutral-400 sm:text-xl/8 max-w-xl mx-auto">
        {description}
      </p>
      <form onSubmit={handleSearch} className="mt-10 flex flex-col sm:flex-row gap-y-3 sm:space-x-2 mx-auto sm:max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <Input 
            placeholder="Search for skills..." 
            className="pl-10 h-10 border-white/10 bg-black/50 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" type="submit" className="border-white/10 text-white hover:bg-white/10">Search</Button>
      </form>
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-y-3 gap-x-6">
        <Button variant="secondary" onClick={() => router.back()} className="group bg-neutral-900 text-white hover:bg-neutral-800 border border-white/10">
          <ArrowLeft
            className="me-2 ms-0 opacity-60 transition-transform group-hover:-translate-x-0.5"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          Go back
        </Button>
        <Button className="-order-1 sm:order-none bg-cyan-500 text-black hover:bg-cyan-400 font-semibold" asChild>
          <Link href="/">Take me home</Link>
        </Button>
      </div>
    </div>
  )
}
