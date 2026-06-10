import examplesData from '@/data/examples.json';
import ExamplesClient from './ExamplesClient';
import { HeroSection } from '@/components/ui/hero-odyssey';

export default function ExamplesPage() {
  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection 
        title="Production Examples"
        subtitle="Explore 50+ real-world capabilities built and shared by the SkillSpace community."
        align="center"
        badge={{ text: "Examples" }}
      />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 -mt-8">
        <ExamplesClient examples={examplesData} />
      </div>
    </main>
  );
}
