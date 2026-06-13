"use client";

import { useEffect, useRef, useState } from "react";
import { lenisStore } from "@/lib/lenis";
import { AnimatePresence, motion } from "framer-motion";
import { Fact } from "@/lib/types";
import { FeedTile } from "./FactTile";

const GAP = 14;

const ASPECT_RATIOS: Record<Fact["height"], number> = {
  short: 5 / 4,
  medium: 4 / 3,
  tall: 3 / 2,
};

function getColCount(width: number): number {
  if (width >= 1200) return 4;
  if (width >= 860) return 3;
  return 2;
}

interface ItemPosition {
  left: number;
  top: number;
  width: number;
  height: number;
  col: number;
}

function computePositions(
  items: { height: Fact["height"] }[],
  colCount: number,
  colWidth: number
): { positions: ItemPosition[]; containerHeight: number } {
  const colHeights = new Array(colCount).fill(0);
  const positions: ItemPosition[] = items.map((item) => {
    const height = Math.round(colWidth * ASPECT_RATIOS[item.height]);
    const col = colHeights.indexOf(Math.min(...colHeights));
    const left = col * (colWidth + GAP);
    const top = colHeights[col];
    colHeights[col] += height + GAP;
    return { left, top, width: colWidth, height, col };
  });
  return { positions, containerHeight: Math.max(...colHeights) };
}

const SKELETON_PATTERN: Fact["height"][] = [
  "tall", "short", "medium", "short", "tall", "medium",
  "medium", "tall", "short", "medium", "short", "tall",
];

function SkeletonGrid({ colCount, colWidth }: { colCount: number; colWidth: number }) {
  const { positions, containerHeight } = computePositions(
    SKELETON_PATTERN.map((height) => ({ height })),
    colCount,
    colWidth
  );
  return (
    <div style={{ position: "relative", height: containerHeight }}>
      {SKELETON_PATTERN.map((_, i) => (
        <div
          key={i}
          className="rounded-[1.5rem] bg-slate/10 animate-pulse"
          style={{
            position: "absolute",
            left: positions[i].left,
            top: positions[i].top,
            width: colWidth,
            height: positions[i].height,
          }}
        />
      ))}
    </div>
  );
}

export default function MasonryFeed({
  facts,
  onOpen,
  onLoadMore,
  hiddenId,
  loadingMore,
  initialLoading,
}: {
  facts: Fact[];
  onOpen: (index: number) => void;
  onLoadMore: () => void;
  hiddenId?: string | null;
  loadingMore: boolean;
  initialLoading?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore]);

  // Preload images + tell Lenis the page grew so it updates its scroll limit
  useEffect(() => {
    if (typeof window === "undefined") return;
    facts.forEach((fact) => {
      const img = new window.Image();
      img.src = fact.image;
    });
    // Small delay so the DOM has painted the new height before Lenis reads it
    const t = setTimeout(() => lenisStore.resize(), 120);
    return () => clearTimeout(t);
  }, [facts]);

  const colCount = getColCount(containerWidth);
  const colWidth =
    containerWidth > 0
      ? Math.floor((containerWidth - GAP * (colCount - 1)) / colCount)
      : 0;

  const showSkeleton = initialLoading || containerWidth === 0;

  const { positions, containerHeight } =
    colWidth > 0 && facts.length > 0
      ? computePositions(facts, colCount, colWidth)
      : { positions: [], containerHeight: 0 };

  return (
    <div ref={containerRef} className="px-4 pb-28">
      <AnimatePresence mode="wait">
        {showSkeleton ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {colWidth > 0 ? (
              <SkeletonGrid colCount={colCount} colWidth={colWidth} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {SKELETON_PATTERN.map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-[1.5rem] bg-slate/10 animate-pulse ${
                      h === "short"
                        ? "aspect-[4/5]"
                        : h === "medium"
                        ? "aspect-[3/4]"
                        : "aspect-[2/3]"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="feed"
            style={{ position: "relative", height: containerHeight }}
          >
            {facts.map((fact, i) => {
              const pos = positions[i];
              if (!pos) return null;
              const delay = Math.min(i * 0.04, 0.4);
              return (
                <motion.div
                  key={fact.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut", delay }}
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    width: pos.width,
                    height: pos.height,
                    visibility: hiddenId === fact.id ? "hidden" : "visible",
                  }}
                >
                  <FeedTile fact={fact} onOpen={() => onOpen(i)} priority={i < 8} />
                </motion.div>
              );
            })}

            {/* Bottom blur overlay during infinite scroll load */}
            <AnimatePresence>
              {loadingMore && facts.length > 0 && (
                <motion.div
                  key="blur-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                    background:
                      "linear-gradient(to top, rgba(240,239,237,0.95) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={sentinelRef} className="h-1 w-full" />
    </div>
  );
}
