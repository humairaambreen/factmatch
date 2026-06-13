"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { categoryAccent } from "@/lib/visuals";

const ALL_CATEGORIES = [
  "Science", "Biology", "Chemistry", "Physics", "Mathematics",
  "Space", "Climate", "Nature", "Geology", "Oceanography",
  "Tech", "AI", "Robotics", "Cybersecurity", "Engineering", "Inventions",
  "History", "Geography", "Travel", "Politics",
  "Economics", "Business", "Finance", "Cryptocurrency", "Law", "Education",
  "Mythology", "Folklore", "Archaeology", "Military", "Crime",
  "Art", "Literature", "Design", "Movies", "Entertainment", "Music",
  "Architecture", "Fashion", "Comics", "Gaming", "Photography", "Theatre", "Anime", "Dance",
  "Healthcare", "Psychology", "Neuroscience", "Mental Health", "Fitness",
  "Nutrition", "Cooking", "Meditation", "Sustainability",
  "Sociology", "Linguistics", "Relationships",
  "Animals", "Food", "Philosophy", "Sports", "General",
];

interface Props {
  active: string | null;
  onChange: (cat: string | null) => void;
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string | null;
  active: boolean;
  onClick: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const color = label ? categoryAccent(label) : "#16a085";

  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (!rippleRef.current || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gsap.killTweensOf(rippleRef.current);
    gsap.set(rippleRef.current, { left: x, top: y, scale: 0, opacity: 0.28 });
    gsap.to(rippleRef.current, { scale: 5, opacity: active ? 0.35 : 0.18, duration: 0.45, ease: "power2.out" });
  }

  function handleMouseLeave() {
    if (!rippleRef.current) return;
    gsap.to(rippleRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" });
  }

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
      style={
        active
          ? { background: color, color: "#fff", boxShadow: `0 0 0 2px ${color}55` }
          : { background: color + "14", color: color }
      }
    >
      <span
        ref={rippleRef}
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          background: color,
          opacity: 0,
        }}
      />
      <span className="relative z-10">{label ?? "All"}</span>
    </button>
  );
}

export default function CategoryFilterBar({ active, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active chip into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [active]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide"
      style={{ scrollbarWidth: "none" }}
    >
      <FilterChip
        key="all"
        label={null}
        active={active === null}
        onClick={() => onChange(null)}
      />
      {ALL_CATEGORIES.map((cat) => (
        <FilterChip
          key={cat}
          label={cat}
          active={active === cat}
          onClick={() => onChange(active === cat ? null : cat)}
        />
      ))}
    </div>
  );
}
