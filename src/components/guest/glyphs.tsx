// Clean line icons for the grown-up parts of the guest page (kids' areas keep their emojis).
import type { GameInfo } from "@/lib/games";

const P: Record<string, string> = {
  bell: "M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4zM10 20a2 2 0 0 0 4 0M12 4.5V3",
  receipt: "M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21zM9 8h6M9 12h6M9 16h3",
  tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
  chat: "M4 5h16v11H9l-5 4zM8 10h8M8 13h5",
  plate: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  cutlery: "M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M9 3v6M17 21V3c-2 1.5-3 4-3 8h3",
  glass: "M7 3h10l-1 8a4 4 0 0 1-8 0zM12 15v6M8.5 21h7M7.5 7h9",
  puzzle: "M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4z",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  party: "M3 6h11v7H8l-3 3v-3H3zM17 9h4v7h-2v3l-3-3h-4v-1",
  cards: "M8 5h10a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4.5 7.5 7 7M5 17l2 1M13 10l2 2.5-2 2.5-2-2.5z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01M15 9l5-5M17 4h3v3",
  ball: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  wheel: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4",
  calc: "M6 3h12v18H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h3",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4",
  landmark: "M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6z",
  wave: "M3 15c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2M3 19c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2M15 5a3 3 0 0 1 0 6",
  tree: "M12 21v-5M7 16h10l-5-12z",
  ferris: "M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 8v.01M8 21l4-8 4 8M6 21h12",
  bag: "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2",
  mask: "M4 5c3 2 13 2 16 0v6a8 8 0 0 1-16 0zM9 10h.01M15 10h.01M9 14c2 1.5 4 1.5 6 0",
  cup: "M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  phone: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z",
  pin: "M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  access: "M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM7 8h10M12 8v6l-3 6M12 14l3 6",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  diet: "M12 21c-5 0-8-4-8-9 4 0 7 1.5 8 5 1-3.5 4-5 8-5 0 5-3 9-8 9zM12 17V7M12 7c0-2 1-3.5 3-4",
};

export function Glyph({ k, className }: { k: string; className?: string }) {
  const d = P[k] ?? P.star;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Line icon for a grown-up game (kids' games keep their emoji). */
export function gameGlyph(g: GameInfo): string {
  if (g.key === "bill" || g.key === "sipwheel") return "wheel";
  if (g.key === "split") return "calc";
  if (g.key === "darts") return "target";
  if (g.key === "pool") return "ball";
  if (g.key === "pour") return "glass";
  if (g.key === "runner") return "flag";
  if (g.key === "bike") return "target";
  if (g.key === "freekick" || g.key === "penalty" || g.key === "keepy") return "ball";
  if (g.key === "racer") return "flag";
  if (g.key === "memory" || g.key === "spotkids" || g.key === "oddone") return "cards";
  if (g.group === "date") return "heart";
  if (g.cat === "puzzles") return "puzzle";
  if (g.cat === "trivia") return "bulb";
  if (g.cat === "party") return "party";
  if (g.cat === "cards") return "cards";
  if (g.cat === "talk") return "chat";
  return "star";
}
