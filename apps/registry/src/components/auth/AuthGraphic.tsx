'use client';

import { motion } from 'framer-motion';
import { SparklesCore } from '../ui/sparkles';

export function AuthGraphic() {
  return (
    <div className="relative hidden lg:flex h-full w-full flex-col items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#06b6d4" // cyan-500
        />
      </div>

      <div className="z-10 flex flex-col items-center justify-center p-8 max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="mb-6 flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 backdrop-blur-sm">
              <svg
                className="h-8 w-8 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Welcome to <span className="text-cyan-400">SkillSpace</span>
          </h2>
          <p className="text-lg text-neutral-400 leading-relaxed">
            The premier registry for AI capabilities. Publish, discover, and integrate advanced
            skills into your AI agents seamlessly.
          </p>
        </motion.div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
