// ─── Feed Injection Config ────────────────────────────────────────────────────
// Declarative map of which widget appears after which batch of articles.
// The feed component reads this config — it has zero knowledge of the widgets.
//
// To add a new widget: add one entry here. Nothing else changes.
// To remove a widget: delete its entry. Nothing else changes.
//
// afterBatch: 0 = after the SSR seed articles, 1 = after first client fetch, etc.
// componentKey: must match a key in INJECTION_COMPONENTS in injection-slot.tsx
// minHeight: reserved px height — prevents CLS while the chunk loads (Pillar 3)

export interface FeedInjection {
  afterBatch:    number;
  id:            string;   // stable React key
  componentKey:  string;   // maps to a dynamic() import in InjectionSlot
  minHeight:     number;   // px — reserved before component loads
}

export const FEED_INJECTIONS: FeedInjection[] = [
  {
    afterBatch:   1,
    id:           "feed-cricket-inline",
    componentKey: "CricketInline",
    minHeight:    180,
  },
  {
    afterBatch:   2,
    id:           "feed-horoscope-mini",
    componentKey: "HoroscopeMini",
    minHeight:    120,
  },
  {
    afterBatch:   3,
    id:           "feed-stories-strip",
    componentKey: "StoriesStrip",
    minHeight:    140,
  },
];
