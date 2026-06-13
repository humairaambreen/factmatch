"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { lenisStore } from "@/lib/lenis";

const WELCOME_LINES = [
  "Welcome to FactMatch.",
  "Stop doom scrolling.",
  "Learn facts instead.",
  "Get your own cards.",
  "Match profiles with anyone.",
  "Everything saved locally.",
  "Your knowledge base.",
];

const ALL_CATEGORIES = [
  // Science & Nature
  "Science", "Biology", "Chemistry", "Physics", "Mathematics",
  "Space", "Climate", "Nature", "Geology", "Oceanography",
  // Technology
  "Tech", "AI", "Robotics", "Cybersecurity", "Engineering", "Inventions",
  // Society & World
  "History", "Geography", "Travel", "Politics",
  "Economics", "Business", "Finance", "Cryptocurrency", "Law", "Education",
  // Ancient & History
  "Mythology", "Folklore", "Archaeology", "Military", "Crime",
  // Arts & Culture
  "Art", "Literature", "Design", "Movies", "Entertainment", "Music",
  "Architecture", "Fashion", "Comics", "Gaming", "Photography", "Theatre",
  "Anime", "Dance",
  // Health & Lifestyle
  "Healthcare", "Psychology", "Neuroscience", "Mental Health", "Fitness",
  "Nutrition", "Cooking", "Meditation", "Sustainability",
  // Human & Society
  "Sociology", "Linguistics", "Relationships",
  // Other
  "Animals", "Food", "Philosophy", "Sports", "General",
];

// ─── Wavy glow ────────────────────────────────────────────────────────────────
function WavyGlow({ color }: { color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 left-0 right-0"
      style={{ height: "35%" }}
      animate={{ scaleX: [1, 1.1, 0.94, 1.07, 1], scaleY: [1, 0.92, 1.08, 0.96, 1], opacity: [0.7, 1, 0.75, 0.95, 0.7] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 140% 90% at 50% 100%, ${color} 0%, transparent 70%)`,
          filter: "blur(28px)",
        }}
      />
    </motion.div>
  );
}

// ─── GSAP masked bottom-to-top line reveal ────────────────────────────────────
function RevealLine({ text, delay }: { text: string; delay: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.fromTo(innerRef.current, { y: "105%" }, { y: "0%", duration: 0.8, delay, ease: "power3.out" });
  }, [delay]);
  return (
    <div ref={outerRef} style={{ overflow: "hidden", lineHeight: 1.15, display: "block" }}>
      <div ref={innerRef}>{text}</div>
    </div>
  );
}

// ─── GSAP circle-ripple button ────────────────────────────────────────────────
function RippleButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const btnRef    = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const textRef   = useRef<HTMLSpanElement>(null);

  function enter(e: React.MouseEvent) {
    const btn  = btnRef.current!;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const r = Math.hypot(rect.width, rect.height);
    gsap.killTweensOf(rippleRef.current); gsap.killTweensOf(textRef.current);
    gsap.set(rippleRef.current, { left: x, top: y, width: 0, height: 0, xPercent: -50, yPercent: -50, opacity: 1, borderRadius: "50%" });
    gsap.to(rippleRef.current, { width: r * 2.4, height: r * 2.4, duration: 0.55, ease: "power2.out" });
    gsap.to(textRef.current, { color: "#e5e4e2", duration: 0.22, delay: 0.12 });
  }
  function leave() {
    gsap.killTweensOf(rippleRef.current); gsap.killTweensOf(textRef.current);
    gsap.to(rippleRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.set(textRef.current, { color: "#0a0a0a" });
  }

  return (
    <button ref={btnRef} onClick={onClick} onMouseEnter={enter} onMouseLeave={leave}
      className="relative overflow-hidden px-8 py-3 rounded-full text-sm font-semibold tracking-wide"
      style={{ background: "#e5e4e2" }}>
      <span ref={rippleRef} className="absolute pointer-events-none" style={{ opacity: 0, background: "#0a0a0a" }} />
      <span ref={textRef} className="relative z-10" style={{ color: "#0a0a0a" }}>{children}</span>
    </button>
  );
}

// ─── Welcome phase ────────────────────────────────────────────────────────────
function WelcomePhase({ onNext }: { onNext: () => void }) {
  const [ready, setReady] = useState(false);
  const lastDelay = 0.3 + WELCOME_LINES.length * 0.22 + 0.8;
  useEffect(() => {
    const t = setTimeout(() => setReady(true), lastDelay * 1000);
    return () => clearTimeout(t);
  }, [lastDelay]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 cursor-pointer"
      onClick={ready ? onNext : undefined}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
    >
      <WavyGlow color="rgba(63,85,102,0.75)" />
      <div className="relative z-10">
        <motion.p className="text-xs font-semibold tracking-[0.28em] uppercase text-alabaster/30 mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
          FactMatch
        </motion.p>
        <div className="font-light text-alabaster" style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)", letterSpacing: "-0.01em" }}>
          {WELCOME_LINES.map((line, i) => <RevealLine key={i} text={line} delay={0.3 + i * 0.22} />)}
        </div>
      </div>
      <motion.p
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-alabaster/60 tracking-[0.3em] uppercase select-none whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? [0.5, 1, 0.5] : 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Tap anywhere to continue
      </motion.p>
    </motion.div>
  );
}

// ─── Consent phase ────────────────────────────────────────────────────────────
const CONSENT_LINES = ["No tracking.", "No servers.", "Just you."];

function ConsentPhase({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-between px-6 sm:px-14 py-14"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}
    >
      <WavyGlow color="rgba(22,160,133,0.45)" />
      <div className="relative z-10">
        <motion.p className="text-xs font-semibold tracking-[0.28em] uppercase text-alabaster/30 mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
          Privacy
        </motion.p>
        <h2 className="font-light text-alabaster" style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)", letterSpacing: "-0.02em" }}>
          {CONSENT_LINES.map((line, i) => <RevealLine key={i} text={line} delay={0.2 + i * 0.16} />)}
        </h2>
      </div>
      <div className="relative z-10 flex flex-col items-start gap-5">
        <motion.p className="text-sm font-light max-w-[26rem] leading-relaxed"
          style={{ color: "rgba(10,10,10,0.6)" }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          Your interests, swipe history, and profile card are stored only on this device. Nothing ever leaves your browser.
        </motion.p>
        <motion.div className="flex items-center gap-6"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5 }}>
          <RippleButton onClick={onAccept}>Allow &amp; continue</RippleButton>
          <button onClick={onDecline} className="text-xs font-medium tracking-wide transition-colors" style={{ color: "#536878" }}>
            Decline
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Ripple category chip ─────────────────────────────────────────────────────
function RippleChip({
  cat, selected, onToggle, delay,
}: {
  cat: string; selected: boolean; onToggle: () => void; delay: number;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  function enter(e: React.MouseEvent) {
    const rect = btnRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const r = Math.hypot(rect.width, rect.height);
    gsap.killTweensOf(rippleRef.current);
    gsap.set(rippleRef.current, { left: x, top: y, width: 0, height: 0, xPercent: -50, yPercent: -50, opacity: 1, borderRadius: "50%" });
    gsap.to(rippleRef.current, { width: r * 2.2, height: r * 2.2, duration: 0.42, ease: "power2.out" });
  }
  function leave() {
    gsap.killTweensOf(rippleRef.current);
    gsap.to(rippleRef.current, { opacity: 0, duration: 0.28, ease: "power2.in" });
  }

  return (
    <motion.button
      ref={btnRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onToggle}
      onMouseEnter={enter}
      onMouseLeave={leave}
      className="relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium"
      style={{
        background: selected ? "#e5e4e2" : "rgba(229,228,226,0.08)",
        color: selected ? "#0a0a0a" : "rgba(229,228,226,0.55)",
        border: selected ? "none" : "1px solid rgba(229,228,226,0.18)",
      }}
    >
      <span ref={rippleRef} className="absolute pointer-events-none" style={{ opacity: 0, background: "rgba(229,228,226,0.22)" }} />
      <span className="relative z-10">{cat}</span>
    </motion.button>
  );
}

// ─── Feed preferences phase ───────────────────────────────────────────────────
function FeedPrefsPhase({ onDone }: { onDone: (cats: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(cat: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col px-6 sm:px-14 py-14 overflow-y-auto"
      data-lenis-prevent
      style={{ scrollbarWidth: "none", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
    >
      <WavyGlow color="rgba(83,104,120,0.5)" />

      <div className="relative z-10 flex-1">
        <motion.p className="text-xs font-semibold tracking-[0.28em] uppercase text-alabaster/30 mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
          Preferences
        </motion.p>

        <h2 className="font-light text-alabaster mb-3" style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)", letterSpacing: "-0.02em" }}>
          <RevealLine text="What are" delay={0.15} />
          <RevealLine text="you into?" delay={0.3} />
        </h2>

        <motion.p className="text-sm font-light mb-8" style={{ color: "rgba(10,10,10,0.55)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.5 }}>
          Pick topics. Your feed learns more as you swipe.
        </motion.p>

        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat, i) => (
            <RippleChip
              key={cat}
              cat={cat}
              selected={selected.has(cat)}
              onToggle={() => toggle(cat)}
              delay={0.5 + i * 0.022}
            />
          ))}
        </div>
      </div>

      <motion.div className="relative z-10 flex items-center gap-6 mt-8 pt-4"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}>
        <RippleButton onClick={() => onDone([...selected])}>
          {selected.size > 0 ? `Continue — ${selected.size} topic${selected.size > 1 ? "s" : ""}` : "Continue"}
        </RippleButton>
        <button onClick={() => onDone([])} className="text-xs font-medium tracking-wide transition-colors" style={{ color: "#536878" }}>
          Skip
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── PWA install phase ────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_PERKS = [
  "Instant launch — no browser bar",
  "Works offline with cached facts",
  "Still fully private, zero tracking",
  "Lives on your home screen",
];

function InstallPhase({ onDone }: { onDone: () => void }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const saved = (window as unknown as { __pwaPrompt?: BeforeInstallPromptEvent }).__pwaPrompt;
    if (saved) setPrompt(saved);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setTimeout(onDone, 900);
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-between px-6 sm:px-14 py-14"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}
    >
      <WavyGlow color="rgba(22,130,100,0.5)" />

      {/* Top — headline */}
      <div className="relative z-10">
        <motion.p className="text-xs font-semibold tracking-[0.28em] uppercase text-alabaster/30 mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
          Install
        </motion.p>
        <h2 className="font-light text-alabaster" style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)", letterSpacing: "-0.02em" }}>
          <RevealLine text="One tap." delay={0.15} />
          <RevealLine text="Always there." delay={0.3} />
        </h2>
      </div>

      {/* Bottom — perks + buttons */}
      <div className="relative z-10 flex flex-col gap-6">
        {/* Perks list */}
        <motion.div className="flex flex-col gap-2.5"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          {INSTALL_PERKS.map((text, i) => (
            <motion.p key={text}
              className="text-sm font-light"
              style={{ color: "rgba(10,10,10,0.6)" }}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.1, duration: 0.4 }}>
              — {text}
            </motion.p>
          ))}
        </motion.div>

        {/* Buttons row */}
        <motion.div className="flex items-center gap-6"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}>
          {installed ? (
            <span className="text-sm font-semibold text-alabaster/80">Installed ✓</span>
          ) : prompt ? (
            <RippleButton onClick={handleInstall}>
              {installing ? "Installing…" : "Install app"}
            </RippleButton>
          ) : (
            <RippleButton onClick={onDone}>Continue</RippleButton>
          )}
          {!installed && (
            <button onClick={onDone} className="text-xs font-medium tracking-wide transition-colors" style={{ color: "#536878" }}>
              {prompt ? "Skip" : "Already installed"}
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function OnboardingScreen({
  onAccept,
  onDecline,
}: {
  onAccept: (categories: string[]) => void;
  onDecline: () => void;
}) {
  const [phase, setPhase] = useState<"welcome" | "consent" | "prefs" | "install">("welcome");
  const pendingCatsRef = useRef<string[]>([]);

  useEffect(() => {
    lenisStore.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Capture beforeinstallprompt so InstallPhase can use it
    function onPrompt(e: Event) {
      e.preventDefault();
      (window as unknown as { __pwaPrompt?: Event }).__pwaPrompt = e;
    }
    window.addEventListener("beforeinstallprompt", onPrompt);

    return () => {
      document.body.style.overflow = prev;
      lenisStore.start();
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  function handlePrefsD(cats: string[]) {
    pendingCatsRef.current = cats;
    setPhase("install");
  }

  function handleInstallDone() {
    onAccept(pendingCatsRef.current);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[300] overflow-hidden gradient-hero"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <AnimatePresence mode="wait">
        {phase === "welcome" && <WelcomePhase key="welcome" onNext={() => setPhase("consent")} />}
        {phase === "consent" && <ConsentPhase key="consent" onAccept={() => setPhase("prefs")} onDecline={onDecline} />}
        {phase === "prefs" && <FeedPrefsPhase key="prefs" onDone={handlePrefsD} />}
        {phase === "install" && <InstallPhase key="install" onDone={handleInstallDone} />}
      </AnimatePresence>
    </motion.div>
  );
}
