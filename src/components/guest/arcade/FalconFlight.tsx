"use client";
// Falcon Flight: tap to flap between the towers. Drawn in real pixel art on a tiny canvas, then scaled up crisp.
import { useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { useBest } from "../screens/Arcade";
import { GameHead } from "../screens/Engines";
import { useCanvas } from "./canvasKit";
import { ArcadeShell } from "./Shell";

const UI: Record<Lang, Record<string, string>> = {
  en: { title: "Falcon Flight", h1: "Tap anywhere to flap", h2: "Fly through the gaps between the towers", h3: "Grab the gold dates for a bonus", h4: "Don't hit the ground!" },
  ar: { title: "طيران الصقر", h1: "اضغط في أي مكان لترفرف", h2: "طِر عبر الفجوات بين الأبراج", h3: "اجمع التمر الذهبي لمكافأة", h4: "لا تصطدم بالأرض!" },
};

// ---- Pixel sprites: one character per pixel ----
const PAL: Record<string, string> = { k: "#2B1A12", b: "#8A5530", d: "#5E3920", l: "#D8A56A", w: "#F6E9D0", y: "#FFC12E", o: "#E08A10", e: "#FFFFFF", p: "#111111", g: "#FFD84A", h: "#FFF3A6", n: "#B07A10" };
const BODY = [
  "................",
  "................",
  "................",
  ".........kkkk...",
  "........kbbbbk..",
  ".......kbbbbekk.",
  "...kkkkbbbbbpyyk",
  "..kllkbbbwwwbkok",
  ".kllkbbbwwwwwbk.",
  "..kkkbbbbwwwbk..",
  "....kbbbbbbbk...",
  ".....kkkkkkk....",
];
const WINGS = [
  // up
  ["....kkk.........", "...kldbk........", "...kldbbk.......", "....kldbbk......", ".....kldbk......", "......kkk......."],
  // level
  ["................", "................", "................", "................", "................", "..kkkkkkk.......", ".kllllddbk......", "..kkkkkkk......."],
  // down
  ["................", "................", "................", "................", "................", "................", "................", "................", "....kbbbk.......", "....kldbk.......", "...kldbk........", "...kkkk........."],
];
const DATE = ["..nn..", ".gggg.", "gghggg", "gghggg", "gggggg", ".gggn.", "..nn.."];

function sprite(rows: string[][], w = 16, h = 12): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  for (const layer of rows)
    layer.forEach((row, y) =>
      [...row].forEach((ch, i) => {
        if (ch === ".") return;
        x.fillStyle = PAL[ch];
        x.fillRect(i, y, 1, 1);
      }),
    );
  return c;
}

const BW = 128; // the game is 128 pixels wide
type Tower = { x: number; gap: number; size: number; style: number; passed?: boolean; date?: { y: number; got?: boolean } };
type Bit = { x: number; y: number; vx: number; vy: number; life: number; c: string };

const STYLES = [
  { body: "#3E5C9A", dark: "#2A3F6E", win: "#9FD8FF", lit: "#FFE89A", trim: "#7FA6E0" },
  { body: "#C98D5A", dark: "#9A6640", win: "#FFE3B0", lit: "#FFF6C8", trim: "#E8B887" },
  { body: "#4A8E86", dark: "#2F6560", win: "#B8F5EC", lit: "#FFF3B0", trim: "#7CC4BA" },
  { body: "#7A5AA8", dark: "#553D7A", win: "#E3C8FF", lit: "#FFE6A0", trim: "#A98ADB" },
];

export function FalconFlight({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const [hud, setHud] = useState({ score: 0 });
  const [final, setFinal] = useState(0);
  const fresh = () => ({ y: 70, vy: 0, rot: 0, flapT: 0, towers: [] as Tower[], bits: [] as Bit[], score: 0, scroll: 0, next: 60, dead: false, deadT: 0, flash: 0, started: false, bh: 176 });
  const g = useRef(fresh());
  const art = useRef<{ frames: HTMLCanvasElement[]; date: HTMLCanvasElement; buf: HTMLCanvasElement } | null>(null);

  const start = () => {
    const bh = g.current.bh;
    g.current = { ...fresh(), bh, y: bh * 0.4 };
    setHud({ score: 0 });
    setState("play");
    log("game_start", { item: k });
  };
  const flap = () => {
    const s = g.current;
    if (state !== "play" || s.dead) return;
    s.started = true;
    s.vy = -148;
    s.flapT = 0.3;
    sfx.flap();
  };
  const die = () => {
    const s = g.current;
    if (s.dead) return;
    s.dead = true;
    s.flash = 1;
    s.vy = -90;
    sfx.crash();
    buzz(HAPTIC.bad);
    for (let i = 0; i < 14; i++) s.bits.push({ x: 40, y: s.y, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 90, life: 0.9, c: ["#8A5530", "#D8A56A", "#F6E9D0"][i % 3] });
    setFinal(s.score);
    log("game_finish", { item: k, value: s.score });
    setTimeout(() => (submit(s.score), setState("over")), 1100);
  };

  const ref = useCanvas(({ ctx, w, h, dt, t }) => {
    const s = g.current;
    if (!art.current) {
      const body = BODY;
      art.current = { frames: WINGS.map((wg) => sprite([body, wg])), date: sprite([DATE], 6, 7), buf: document.createElement("canvas") };
    }
    const A = art.current;
    const BH = Math.max(120, Math.round((BW * h) / Math.max(1, w)));
    if (A.buf.width !== BW || A.buf.height !== BH) ((A.buf.width = BW), (A.buf.height = BH));
    s.bh = BH;
    const b = A.buf.getContext("2d")!;
    const GROUND = BH - 16;
    const speed = 52 + Math.min(20, s.score * 0.6);

    // ---- update ----
    if (state === "play") {
      if (!s.dead) {
        if (s.started) {
          s.vy += 520 * dt;
          s.y += s.vy * dt;
          s.scroll += speed * dt;
          s.next -= speed * dt;
          if (s.next <= 0) {
            const gap = Math.max(46, 60 - s.score * 0.7);
            const size = gap;
            const top = 18, bottom = GROUND - 18 - size;
            const center = top + Math.random() * Math.max(10, bottom - top);
            const tw: Tower = { x: BW + 4, gap: center, size, style: Math.floor(Math.random() * STYLES.length) };
            if (Math.random() < 0.45) tw.date = { y: center + size / 2 };
            s.towers.push(tw);
            s.next = 78;
          }
        } else s.y = BH * 0.4 + Math.sin(t * 5) * 3;
        for (const tw of s.towers) {
          tw.x -= speed * dt;
          const bx = 40, br = 5;
          if (bx + br > tw.x && bx - br < tw.x + 22 && (s.y - br < tw.gap || s.y + br > tw.gap + tw.size)) die();
          if (!tw.passed && tw.x + 22 < bx) {
            tw.passed = true;
            s.score += 1;
            sfx.coin();
            setHud({ score: s.score });
          }
          if (tw.date && !tw.date.got && Math.abs(tw.x + 11 - bx) < 7 && Math.abs(tw.date.y - s.y) < 8) {
            tw.date.got = true;
            s.score += 2;
            sfx.perfect();
            for (let i = 0; i < 8; i++) s.bits.push({ x: tw.x + 11, y: tw.date.y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, life: 0.5, c: "#FFD84A" });
            setHud({ score: s.score });
          }
        }
        s.towers = s.towers.filter((tw) => tw.x > -30);
        if (s.y > GROUND - 5) ((s.y = GROUND - 5), die());
        if (s.y < -10) (s.y = -10), (s.vy = 0);
      } else {
        s.deadT += dt;
        s.vy += 520 * dt;
        s.y = Math.min(GROUND - 5, s.y + s.vy * dt);
      }
    } else if (state === "ready") {
      s.y = BH * 0.42 + Math.sin(t * 4) * 4;
      s.scroll += 30 * dt;
    }
    s.rot = s.dead ? Math.min(1.6, s.rot + dt * 6) : Math.max(-0.45, Math.min(1.1, s.vy / 260));
    s.flapT = Math.max(0, s.flapT - dt);
    for (const p of s.bits) ((p.x += p.vx * dt), (p.y += p.vy * dt), (p.vy += 200 * dt), (p.life -= dt));
    s.bits = s.bits.filter((p) => p.life > 0);
    s.flash = Math.max(0, s.flash - dt * 3);

    // ---- draw (in pixels) ----
    // Sky in flat bands, like an old console
    const bands = ["#2B2D6E", "#3C3F8F", "#5752A8", "#7A63B8", "#A472B8", "#D47FA6", "#F29A8E", "#FFC28A"];
    const bandH = Math.ceil(GROUND / bands.length);
    bands.forEach((c, i) => ((b.fillStyle = c), b.fillRect(0, i * bandH, BW, bandH)));
    // Dither line between bands
    for (let i = 1; i < bands.length; i++) {
      b.fillStyle = bands[i];
      for (let x = (i % 2); x < BW; x += 2) b.fillRect(x, i * bandH - 1, 1, 1);
    }
    // Stars in the top bands
    b.fillStyle = "#FFFFFF";
    for (let i = 0; i < 18; i++) {
      const sx = (i * 53 + Math.floor(s.scroll * 0.05)) % BW, sy = (i * 29) % (bandH * 2);
      if ((Math.floor(t * 2) + i) % 5) b.fillRect(sx, sy, 1, 1);
    }
    // Pixel sun
    const sunX = 92, sunY = Math.round(GROUND * 0.62);
    b.fillStyle = "#FFE3A0";
    for (let dy = -9; dy <= 9; dy++) {
      const half = Math.floor(Math.sqrt(81 - dy * dy));
      if ((sunY + dy) % 3 === 0 && dy > 2) continue; // retro stripes through the sun
      b.fillRect(sunX - half, sunY + dy, half * 2, 1);
    }
    // Clouds
    b.fillStyle = "#FBD3C4";
    for (let i = 0; i < 4; i++) {
      const cx = Math.round(BW - ((s.scroll * 0.2 + i * 47) % (BW + 40))) , cy = 14 + i * 13;
      b.fillRect(cx, cy, 18, 3);
      b.fillRect(cx + 4, cy - 2, 9, 2);
      b.fillRect(cx + 2, cy + 3, 14, 1);
    }
    // Far skyline (slow parallax)
    const far = Math.floor(s.scroll * 0.3);
    for (let i = -1; i < 12; i++) {
      const x = i * 14 - (far % 14), hgt = 14 + ((i + Math.floor(far / 14)) * 37 % 23);
      b.fillStyle = "#4B3A7A";
      b.fillRect(x, GROUND - hgt, 12, hgt);
      b.fillStyle = "#6A54A0";
      for (let yy = GROUND - hgt + 3; yy < GROUND - 2; yy += 4) for (let xx = x + 2; xx < x + 11; xx += 3) if ((xx + yy + i) % 4) b.fillRect(xx, yy, 1, 1);
    }
    // Towers
    for (const tw of s.towers) {
      const st = STYLES[tw.style], x = Math.round(tw.x);
      const drawPart = (y0: number, y1: number, cap: "top" | "bottom") => {
        b.fillStyle = st.dark;
        b.fillRect(x, y0, 22, y1 - y0);
        b.fillStyle = st.body;
        b.fillRect(x + 1, y0, 17, y1 - y0);
        b.fillStyle = st.trim;
        b.fillRect(x + 1, y0, 1, y1 - y0);
        for (let yy = y0 + 3; yy < y1 - 2; yy += 4)
          for (let xx = x + 3; xx < x + 18; xx += 4) {
            b.fillStyle = (xx * 7 + yy * 3 + tw.style) % 5 === 0 ? st.lit : st.win;
            b.fillRect(xx, yy, 2, 2);
          }
        // Cap with a lip and an antenna on top
        const capY = cap === "top" ? y1 - 4 : y0;
        b.fillStyle = st.trim;
        b.fillRect(x - 2, capY, 26, 4);
        b.fillStyle = st.dark;
        b.fillRect(x - 2, capY + (cap === "top" ? 3 : 0), 26, 1);
        if (cap === "bottom") {
          b.fillStyle = "#DDDDEE";
          b.fillRect(x + 10, y0 - 7, 1, 7);
          b.fillStyle = Math.floor(t * 3) % 2 ? "#FF4D4D" : "#7A1E1E";
          b.fillRect(x + 10, y0 - 8, 1, 1);
        }
      };
      drawPart(0, Math.round(tw.gap), "top");
      drawPart(Math.round(tw.gap + tw.size), GROUND, "bottom");
      if (tw.date && !tw.date.got) b.drawImage(A.date, x + 8, Math.round(tw.date.y - 3 + Math.sin(t * 6 + tw.x) * 1.5));
    }
    // Ground: sand with scrolling stripes
    b.fillStyle = "#E3A75F";
    b.fillRect(0, GROUND, BW, BH - GROUND);
    b.fillStyle = "#F7C77E";
    b.fillRect(0, GROUND, BW, 2);
    b.fillStyle = "#C9853F";
    const gs = Math.floor(s.scroll) % 8;
    for (let x = -gs; x < BW; x += 8) (b.fillRect(x, GROUND + 4, 4, 1), b.fillRect(x + 4, GROUND + 8, 4, 1));
    b.fillStyle = "#B06F30";
    b.fillRect(0, BH - 2, BW, 2);
    // Falcon
    const frame = s.dead ? 1 : s.flapT > 0 ? (s.flapT > 0.18 ? 2 : 0) : Math.floor(t * 8) % 3 === 0 ? 0 : 1;
    b.save();
    b.translate(40, Math.round(s.y));
    b.rotate(Math.round(s.rot * 8) / 8); // step the angle so it stays pixel-chunky
    b.drawImage(A.frames[frame], -8, -7);
    b.restore();
    for (const p of s.bits) {
      b.fillStyle = p.c;
      b.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    if (s.flash) {
      b.fillStyle = `rgba(255,255,255,${s.flash})`;
      b.fillRect(0, 0, BW, BH);
    }
    if (state === "play" && !s.started) {
      // "Tap" hint in chunky pixels
      b.fillStyle = "#fff";
      const hx = 34, hy = Math.round(s.y) + 14 + (Math.floor(t * 3) % 2);
      b.fillRect(hx, hy, 12, 1);
      b.fillRect(hx + 5, hy - 2, 2, 2);
    }

    // Scale up with no smoothing so every pixel stays sharp.
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(A.buf, 0, 0, BW, BH, 0, 0, w, (BH * w) / BW);
  }, true);

  return (
    <>
      <GameHead k={k} />
      <ArcadeShell
        song="desert"
        title={ui.title}
        how={[ui.h1, ui.h2, ui.h3, ui.h4]}
        state={state}
        score={final}
        best={best}
        newBest={state === "over" && best === final && final > 0}
        accent="#F29A8E"
        onStart={start}
        chips={<span className="ax-chip gold">🦅 {hud.score}</span>}
      >
        <canvas
          ref={ref}
          className="ax-canvas tall ax-pixelated"
          aria-label={ui.title}
          tabIndex={0}
          onPointerDown={flap}
          onKeyDown={(e) => (e.key === " " || e.key === "ArrowUp") && (e.preventDefault(), flap())}
        />
      </ArcadeShell>
    </>
  );
}
