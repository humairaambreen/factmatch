"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { RefreshCw } from "lucide-react";
import { lenisStore } from "@/lib/lenis";

const THRESHOLD = 72; // px pull required to trigger refresh

interface Props {
  onRefresh: () => void;
}

export default function PullToRefresh({ onRefresh }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "pulling" | "ready" | "loading">("idle");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const touchStartY = useRef(0);
  const pullY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return;
      touchStartY.current = e.touches[0].clientY;
      pullY.current = 0;
      if (phaseRef.current === "idle") setPhase("pulling");
    }

    function onTouchMove(e: TouchEvent) {
      if (phaseRef.current === "loading") return;
      if (window.scrollY > 0) return;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy <= 0) {
        if (phaseRef.current !== "idle") setPhase("idle");
        return;
      }
      // Rubber-band: diminishing returns
      const damped = Math.min(dy * 0.45, THRESHOLD * 1.4);
      pullY.current = damped;

      if (!containerRef.current || !iconRef.current) return;
      gsap.set(containerRef.current, { y: damped, opacity: Math.min(damped / THRESHOLD, 1) });
      gsap.set(iconRef.current, { rotate: (damped / THRESHOLD) * 180 });

      if (damped >= THRESHOLD) {
        if (phaseRef.current !== "ready") setPhase("ready");
      } else {
        if (phaseRef.current !== "pulling") setPhase("pulling");
      }
    }

    function onTouchEnd() {
      if (phaseRef.current === "ready") {
        setPhase("loading");
        // Snap to loading position
        gsap.to(containerRef.current, { y: 56, duration: 0.2, ease: "power2.out" });
        if (iconRef.current) {
          gsap.to(iconRef.current, { rotate: 360, repeat: -1, duration: 0.7, ease: "none" });
        }
        onRefresh();
        setTimeout(dismiss, 1200);
      } else {
        dismiss();
      }
    }

    function dismiss() {
      gsap.to(containerRef.current, { y: 0, opacity: 0, duration: 0.35, ease: "power2.inOut" });
      if (iconRef.current) gsap.killTweensOf(iconRef.current);
      setPhase("idle");
      pullY.current = 0;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex justify-center"
      style={{ opacity: 0, transform: "translateY(0px)" }}
    >
      <div
        className="mt-3 flex items-center gap-2 rounded-full px-4 py-2 shadow-lg text-xs font-semibold"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", color: "#16a085" }}
      >
        <div ref={iconRef} style={{ display: "flex" }}>
          <RefreshCw className="h-3.5 w-3.5" />
        </div>
        {phase === "ready" || phase === "loading" ? "Release to refresh" : "Pull to refresh"}
      </div>
    </div>
  );
}
