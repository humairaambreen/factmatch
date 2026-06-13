"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { lenisStore } from "@/lib/lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.18,        // higher = snappier, less lag
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,  // don't override native touch scroll
    });

    lenisStore.set(lenis);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisStore.set(null);
    };
  }, []);

  return null;
}
