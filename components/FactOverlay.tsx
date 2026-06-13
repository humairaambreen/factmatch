"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import { Fact, SwipeDirection } from "@/lib/types";
import { ExpandedTile } from "./FactTile";

const SWIPE_X_THRESHOLD = 120;
const SWIPE_Y_CLOSE = 100;

function SwipeableExpanded({
  fact,
  onSwipe,
  onDismiss,
  useMorphLayout,
}: {
  fact: Fact;
  onSwipe: (direction: SwipeDirection) => void;
  onDismiss: () => void;
  useMorphLayout?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-10, 10]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -20], [1, 0]);
  const dismissProgress = useTransform(y, [0, 120], [0, 1]);
  const dismissHintOpacity = useTransform(y, [40, 100], [0, 1]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const isVertical = Math.abs(info.offset.y) > Math.abs(info.offset.x);

    if (isVertical && info.offset.y > SWIPE_Y_CLOSE) {
      animate(y, 800, { duration: 0.3, ease: "easeOut" });
      onDismiss();
    } else if (!isVertical && info.offset.x > SWIPE_X_THRESHOLD) {
      animate(x, 500, { duration: 0.3, ease: "easeOut" });
      onSwipe("right");
    } else if (!isVertical && info.offset.x < -SWIPE_X_THRESHOLD) {
      animate(x, -500, { duration: 0.3, ease: "easeOut" });
      onSwipe("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
      animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }

  function trigger(direction: SwipeDirection) {
    animate(x, direction === "right" ? 500 : -500, { duration: 0.3, ease: "easeOut" });
    onSwipe(direction);
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    // Ignore taps on interactive elements inside the card
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const w = rect.width;
    if (relX < w * 0.35) trigger("left");
    else if (relX > w * 0.65) trigger("right");
  }

  return (
    <motion.div
      className="relative w-full h-full touch-none select-none"
      style={{ x, y, rotate }}
      drag
      dragElastic={0.25}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      onClick={handleTap}
    >
      {/* tap zones — invisible, pointer-events handled by parent onClick */}
      <div className="absolute left-0 top-0 w-[35%] h-[75%] z-[5] pointer-events-none" />
      <div className="absolute right-0 top-0 w-[35%] h-[75%] z-[5] pointer-events-none" />

      {/* like / skip stamps */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-7 stamp text-alabaster z-10">
        Useful
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-7 stamp text-alabaster z-10">
        Skip
      </motion.div>

      {/* swipe-down dismiss hint */}
      <motion.div
        style={{ opacity: dismissHintOpacity }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/40 backdrop-blur-sm text-alabaster text-xs font-semibold px-4 py-1.5 rounded-full"
      >
        Release to close
      </motion.div>

      {/* drag handle bar */}
      <motion.div
        style={{ scaleX: dismissProgress }}
        className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-alabaster/40 rounded-full z-10"
      />

      <ExpandedTile
        fact={fact}
        onLike={() => trigger("right")}
        onSkip={() => trigger("left")}
        useMorphLayout={useMorphLayout}
      />
    </motion.div>
  );
}

export default function FactOverlay({
  queue,
  activeIndex,
  onSwipe,
  onClose,
  morphTargetId,
}: {
  queue: Fact[];
  activeIndex: number;
  onSwipe: (fact: Fact, direction: SwipeDirection) => void;
  onClose: () => void;
  morphTargetId: string | null;
}) {
  const current = queue[activeIndex];
  const done = !current;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-3 py-3 sm:px-4 sm:py-[5%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="absolute inset-0 bg-onyx/55 backdrop-blur-xl"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md h-full" style={{ maxHeight: "min(820px, calc(100dvh - 24px))" }}>
          {!done && queue[activeIndex + 2] && (
            <div
              className="absolute inset-0 rounded-[2rem] overflow-hidden opacity-40"
              style={{ transform: "scale(0.88) translateY(32px)", zIndex: -2 }}
            >
              <Image
                src={queue[activeIndex + 2].image}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          {!done && queue[activeIndex + 1] && (
            <div
              className="absolute inset-0 rounded-[2rem] overflow-hidden opacity-60"
              style={{ transform: "scale(0.94) translateY(18px)", zIndex: -1 }}
            >
              <Image
                src={queue[activeIndex + 1].image}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full w-full rounded-[2rem] glass-dark flex flex-col items-center justify-center text-center px-8 gap-4"
            >
              <h3 className="text-xl font-bold text-alabaster">You&apos;re all caught up</h3>
              <p className="text-sm text-alabaster/70 max-w-xs">
                Loading a fresh batch personalized to what you&apos;ve liked so far…
              </p>
              <button onClick={onClose} className="btn-pill bg-alabaster text-onyx mt-2">
                Back to feed
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={current.id}
              className="absolute inset-0"
              initial={current.id === morphTargetId ? false : { opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              <SwipeableExpanded
                fact={current}
                onSwipe={(direction) => onSwipe(current, direction)}
                onDismiss={onClose}
                useMorphLayout={current.id === morphTargetId}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
