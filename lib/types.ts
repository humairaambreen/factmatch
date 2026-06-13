export interface Fact {
  id: string;
  text: string;
  category: string;
  source?: string;
  height: "short" | "medium" | "tall";
  image: string;
}

export type SwipeDirection = "left" | "right";

export interface SwipeRecord {
  factId: string;
  text: string;
  category: string;
  direction: SwipeDirection;
  at: number;
}

export interface UserProfile {
  name: string;
  avatar: string | null;
}

export interface CategoryStat {
  category: string;
  liked: number;
  total: number;
  percent: number;
}
