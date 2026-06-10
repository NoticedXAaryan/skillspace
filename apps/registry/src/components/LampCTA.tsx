"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LampContainer } from "@/components/ui/lamp";

export function LampCTA() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-white to-neutral-400 py-4 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-7xl"
      >
        Build your first skill.
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex mt-8 gap-4 flex-col sm:flex-row"
      >
        <Button asChild size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-neutral-200 border-none font-semibold">
          <Link href="/docs">Read the Docs</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 bg-transparent font-semibold">
          <Link href="/docs/cli">Install CLI</Link>
        </Button>
      </motion.div>
    </LampContainer>
  );
}
