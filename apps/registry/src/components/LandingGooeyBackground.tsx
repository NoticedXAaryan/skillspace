"use client"

import React from "react"
import { useScreenSize } from "@/hooks/use-screen-size"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { GooeyFilter } from "@/components/ui/gooey-filter"

export function LandingGooeyBackground() {
  const screenSize = useScreenSize()

  return (
    <GooeyFilter id="gooey-filter-pixel-trail" strength={5} />
  )
}
