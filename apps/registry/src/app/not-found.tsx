import { NotFoundContent, Illustration } from "@/components/ui/not-found"
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-cyan-500/30">
      <Navbar />
      <main className="flex-1 relative flex flex-col w-full justify-center p-6 md:p-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
          <Illustration className="absolute inset-0 w-full h-[60vh] opacity-5 text-cyan-500 pointer-events-none -translate-y-12" />
          <NotFoundContent
            title="Page not found"
            description="The skill or page you are looking for does not exist in the registry or may have been removed."
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
