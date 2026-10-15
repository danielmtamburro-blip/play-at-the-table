"use client";
// Leaderboards: today's (resets at midnight Dubai time) and all-time top 10, per venue and game.
import { getBrowserClient } from "./supabase/client";
import type { Lang } from "./types";

type Unit = Record<Lang, (n: number) => string>;
const plural = (en: string, ar: string): Unit => ({ en: (n) => `${n} ${en}`, ar: (n) => `${n} ${ar}` });
const time: Unit = {
  en: (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
  ar: (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
};

/** Games with a leaderboard. Must match private.score_rules in the database. */
export const SCORED: Record<string, { lowerBetter: boolean; unit: Unit }> = {
  bubbles: { lowerBetter: false, unit: plural("bubbles", "فقاعة") },
  penalty: { lowerBetter: false, unit: { en: (n) => `${n}/5 goals`, ar: (n) => `${n}/5 أهداف` } },
  racer: { lowerBetter: false, unit: plural("m", "م") },
  keepy: { lowerBetter: false, unit: plural("kicks", "ركلة") },
  reaction: { lowerBetter: true, unit: plural("ms", "م.ث") },
  maths: { lowerBetter: false, unit: plural("correct", "صحيحة") },
  memory: { lowerBetter: true, unit: plural("moves", "محاولة") },
  oddone: { lowerBetter: false, unit: { en: (n) => `${n}/8`, ar: (n) => `${n}/8` } },
  count: { lowerBetter: false, unit: { en: (n) => `${n}/6`, ar: (n) => `${n}/6` } },
  sudoku: { lowerBetter: true, unit: time },
  wordguess: { lowerBetter: true, unit: { en: (n) => `${n}/6 tries`, ar: (n) => `${n}/6 محاولات` } },
  hilo: { lowerBetter: false, unit: plural("in a row", "متتالية") },
  pour: { lowerBetter: false, unit: plural("pours", "صبّة") },
  runner: { lowerBetter: false, unit: plural("pts", "نقطة") },
  bike: { lowerBetter: false, unit: plural("pts", "نقطة") },
  freekick: { lowerBetter: false, unit: plural("pts", "نقطة") },
  slice: { lowerBetter: false, unit: plural("pts", "نقطة") },
  stack: { lowerBetter: false, unit: plural("floors", "طابق") },
  falcon: { lowerBetter: false, unit: plural("towers", "برج") },
  hoops: { lowerBetter: false, unit: plural("baskets", "سلة") },
};

export const isScored = (game: string) => game in SCORED;

export type BoardRow = { nickname: string; score: number; table_label: string | null; day?: string };
export type Board = { lower_better: boolean; today: BoardRow[]; all_time: BoardRow[] };

export async function fetchBoard(venueId: string, game: string): Promise<Board | null> {
  const sb = getBrowserClient();
  if (!sb || venueId === "sample") return null;
  const { data, error } = await sb.rpc("leaderboard", { p_venue: venueId, p_game: game });
  return error ? null : (data as Board);
}

export async function fetchHot(venueId: string): Promise<string | null> {
  const sb = getBrowserClient();
  if (!sb || venueId === "sample") return null;
  const { data } = await sb.rpc("leaderboard_hot", { p_venue: venueId });
  return (data as string | null) ?? null;
}

/** Does this score make today's or the all-time top 10? */
export async function qualifies(venueId: string, game: string, score: number): Promise<{ today: boolean; allTime: boolean }> {
  const sb = getBrowserClient();
  if (!sb || venueId === "sample") return { today: false, allTime: false };
  const { data } = await sb.rpc("leaderboard_cutoff", { p_venue: venueId, p_game: game });
  const c = data as { lower_better: boolean; today_count: number; all_count: number; today_10th: number | null; all_10th: number | null } | null;
  if (!c) return { today: false, allTime: false };
  const beats = (cut: number | null, count: number) => count < 10 || cut == null || (c.lower_better ? score < cut : score > cut);
  return { today: beats(c.today_10th, c.today_count), allTime: beats(c.all_10th, c.all_count) };
}

export async function submitScore(venueId: string, game: string, nickname: string, score: number, table: string | null) {
  const { data, error } = await getBrowserClient()!.rpc("submit_score", {
    p_venue: venueId,
    p_game: game,
    p_nickname: nickname,
    p_score: Math.round(score),
    p_table: table,
  });
  if (error) throw new Error(error.message);
  return data as { today_rank: number; all_rank: number };
}
