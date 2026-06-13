"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizOption {
  id: string;
  text: string;
}

export default function QuizModal({
  target,
  decoys,
  onClose,
}: {
  /** The fact the user previously right-swiped ("useful") */
  target: QuizOption;
  /** Other facts (any from history) used as wrong answers */
  decoys: QuizOption[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => {
    const all = [target, ...decoys.slice(0, 3)];
    return all.sort(() => Math.random() - 0.5);
  }, [target, decoys]);

  const isCorrect = selected === target.id;
  const answered = selected !== null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[65] flex items-center justify-center px-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-onyx/60 backdrop-blur-sm"
          onClick={answered ? onClose : undefined}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative w-full max-w-sm bg-alabaster-soft rounded-[1.75rem] shadow-pop flex flex-col"
          style={{ maxHeight: "88vh" }}
        >
          <div className="px-6 pt-6 pb-3 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-slate pulse" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                Quick recall check
              </p>
            </div>
            <h2 className="text-lg font-bold">
              Which of these did you swipe as useful?
            </h2>
          </div>

          <div
            className="flex flex-col gap-2.5 overflow-y-auto px-6 pb-2"
            data-lenis-prevent
            style={{ scrollbarWidth: "none" }}
          >
            {options.map((opt) => {
              const isSelected = selected === opt.id;
              const showCorrect = answered && opt.id === target.id;
              const showWrong = answered && isSelected && opt.id !== target.id;

              return (
                <button
                  key={opt.id}
                  disabled={answered}
                  onClick={() => setSelected(opt.id)}
                  className={[
                    "text-left text-sm leading-snug rounded-2xl border px-4 py-3 transition-all",
                    showCorrect
                      ? "border-slate bg-slate/15 font-semibold"
                      : showWrong
                      ? "border-onyx/30 bg-onyx/5 line-through opacity-70"
                      : "border-slate/15 bg-white hover:border-slate/40",
                  ].join(" ")}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden px-6 pb-6 shrink-0"
              >
                <p className={`text-sm font-medium mt-3 mb-3 ${isCorrect ? "text-slate" : "text-onyx/70"}`}>
                  {isCorrect
                    ? "Nice memory! That's the one you swiped as useful."
                    : "Not quite — but seeing it again helps it stick."}
                </p>
                <button onClick={onClose} className="btn-pill btn-pill-primary w-full">
                  Continue exploring
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
