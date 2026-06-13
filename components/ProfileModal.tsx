"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark, PawPrint, Telescope, FlaskConical, Globe, Brain,
  Cpu, UtensilsCrossed, Palette, Trophy, Music, Clapperboard,
  Vote, HeartPulse, Wind, BookOpen, Lightbulb, Bot, X, Download,
  Camera, ChevronLeft, Settings, Trash2, ShieldOff,
  Dna, Atom, Zap, Calculator, CloudRain, TreePine, Mountain,
  Cog, Lock, Wrench, TrendingUp, Briefcase, Banknote, Scale, GraduationCap,
  Scroll, Pickaxe, Swords, Fingerprint,
  BookText, Building2, Shirt, Gamepad2, Mic, Sparkles,
  Dumbbell, Leaf, Heart, Plane, Recycle,
  Headphones, Paintbrush, BookMarked, Music2, MessageSquare, Users,
  Activity, Hammer, Waves, ChefHat, Coins, Feather, HeartHandshake,
} from "lucide-react";
import { CategoryStat, UserProfile } from "@/lib/types";
import { categoryAccent } from "@/lib/visuals";
import { DailyActivity, getPreferredCategories, setPreferredCategories } from "@/lib/storage";
import { lenisStore } from "@/lib/lenis";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  // Original
  History: Landmark, Animals: PawPrint, Space: Telescope,
  Science: FlaskConical, Geography: Globe, Psychology: Brain,
  Tech: Cpu, Food: UtensilsCrossed, Art: Palette, Sports: Trophy,
  Entertainment: Music, Movies: Clapperboard, Politics: Vote,
  Healthcare: HeartPulse, Meditation: Wind, Philosophy: BookOpen,
  AI: Bot, General: Lightbulb,
  // Science & Nature
  Biology: Dna, Chemistry: Atom, Physics: Zap, Mathematics: Calculator,
  Climate: CloudRain, Nature: TreePine, Geology: Mountain,
  // Technology
  Robotics: Cog, Cybersecurity: Lock, Engineering: Wrench,
  // Society
  Economics: TrendingUp, Business: Briefcase, Finance: Banknote,
  Law: Scale, Education: GraduationCap,
  // Ancient & Crime
  Mythology: Scroll, Archaeology: Pickaxe, Military: Swords, Crime: Fingerprint,
  // Arts
  Literature: BookText, Architecture: Building2, Fashion: Shirt,
  Gaming: Gamepad2, Photography: Camera, Theatre: Mic, Anime: Sparkles,
  // Health & Lifestyle
  Fitness: Dumbbell, Nutrition: Leaf, "Mental Health": Heart,
  Travel: Plane, Sustainability: Recycle,
  // New additions
  Music: Headphones, Design: Paintbrush, Comics: BookMarked,
  Dance: Music2, Linguistics: MessageSquare, Sociology: Users,
  Neuroscience: Activity, Inventions: Hammer, Oceanography: Waves,
  Cooking: ChefHat, Cryptocurrency: Coins, Folklore: Feather,
  Relationships: HeartHandshake,
};

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

// SVG path content for each Lucide icon — used for canvas export
const CATEGORY_SVG_PATHS: Record<string, string> = {
  History: `<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/>`,
  Animals: `<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>`,
  Space: `<path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/><path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/><path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/><path d="m6.158 8.633 1.114 4.456"/><path d="m8 21 3.105-6.21"/><circle cx="12" cy="21" r="1"/>`,
  Science: `<path d="M14 2v6l3.75 6.5A4 4 0 0 1 14.08 21H9.92a4 4 0 0 1-3.67-6.5L10 8V2"/><path d="M6.8 18h10.4"/><path d="M8 2h8"/>`,
  Geography: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
  Psychology: `<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>`,
  Tech: `<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>`,
  Food: `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>`,
  Art: `<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`,
  Sports: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>`,
  Entertainment: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
  Movies: `<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 3.9"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>`,
  Politics: `<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/>`,
  Healthcare: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>`,
  Meditation: `<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>`,
  Philosophy: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  AI: `<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>`,
  General: `<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`,
  // Science & Nature
  Biology: `<path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m14 8-1-1"/><path d="m7 18 2.5 2.5"/>`,
  Chemistry: `<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>`,
  Physics: `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`,
  Mathematics: `<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/>`,
  Climate: `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>`,
  Nature: `<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3A1 1 0 0 1 15.2 9H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>`,
  Geology: `<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>`,
  // Technology
  Robotics: `<rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/>`,
  Cybersecurity: `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  Engineering: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  // Society
  Economics: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>`,
  Business: `<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>`,
  Finance: `<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>`,
  Law: `<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21H17"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>`,
  Education: `<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>`,
  // Ancient & Crime
  Mythology: `<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 3H8.5a2.5 2.5 0 0 0 0 5H19a2 2 0 1 1 0 4H8"/>`,
  Archaeology: `<path d="M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912"/><path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393"/><path d="m19.686 8.314-3-3"/><path d="m8 8 5-5"/>`,
  Military: `<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/>`,
  Crime: `<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 17.5c1 1.5 3.64.8 5 0"/><path d="M20 10c.18 2 .5 3.03.5 6"/>`,
  // Arts
  Literature: `<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/>`,
  Architecture: `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/>`,
  Fashion: `<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>`,
  Gaming: `<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="17" x2="17.01" y1="10" y2="10"/><path d="M6 5H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/><path d="M10 5a2 2 0 0 1 4 0"/>`,
  Photography: `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>`,
  Theatre: `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>`,
  Anime: `<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>`,
  // Health & Lifestyle
  Fitness: `<path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/>`,
  Nutrition: `<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2Z"/>`,
  "Mental Health": `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
  Travel: `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-2 0-4 2-4 4l-3.5 3.5L4 9.2"/><path d="m10.5 13.5-4 4"/><path d="m13.5 10.5 4 4"/>`,
  Sustainability: `<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-2.726l2.15-3.728"/><path d="M10.985 19h7.2a1.83 1.83 0 0 0 1.57-2.726l-2.15-3.728"/><path d="M14.5 3H9.5a1.83 1.83 0 0 0-1.57 2.726l2.15 3.728"/><path d="m6 8 1.5 2.6"/><path d="m18 8-1.5 2.6"/>`,
  // New additions
  Music: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
  Design: `<path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/>`,
  Comics: `<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="m9.5 10.5 2 2 4-4"/>`,
  Dance: `<path d="M8 2h.01M8 9h.01"/><circle cx="8" cy="5.5" r="2.5"/><path d="M8 8v8l4 2"/><path d="m8 16-2 3"/>`,
  Linguistics: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  Sociology: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  Neuroscience: `<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>`,
  Inventions: `<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>`,
  Oceanography: `<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>`,
  Cooking: `<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/>`,
  Cryptocurrency: `<path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 5.207M5.51 17.897 10.41 7.003M6.797 6.574l-1.932-.34m.463-2.632 3.95.695M7.26 3.942l-.347 1.97"/>`,
  Folklore: `<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 8l1.5 3H17l-2.5 2 1 3L12 14l-3.5 2 1-3L7 11h3.5L12 8z"/>`,
  Relationships: `<path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l8.42 8.42 8.42-8.42a5.4 5.4 0 0 0 0-7.65z"/>`,
};

const SUMMARY_SVG: Record<string, string> = {
  compass: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`,
  check: `<path d="M20 6 9 17l-5-5"/>`,
};

// ─── Settings ripple chip ─────────────────────────────────────────────────────
function SettingsChip({
  cat, selected, onToggle,
}: {
  cat: string; selected: boolean; onToggle: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const color = categoryAccent(cat);

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
    <button
      ref={btnRef}
      onClick={onToggle}
      onMouseEnter={enter}
      onMouseLeave={leave}
      className="relative overflow-hidden px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: selected ? color + "18" : "rgba(83,104,120,0.07)",
        color: selected ? color : "#7c93a3",
        border: selected ? `1px solid ${color}40` : "1px solid transparent",
      }}
    >
      <span ref={rippleRef} className="absolute pointer-events-none" style={{ opacity: 0, background: color + "22" }} />
      <span className="relative z-10">{cat}</span>
    </button>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────
function SettingsPanel({
  onClose,
  onClearData,
}: {
  onClose: () => void;
  onClearData: () => void;
}) {
  const [prefCats, setPrefCats] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return getPreferredCategories();
  });
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    lenisStore.stop();
    return () => { lenisStore.start(); };
  }, []);

  function toggleCat(cat: string) {
    setPrefCats(prev => {
      const next = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat];
      setPreferredCategories(next);
      return next;
    });
  }

  return (
    <motion.div
      className="absolute inset-0 bg-white rounded-[2rem] z-20 flex flex-col overflow-hidden"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 360, damping: 36 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-slate/10 shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate/10 transition-colors">
          <ChevronLeft className="h-4 w-4 text-slate" />
        </button>
        <p className="font-bold text-sm text-onyx">Settings</p>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-6"
        data-lenis-prevent
        style={{ scrollbarWidth: "none", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {/* Feed topics */}
        <div>
          <p className="text-[10px] font-bold text-slate/50 uppercase tracking-widest mb-3">Feed topics</p>
          <p className="text-xs text-slate/50 mb-3">Selected topics are boosted in your feed.</p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(cat => (
              <SettingsChip
                key={cat}
                cat={cat}
                selected={prefCats.includes(cat)}
                onToggle={() => toggleCat(cat)}
              />
            ))}
          </div>
        </div>

        {/* Data */}
        <div>
          <p className="text-[10px] font-bold text-slate/50 uppercase tracking-widest mb-3">Data</p>
          {confirmClear ? (
            <div className="bg-red-50 rounded-xl p-3 space-y-2">
              <p className="text-xs text-red-600 font-medium leading-relaxed">
                This deletes all swipe history, preferences, and profile. Irreversible.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onClearData(); onClose(); }}
                  className="flex-1 py-2 bg-red-500 text-white rounded-full text-xs font-semibold"
                >
                  Delete everything
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 bg-slate/10 text-slate rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition-colors py-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all local data
            </button>
          )}
        </div>

        {/* Author */}
        <div className="pt-2 pb-1 text-center">
          <p className="text-[10px] text-slate/30">
            Made by{" "}
            <a
              href="https://humairaambreen.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate/50 hover:text-slate underline underline-offset-2 transition-colors"
            >
              Humaira Ambreen
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Activity heatmap ─────────────────────────────────────────────────────────
function ActivityHeatmap({ activity }: { activity: DailyActivity[] }) {
  const WEEKS = 26; // ~6 months
  const DAYS = 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build date→count map
  const countMap = new Map<string, number>();
  for (const d of activity) countMap.set(d.date, d.count);

  // Build grid: weeks × days, oldest first
  const totalDays = WEEKS * DAYS;
  // Align so today lands on correct weekday column
  const todayDow = today.getDay(); // 0=Sun
  // Start: go back enough so grid ends today
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (totalDays - 1));

  const cells: { date: string; count: number }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().split("T")[0];
    cells.push({ date: key, count: countMap.get(key) ?? 0 });
  }

  // Max count for intensity scaling
  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  function cellColor(count: number): string {
    if (count === 0) return "rgba(0,0,0,0.06)";
    const intensity = count / maxCount;
    // teal accent matching brand
    if (intensity < 0.25) return "#b2dfdb";
    if (intensity < 0.5) return "#4db6ac";
    if (intensity < 0.75) return "#00897b";
    return "#00695c";
  }

  // Group cells by week
  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(cells.slice(w * DAYS, w * DAYS + DAYS));
  }

  const hasAny = activity.length > 0;

  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold text-slate/50 uppercase tracking-widest mb-2">Activity</p>
      {!hasAny ? (
        <p className="text-xs text-slate/40 text-center py-3">Start swiping to build your activity history.</p>
      ) : (
        <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {week.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} swipes`}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    background: cellColor(cell.count),
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile modal ────────────────────────────────────────────────────────────
export default function ProfileModal({
  profile, stats, totalSwipes, totalLiked,
  onSave, onClearData, onClose, consentGiven, onReAccept,
  activity = [], streak = 0,
}: {
  profile: UserProfile;
  stats: CategoryStat[];
  totalSwipes: number;
  totalLiked: number;
  onSave: (profile: UserProfile) => void;
  onClearData: () => void;
  onClose: () => void;
  consentGiven: boolean;
  onReAccept: () => void;
  activity?: DailyActivity[];
  streak?: number;
}) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState<string | null>(profile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      onSave({ name, avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function exportCard() {
    setExporting(true);
    try {
      await drawProfileCard({ name: name || "Anonymous", avatar, stats, totalSwipes, totalLiked });
    } finally {
      setExporting(false);
    }
  }

  const activeStats = stats.filter((s) => s.total > 0);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-onyx/60 backdrop-blur-md" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-pop"
        >
          {/* Gradient hero */}
          <div className="gradient-hero px-5 pt-5 pb-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X className="h-4 w-4 text-alabaster" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative h-14 w-14 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-alabaster font-bold text-lg shrink-0 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent group"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{(name || "?").charAt(0).toUpperCase()}</span>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <div className="flex-1 min-w-0">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => onSave({ name, avatar })}
                  placeholder="Your name"
                  className="w-full bg-transparent text-alabaster font-bold text-base placeholder:text-alabaster/40 focus:outline-none border-b border-white/20 focus:border-white/60 pb-0.5 transition-colors"
                />
                <p className="text-[11px] text-alabaster/50 mt-1">FactMatch Explorer</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { value: totalSwipes, label: "Explored" },
                { value: totalLiked, label: "Useful" },
                { value: activeStats.length, label: "Topics" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/10 rounded-xl px-2 py-2.5 text-center">
                  <p className="text-xl font-bold text-alabaster">{value}</p>
                  <p className="text-[9px] text-alabaster/55 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
              <div className="bg-white/10 rounded-xl px-2 py-2.5 text-center">
                <p className="text-xl font-bold text-alabaster">{streak > 0 ? `🔥${streak}` : "—"}</p>
                <p className="text-[9px] text-alabaster/55 font-semibold uppercase tracking-wide mt-0.5">Streak</p>
              </div>
            </div>
          </div>

          {/* White content — relative so settings + consent overlay can position over it */}
          <div className="bg-white px-5 pt-4 pb-5 relative">
            <p className="text-[10px] font-bold text-slate/50 uppercase tracking-widest mb-3">Your interests</p>

            {activeStats.length === 0 ? (
              <p className="text-sm text-slate/50 text-center py-6">Swipe some facts to see your interests.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {activeStats.slice(0, 9).map((s) => {
                  const Icon = CATEGORY_ICONS[s.category] ?? Lightbulb;
                  const color = categoryAccent(s.category);
                  return (
                    <motion.div
                      key={s.category}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                      className="rounded-xl py-2.5 px-2 flex flex-col items-center gap-1 text-center bg-slate/5"
                    >
                      <div className="p-1.5 rounded-lg" style={{ background: color + "18" }}>
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <span className="text-[10px] font-semibold text-onyx/70 leading-tight">{s.category}</span>
                      <span className="text-sm font-extrabold leading-none" style={{ color }}>{s.liked}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <ActivityHeatmap activity={activity} />

            <div className="flex flex-col gap-2">
              <button
                onClick={exportCard}
                disabled={exporting || activeStats.length === 0}
                className="btn-pill btn-pill-primary w-full disabled:opacity-40 gap-2 text-sm"
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? "Generating…" : "Export profile card"}
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-slate/40 hover:text-slate transition-colors"
              >
                <Settings className="h-3 w-3" />
                Settings
              </button>
            </div>

            {/* Consent blur overlay — shown if user declined data storage */}
            {!consentGiven && (
              <motion.div
                className="absolute inset-0 z-10 rounded-b-[2rem] flex flex-col items-center justify-center gap-3 px-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  background: "rgba(250,249,247,0.75)",
                }}
              >
                <div className="p-3 rounded-full bg-slate/10">
                  <ShieldOff className="h-6 w-6 text-slate" />
                </div>
                <div>
                  <p className="font-bold text-onyx text-base mb-1">You&apos;re missing a lot</p>
                  <p className="text-xs text-slate leading-relaxed max-w-[220px]">
                    Allow data storage to save your history, personalize your feed, and unlock your profile.
                  </p>
                </div>
                <button onClick={onReAccept} className="btn-pill btn-pill-primary text-sm px-6 mt-1">
                  Enable personalization
                </button>
              </motion.div>
            )}
          </div>

          {/* Settings panel — covers full modal so it has enough height to scroll */}
          <AnimatePresence>
            {settingsOpen && (
              <SettingsPanel
                onClose={() => setSettingsOpen(false)}
                onClearData={onClearData}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────
function makeSvgUrl(paths: string, color: string, size: number): string {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  );
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

async function drawIcon(ctx: CanvasRenderingContext2D, paths: string, color: string, x: number, y: number, size: number): Promise<void> {
  const img = await loadImage(makeSvgUrl(paths, color, size));
  ctx.drawImage(img, x, y, size, size);
}

async function drawProfileCard({ name, avatar, stats, totalSwipes, totalLiked }: {
  name: string; avatar: string | null; stats: CategoryStat[]; totalSwipes: number; totalLiked: number;
}) {
  const activeStats = stats.filter((s) => s.total > 0).slice(0, 8);
  const W = 1080, SCALE = 2;
  const PHOTO_H = 840;
  const rowH = 80;
  // content overhead: top padding + summary row + gap + separator + gap + label + gap + bottom pad
  const contentOverhead = 56 + 60 + 48 + 52 + 80;
  const H = PHOTO_H + contentOverhead + activeStats.length * rowH;
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE; canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#111418"; ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, PHOTO_H); ctx.clip();
  if (avatar) {
    const img = await loadImage(avatar);
    const iW = img.naturalWidth || img.width, iH = img.naturalHeight || img.height;
    const scale = Math.max(W / iW, PHOTO_H / iH);
    ctx.drawImage(img, (W - iW * scale) / 2, (PHOTO_H - iH * scale) / 2, iW * scale, iH * scale);
  } else {
    const grad = ctx.createLinearGradient(0, 0, W * 0.7, PHOTO_H);
    grad.addColorStop(0, "#1e2d3d"); grad.addColorStop(1, "#0d1117");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, PHOTO_H);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.font = `700 ${Math.round(PHOTO_H * 0.36)}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(name.charAt(0).toUpperCase(), W / 2, PHOTO_H / 2);
  }
  const scrim = ctx.createLinearGradient(0, PHOTO_H - 420, 0, PHOTO_H);
  scrim.addColorStop(0, "rgba(17,20,24,0)"); scrim.addColorStop(1, "rgba(17,20,24,1)");
  ctx.fillStyle = scrim; ctx.fillRect(0, PHOTO_H - 420, W, 420);
  ctx.restore();

  ctx.fillStyle = "#ffffff"; ctx.font = "800 96px sans-serif";
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(name, 72, PHOTO_H - 88);
  ctx.fillStyle = "rgba(255,255,255,0.38)"; ctx.font = "400 38px sans-serif";
  ctx.fillText("FactMatch Explorer", 72, PHOTO_H - 36);

  let y = PHOTO_H + 56;
  const iconSize = 52, summaryIconColor = "rgba(255,255,255,0.6)";
  await drawIcon(ctx, SUMMARY_SVG.compass, summaryIconColor, 72, y - iconSize + 6, iconSize);
  ctx.fillStyle = "#ffffff"; ctx.font = "700 44px sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(String(totalSwipes), 72 + iconSize + 10, y);
  const expW = ctx.measureText(String(totalSwipes)).width;
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "400 38px sans-serif";
  ctx.fillText("explored", 72 + iconSize + 10 + expW + 10, y);
  const exploredTotalW = iconSize + 10 + expW + 10 + ctx.measureText("explored").width + 52;
  await drawIcon(ctx, SUMMARY_SVG.check, summaryIconColor, 72 + exploredTotalW, y - iconSize + 6, iconSize);
  ctx.fillStyle = "#ffffff"; ctx.font = "700 44px sans-serif";
  ctx.fillText(String(totalLiked), 72 + exploredTotalW + iconSize + 10, y);
  const usefulW = ctx.measureText(String(totalLiked)).width;
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "400 38px sans-serif";
  ctx.fillText("useful", 72 + exploredTotalW + iconSize + 10 + usefulW + 10, y);
  y += 60;

  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(72, y); ctx.lineTo(W - 72, y); ctx.stroke();
  y += 48;

  ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.font = "600 26px sans-serif";
  ctx.fillText("KNOWLEDGE INTERESTS", 72, y);
  y += 52;

  const iSz = 44;
  for (let i = 0; i < activeStats.length; i++) {
    const s = activeStats[i];
    const color = categoryAccent(s.category);
    const paths = CATEGORY_SVG_PATHS[s.category] ?? CATEGORY_SVG_PATHS.General;
    const ry = y + i * rowH;
    await drawIcon(ctx, paths, color, 72, ry + (rowH - iSz) / 2 - 4, iSz);
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = "500 36px sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(s.category, 72 + iSz + 24, ry + rowH / 2);
    ctx.fillStyle = "#ffffff"; ctx.font = "800 42px sans-serif"; ctx.textAlign = "right";
    ctx.fillText(String(s.liked), W - 72, ry + rowH / 2);
    if (i < activeStats.length - 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(72 + iSz + 24, ry + rowH); ctx.lineTo(W - 72, ry + rowH); ctx.stroke();
    }
  }

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl; link.download = "factflow-profile.png"; link.click();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
