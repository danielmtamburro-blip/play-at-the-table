"use client";
// The frame every canvas game sits in: full-width stage, score chips, start and game-over screens.
import { useEffect, useState } from "react";
import { isMuted, music, onMute, setMuted, type SONGS } from "@/lib/sfx";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";

/** Sound on/off, shared by every game and remembered on this phone. */
export function MuteButton() {
  const [m, setM] = useState(false);
  useEffect(() => (setM(isMuted()), onMute(setM)), []);
  return (
    <button className="ax-mute" aria-label={m ? "Sound on" : "Sound off"} aria-pressed={m} onClick={() => setMuted(!m)}>
      {m ? "🔇" : "🔊"}
    </button>
  );
}

/** Plays a game's music while it's being played. */
export function useMusic(song: keyof typeof SONGS | undefined, on: boolean) {
  const [m, setM] = useState(false);
  useEffect(() => (setM(isMuted()), onMute(setM)), []);
  useEffect(() => {
    if (!song || !on || m) return;
    music.play(song);
    return () => music.stop();
  }, [song, on, m]);
}

const UI: Record<Lang, Record<string, string>> = {
  en: { play: "Play", again: "Play again", best: "Best", over: "Game over", newBest: "New best! 🎉", score: "Score" },
  ar: { play: "العب", again: "العب مرة أخرى", best: "الأفضل", over: "انتهت اللعبة", newBest: "رقم قياسي جديد! 🎉", score: "النتيجة" },
};

export function ArcadeShell({ title, how, state, score, best, chips, onStart, children, accent = "#FFB51F", newBest, song }: {
  title: string;
  how: string[];
  state: "ready" | "play" | "over";
  score: number | string;
  best: number | null;
  chips?: React.ReactNode;
  onStart: () => void;
  children: React.ReactNode;
  accent?: string;
  newBest?: boolean;
  song?: keyof typeof SONGS;
}) {
  const { lang } = useGuest();
  const u = UI[lang];
  useMusic(song, state === "play");
  return (
    <div className="ax" style={{ ["--ax" as string]: accent }}>
      <div className="ax-stage">
        {children}
        {state === "play" && <div className="ax-hud">{chips}</div>}
        <MuteButton />
        {state !== "play" && (
          <div className="ax-overlay">
            <div className="ax-card">
              <b className="ax-title">{state === "over" ? u.over : title}</b>
              {state === "over" ? (
                <>
                  <span className="ax-score">{score}</span>
                  <span className="ax-best">{newBest ? u.newBest : best != null ? `${u.best}: ${best}` : ""}</span>
                </>
              ) : (
                <ul className="ax-how">
                  {how.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              <button className="ax-play" data-act="start" onClick={onStart}>
                ▶ {state === "over" ? u.again : u.play}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
