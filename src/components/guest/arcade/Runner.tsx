"use client";
// Desert Dash: a 3-lane endless runner. Swipe left/right to change lane, up to jump, down to slide.
import { useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { useBest } from "../screens/Arcade";
import { GameHead } from "../screens/Engines";
import { drawParticles, lerp, rr, stepParticles, swipeHandlers, useCanvas, type Particle } from "./canvasKit";
import { ArcadeShell } from "./Shell";

const UI: Record<Lang, Record<string, string>> = {
  en: { title: "Desert Dash", h1: "Swipe ← → to change lanes", h2: "Swipe ↑ to jump rocks", h3: "Swipe ↓ to slide under arches", h4: "Grab the gold coins!", m: "m" },
  ar: { title: "سباق الصحراء", h1: "اسحب ← → لتغيير المسار", h2: "اسحب ↑ للقفز فوق الصخور", h3: "اسحب ↓ للانزلاق تحت الأقواس", h4: "اجمع العملات الذهبية!", m: "م" },
};

type Ob = { z: number; lane: number; kind: "rock" | "arch" | "wall" | "coin"; hit?: boolean };
const PZ = 1.2; // player depth
const D = 4; // perspective depth

export function Runner({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const [hud, setHud] = useState({ dist: 0, coins: 0 });
  const [final, setFinal] = useState(0);
  const g = useRef({ lane: 0, x: 0, y: 0, vy: 0, slide: 0, speed: 16, dist: 0, coins: 0, obs: [] as Ob[], next: 20, time: 0, dead: false, parts: [] as Particle[], shake: 0 });

  const reset = () => {
    g.current = { lane: 0, x: 0, y: 0, vy: 0, slide: 0, speed: 16, dist: 0, coins: 0, obs: [], next: 24, time: 0, dead: false, parts: [], shake: 0 };
    setHud({ dist: 0, coins: 0 });
    setState("play");
    log("game_start", { item: k });
  };
  const control = (d: "left" | "right" | "up" | "down" | "tap") => {
    const s = g.current;
    if (state !== "play" || s.dead) return;
    if (d === "left") s.lane = Math.max(-1, s.lane - 1);
    if (d === "right") s.lane = Math.min(1, s.lane + 1);
    if ((d === "up" || d === "tap") && s.y <= 0.01) ((s.vy = 8.2), sfx.jump());
    if (d === "down") ((s.slide = 0.75), (s.vy = Math.min(s.vy, -6)));
    if (d === "left" || d === "right") sfx.swipe();
  };

  const spawn = (s: typeof g.current) => {
    const r = Math.random();
    const lanes = [-1, 0, 1].sort(() => Math.random() - 0.5);
    if (r < 0.28) s.obs.push({ z: 60, lane: lanes[0], kind: "rock" });
    else if (r < 0.48) [-1, 0, 1].forEach((l) => s.obs.push({ z: 60, lane: l, kind: "arch" }));
    else if (r < 0.7) (s.obs.push({ z: 60, lane: lanes[0], kind: "wall" }), s.obs.push({ z: 60, lane: lanes[1], kind: "wall" }));
    else for (let i = 0; i < 5; i++) s.obs.push({ z: 60 + i * 2.2, lane: lanes[0], kind: "coin" });
    if (Math.random() < 0.5) for (let i = 0; i < 4; i++) s.obs.push({ z: 66 + i * 2.2, lane: lanes[2], kind: "coin" });
  };

  const end = () => {
    const s = g.current;
    s.dead = true;
    s.shake = 0.4;
    sfx.crash();
    buzz(HAPTIC.bad);
    const score = Math.floor(s.dist) + s.coins * 10;
    setFinal(score);
    log("game_finish", { item: k, value: score });
    setTimeout(() => (submit(score), setState("over")), 700);
  };

  const ref = useCanvas(({ ctx, w, h, dt, t }) => {
    const s = g.current;
    const hy = h * 0.36, cx = w / 2;
    const sc = (z: number) => D / (D + Math.max(-0.9, z));
    const Y = (z: number) => hy + (h - hy) * sc(z);
    const half = (z: number) => w * 0.62 * sc(z);
    const LX = (lane: number, z: number) => cx + lane * half(z) * 0.62;

    // ---- update ----
    if (state === "play" && !s.dead) {
      s.time += dt;
      s.speed = Math.min(40, 16 + s.time * 0.4);
      const dz = s.speed * dt;
      s.dist += dz * 0.5;
      s.next -= dz;
      if (s.next <= 0) (spawn(s), (s.next = Math.max(10, 18 - s.time * 0.12)));
      s.x = lerp(s.x, s.lane, Math.min(1, dt * 14));
      s.vy -= 24 * dt;
      s.y = Math.max(0, s.y + s.vy * dt);
      if (s.y === 0 && s.vy < 0) s.vy = 0;
      s.slide = Math.max(0, s.slide - dt);
      for (const o of s.obs) {
        o.z -= dz;
        if (o.hit || Math.abs(o.z - PZ) > 0.55 || Math.abs(o.lane - s.x) > 0.5) continue;
        if (o.kind === "coin") {
          o.hit = true;
          s.coins += 1;
          sfx.coin();
          for (let i = 0; i < 8; i++) s.parts.push({ x: LX(o.lane, o.z), y: Y(o.z) - 40, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 160, life: 0.5, max: 0.5, c: "#FFD34D", r: 3, g: 300 });
        } else if ((o.kind === "rock" && s.y < 0.9) || (o.kind === "arch" && s.slide <= 0) || o.kind === "wall") {
          o.hit = true;
          end();
        } else o.hit = true;
      }
      s.obs = s.obs.filter((o) => o.z > -1.5 && !(o.kind === "coin" && o.hit));
      if (Math.floor(s.time * 4) !== Math.floor((s.time - dt) * 4)) setHud({ dist: Math.floor(s.dist), coins: s.coins });
    }
    s.parts = stepParticles(s.parts, dt);
    s.shake = Math.max(0, s.shake - dt);

    // ---- draw ----
    ctx.save();
    if (s.shake) ctx.translate((Math.random() - 0.5) * 12 * s.shake, (Math.random() - 0.5) * 12 * s.shake);
    // Sky and sun
    const sky = ctx.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, "#3B1F6E");
    sky.addColorStop(0.55, "#E8606A");
    sky.addColorStop(1, "#FFC774");
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, w + 40, hy + 22);
    const sun = ctx.createRadialGradient(cx * 1.25, hy - 10, 4, cx * 1.25, hy - 10, w * 0.32);
    sun.addColorStop(0, "rgba(255,240,190,1)");
    sun.addColorStop(0.25, "rgba(255,210,130,.8)");
    sun.addColorStop(1, "rgba(255,170,100,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, hy);
    // Distant dunes (parallax)
    const off = (s.dist * 2) % w;
    for (const [col, amp, yy, sp] of [["#8C4A6B", 22, hy - 6, 0.3], ["#B8606A", 16, hy + 2, 0.6]] as [string, number, number, number][]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, hy + 30);
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, yy - amp * (0.5 + 0.5 * Math.sin((x + off * sp) / 70)) * (0.6 + 0.4 * Math.sin((x + off * sp) / 23)));
      ctx.lineTo(w, hy + 30);
      ctx.fill();
    }
    // Sand
    const sand = ctx.createLinearGradient(0, hy, 0, h);
    sand.addColorStop(0, "#E9A86A");
    sand.addColorStop(1, "#C77B3E");
    ctx.fillStyle = sand;
    ctx.fillRect(-20, hy, w + 40, h - hy + 20);
    // Stone path, drawn in bands so it scrolls
    const scroll = (s.dist * 2) % 4;
    for (let z = 60; z > -0.9; z -= 2) {
      const z1 = z - scroll, z2 = z1 - 2;
      if (z2 < -0.9) continue;
      const even = Math.round((z + 60) / 2) % 2 === 0;
      ctx.fillStyle = even ? "#D9C2A0" : "#CBB08A";
      ctx.beginPath();
      ctx.moveTo(cx - half(z1), Y(z1));
      ctx.lineTo(cx + half(z1), Y(z1));
      ctx.lineTo(cx + half(z2), Y(z2));
      ctx.lineTo(cx - half(z2), Y(z2));
      ctx.fill();
    }
    // Path edges and lane lines
    ctx.strokeStyle = "rgba(120,80,40,.35)";
    ctx.lineWidth = 2;
    for (const e of [-1, 1, -0.33, 0.33]) {
      ctx.beginPath();
      ctx.moveTo(cx + e * half(60), Y(60));
      ctx.lineTo(cx + e * half(-0.8), Y(-0.8));
      ctx.stroke();
    }
    // Side pillars
    for (let z = 60 - ((s.dist * 2) % 12); z > -0.5; z -= 12) {
      for (const side of [-1, 1]) {
        const x = cx + side * half(z) * 1.18, y = Y(z), k2 = sc(z) * h * 0.5;
        ctx.fillStyle = "#9B5E3C";
        rr(ctx, x - k2 * 0.08, y - k2, k2 * 0.16, k2, k2 * 0.03);
        ctx.fill();
        ctx.fillStyle = "#C98A5A";
        ctx.fillRect(x - k2 * 0.11, y - k2 - k2 * 0.05, k2 * 0.22, k2 * 0.07);
      }
    }
    // Objects far → near
    const list = [...s.obs].filter((o) => o.z > -0.8).sort((a, b) => b.z - a.z);
    const drawPlayerAt = list.findIndex((o) => o.z < PZ);
    const drawObj = (o: Ob) => {
      const x = LX(o.lane, o.z), y = Y(o.z), k2 = sc(o.z) * h * 0.22;
      if (o.kind === "coin") {
        const sp = Math.abs(Math.cos(t * 6 + o.z));
        ctx.fillStyle = "#F5B800";
        ctx.beginPath();
        ctx.ellipse(x, y - k2 * 0.9, k2 * 0.32 * (0.25 + sp * 0.75), k2 * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFE680";
        ctx.beginPath();
        ctx.ellipse(x, y - k2 * 0.9, k2 * 0.18 * (0.25 + sp * 0.75), k2 * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.kind === "rock") {
        ctx.fillStyle = "rgba(0,0,0,.18)";
        ctx.beginPath();
        ctx.ellipse(x, y, k2 * 0.6, k2 * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        const gr = ctx.createLinearGradient(x, y - k2 * 0.7, x, y);
        gr.addColorStop(0, "#9A7B66");
        gr.addColorStop(1, "#5E4636");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(x - k2 * 0.55, y);
        ctx.quadraticCurveTo(x - k2 * 0.5, y - k2 * 0.6, x - k2 * 0.1, y - k2 * 0.7);
        ctx.quadraticCurveTo(x + k2 * 0.45, y - k2 * 0.75, x + k2 * 0.55, y);
        ctx.fill();
      } else if (o.kind === "arch") {
        const top = y - k2 * 1.9;
        ctx.fillStyle = "#7A3E2A";
        ctx.fillRect(x - k2 * 0.6, top, k2 * 0.14, k2 * 1.9);
        ctx.fillRect(x + k2 * 0.46, top, k2 * 0.14, k2 * 1.9);
        const gr = ctx.createLinearGradient(0, top, 0, top + k2 * 0.6);
        gr.addColorStop(0, "#C0763F");
        gr.addColorStop(1, "#8A4A26");
        ctx.fillStyle = gr;
        rr(ctx, x - k2 * 0.72, top, k2 * 1.44, k2 * 0.55, k2 * 0.1);
        ctx.fill();
      } else {
        const gr = ctx.createLinearGradient(x - k2 * 0.6, 0, x + k2 * 0.6, 0);
        gr.addColorStop(0, "#8E6A52");
        gr.addColorStop(1, "#B48A6A");
        ctx.fillStyle = gr;
        rr(ctx, x - k2 * 0.6, y - k2 * 1.3, k2 * 1.2, k2 * 1.3, k2 * 0.08);
        ctx.fill();
        ctx.strokeStyle = "rgba(60,40,30,.35)";
        ctx.lineWidth = Math.max(1, k2 * 0.04);
        ctx.strokeRect(x - k2 * 0.6, y - k2 * 0.65, k2 * 1.2, 0.01);
      }
    };
    const drawPlayer = () => {
      const x = LX(s.x, PZ), y = Y(PZ), k2 = sc(PZ) * h * 0.24;
      ctx.fillStyle = "rgba(0,0,0,.2)";
      ctx.beginPath();
      ctx.ellipse(x, y, k2 * 0.42 * (1 - s.y * 0.05), k2 * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      const lift = s.y * k2 * 0.35, sl = s.slide > 0;
      const ph = t * (state === "play" && !s.dead ? 16 : 3);
      const legA = Math.sin(ph) * 0.5, armA = -Math.sin(ph) * 0.6;
      const hip = y - lift - (sl ? k2 * 0.35 : k2 * 0.75);
      ctx.lineCap = "round";
      // Legs
      ctx.strokeStyle = "#2B2F4A";
      ctx.lineWidth = k2 * 0.16;
      if (!sl)
        for (const sgn of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(x + sgn * k2 * 0.1, hip);
          ctx.lineTo(x + sgn * k2 * 0.12 + Math.sin(legA * sgn) * k2 * 0.15, hip + k2 * 0.62 - Math.max(0, legA * sgn) * k2 * 0.18);
          ctx.stroke();
        }
      // Torso
      const tg = ctx.createLinearGradient(x, hip - k2 * 0.7, x, hip);
      tg.addColorStop(0, "#FF6B5B");
      tg.addColorStop(1, "#D9364F");
      ctx.fillStyle = tg;
      rr(ctx, x - k2 * 0.24, hip - k2 * (sl ? 0.45 : 0.7), k2 * 0.48, k2 * (sl ? 0.45 : 0.72), k2 * 0.16);
      ctx.fill();
      // Arms
      ctx.strokeStyle = "#E8A47C";
      ctx.lineWidth = k2 * 0.11;
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + sgn * k2 * 0.24, hip - k2 * (sl ? 0.35 : 0.6));
        ctx.lineTo(x + sgn * k2 * 0.36, hip - k2 * (sl ? 0.15 : 0.3) + Math.sin(armA * sgn) * k2 * 0.18);
        ctx.stroke();
      }
      // Head with hair and cap
      const hyy = hip - k2 * (sl ? 0.62 : 0.92);
      ctx.fillStyle = "#E8A47C";
      ctx.beginPath();
      ctx.arc(x, hyy, k2 * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3A2418";
      ctx.beginPath();
      ctx.arc(x, hyy - k2 * 0.02, k2 * 0.2, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#FFB51F";
      rr(ctx, x - k2 * 0.22, hyy - k2 * 0.2, k2 * 0.44, k2 * 0.1, k2 * 0.05);
      ctx.fill();
    };
    list.forEach((o, i) => {
      if (i === drawPlayerAt) drawPlayer();
      drawObj(o);
    });
    if (drawPlayerAt === -1) drawPlayer();
    drawParticles(ctx, s.parts);
    // Speed lines
    if (state === "play" && s.speed > 24) {
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * w * 0.45, hy + Math.sin(a) * h * 0.3 + h * 0.2);
        ctx.lineTo(cx + Math.cos(a) * w * 0.6, hy + Math.sin(a) * h * 0.4 + h * 0.2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }, true);

  const sw = swipeHandlers(control);
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
        accent="#FF8A3D"
        onStart={reset}
        chips={
          <>
            <span className="ax-chip">🏃 {hud.dist} {ui.m}</span>
            <span className="ax-chip gold">🪙 {hud.coins}</span>
          </>
        }
      >
        <canvas
          ref={ref}
          className="ax-canvas tall"
          {...sw}
          onKeyDown={(e) => {
            const m: Record<string, "left" | "right" | "up" | "down"> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", " ": "up" };
            if (m[e.key]) (e.preventDefault(), control(m[e.key]));
          }}
          tabIndex={0}
          aria-label={ui.title}
        />
      </ArcadeShell>
      {state === "play" && (
        <div className="ax-pad">
          <button onClick={() => control("left")} data-act="left" aria-label="Left">◀</button>
          <button onClick={() => control("up")} data-act="up" aria-label="Jump">▲</button>
          <button onClick={() => control("down")} data-act="down" aria-label="Slide">▼</button>
          <button onClick={() => control("right")} data-act="right" aria-label="Right">▶</button>
        </div>
      )}
    </>
  );
}
