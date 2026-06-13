"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[70]"
      >
        <div className="glass-frosted rounded-[1.5rem] p-5 shadow-pop">
          <p className="text-sm font-semibold text-onyx mb-1.5">
            We keep things on your device
          </p>
          <p className="text-xs text-onyx/70 leading-relaxed mb-4">
            FactMatch can save your swipes, profile, and interest stats
            locally on this device (no account, nothing sent to a server) so
            your feed gets more personalized and your profile card stays
            up to date. You can clear this anytime from your profile.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onAccept} className="btn-pill btn-pill-primary flex-1 text-xs px-4 py-2.5">
              Allow &amp; personalize
            </button>
            <button onClick={onDecline} className="btn-pill btn-pill-ghost text-xs px-4 py-2.5">
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
