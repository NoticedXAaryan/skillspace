"use client";

import dynamic from 'next/dynamic';

export const DynamicGooeyBackground = dynamic(
  () => import('@/components/LandingGooeyBackground').then(mod => mod.LandingGooeyBackground),
  { ssr: false }
);
