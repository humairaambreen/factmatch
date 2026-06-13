"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Download, Copy } from "lucide-react";
import { Fact } from "@/lib/types";
import { categoryAccent } from "@/lib/visuals";

// ─── Long-press hook (tracks VIEWPORT coords) ─────────────────────────────────
const HOLD_MS = 1200;
const RING_DELAY = 300; // ring only appears after this — quick taps never see it

const SWIPE_CANCEL_PX = 8; // cancel long press if pointer moves more than this

function useLongPress(onLongPress: (vpX: number, vpY: number) => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (e: React.PointerEvent) => {
      didLongPress.current = false;
      startPos.current = { x: e.clientX, y: e.clientY };
      timerRef.current = setTimeout(() => {
        didLongPress.current = true;
        onLongPress(startPos.current.x, startPos.current.y);
      }, HOLD_MS);
    },
    [onLongPress]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // cancel if user starts dragging/swiping
  const move = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > SWIPE_CANCEL_PX) cancel();
  }, [cancel]);

  const consumed = useCallback(() => didLongPress.current, []);
  return { start, cancel, move, consumed };
}

// ─── Fact actions ─────────────────────────────────────────────────────────────
async function shareFact(fact: Fact) {
  const canvas = await downloadFactCard(fact);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (blob) {
    const file = new File([blob], "factmatch.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch { /* fall through */ }
    }
  }
  // fallback: just download the image
  await triggerDownload(fact);
}

function copyFact(fact: Fact) {
  navigator.clipboard.writeText(fact.text);
}

async function downloadFactCard(fact: Fact): Promise<HTMLCanvasElement> {
  const W = 720, H = 960;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const color = categoryAccent(fact.category);

  // try loading the fact image (may fail due to CORS on some sources)
  let photoLoaded = false;
  try {
    const img = await Promise.race([
      loadImg(fact.image),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 3000)),
    ]);
    // cover-fit into top 62% of card
    const photoH = Math.round(H * 0.62);
    const iW = (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width;
    const iH = (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height;
    const scale = Math.max(W / iW, photoH / iH);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, photoH); ctx.clip();
    ctx.drawImage(img as HTMLImageElement, (W - iW * scale) / 2, (photoH - iH * scale) / 2, iW * scale, iH * scale);
    ctx.restore();
    // bottom scrim over photo
    const scrim = ctx.createLinearGradient(0, photoH - 320, 0, photoH);
    scrim.addColorStop(0, "rgba(12,12,14,0)");
    scrim.addColorStop(1, "rgba(12,12,14,1)");
    ctx.fillStyle = scrim; ctx.fillRect(0, photoH - 320, W, 320);
    // dark bottom section
    ctx.fillStyle = "#0c0c0e"; ctx.fillRect(0, photoH, W, H - photoH);
    photoLoaded = true;
  } catch {
    // fallback: full dark gradient card
    const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
    bg.addColorStop(0, "#111418"); bg.addColorStop(1, "#1c2731");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  }

  // glass-style bottom blur simulation: semi-transparent frosted panel
  const panelY = photoLoaded ? Math.round(H * 0.52) : 80;
  const panelH = H - panelY - 60;
  ctx.fillStyle = "rgba(12,12,14,0.55)";
  rRect(ctx, 32, panelY, W - 64, panelH, 28); ctx.fill();
  // subtle border
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1.5;
  rRect(ctx, 32, panelY, W - 64, panelH, 28); ctx.stroke();

  // category chip
  const chipY = panelY + 28;
  ctx.fillStyle = color + "28";
  rRect(ctx, 56, chipY, 140, 36, 18); ctx.fill();
  ctx.fillStyle = color; ctx.font = "600 18px sans-serif"; ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(fact.category, 78, chipY + 18);

  // fact text (word-wrap inside panel)
  ctx.fillStyle = "#e5e4e2";
  const fontSize = fact.text.length > 200 ? 28 : fact.text.length > 120 ? 32 : 36;
  ctx.font = `700 ${fontSize}px sans-serif`;
  ctx.textBaseline = "alphabetic";
  const maxLineW = W - 112;
  const lineH = fontSize * 1.45;
  const words = fact.text.split(" ");
  let line = "", ty = chipY + 64;
  const maxY = panelY + panelH - 72;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxLineW && line) {
      if (ty + lineH > maxY) { ctx.fillText(line + "…", 56, ty); break; }
      ctx.fillText(line, 56, ty); line = word; ty += lineH;
    } else line = test;
  }
  if (line && ty <= maxY) ctx.fillText(line, 56, ty);

  // site URL at bottom of panel
  ctx.fillStyle = "rgba(229,228,226,0.35)";
  ctx.font = "400 20px sans-serif"; ctx.textBaseline = "middle";
  ctx.fillText("factmatch.vercel.app", 56, panelY + panelH - 26);

  return canvas;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img"); img.crossOrigin = "anonymous";
    img.onload = () => resolve(img); img.onerror = reject; img.src = src;
  });
}

async function triggerDownload(fact: Fact) {
  const canvas = await downloadFactCard(fact);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `factmatch-${fact.category.toLowerCase()}.png`;
  link.click();
}

function rRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ─── Radial menu (portal — no overflow clipping) ──────────────────────────────
const MENU_ACTIONS = [
  { id: "share",    icon: Share2,   label: "Share",    angle: -65 },
  { id: "download", icon: Download, label: "Save",     angle:   0 },
  { id: "copy",     icon: Copy,     label: "Copy",     angle:  65 },
];
const RADIUS = 96;

function RadialMenu({
  fact, vpX, vpY, onClose,
}: {
  fact: Fact; vpX: number; vpY: number; onClose: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  // dismiss on global pointer-up (drag-to-select or cancel)
  useEffect(() => {
    function onUp(e: PointerEvent) {
      // find if pointer is over any button by checking DOM hit
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const btn = el?.closest("[data-radial-id]");
      const id = btn?.getAttribute("data-radial-id");
      if (id) triggerAction(id);
      else onClose();
    }
    window.addEventListener("pointerup", onUp, { once: true });
    return () => window.removeEventListener("pointerup", onUp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function triggerAction(id: string) {
    onClose();
    if (id === "share")    await shareFact(fact);
    else if (id === "download") await triggerDownload(fact);
    else if (id === "copy") copyFact(fact);
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* dim backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" />

      {/* center dot */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-white/70 pointer-events-none"
        style={{ left: vpX - 6, top: vpY - 6 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      />

      {/* radial buttons */}
      {MENU_ACTIONS.map((action, i) => {
        const rad = ((action.angle - 90) * Math.PI) / 180;
        const bx = vpX + Math.cos(rad) * RADIUS;
        const by = vpY + Math.sin(rad) * RADIUS;
        const Icon = action.icon;
        const isActive = active === action.id;
        return (
          <motion.div
            key={action.id}
            data-radial-id={action.id}
            className="absolute flex flex-col items-center gap-1.5 pointer-events-auto cursor-pointer"
            style={{ left: bx - 30, top: by - 30 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isActive ? 1.18 : 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22, delay: i * 0.045 }}
            onPointerEnter={() => setActive(action.id)}
            onPointerLeave={() => setActive(null)}
            onPointerDown={(e) => { e.stopPropagation(); triggerAction(action.id); }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-pop transition-colors duration-150"
              style={{
                background: isActive ? "#ffffff" : "rgba(255,255,255,0.88)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Icon className="h-5 w-5 text-onyx" />
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow">{action.label}</span>
          </motion.div>
        );
      })}
    </motion.div>,
    document.body
  );
}

// ─── Hold progress ring (stays inside card, viewport-relative via fixed) ──────
function HoldRing({ vpX, vpY, active }: { vpX: number; vpY: number; active: boolean }) {
  const C = 2 * Math.PI * 22;
  if (!active) return null;
  return createPortal(
    <svg
      className="fixed pointer-events-none z-[199]"
      style={{ left: vpX - 28, top: vpY - 28, width: 56, height: 56 }}
    >
      <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
      <motion.circle
        cx={28} cy={28} r={22} fill="none"
        stroke="white" strokeWidth={3} strokeDasharray={C} strokeLinecap="round"
        transform="rotate(-90 28 28)"
        initial={{ strokeDashoffset: C }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: (HOLD_MS - RING_DELAY) / 1000, ease: "linear" }}
      />
    </svg>,
    document.body
  );
}

// ─── FeedTile ─────────────────────────────────────────────────────────────────
export function FeedTile({ fact, onOpen, priority }: { fact: Fact; onOpen: () => void; priority?: boolean }) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [holdPos, setHoldPos] = useState({ x: 0, y: 0 });
  const [holding, setHolding] = useState(false);
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { start, cancel, move, consumed } = useLongPress((x, y) => {
    setHolding(false);
    setMenu({ x, y });
  });

  function onDown(e: React.PointerEvent) {
    setHoldPos({ x: e.clientX, y: e.clientY });
    ringTimerRef.current = setTimeout(() => setHolding(true), RING_DELAY);
    start(e);
  }
  function onMove(e: React.PointerEvent) {
    move(e);
    // if move cancels long press, also hide ring
    const dx = e.clientX - holdPos.x, dy = e.clientY - holdPos.y;
    if (Math.sqrt(dx*dx + dy*dy) > SWIPE_CANCEL_PX) {
      if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; }
      setHolding(false);
    }
  }
  function onUp() {
    cancel();
    if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; }
    setHolding(false);
  }

  return (
    <motion.div
      layoutId={`tile-${fact.id}`}
      className="fact-card relative w-full h-full overflow-hidden cursor-pointer"
      whileTap={menu ? {} : { scale: 0.97 }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onClick={() => { if (!consumed()) onOpen(); }}
    >
      <Image
        src={fact.image} alt="" fill
        sizes="(min-width: 1200px) 25vw, (min-width: 860px) 33vw, (min-width: 480px) 50vw, 50vw"
        className="object-cover" unoptimized priority={priority}
      />
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-[1.5rem] overflow-hidden p-4"
        style={{
          backdropFilter: "blur(16px) brightness(0.72)",
          WebkitBackdropFilter: "blur(16px) brightness(0.72)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 35%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 35%)",
          paddingTop: "2.5rem",
        }}
      >
        <p className="text-alabaster text-[15px] font-semibold leading-snug line-clamp-4">{fact.text}</p>
      </div>

      <HoldRing vpX={holdPos.x} vpY={holdPos.y} active={holding} />
      <AnimatePresence>
        {menu && <RadialMenu fact={fact} vpX={menu.x} vpY={menu.y} onClose={() => setMenu(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── ExpandedTile ─────────────────────────────────────────────────────────────
export function ExpandedTile({
  fact, showActions = true, onLike, onSkip, useMorphLayout,
}: {
  fact: Fact; showActions?: boolean; onLike?: () => void; onSkip?: () => void; useMorphLayout?: boolean;
}) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [holdPos, setHoldPos] = useState({ x: 0, y: 0 });
  const [holding, setHolding] = useState(false);
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { start, cancel, move } = useLongPress((x, y) => {
    setHolding(false);
    setMenu({ x, y });
  });

  function onDown(e: React.PointerEvent) {
    setHoldPos({ x: e.clientX, y: e.clientY });
    ringTimerRef.current = setTimeout(() => setHolding(true), RING_DELAY);
    start(e);
  }
  function onMove(e: React.PointerEvent) {
    move(e);
    const dx = e.clientX - holdPos.x, dy = e.clientY - holdPos.y;
    if (Math.sqrt(dx*dx + dy*dy) > SWIPE_CANCEL_PX) {
      if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; }
      setHolding(false);
    }
  }
  function onUp() {
    cancel();
    if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; }
    setHolding(false);
  }

  return (
    <motion.div
      {...(useMorphLayout ? { layoutId: `tile-${fact.id}` } : {})}
      className="relative w-full h-full overflow-hidden rounded-[2rem] shadow-pop"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <Image src={fact.image} alt="" fill sizes="100vw" className="object-cover" unoptimized priority />

      {/* bottom gradient — no backdropFilter (causes GPU glitch during drag) */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.78) 48%)" }}
      />

      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8">
        <div className="flex-1 min-h-0 flex items-end pb-4 overflow-hidden">
          <p
            className={`font-bold leading-snug text-alabaster overflow-y-auto max-h-full ${
              fact.text.length > 300 ? "text-sm sm:text-base" :
              fact.text.length > 180 ? "text-base sm:text-lg" :
              fact.text.length > 100 ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
            }`}
            data-lenis-prevent
            style={{ scrollbarWidth: "none" }}
          >{fact.text}</p>
        </div>
        <div className="space-y-3 shrink-0">
          {fact.source && <p className="text-[11px] text-alabaster/60 truncate">Source: {fact.source}</p>}
          {showActions && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={onSkip} className="btn-pill bg-alabaster/15 text-alabaster backdrop-blur-md flex-1 whitespace-nowrap text-sm">
                <X className="h-3.5 w-3.5 shrink-0" /> Not useful
              </button>
              <button onClick={onLike} className="btn-pill bg-alabaster text-onyx flex-1 whitespace-nowrap text-sm">
                <Heart className="h-3.5 w-3.5 shrink-0" fill="currentColor" /> Useful
              </button>
            </div>
          )}
        </div>
      </div>

      <HoldRing vpX={holdPos.x} vpY={holdPos.y} active={holding} />
      <AnimatePresence>
        {menu && <RadialMenu fact={fact} vpX={menu.x} vpY={menu.y} onClose={() => setMenu(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
