import { Fact } from "./types";
import { buildSimilarityScorer } from "./recommend";

// ---------------------------------------------------------------------
// Image helpers — deterministic placeholder photography per fact, themed
// loosely around its category so the feed feels visually rich.
// ---------------------------------------------------------------------
const CATEGORY_SEEDS: Record<string, string[]> = {
  // Original
  Science: ["lab-1", "lab-2", "science-1", "science-2"],
  History: ["history-1", "history-2", "ruins-1", "ruins-2"],
  Animals: ["animal-1", "animal-2", "wildlife-1", "wildlife-2"],
  Space: ["space-1", "space-2", "galaxy-1", "galaxy-2"],
  Geography: ["earth-1", "earth-2", "mountain-1", "mountain-2"],
  Psychology: ["mind-1", "mind-2", "portrait-1", "portrait-2"],
  Tech: ["tech-1", "tech-2", "circuit-1", "circuit-2"],
  Food: ["food-1", "food-2", "kitchen-1", "kitchen-2"],
  Art: ["art-1", "art-2", "museum-1", "museum-2"],
  Sports: ["sports-1", "sports-2"],
  Entertainment: ["film-1", "film-2"],
  AI: ["tech-1", "tech-2", "circuit-1", "circuit-2"],
  Politics: ["city-1", "city-2", "building-1", "building-2"],
  Healthcare: ["health-1", "health-2", "nature-1", "nature-2"],
  Meditation: ["zen-1", "zen-2", "landscape-1", "landscape-2"],
  Philosophy: ["library-1", "library-2", "portrait-1"],
  Movies: ["film-1", "film-2", "cinema-1"],
  General: ["general-1", "general-2"],
  Random: ["random-1", "random-2", "abstract-1", "abstract-2"],
  // Science & Nature
  Biology: ["biology-1", "nature-3", "lab-3", "microscope-1"],
  Chemistry: ["lab-4", "chemistry-1", "science-3", "abstract-2"],
  Physics: ["physics-1", "science-4", "lab-5", "abstract-3"],
  Mathematics: ["math-1", "abstract-4", "geometry-1", "library-3"],
  Climate: ["weather-1", "climate-1", "storm-1", "nature-4"],
  Nature: ["forest-1", "forest-2", "landscape-3", "nature-5"],
  Geology: ["geology-1", "mountain-3", "rock-1", "cave-1"],
  // Technology
  Robotics: ["robot-1", "tech-3", "machine-1", "circuit-3"],
  Cybersecurity: ["dark-1", "tech-4", "circuit-4", "network-1"],
  Engineering: ["engineering-1", "construction-1", "bridge-1", "tech-5"],
  // Society
  Economics: ["city-3", "business-1", "market-1", "finance-1"],
  Business: ["business-2", "office-1", "corporate-1", "city-4"],
  Finance: ["finance-2", "money-1", "bank-1", "chart-1"],
  Law: ["court-1", "law-1", "justice-1", "building-3"],
  Education: ["school-1", "library-4", "book-1", "campus-1"],
  // Ancient & Crime
  Mythology: ["mythology-1", "ruins-3", "ancient-1", "temple-1"],
  Archaeology: ["ruins-4", "excavation-1", "ancient-2", "fossil-1"],
  Military: ["military-1", "history-3", "defense-1", "ruins-5"],
  Crime: ["city-5", "urban-1", "dark-2", "street-1"],
  // Arts
  Literature: ["library-5", "book-2", "reading-1", "study-1"],
  Architecture: ["architecture-1", "building-4", "design-1", "city-6"],
  Fashion: ["fashion-1", "style-1", "clothing-1", "art-3"],
  Gaming: ["gaming-1", "tech-6", "screen-1", "neon-1"],
  Photography: ["camera-1", "photo-1", "portrait-2", "art-4"],
  Theatre: ["theatre-1", "stage-1", "performance-1", "light-1"],
  Anime: ["anime-1", "art-5", "japan-1", "colorful-1"],
  // Health & Lifestyle
  Fitness: ["fitness-1", "gym-1", "sport-3", "workout-1"],
  Nutrition: ["food-3", "health-3", "fruits-1", "vegetable-1"],
  "Mental Health": ["zen-3", "calm-1", "nature-6", "peace-1"],
  Travel: ["travel-1", "destination-1", "landscape-4", "adventure-1"],
  Sustainability: ["nature-7", "green-1", "forest-3", "clean-1"],
  // New additions
  Music: ["music-1", "concert-1", "studio-1", "vinyl-1"],
  Design: ["design-1", "studio-2", "art-6", "color-1"],
  Comics: ["comic-1", "book-3", "art-7", "pop-1"],
  Dance: ["dance-1", "stage-2", "motion-1", "performance-2"],
  Linguistics: ["language-1", "book-4", "abstract-5", "pattern-1"],
  Sociology: ["crowd-1", "city-7", "social-1", "community-1"],
  Neuroscience: ["brain-1", "science-5", "lab-6", "abstract-6"],
  Inventions: ["invention-1", "lab-7", "workshop-1", "history-4"],
  Oceanography: ["ocean-1", "ocean-2", "sea-1", "underwater-1"],
  Cooking: ["kitchen-3", "food-4", "chef-1", "restaurant-2"],
  Cryptocurrency: ["tech-7", "finance-3", "abstract-7", "digital-1"],
  Folklore: ["forest-4", "ancient-3", "mythology-2", "night-1"],
  Relationships: ["portrait-3", "couple-1", "nature-8", "warm-1"],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function imageFor(category: string, text: string, override?: string): string {
  if (override) return override;
  const seeds = CATEGORY_SEEDS[category] ?? CATEGORY_SEEDS.Random;
  const seed = seeds[hashString(text) % seeds.length];
  return `https://picsum.photos/seed/${encodeURIComponent(seed + "-" + (hashString(text) % 50))}/640/820`;
}

function pickHeight(text: string): Fact["height"] {
  const len = text.length;
  if (len < 80) return "short";
  if (len < 150) return "medium";
  return "tall";
}

function toFact(text: string, category: string, source?: string, image?: string): Fact {
  const clean = text.trim();
  return {
    id: `${category}-${hashString(clean)}-${Math.random().toString(36).slice(2, 7)}`,
    text: clean,
    category,
    source,
    height: pickHeight(clean),
    image: imageFor(category, clean, image),
  };
}

// ---------------------------------------------------------------------
// Free, keyless fact sources. Each fetcher returns 0+ Facts. Failures are
// swallowed so a single dead API never breaks the feed. Wikipedia gives
// us a practically unlimited stream of "did you know" style content
// without hardcoding anything in source.
// ---------------------------------------------------------------------

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

async function fetchCatFact(): Promise<Fact[]> {
  try {
    const res = await fetch("https://catfact.ninja/fact", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data?.fact) return [];
    return [toFact(data.fact, "Animals", "Cat Facts")];
  } catch {
    return [];
  }
}

async function fetchDogFacts(): Promise<Fact[]> {
  try {
    const res = await fetch("https://dog-api.kinduff.com/api/facts?number=2", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.facts)) return [];
    return data.facts.map((t: string) => toFact(t, "Animals", "Dog Facts"));
  } catch {
    return [];
  }
}

async function fetchHistoryEvents(): Promise<Fact[]> {
  try {
    const res = await fetch("https://history.muffinlabs.com/date", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const events = data?.data?.Events;
    if (!Array.isArray(events) || !events.length) return [];
    const picks = [...events].sort(() => Math.random() - 0.5).slice(0, 2);
    return picks.map((e: { year: string; text: string }) =>
      toFact(`${e.year} — ${e.text}`, "History", "This Day in History")
    );
  } catch {
    return [];
  }
}

async function fetchAdvice(): Promise<Fact[]> {
  try {
    const res = await fetch("https://api.adviceslip.com/advice", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const advice = data?.slip?.advice;
    if (!advice) return [];
    return [toFact(advice, "Psychology", "Advice Slip")];
  } catch {
    return [];
  }
}

async function fetchTrivia(): Promise<Fact[]> {
  try {
    const res = await fetch("https://opentdb.com/api.php?amount=2&type=multiple", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.results)) return [];
    return data.results.map((r: { category: string; question: string; correct_answer: string }) => {
      const cat = mapTriviaCategory(r.category);
      const q = decodeHtml(r.question);
      const a = decodeHtml(r.correct_answer);
      return toFact(`${q} — Answer: ${a}`, cat, "Open Trivia DB");
    });
  } catch {
    return [];
  }
}

// Wikipedia: random article summaries, framed as "did you know" facts.
// Practically infinite, free, keyless, CORS-enabled.
async function fetchWikipediaRandom(n = 3): Promise<Fact[]> {
  try {
    const requests = Array.from({ length: n }, () =>
      fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary", {
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    );
    const results = await Promise.all(requests);
    const facts: Fact[] = [];
    for (const data of results) {
      if (!data?.extract || data.type === "disambiguation") continue;
      const text = `${data.title}: ${data.extract}`;
      const image: string | undefined = data.thumbnail?.source ?? data.originalimage?.source;
      const category = guessCategory(data.title ?? "", data.extract ?? "");
      facts.push(toFact(text, category, "Wikipedia", image));
    }
    return facts;
  } catch {
    return [];
  }
}

// Wikipedia "On this day" — historical events for today's date.
async function fetchWikipediaOnThisDay(): Promise<Fact[]> {
  try {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events = data?.selected;
    if (!Array.isArray(events) || !events.length) return [];
    const picks = [...events].sort(() => Math.random() - 0.5).slice(0, 2);
    return picks.map((e: { year: number; text: string; pages?: { thumbnail?: { source?: string } }[] }) => {
      const image = e.pages?.find((p) => p.thumbnail?.source)?.thumbnail?.source;
      return toFact(`${e.year} — ${e.text}`, "History", "Wikipedia · On This Day", image);
    });
  } catch {
    return [];
  }
}

function guessCategory(title: string, extract: string): string {
  const t = `${title} ${extract}`.toLowerCase();
  // AI — most specific tech sub-category first
  if (/artificial intelligence|machine learning|deep learning|neural network|large language model|\bllm\b|\bgpt\b|chatgpt|generative ai|diffusion model|transformer model|reinforcement learning|computer vision|\bnlp\b|natural language processing/.test(t)) return "AI";
  // Cryptocurrency (before Finance)
  if (/\bcrypto\b|bitcoin|ethereum|blockchain|\bdefi\b|\bnft\b|\bweb3\b|altcoin|digital currency|crypto wallet|satoshi|proof.of.work/.test(t)) return "Cryptocurrency";
  // Cybersecurity
  if (/cybersecurity|cyber attack|hacker|malware|ransomware|phishing|firewall|\bencryption\b|data breach|\bddos\b|trojan horse|security vulnerability|zero.day|dark web|spyware/.test(t)) return "Cybersecurity";
  // Robotics
  if (/\brobot\b|robotics|autonomous vehicle|self.driving|drone swarm|humanoid|mechanical arm|industrial automation|boston dynamics/.test(t)) return "Robotics";
  // Biology (before Science)
  if (/\bbiology\b|\bevolution\b|genetics|ecosystem|organism|\bbacteria\b|cell division|dna replication|photosynthesis|protein synthesis|\becology\b|taxonomy|species diversity|microbiology|neurobiology/.test(t)) return "Biology";
  // Chemistry (before Science)
  if (/\bchemistry\b|\bchemical\b|periodic table|chemical element|chemical compound|chemical reaction|molecular structure|\bisotope\b|organic chemistry|polymer|electrochemistry|thermochemistry/.test(t)) return "Chemistry";
  // Physics (before Science)
  if (/\bphysics\b|\bquantum\b|relativity|thermodynamics|electromagnetism|\bvelocity\b|particle physics|wave function|field theory|string theory|nuclear physics/.test(t)) return "Physics";
  // Mathematics
  if (/\bmathematics\b|\bmath\b|\bequation\b|\btheorem\b|\bcalculus\b|algebra|geometry|probability theory|number theory|prime number|mathematical proof|topology|statistics/.test(t)) return "Mathematics";
  // Geology (before Geography)
  if (/geology|geolog|rock formation|\bmineral\b|tectonic plate|earthquake|volcano|fossil record|\bsediment\b|crystal structure|igneous|metamorphic rock|magma/.test(t)) return "Geology";
  // Engineering
  if (/civil engineering|mechanical engineering|electrical engineering|software engineering|infrastructure|structural design|\bdam\b construction|bridge engineering|aerospace engineering/.test(t)) return "Engineering";
  // Tech
  if (/technology|computer|software|algorithm|\binternet\b|digital|programming|network|startup|semiconductor|microchip|coding|open.source/.test(t)) return "Tech";
  // Climate (before Nature and Geography)
  if (/climate change|global warming|greenhouse gas|carbon emission|weather pattern|\bdrought\b|\bflood\b|\bhurricane\b|temperature rise|ozone layer|sea level rise|fossil fuel|deforestation/.test(t)) return "Climate";
  // Sustainability
  if (/sustainability|renewable energy|solar power|wind energy|\brecycling\b|carbon footprint|green energy|electric vehicle|eco.friendly|circular economy|zero.waste/.test(t)) return "Sustainability";
  // Nature (before Animals and Geography)
  if (/\brainforest\b|\bwilderness\b|\bwetland\b|biodiversity|flora and fauna|habitat destruction|conservation|wildlife refuge|national park|coral reef|old.growth forest/.test(t)) return "Nature";
  // Folklore (before Mythology)
  if (/\bfolklore\b|folk tale|fairy tale|oral tradition|\bfable\b|folk legend|folk music|traditional story|fairy folk/.test(t)) return "Folklore";
  // Mythology (before History)
  if (/\bmyth\b|mythology|\blegend\b|\bdeity\b|greek myth|norse myth|roman god|olympus|\bodin\b|\bzeus\b|\bthor\b|epic poem|creation myth|pantheon/.test(t)) return "Mythology";
  // Archaeology (before History)
  if (/archaeolog|excavation|\bruins\b|ancient civilization|\btomb\b|burial site|carbon dating|archaeological|hieroglyph|artifact|dig site/.test(t)) return "Archaeology";
  // Military (before History)
  if (/military|armed forces|\bnavy\b|air force|\bsoldier\b|warfare|nuclear weapon|\bnato\b|military strategy|military tactics|combat|battalion|siege warfare/.test(t)) return "Military";
  // Crime
  if (/\bcrime\b|\bmurder\b|\btheft\b|\bfraud\b|criminal|prison|arrest|serial killer|heist|drug trafficking|gangster|forensic|criminology/.test(t)) return "Crime";
  // Law
  if (/\blaw\b|legal|court|judge|\blawyer\b|attorney|constitution|statute|regulation|verdict|jury|justice system|human rights|international law/.test(t)) return "Law";
  // Economics
  if (/economics|\beconomy\b|\bgdp\b|inflation|recession|stock market|trade|supply and demand|fiscal policy|monetary policy|unemployment|macroeconomics/.test(t)) return "Economics";
  // Finance
  if (/finance|investment|bonds|portfolio|hedge fund|cryptocurrency|\bcrypto\b|tax|income|wealth|banking|stock|equity|venture capital/.test(t)) return "Finance";
  // Business
  if (/business|corporation|company|entrepreneurship|startup|merger|acquisition|\bceo\b|revenue|profit|market share|e.commerce/.test(t)) return "Business";
  // Education
  if (/education|\buniversity\b|teaching|curriculum|academic|scholarship|research|professor|learning|school|college/.test(t)) return "Education";
  // Inventions (before History)
  if (/\binvention\b|inventor|patented|patent number|invented by|prototype|innovation|pioneered|breakthrough device|first ever made/.test(t)) return "Inventions";
  // History
  if (/\bwar\b|battle|conflict|revolution|empire|dynasty|ancient|medieval|colonial|treaty|siege|uprising|kingdom|monarchy/.test(t)) return "History";
  // Politics
  if (/election|parliament|congress|senate|president|prime minister|democracy|political|legislation|government|policy|vote/.test(t)) return "Politics";
  // Oceanography (before Geography)
  if (/\boceanograph\b|\bdeep.sea\b|marine biology|ocean current|tidal wave|seafloor|hydrothermal vent|bioluminescence|submarine canyon|sonar/.test(t)) return "Oceanography";
  // Geography
  if (/country|city|mountain|river|continent|ocean|region|province|island|lake|desert|coast|territory|capital/.test(t)) return "Geography";
  // Travel
  if (/tourism|destination|tourist|\bvacation\b|hotel|airline|passport|culture shock|backpacking|adventure travel/.test(t)) return "Travel";
  // Literature (before Art and Entertainment)
  if (/\bnovel\b|\bpoetry\b|\bpoet\b|literary|prose|fiction writer|\bbiography\b|\bmemoir\b|short story|playwright|novelist|author|shakespeare|dickens|hemingway/.test(t)) return "Literature";
  // Theatre (before Entertainment)
  if (/\btheatre\b|\btheater\b|\bplay\b|playwright|broadway|opera|ballet|stage production|dramatic|musical theatre|rehearsal/.test(t)) return "Theatre";
  // Anime
  if (/\banime\b|manga|japanese animation|studio ghibli|shonen|shojo|\bmecha\b|\botaku\b|cosplay|\bpokemon\b|naruto|one piece/.test(t)) return "Anime";
  // Comics (before Gaming)
  if (/\bcomic book\b|graphic novel|superhero comics|\bmarvel\b|\bdc comics\b|sequential art|comic strip|manga artist/.test(t)) return "Comics";
  // Gaming (before Entertainment)
  if (/video game|\bgaming\b|\besports\b|playstation|\bxbox\b|\bnintendo\b|steam platform|\bgamer\b|\brpg\b|\bfps\b/.test(t)) return "Gaming";
  // Photography
  if (/photograph|\bphotography\b|\bcamera lens\b|\baperture\b|shutter speed|portrait photo|photojournalism|darkroom/.test(t)) return "Photography";
  // Architecture
  if (/architect|architecture|building design|skyscraper|cathedral|palace|monument|urban planning|interior design/.test(t)) return "Architecture";
  // Design (before Art)
  if (/graphic design|\bui design\b|\bux design\b|typography|logo design|brand identity|visual design|product design|industrial design/.test(t)) return "Design";
  // Fashion
  if (/fashion|clothing designer|haute couture|runway|wardrobe|garment|textile|fashion trend|apparel/.test(t)) return "Fashion";
  // Art
  if (/painting|sculpture|gallery|museum|composer|art movement|impressionism|abstract art/.test(t)) return "Art";
  // Space
  if (/planet|star|galaxy|\bspace\b|nasa|orbit|comet|asteroid|cosmos|nebula|telescope|spacecraft|astronaut|universe|solar/.test(t)) return "Space";
  // Relationships (before Psychology)
  if (/\brelationship\b|\bromance\b|\bmarriage\b|romantic partner|dating|couple therapy|attachment style|interpersonal|social bond|friendship|breakup|heartbreak/.test(t)) return "Relationships";
  // Neuroscience (before Psychology)
  if (/\bneuroscience\b|\bneuron\b|\bsynapse\b|neural circuit|\bcortex\b|\bdopamine\b|\bserotonin\b|brain imaging|fmri|neuroplasticity/.test(t)) return "Neuroscience";
  // Sociology (before Psychology)
  if (/\bsociology\b|social structure|social norms|sociological|social inequality|social class|community dynamics|social behavior|groupthink/.test(t)) return "Sociology";
  // Mental Health (before Psychology and Healthcare)
  if (/mental health|anxiety|depression|\btherapy\b|counseling|\bstress\b|\btrauma\b|\bptsd\b|bipolar|schizophrenia|mindfulness|psychiatry|well.being/.test(t)) return "Mental Health";
  // Meditation
  if (/meditation|mindfulness|yoga|wellness|\bzen\b|spiritual|buddhism|breathing|chakra|enlightenment/.test(t)) return "Meditation";
  // Fitness
  if (/fitness|exercise|workout|\bgym\b|bodybuilding|marathon|running|swimming|cycling|strength training|endurance/.test(t)) return "Fitness";
  // Nutrition
  if (/nutrition|\bdiet\b|\bvitamin\b|calorie|protein|carbohydrate|superfood|supplement|healthy eating|metabolism/.test(t)) return "Nutrition";
  // Healthcare
  if (/medicine|hospital|doctor|disease|surgery|health|patient|diagnosis|treatment|pharmacy|pandemic|virus/.test(t)) return "Healthcare";
  // Psychology
  if (/psychology|cognitive|behavior|emotion|personality|neuroscience|perception|intelligence/.test(t)) return "Psychology";
  // Linguistics (before Philosophy)
  if (/\blinguistics\b|phonetics|\bgrammar\b|\bsyntax\b|morphology|\bdialect\b|etymology|semiotics|language family|proto.language|sociolinguistics/.test(t)) return "Linguistics";
  // Philosophy
  if (/philosophy|philosopher|ethics|moral|existentialism|logic|metaphysics|aristotle|plato|kant|socrates/.test(t)) return "Philosophy";
  // Science (broad fallback for remaining science)
  if (/science|scientific|experiment|laboratory|research|molecule|atom|gene|vaccine/.test(t)) return "Science";
  // Sports
  if (/sport|football|basketball|tennis|cricket|olympic|athlete|championship|tournament|stadium|soccer|baseball/.test(t)) return "Sports";
  // Movies
  if (/\bfilm\b|\bmovie\b|cinema|box office|hollywood|director|screenplay|oscar|actor|actress|blockbuster/.test(t)) return "Movies";
  // Entertainment
  if (/music|album|concert|band|singer|pop|rock|jazz|hip hop|rap|musician|orchestra|record label/.test(t)) return "Entertainment";
  // Cooking (before Food)
  if (/\bcooking\b|\bchef\b|culinary technique|baking method|roast|sauté|fermentation|molecular gastronomy|michelin|recipe/.test(t)) return "Cooking";
  // Music (before Entertainment)
  if (/\bmusic\b|album|concert|\bband\b|singer|pop music|rock music|jazz|hip hop|\brap\b|musician|orchestra|record label|composer|symphony/.test(t)) return "Music";
  // Dance (before Entertainment)
  if (/\bdance\b|dancing|\bchoreograph|\bballroom\b|\bsalsa\b|\btango\b|hip.hop dance|contemporary dance|classical dance|folk dance/.test(t)) return "Dance";
  // Food & Animals
  if (/food|cuisine|dish|restaurant|ingredient|gastronomy|beverage|wine|beer|baking/.test(t)) return "Food";
  if (/animal|species|bird|fish|mammal|reptile|insect|wildlife|fauna|genus|habitat|predator|vertebrate|dinosaur/.test(t)) return "Animals";
  return "General";
}

function decodeHtml(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&eacute;/g, "é")
    .replace(/&ouml;/g, "ö");
}

function mapTriviaCategory(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("computer") || lower.includes("software") || lower.includes("internet")) return "Tech";
  if (lower.includes("math") || lower.includes("mathematics")) return "Mathematics";
  if (lower.includes("biology") || lower.includes("botany") || lower.includes("zoology")) return "Biology";
  if (lower.includes("chemistry")) return "Chemistry";
  if (lower.includes("physics")) return "Physics";
  if (lower.includes("science")) return "Science";
  if (lower.includes("history")) return "History";
  if (lower.includes("mythology") || lower.includes("folklore")) return "Mythology";
  if (lower.includes("geography")) return "Geography";
  if (lower.includes("animal") || lower.includes("nature") || lower.includes("wildlife")) return "Animals";
  if (lower.includes("art") || lower.includes("painting") || lower.includes("sculpture")) return "Art";
  if (lower.includes("literature") || lower.includes("book") || lower.includes("novel")) return "Literature";
  if (lower.includes("sport")) return "Sports";
  if (lower.includes("film") || lower.includes("movie") || lower.includes("cinema")) return "Movies";
  if (lower.includes("music") || lower.includes("television") || lower.includes("entertainment")) return "Entertainment";
  if (lower.includes("politics") || lower.includes("government")) return "Politics";
  if (lower.includes("food") || lower.includes("drink") || lower.includes("cuisine")) return "Food";
  if (lower.includes("anime") || lower.includes("manga") || lower.includes("japanese")) return "Anime";
  if (lower.includes("game") || lower.includes("gaming") || lower.includes("video")) return "Gaming";
  if (lower.includes("comic") || lower.includes("superhero")) return "Comics";
  if (lower.includes("music") || lower.includes("song") || lower.includes("band")) return "Music";
  if (lower.includes("dance") || lower.includes("dancing")) return "Dance";
  if (lower.includes("design") || lower.includes("typography")) return "Design";
  if (lower.includes("linguistics") || lower.includes("language")) return "Linguistics";
  if (lower.includes("sociology") || lower.includes("social")) return "Sociology";
  if (lower.includes("crypto") || lower.includes("bitcoin") || lower.includes("blockchain")) return "Cryptocurrency";
  if (lower.includes("ocean") || lower.includes("marine")) return "Oceanography";
  if (lower.includes("cooking") || lower.includes("chef") || lower.includes("culinary")) return "Cooking";
  if (lower.includes("folklore") || lower.includes("fairy tale")) return "Folklore";
  if (lower.includes("invention") || lower.includes("inventor")) return "Inventions";
  if (lower.includes("neuroscience") || lower.includes("neurology")) return "Neuroscience";
  if (lower.includes("relationship") || lower.includes("romance")) return "Relationships";
  return "General";
}

// Each entry: [fetcher, weight] — weight controls how many times it's
// queried per batch, letting Wikipedia (near-infinite) dominate volume.
const FETCHERS: Array<() => Promise<Fact[]>> = [
  () => fetchWikipediaRandom(4),
  fetchWikipediaOnThisDay,
  fetchCatFact,
  fetchDogFacts,
  fetchHistoryEvents,
  fetchAdvice,
  fetchTrivia,
];

/**
 * Fetches a batch of facts by querying every connected free API/source in
 * parallel (with a timeout) and de-duplicating. Nothing is hardcoded —
 * everything comes live from Wikipedia and other free fact APIs. If
 * absolutely everything fails (e.g. fully offline with no cache), an
 * empty array is returned and the UI shows an offline state.
 *
 * If `weights` (category -> weight) and/or `likedTexts` are provided,
 * the resulting batch is re-ranked using a lightweight on-device
 * content-similarity model (see lib/recommend.ts) so facts resembling
 * what the user has liked tend to surface first, while still mixing in
 * fresh categories for discovery.
 */
export async function fetchFactBatch(
  count = 10,
  weights?: Record<string, number>,
  likedTexts?: string[]
): Promise<Fact[]> {
  try {
    const results = await withTimeout(
      Promise.all(FETCHERS.map((fn) => fn())),
      5000
    );

    const fresh = results.flat();
    const seen = new Set<string>();
    const deduped = fresh.filter((f) => {
      if (seen.has(f.text)) return false;
      seen.add(f.text);
      return true;
    });

    let batch = deduped;

    if ((weights && Object.keys(weights).length) || (likedTexts && likedTexts.length)) {
      batch = personalize(batch, weights ?? {}, likedTexts ?? []);
    } else {
      batch = batch.sort(() => Math.random() - 0.5);
    }

    return count ? batch.slice(0, Math.max(count, 1)) : batch;
  } catch {
    return [];
  }
}

/**
 * Re-orders a batch using category-level weights (engagement history)
 * combined with on-device content-similarity scoring against recently
 * liked fact text, plus randomness to keep discovery alive.
 */
function personalize(
  facts: Fact[],
  weights: Record<string, number>,
  likedTexts: string[]
): Fact[] {
  const similarity = buildSimilarityScorer(likedTexts);
  return facts
    .map((fact) => {
      const categoryScore = weights[fact.category] ?? 1;
      const contentScore = similarity(fact.text); // 0..1
      const score = (categoryScore + contentScore * 3) * (0.5 + Math.random() * 0.5);
      return { fact, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.fact);
}
