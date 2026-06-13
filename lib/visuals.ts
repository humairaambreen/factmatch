const PALETTE = ["#0a0a0a", "#20303b", "#3f5566", "#536878", "#7c93a3", "#8c9aa3", "#c9d2d8", "#e5e4e2"];

const CATEGORY_VIVID: Record<string, string> = {
  // Original
  History: "#c0392b",
  Animals: "#27ae60",
  Space: "#8e44ad",
  Science: "#16a085",
  Geography: "#d35400",
  Psychology: "#e67e22",
  Tech: "#2980b9",
  Food: "#f39c12",
  Art: "#e91e8c",
  Sports: "#1abc9c",
  Entertainment: "#e74c3c",
  AI: "#00b4d8",
  Movies: "#e65100",
  Politics: "#0d47a1",
  Healthcare: "#00695c",
  Meditation: "#6a1b9a",
  Philosophy: "#4a148c",
  General: "#7f8c8d",
  Random: "#95a5a6",
  // Science & Nature
  Biology: "#00897B",
  Chemistry: "#7B1FA2",
  Physics: "#283593",
  Mathematics: "#F57F17",
  Climate: "#006064",
  Nature: "#33691E",
  Geology: "#5D4037",
  // Technology
  Robotics: "#37474F",
  Cybersecurity: "#B71C1C",
  Engineering: "#E65100",
  // Society
  Economics: "#1B5E20",
  Business: "#0D47A1",
  Finance: "#827717",
  Law: "#4A148C",
  Education: "#00838F",
  // Ancient & Crime
  Mythology: "#880E4F",
  Archaeology: "#795548",
  Military: "#546E7A",
  Crime: "#C62828",
  // Arts
  Literature: "#1A237E",
  Architecture: "#BF360C",
  Fashion: "#AD1457",
  Gaming: "#4527A0",
  Photography: "#455A64",
  Theatre: "#FF6F00",
  Anime: "#C2185B",
  // Health & Lifestyle
  Fitness: "#2E7D32",
  Nutrition: "#F9A825",
  "Mental Health": "#512DA8",
  Travel: "#01579B",
  Sustainability: "#004D40",
  // New additions
  Music: "#8E24AA",
  Design: "#FF7043",
  Comics: "#5D4037",
  Dance: "#D81B60",
  Linguistics: "#039BE5",
  Sociology: "#00ACC1",
  Neuroscience: "#7E57C2",
  Inventions: "#FF8F00",
  Oceanography: "#0288D1",
  Cooking: "#EF6C00",
  Cryptocurrency: "#D97706",
  Folklore: "#6D4C9A",
  Relationships: "#F06292",
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function categoryGradient(category: string): string {
  const h = hash(category);
  const a = PALETTE[h % PALETTE.length];
  const b = PALETTE[(h >> 3) % PALETTE.length];
  const angle = 110 + (h % 60);
  return `linear-gradient(${angle}deg, ${a} 0%, ${b} 100%)`;
}

export function categoryAccent(category: string): string {
  return CATEGORY_VIVID[category] ?? PALETTE[(hash(category) >> 1) % PALETTE.length];
}
