"use client";
// Fruit Slash: swipe to slice fruit thrown up from the table. Don't drop three, and never slice a bomb.
import { useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { useBest } from "../screens/Arcade";
import { GameHead } from "../screens/Engines";
import { drawParticles, stepParticles, useCanvas, type Particle } from "./canvasKit";
import { ArcadeShell } from "./Shell";

const UI: Record<Lang, Record<string, string>> = {
  en: { title: "Fruit Slash", h1: "Swipe across the fruit to slice it", h2: "Slice 3 or more in one swipe for a combo", h3: "Drop 3 fruit and it's over", h4: "Never slice a bomb 💣", combo: "COMBO", lives: "Lives" },
  ar: { title: "تقطيع الفواكه", h1: "اسحب فوق الفاكهة لتقطيعها", h2: "قطّع 3 أو أكثر بسحبة واحدة لتحصل على كومبو", h3: "إذا سقطت 3 فواكه تنتهي اللعبة", h4: "لا تقطع القنبلة أبداً 💣", combo: "كومبو", lives: "المحاولات" },
};

type Kind = "watermelon" | "orange" | "apple" | "lemon" | "kiwi" | "peach" | "bomb";
// Skin, flesh, rind ring, seed colour, radius (relative to width)
const LOOK: Record<Exclude<Kind, "bomb">, { skin: string; skin2: string; flesh: string; ring: string; seed: string; r: number }> = {
  watermelon: { skin: "#2E9E4A", skin2: "#17632C", flesh: "#FF4D5E", ring: "#F4FFE8", seed: "#2A1A12", r: 0.105 },
  orange: { skin: "#FF9A1F", skin2: "#E06A00", flesh: "#FFB547", ring: "#FFF1D6", seed: "#FFE3A8", r: 0.078 },
  apple: { skin: "#E8303F", skin2: "#9E1424", flesh: "#FFF4D2", ring: "#FFFBEA", seed: "#5A3A1E", r: 0.074 },
  lemon: { skin: "#FFE03A", skin2: "#E3B400", flesh: "#FFF27A", ring: "#FFFDE5", seed: "#FFF7B8", r: 0.07 },
  kiwi: { skin: "#8A6236", skin2: "#5C3E1F", flesh: "#7BC043", ring: "#E9F7C9", seed: "#1C1A10", r: 0.066 },
  peach: { skin: "#FFB07A", skin2: "#F0606E", flesh: "#FFD28A", ring: "#FFF0D8", seed: "#B5502E", r: 0.072 },
};
const KINDS = Object.keys(LOOK) as Exclude<Kind, "bomb">[];

type Fruit = { x: number; y: number; vx: number; vy: number; a: number; va: number; kind: Kind; r: number; cut?: boolean };
type Half = { x: number; y: number; vx: number; vy: number; a: number; va: number; kind: Exclude<Kind, "bomb">; r: number; side: 1 | -1; cutA: number; life: number };
type Stain = { x: number; y: number; r: number; c: string; life: number; blobs: [number, number, number][] };
type Pop = { x: number; y: number; text: string; life: number; big?: boolean };

export function FruitSlash({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const [hud, setHud] = useState({ score: 0, lives: 3 });
  const [final, setFinal] = useState(0);
  const fresh = () => ({ fruits: [] as Fruit[], halves: [] as Half[], stains: [] as Stain[], parts: [] as Particle[], pops: [] as Pop[], trail: [] as { x: number; y: number; t: number }[], score: 0, lives: 3, time: 0, wave: 1.2, flash: 0, shake: 0, dead: false, down: false, swipeHits: 0, w: 0, h: 0 });
  const g = useRef(fresh());

  const start = () => {
    g.current = fresh();
    setHud({ score: 0, lives: 3 });
    setState("play");
    log("game_start", { item: k });
  };
  const end = (bomb: boolean) => {
    const s = g.current;
    if (s.dead) return;
    s.dead = true;
    if (bomb) ((s.flash = 1), (s.shake = 0.6), sfx.boom(), buzz(HAPTIC.bad));
    else sfx.lose();
    setFinal(s.score);
    log("game_finish", { item: k, value: s.score });
    setTimeout(() => (submit(s.score), setState("over")), bomb ? 1100 : 700);
  };

  const throwWave = (s: ReturnType<typeof fresh>) => {
    const n = Math.min(6, 1 + Math.floor(Math.random() * (2 + s.time / 15)));
    const bombChance = Math.min(0.28, 0.06 + s.time / 200);
    for (let i = 0; i < n; i++) {
      const bomb = s.time > 6 && Math.random() < bombChance;
      const kind: Kind = bomb ? "bomb" : KINDS[Math.floor(Math.random() * KINDS.length)];
      const r = (bomb ? 0.075 : LOOK[kind as Exclude<Kind, "bomb">].r) * s.w;
      const x = s.w * (0.18 + Math.random() * 0.64);
      // Aim the throw so the top of the arc lands in the upper third of the screen.
      const peak = s.h * (0.12 + Math.random() * 0.25);
      const G = s.h * 1.25;
      const vy = -Math.sqrt(2 * G * (s.h + r - peak));
      const vx = (s.w / 2 - x) * (0.5 + Math.random() * 0.7) + (Math.random() - 0.5) * s.w * 0.3;
      setTimeout(() => {
        if (!g.current.dead && g.current === s) s.fruits.push({ x, y: s.h + r, vx, vy, a: Math.random() * 6, va: (Math.random() - 0.5) * 5, kind, r });
      }, i * (120 + Math.random() * 180));
    }
  };

  const slice = (s: ReturnType<typeof fresh>, f: Fruit, dx: number, dy: number) => {
    f.cut = true;
    if (f.kind === "bomb") return end(true);
    const L = LOOK[f.kind];
    const cutA = Math.atan2(dy, dx);
    const nx = -Math.sin(cutA), ny = Math.cos(cutA);
    for (const side of [1, -1] as const)
      s.halves.push({ x: f.x, y: f.y, vx: f.vx * 0.6 + nx * side * 90, vy: f.vy * 0.3 + ny * side * 90 - 60, a: cutA, va: side * (2 + Math.random() * 2), kind: f.kind, r: f.r, side, cutA, life: 2.5 });
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 260;
      s.parts.push({ x: f.x, y: f.y, vx: Math.cos(a) * sp + dx * 0.15, vy: Math.sin(a) * sp + dy * 0.15, life: 0.6 + Math.random() * 0.4, max: 1, c: L.flesh, r: 2 + Math.random() * 4, g: 900 });
    }
    const blobs: [number, number, number][] = Array.from({ length: 7 }, () => [(Math.random() - 0.5) * f.r * 2.2, (Math.random() - 0.5) * f.r * 2.2, f.r * (0.2 + Math.random() * 0.45)]);
    s.stains.push({ x: f.x, y: f.y, r: f.r * 1.1, c: L.flesh, life: 3, blobs });
    if (s.stains.length > 14) s.stains.shift();
    s.score += 1;
    s.swipeHits += 1;
    s.pops.push({ x: f.x, y: f.y - f.r, text: "+1", life: 0.7 });
    sfx.slice();
    sfx.splat();
    buzz(HAPTIC.tap);
    setHud({ score: s.score, lives: s.lives });
  };

  const finishSwipe = (s: ReturnType<typeof fresh>) => {
    if (s.swipeHits >= 3) {
      const bonus = s.swipeHits;
      s.score += bonus;
      const last = s.trail[s.trail.length - 1];
      s.pops.push({ x: last?.x ?? s.w / 2, y: (last?.y ?? s.h / 2) - 30, text: `${s.swipeHits}× ${ui.combo} +${bonus}`, life: 1.2, big: true });
      for (let i = 0; i < s.swipeHits; i++) setTimeout(() => sfx.combo(i * 3), i * 70);
      setHud({ score: s.score, lives: s.lives });
    }
    s.swipeHits = 0;
  };

  const ref = useCanvas(({ ctx, w, h, dt, t }) => {
    const s = g.current;
    s.w = w;
    s.h = h;
    const G = h * 1.25;
    // ---- update ----
    if (state === "play" && !s.dead) {
      s.time += dt;
      s.wave -= dt;
      if (s.wave <= 0 && s.fruits.length < 3) (throwWave(s), (s.wave = Math.max(0.9, 2.2 - s.time / 40)));
    }
    for (const f of s.fruits) {
      f.vy += G * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.a += f.va * dt;
      if (f.kind === "bomb" && !f.cut && Math.random() < 0.6)
        s.parts.push({ x: f.x + Math.sin(f.a - 0.9) * f.r * 1.3, y: f.y - Math.cos(f.a - 0.9) * f.r * 1.3, vx: (Math.random() - 0.5) * 80, vy: -40 - Math.random() * 60, life: 0.35, max: 0.35, c: Math.random() < 0.5 ? "#FFE27A" : "#FF7A2E", r: 1.5 + Math.random() * 2 });
      if (!f.cut && f.vy > 0 && f.y - f.r > h) {
        f.cut = true;
        if (f.kind !== "bomb" && state === "play" && !s.dead) {
          s.lives -= 1;
          sfx.wrong();
          buzz(HAPTIC.bad);
          s.pops.push({ x: Math.min(w - 30, Math.max(30, f.x)), y: h - 30, text: "✕", life: 0.8, big: true });
          setHud({ score: s.score, lives: s.lives });
          if (s.lives <= 0) end(false);
        }
      }
    }
    s.fruits = s.fruits.filter((f) => !f.cut);
    for (const hf of s.halves) {
      hf.vy += G * dt;
      hf.x += hf.vx * dt;
      hf.y += hf.vy * dt;
      hf.a += hf.va * dt;
      hf.life -= dt;
    }
    s.halves = s.halves.filter((hf) => hf.life > 0 && hf.y - hf.r < h + 40);
    for (const st of s.stains) st.life -= dt * 0.5;
    s.stains = s.stains.filter((st) => st.life > 0);
    for (const p of s.pops) ((p.life -= dt), (p.y -= 40 * dt));
    s.pops = s.pops.filter((p) => p.life > 0);
    s.parts = stepParticles(s.parts, dt);
    const now = performance.now() / 1000;
    s.trail = s.trail.filter((p) => now - p.t < 0.16);
    s.flash = Math.max(0, s.flash - dt * 1.4);
    s.shake = Math.max(0, s.shake - dt);

    // ---- draw ----
    ctx.save();
    if (s.shake) ctx.translate((Math.random() - 0.5) * 18 * s.shake, (Math.random() - 0.5) * 18 * s.shake);
    // Wooden table top
    const wood = ctx.createLinearGradient(0, 0, w, h);
    wood.addColorStop(0, "#7A4A2A");
    wood.addColorStop(0.5, "#8E5A33");
    wood.addColorStop(1, "#5E3720");
    ctx.fillStyle = wood;
    ctx.fillRect(-20, -20, w + 40, h + 40);
    const plank = h / 5;
    for (let i = 0; i < 6; i++) {
      const y = i * plank;
      ctx.fillStyle = i % 2 ? "rgba(255,220,170,.04)" : "rgba(0,0,0,.05)";
      ctx.fillRect(0, y, w, plank);
      ctx.fillStyle = "rgba(30,14,4,.45)";
      ctx.fillRect(0, y - 1, w, 2);
      ctx.strokeStyle = "rgba(40,20,8,.16)";
      ctx.lineWidth = 1.2;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        const yy = y + plank * (0.15 + j * 0.17);
        ctx.moveTo(0, yy);
        for (let x = 0; x <= w; x += 20) ctx.lineTo(x, yy + Math.sin(x / 47 + i * 3 + j) * 3 + Math.sin(x / 13 + j) * 0.8);
        ctx.stroke();
      }
      // A knot in the wood
      ctx.strokeStyle = "rgba(40,20,8,.22)";
      ctx.beginPath();
      ctx.ellipse(((i * 137) % w) + 20, y + plank * 0.5, 14, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,.45)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    // Juice stains
    for (const st of s.stains) {
      ctx.globalAlpha = Math.min(0.5, st.life * 0.25);
      ctx.fillStyle = st.c;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r * 0.8, 0, Math.PI * 2);
      for (const [bx, by, br] of st.blobs) (ctx.moveTo(st.x + bx + br, st.y + by), ctx.arc(st.x + bx, st.y + by, br, 0, Math.PI * 2));
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Fruit halves (behind whole fruit)
    for (const hf of s.halves) drawHalf(ctx, hf);
    for (const f of s.fruits) (f.kind === "bomb" ? drawBomb(ctx, f, t) : drawFruit(ctx, f));
    drawParticles(ctx, s.parts);
    // Blade trail
    if (s.trail.length > 1) {
      for (const [lw, col] of [[14, "rgba(120,200,255,.25)"], [7, "rgba(200,235,255,.75)"], [3, "#fff"]] as [number, string][]) {
        ctx.strokeStyle = col;
        ctx.lineCap = ctx.lineJoin = "round";
        for (let i = 1; i < s.trail.length; i++) {
          const a = s.trail[i - 1], b = s.trail[i], k2 = i / s.trail.length;
          ctx.lineWidth = lw * k2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // Score pops
    ctx.textAlign = "center";
    for (const p of s.pops) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.font = `900 ${p.big ? 26 : 20}px system-ui, sans-serif`;
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(40,16,4,.8)";
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.text === "✕" ? "#FF5A4E" : p.big ? "#FFE27A" : "#fff";
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (s.flash) {
      ctx.fillStyle = `rgba(255,250,235,${s.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
  }, true);

  const pt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = g.current;
    if (!s.down || state !== "play" || s.dead) return;
    const p = pt(e), last = s.trail[s.trail.length - 1];
    s.trail.push({ ...p, t: performance.now() / 1000 });
    if (!last) return;
    const dx = p.x - last.x, dy = p.y - last.y, len = Math.hypot(dx, dy);
    if (len < 2) return;
    if (len > 18 && Math.random() < 0.3) sfx.swipe();
    // Did this bit of the swipe pass through any fruit?
    for (const f of s.fruits) {
      if (f.cut) continue;
      const t2 = Math.max(0, Math.min(1, ((f.x - last.x) * dx + (f.y - last.y) * dy) / (len * len)));
      if (Math.hypot(last.x + dx * t2 - f.x, last.y + dy * t2 - f.y) < f.r * 0.95) slice(s, f, dx * 30, dy * 30);
    }
  };

  return (
    <>
      <GameHead k={k} />
      <ArcadeShell
        song="sunny"
        title={ui.title}
        how={[ui.h1, ui.h2, ui.h3, ui.h4]}
        state={state}
        score={final}
        best={best}
        newBest={state === "over" && best === final && final > 0}
        accent="#FF5A4E"
        onStart={start}
        chips={
          <>
            <span className="ax-chip gold">🍉 {hud.score}</span>
            <span className="ax-chip">{"❤️".repeat(Math.max(0, hud.lives))}{"🖤".repeat(Math.max(0, 3 - hud.lives))}</span>
          </>
        }
      >
        <canvas
          ref={ref}
          className="ax-canvas tall"
          aria-label={ui.title}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const s = g.current;
            s.down = true;
            s.swipeHits = 0;
            s.trail = [{ ...pt(e), t: performance.now() / 1000 }];
          }}
          onPointerMove={move}
          onPointerUp={() => ((g.current.down = false), finishSwipe(g.current))}
          onPointerCancel={() => ((g.current.down = false), finishSwipe(g.current))}
        />
      </ArcadeShell>
    </>
  );
}

function drawFruit(ctx: CanvasRenderingContext2D, f: Fruit) {
  const L = LOOK[f.kind as Exclude<Kind, "bomb">], r = f.r;
  ctx.save();
  ctx.translate(f.x, f.y);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.beginPath();
  ctx.ellipse(r * 0.25, r * 0.35, r, r * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(f.a);
  const sx = f.kind === "watermelon" ? 1.18 : f.kind === "lemon" ? 1.22 : f.kind === "kiwi" ? 1.1 : 1;
  ctx.scale(sx, 1);
  const gr = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  gr.addColorStop(0, L.skin);
  gr.addColorStop(1, L.skin2);
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  if (f.kind === "watermelon") {
    ctx.strokeStyle = "rgba(10,60,20,.55)";
    ctx.lineWidth = r * 0.12;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(i) * r * 0.32 + 1, r * 0.98, 0, -Math.PI / 2, Math.PI / 2, i < 0);
      ctx.stroke();
    }
  }
  if (f.kind === "orange" || f.kind === "lemon") {
    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4, d = (i / 14) * r * 0.85;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (f.kind === "kiwi") {
    ctx.strokeStyle = "rgba(255,230,180,.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const a = i * 0.35;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      ctx.lineTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
      ctx.stroke();
    }
  }
  if (f.kind === "peach") {
    ctx.strokeStyle = "rgba(160,40,40,.35)";
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.95);
    ctx.quadraticCurveTo(r * 0.35, 0, 0, r * 0.95);
    ctx.stroke();
  }
  if (f.kind === "apple" || f.kind === "peach" || f.kind === "orange") {
    ctx.strokeStyle = "#5A3A1E";
    ctx.lineWidth = r * 0.12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.05, -r * 1.2, r * 0.18, -r * 1.3);
    ctx.stroke();
    ctx.fillStyle = "#4CB944";
    ctx.beginPath();
    ctx.ellipse(r * 0.38, -r * 1.12, r * 0.32, r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Shine
  const sh = ctx.createRadialGradient(-r * 0.4, -r * 0.45, 0, -r * 0.4, -r * 0.45, r * 0.55);
  sh.addColorStop(0, "rgba(255,255,255,.65)");
  sh.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHalf(ctx: CanvasRenderingContext2D, hf: Half) {
  const L = LOOK[hf.kind], r = hf.r;
  ctx.save();
  ctx.globalAlpha = Math.min(1, hf.life * 2);
  ctx.translate(hf.x, hf.y);
  ctx.rotate(hf.a);
  if (hf.side < 0) ctx.scale(1, -1);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = L.skin2;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = L.ring;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = L.flesh;
  ctx.fill();
  ctx.fillStyle = L.seed;
  if (hf.kind === "orange" || hf.kind === "lemon") {
    ctx.strokeStyle = L.ring;
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 6; i++) {
      const a = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
      ctx.stroke();
    }
  } else if (hf.kind === "kiwi") {
    ctx.fillStyle = "#F4F9D8";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.25, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = L.seed;
    for (let i = 0; i < 12; i++) {
      const a = 0.15 + (i / 12) * (Math.PI - 0.3);
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, r * 0.06, r * 0.025, a, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (hf.kind === "peach") {
    ctx.beginPath();
    ctx.ellipse(0, r * 0.12, r * 0.25, r * 0.18, 0, 0, Math.PI);
    ctx.fill();
  } else {
    const n = hf.kind === "watermelon" ? 7 : 3;
    for (let i = 0; i < n; i++) {
      const a = 0.4 + (i / Math.max(1, n - 1)) * (Math.PI - 0.8);
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.07, r * 0.04, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBomb(ctx: CanvasRenderingContext2D, f: Fruit, t: number) {
  const r = f.r;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(r * 0.25, r * 0.35, r, r * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  // Red warning glow
  const glow = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.7);
  glow.addColorStop(0, `rgba(255,40,40,${0.25 + 0.2 * Math.sin(t * 14)})`);
  glow.addColorStop(1, "rgba(255,40,40,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(f.a);
  const gr = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.05, 0, 0, r);
  gr.addColorStop(0, "#5A5A6E");
  gr.addColorStop(1, "#0D0D14");
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3A3A48";
  ctx.save();
  ctx.rotate(-0.9);
  ctx.fillRect(-r * 0.22, -r * 1.18, r * 0.44, r * 0.3);
  ctx.strokeStyle = "#C9A26B";
  ctx.lineWidth = r * 0.09;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.15);
  ctx.quadraticCurveTo(r * 0.3, -r * 1.45, 0, -r * 1.25);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.38, -r * 0.4, r * 0.22, r * 0.13, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `900 ${r * 0.9}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FF4040";
  ctx.fillText("✕", 0, r * 0.05);
  ctx.restore();
}
