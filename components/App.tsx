"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { WifiOff } from "lucide-react";
import { Fact, SwipeDirection, SwipeRecord, UserProfile } from "@/lib/types";
import { fetchFactBatch } from "@/lib/facts";
import {
  addSwipeRecord,
  clearAllData,
  getCategoryStats,
  getCategoryWeights,
  getDailyActivity,
  getHistory,
  getPreferredCategories,
  getProfile,
  getStreak,
  hasConsent,
  setConsent,
  setPreferredCategories,
  setProfile as persistProfile,
  trackDailySwipe,
} from "@/lib/storage";
import { AnimatePresence } from "framer-motion";
import MasonryFeed from "./MasonryFeed";
import FactOverlay from "./FactOverlay";
import QuizModal from "./QuizModal";
import ProfileModal from "./ProfileModal";
import OnboardingScreen from "./OnboardingScreen";

const PAGE_SIZE = 12;

function randomThreshold() {
  return Math.floor(Math.random() * 2) + 4; // 4 or 5
}

interface QuizState {
  target: { id: string; text: string };
  decoys: { id: string; text: string }[];
}

export default function App() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offline, setOffline] = useState(false);

  // Overlay
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayQueue, setOverlayQueue] = useState<Fact[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [morphFactId, setMorphFactId] = useState<string | null>(null);
  const [morphTargetId, setMorphTargetId] = useState<string | null>(null);

  // Onboarding (session-once)
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("onboarding_done")) {
      setShowOnboarding(true);
    }
  }, []);

  // Consent / profile / history
  const [consentDecided, setConsentDecided] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [profile, setProfileState] = useState<UserProfile>({ name: "", avatar: null });
  const [history, setHistory] = useState<SwipeRecord[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);

  const historyRef = useRef<SwipeRecord[]>([]);
  const swipeCountRef = useRef(0);
  const thresholdRef = useRef(randomThreshold());
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const loadingRef = useRef(false);

  // Hero animation refs
  const heroLabelRef = useRef<HTMLParagraphElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);

  // ---- hero text variants ----
  interface HeroVariant {
    headline: string;
    description: string;
  }

  function getHeroVariant(name: string): HeroVariant {
    const hour = new Date().getHours();
    const greeting = name ? `, ${name}` : "";

    const timeVariants: HeroVariant[] = [
      // Morning 5-11
      {
        headline: `Good morning${greeting}. Ready to learn something new?`,
        description: "Start your day with a fact that sticks.",
      },
      // Afternoon 12-17
      {
        headline: `Good afternoon${greeting}. Your curiosity break is here.`,
        description: "A few minutes, a few facts worth knowing.",
      },
      // Evening 18-22
      {
        headline: `Good evening${greeting}. Wind down with something fascinating.`,
        description: "Ease into the evening with ideas worth sitting with.",
      },
      // Late night 23-4
      {
        headline: `Still up${greeting}? Perfect time to feed your brain.`,
        description: "The night shift for curious minds.",
      },
    ];

    const staticVariants: HeroVariant[] = [
      {
        headline: "Did you know? You're about to find out.",
        description: "Swipe through facts your feed didn't know you needed.",
      },
      {
        headline: "Curiosity didn't kill the cat. It made it smarter.",
        description: "Swipe, learn, and let your feed get to know you.",
      },
      {
        headline: "The most interesting tab you have open right now.",
        description: 'Facts that actually make you go “wait, really?”',
      },
      {
        headline: "Brain food, served fresh.",
        description: "Short facts. Long impressions.",
      },
      {
        headline: "Find facts you'll actually click with.",
        description:
          "Your feed adapts to your taste. Quiz included, no studying required.",
      },
    ];

    const SESSION_KEY = "hero_variant_index";
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;

    if (stored !== null) {
      const idx = parseInt(stored, 10);
      const all = [...timeVariants, ...staticVariants];
      return all[idx % all.length];
    }

    let chosen: HeroVariant;
    let chosenIdx: number;

    if (hour >= 5 && hour < 12) {
      chosen = timeVariants[0];
      chosenIdx = 0;
    } else if (hour >= 12 && hour < 18) {
      chosen = timeVariants[1];
      chosenIdx = 1;
    } else if (hour >= 18 && hour < 23) {
      chosen = timeVariants[2];
      chosenIdx = 2;
    } else {
      // 23-4
      chosen = timeVariants[3];
      chosenIdx = 3;
    }

    // 40% chance to use a static variant instead for variety
    const roll = Math.random();
    if (roll < 0.4) {
      const staticIdx = Math.floor(Math.random() * staticVariants.length);
      chosen = staticVariants[staticIdx];
      chosenIdx = timeVariants.length + staticIdx;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, String(chosenIdx));
    }

    return chosen;
  }

  // SSR-safe: start with static default so server and client first-render match.
  // useEffect picks the real variant client-side, avoiding hydration mismatch.
  const [heroVariant, setHeroVariant] = useState<HeroVariant>({
    headline: "Find facts you'll actually click with.",
    description: "Your feed adapts to your taste. Quiz included, no studying required.",
  });
  useEffect(() => {
    setHeroVariant(getHeroVariant(profile.name ?? ""));
  // profile.name comes from localStorage so only stable after bootstrap effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name]);

  // ---- hero GSAP blur-to-reveal animation (session-once) ----
  useEffect(() => {
    const ANIM_KEY = "hero_animated";
    const alreadyRan = typeof window !== "undefined" && sessionStorage.getItem(ANIM_KEY) === "1";

    const els = [heroLabelRef.current, heroH1Ref.current, heroDescRef.current, heroButtonsRef.current];

    if (alreadyRan || els.some((el) => !el)) {
      // Elements start visible — ensure no leftover hidden styles
      els.forEach((el) => {
        if (el) {
          el.style.opacity = "1";
          el.style.filter = "none";
          el.style.transform = "none";
        }
      });
      return;
    }

    // Set initial hidden state
    gsap.set(heroLabelRef.current, { opacity: 0, y: 10 });
    gsap.set(heroH1Ref.current, { opacity: 0, y: 18, filter: "blur(12px)" });
    gsap.set(heroDescRef.current, { opacity: 0, y: 14, filter: "blur(12px)" });
    gsap.set(heroButtonsRef.current, { opacity: 0, y: 8 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(ANIM_KEY, "1");
        }
      },
    });

    tl.to(heroLabelRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" })
      .to(
        heroH1Ref.current,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, ease: "power3.out" },
        "-=0.15"
      )
      .to(
        heroDescRef.current,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" },
        "-=0.3"
      )
      .to(
        heroButtonsRef.current,
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2"
      );

    return () => {
      tl.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- bootstrap from localStorage ----
  useEffect(() => {
    const consent = hasConsent();
    const storedConsent = typeof window !== "undefined" ? localStorage.getItem("factmatch_consent") : null;
    setConsentDecided(storedConsent !== null);
    setConsentGiven(consent);
    if (consent) {
      const p = getProfile();
      const h = getHistory();
      setProfileState(p);
      setHistory(h);
      historyRef.current = h;
    }
  }, []);

  const weightsAndLikes = useCallback(() => {
    const h = historyRef.current;
    const weights = getCategoryWeights(h);
    // boost preferred categories that have little/no history yet
    getPreferredCategories().forEach(cat => {
      weights[cat] = Math.max(weights[cat] ?? 0, 2);
    });
    const likedTexts = h.filter((r) => r.direction === "right").map((r) => r.text);
    return { weights, likedTexts };
  }, []);

  const loadFacts = useCallback(
    async (initial = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      if (initial) setLoading(true);
      else setLoadingMore(true);

      const { weights, likedTexts } = weightsAndLikes();
      const batch = await fetchFactBatch(PAGE_SIZE, weights, likedTexts);

      setFacts((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const fresh = batch.filter((f) => !existingIds.has(f.id));
        return [...prev, ...fresh];
      });

      if (initial) {
        setOffline(batch.length === 0);
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
      loadingRef.current = false;
    },
    [weightsAndLikes]
  );

  useEffect(() => {
    loadFacts(true);
  }, [loadFacts]);

  // Append newly-loaded facts to overlay queue while overlay is open
  useEffect(() => {
    if (!overlayOpen) return;
    setOverlayQueue((prev) => {
      const ids = new Set(prev.map((f) => f.id));
      const fresh = facts.filter((f) => !ids.has(f.id));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
  }, [facts, overlayOpen]);

  const handleOpen = useCallback(
    (index: number) => {
      setOverlayQueue(facts.slice(index));
      setActiveIndex(0);
      setMorphFactId(facts[index]?.id ?? null);
      setMorphTargetId(facts[index]?.id ?? null);
      setOverlayOpen(true);
    },
    [facts]
  );

  const handleLoadMore = useCallback(() => loadFacts(false), [loadFacts]);

  const handleClose = useCallback(() => {
    const currentCard = overlayQueue[activeIndex];
    setMorphTargetId(currentCard?.id ?? null);
    setOverlayOpen(false);
    setMorphFactId(null);
  }, [overlayQueue, activeIndex]);

  const recordSwipe = useCallback(
    (fact: Fact, direction: SwipeDirection) => {
      const record: SwipeRecord = {
        factId: fact.id,
        text: fact.text,
        category: fact.category,
        direction,
        at: Date.now(),
      };
      historyRef.current = [...historyRef.current, record].slice(-600);
      setHistory(historyRef.current);
      if (hasConsent()) {
        addSwipeRecord(record);
        trackDailySwipe();
      }
    },
    []
  );

  const handleSwipe = useCallback(
    (fact: Fact, direction: SwipeDirection) => {
      recordSwipe(fact, direction);
      setMorphTargetId(null);
      swipeCountRef.current += 1;

      // top up the overlay queue when running low
      setOverlayQueue((prev) => {
        if (prev.length - (activeIndex + 1) <= 3) {
          loadFacts(false);
        }
        return prev;
      });

      setTimeout(() => {
        setActiveIndex((i) => i + 1);

        // periodic recall quiz — only ever quizzes on right-swiped facts
        if (swipeCountRef.current >= thresholdRef.current) {
          const liked = historyRef.current.filter((r) => r.direction === "right");
          if (liked.length >= 1) {
            const target = liked[Math.floor(Math.random() * liked.length)];

            const likedDecoys = liked.filter((r) => r.factId !== target.factId);
            const otherSwiped = historyRef.current.filter((r) => r.factId !== target.factId);
            const feedDecoys = facts.filter((f) => f.id !== target.factId);

            const decoyPool =
              likedDecoys.length >= 3
                ? likedDecoys
                : otherSwiped.length >= 3
                ? otherSwiped
                : feedDecoys.map((f) => ({ factId: f.id, text: f.text }));

            const seenIds = new Set([target.factId]);
            const decoys = [...decoyPool]
              .sort(() => Math.random() - 0.5)
              .filter((d) => {
                if (seenIds.has(d.factId)) return false;
                seenIds.add(d.factId);
                return true;
              })
              .slice(0, 3)
              .map((d) => ({ id: d.factId, text: d.text }));

            if (decoys.length >= 1) {
              setQuiz({
                target: { id: target.factId, text: target.text },
                decoys,
              });
            }
          }
          swipeCountRef.current = 0;
          thresholdRef.current = randomThreshold();
        }
      }, 220);
    },
    [activeIndex, facts, loadFacts, recordSwipe]
  );

  const handleAcceptConsent = useCallback(() => {
    setConsent(true);
    setConsentDecided(true);
    setConsentGiven(true);
    const p = getProfile();
    setProfileState(p);
    historyRef.current.forEach(addSwipeRecord);
  }, []);

  const handleDeclineConsent = useCallback(() => {
    setConsent(false);
    setConsentDecided(true);
    setConsentGiven(false);
  }, []);

  const handleSaveProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    persistProfile(p);
  }, []);

  const handleClearData = useCallback(() => {
    clearAllData();
    historyRef.current = [];
    setHistory([]);
    setProfileState({ name: "", avatar: null });
    setConsentDecided(false);
  }, []);

  const stats = getCategoryStats(history);
  const totalSwipes = history.length;
  const totalLiked = history.filter((r) => r.direction === "right").length;
  const activity = getDailyActivity();
  const streak = getStreak(activity);

  return (
    <main className="min-h-screen bg-alabaster-soft">
      {/* Hero */}
      <div className="gradient-hero relative overflow-hidden px-6 pt-12 pb-16 sm:min-h-[55vh] rounded-b-[2.5rem] flex flex-col justify-center sm:px-12 sm:pt-0 sm:pb-0">
        <div className="relative z-10">
          <p
            ref={heroLabelRef}
            className="text-xs font-semibold tracking-[0.25em] uppercase text-alabaster/60 mb-2"
          >
            FACTMATCH
          </p>
          <h1
            ref={heroH1Ref}
            className="text-3xl sm:text-5xl font-bold text-alabaster leading-tight max-w-lg"
          >
            {heroVariant.headline}
          </h1>
          <p
            ref={heroDescRef}
            className="text-base sm:text-lg text-alabaster/70 mt-3 max-w-sm sm:max-w-md"
          >
            {heroVariant.description}
          </p>

          <div ref={heroButtonsRef} className="flex items-center gap-3 mt-6">
            <button
              onClick={() => facts.length && handleOpen(0)}
              className="btn-pill btn-neumorphic-primary"
              disabled={!facts.length}
            >
              Start swiping
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="btn-pill btn-neumorphic-dark text-alabaster"
            >
              {profile.name || "Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="pt-6">
        {offline && facts.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 px-8 text-center">
            <WifiOff className="h-10 w-10 text-slate" />
            <p className="text-sm text-slate font-medium">
              Couldn't reach any fact sources right now. Check your
              connection and try again.
            </p>
            <button onClick={() => loadFacts(true)} className="btn-pill btn-pill-primary mt-2">
              Retry
            </button>
          </div>
        ) : (
          <MasonryFeed
            facts={facts}
            onOpen={handleOpen}
            onLoadMore={handleLoadMore}
            hiddenId={overlayOpen ? morphFactId : null}
            loadingMore={loadingMore}
            initialLoading={loading}
          />
        )}
      </div>

      {/* Progressive bottom blur — hides when swipe overlay is open */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-36 z-30 transition-opacity duration-300"
        style={{
          opacity: overlayOpen ? 0 : 1,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
        }}
      />

      {overlayOpen && (
        <FactOverlay
          queue={overlayQueue}
          activeIndex={activeIndex}
          onSwipe={handleSwipe}
          onClose={handleClose}
          morphTargetId={morphTargetId}
        />
      )}

      {quiz && <QuizModal target={quiz.target} decoys={quiz.decoys} onClose={() => setQuiz(null)} />}

      {profileOpen && (
        <ProfileModal
          profile={profile}
          stats={stats}
          totalSwipes={totalSwipes}
          totalLiked={totalLiked}
          activity={activity}
          streak={streak}
          onSave={handleSaveProfile}
          onClearData={handleClearData}
          onClose={() => setProfileOpen(false)}
          consentGiven={consentGiven}
          onReAccept={handleAcceptConsent}
        />
      )}

      {/* Onboarding — session-once, replaces CookieConsent for first-timers */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingScreen
            onAccept={(categories) => {
              sessionStorage.setItem("onboarding_done", "1");
              setShowOnboarding(false);
              handleAcceptConsent();
              if (categories.length > 0) setPreferredCategories(categories);
            }}
            onDecline={() => {
              sessionStorage.setItem("onboarding_done", "1");
              setShowOnboarding(false);
              handleDeclineConsent();
            }}
          />
        )}
      </AnimatePresence>

      {/* Legacy consent for returning users who cleared storage but not sessionStorage */}
      {!showOnboarding && !consentDecided && (
        <OnboardingScreen
          onAccept={(categories) => {
            handleAcceptConsent();
            if (categories.length > 0) setPreferredCategories(categories);
          }}
          onDecline={handleDeclineConsent}
        />
      )}
    </main>
  );
}
