/**
 * A tiny, dependency-free content-based recommender.
 *
 * It builds bag-of-words term-frequency vectors for fact text and scores
 * new facts by cosine similarity against the user's recently right-swiped
 * ("useful") facts. This runs entirely on-device — no external ML
 * service, no model download — but gives the feed a genuine "more like
 * what you liked" signal on top of category-level personalization.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "is", "are", "was", "were", "be", "been", "being", "it", "its", "this",
  "that", "than", "as", "with", "by", "from", "has", "have", "had", "more",
  "most", "can", "could", "will", "would", "about", "into", "over", "than",
  "their", "they", "them", "which", "who", "what", "when", "where", "how",
  "answer", "question", "you", "your", "not", "no", "any", "some", "one",
  "two", "three", "first", "also", "after", "before", "than", "out", "up",
]);

export type TermVector = Map<string, number>;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export function vectorize(text: string): TermVector {
  const tokens = tokenize(text);
  const vec: TermVector = new Map();
  for (const t of tokens) {
    vec.set(t, (vec.get(t) ?? 0) + 1);
  }
  return vec;
}

export function cosineSimilarity(a: TermVector, b: TermVector): number {
  if (!a.size || !b.size) return 0;
  let dot = 0;
  for (const [term, freqA] of a) {
    const freqB = b.get(term);
    if (freqB) dot += freqA * freqB;
  }
  if (!dot) return 0;
  const magA = Math.sqrt([...a.values()].reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt([...b.values()].reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB);
}

/**
 * Given the texts of facts the user has liked, returns a function that
 * scores arbitrary fact text by average similarity to those liked facts
 * (0..1). Useful for re-ranking a fresh batch toward "more like this".
 */
export function buildSimilarityScorer(likedTexts: string[]) {
  const likedVectors = likedTexts.slice(-25).map(vectorize);
  if (!likedVectors.length) {
    return () => 0;
  }
  return (text: string) => {
    const vec = vectorize(text);
    let total = 0;
    for (const lv of likedVectors) total += cosineSimilarity(vec, lv);
    return total / likedVectors.length;
  };
}
