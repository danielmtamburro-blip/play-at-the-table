"use client";
// Sky Tower: a floor slides back and forth, tap to drop it. Whatever overhangs is sliced off. Line it up perfectly for a bonus.
import { useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { useBest } from "../screens/Arcade";
import { GameHead } from "../screens/Engines";
import { drawParticles, lerp, stepParticles, useCanvas, type Particle } from "./canvasKit";
import { ArcadeShell } from "./Shell";

const UI: Record<Lang, Record<string, string>> = {
  en: { title: "Sky Tower", h1: "Tap to drop each floor", h2: "Anything hanging over the edge falls off", h3: "Line it up perfectly for a bonus ✨", h4: "How high can you build?", perfect: "PERFECT!", floors: "floors" },
  ar: { title: "برج السماء", h1: "اضغط لإسقاط كل طابق", h2: "أي جزء يتجاوز الحافة يسقط", h3: "طابقه تماماً لتحصل على مكافأة ✨", h4: "إلى أي ارتفاع تستطيع البناء؟", perfect: "مثالي!", floors: "طوابق" },
};

const FH = 26; // floor height in px
const DEPTH = 0.5; // how much of the top face shows, as a share of the floor height
type Floor = { x: number; w: number; hue: number };
type Chip = { x: number; y: number; w: number; vx: number; vy: number; a: number; va: number; hue: number };

export function SkyTower({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const [hud, setHud] = useState({ floors: 0, combo: 0 });
  const [final, setFinal] = useState(0);
  const fresh = (w = 320) => ({ floors: [{ x: w * 0.2, w: w * 0.6, hue: 200 }] as Floor[], mover: { x: 0, w: w * 0.6, dir: 1, speed: 150 }, chips: [] as Chip[], parts: [] as Particle[], cam: 0, combo: 0, glow: 0, pop: 0, shake: 0, dead: false, w, stars: Array.from({ length: 60 }, () => [Math.random(), Math.random() * 3000, Math.random()]) as [number, number, number][] });
  const g = useRef(fresh());

  const start = () => {
    const w = g.current.w;
    g.current = fresh(w);
    g.current.mover.x = -w * 0.3;
    setHud({ floors: 0, combo: 0 });
    setState("play");
    log("game_start", { item: k });
  };

  const drop = () => {
    const s = g.current;
    if (state !== "play" || s.dead) return;
    const top = s.floors[s.floors.length - 1], m = s.mover;
    const left = Math.max(top.x, m.x), right = Math.min(top.x + top.w, m.x + m.w);
    const hue = (top.hue + 14) % 360;
    const y = (s.floors.length + 1) * FH; // height of the new floor's top
    if (right - left <= 0) {
      // Missed the tower completely
      s.chips.push({ x: m.x, y, w: m.w, vx: m.dir * 40, vy: 0, a: 0, va: m.dir * 1.5, hue });
      s.dead = true;
      s.shake = 0.35;
      sfx.thud();
      sfx.lose();
      buzz(HAPTIC.bad);
      const score = s.floors.length - 1;
      setFinal(score);
      log("game_finish", { item: k, value: score });
      setTimeout(() => (submit(score), setState("over")), 1200);
      return;
    }
    const off = Math.abs(m.x - top.x);
    let nx = left, nw = right - left;
    if (off < 5) {
      // Perfect: snap into place, and every 3 in a row grows the floor back a little.
      nx = top.x;
      nw = top.w;
      s.combo += 1;
      if (s.combo >= 3) nw = Math.min(s.w * 0.6, nw + 8);
      nx = top.x - (nw - top.w) / 2;
      s.glow = 1;
      s.pop = 1;
      sfx.perfect();
      sfx.combo(s.combo);
      buzz(HAPTIC.tap);
      for (let i = 0; i < 24; i++)
        s.parts.push({ x: nx + Math.random() * nw, y: -y, vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 140, life: 0.8, max: 0.8, c: Math.random() < 0.5 ? "#FFF3B0" : "#ffffff", r: 1.5 + Math.random() * 2.5, g: 120 });
    } else {
      s.combo = 0;
      // The overhang falls away
      const cutX = m.x < top.x ? m.x : right, cutW = m.w - nw;
      s.chips.push({ x: cutX, y, w: cutW, vx: (m.x < top.x ? -1 : 1) * 60, vy: 0, a: 0, va: (m.x < top.x ? -1 : 1) * (1 + Math.random() * 2), hue });
      sfx.thud();
      buzz(HAPTIC.tap);
    }
    s.floors.push({ x: nx, w: nw, hue });
    s.shake = Math.max(s.shake, 0.12);
    // Next floor comes from alternating sides, a little faster each time.
    const n = s.floors.length;
    s.mover = { x: n % 2 ? s.w - nw * 0.5 : -nw * 0.5, w: nw, dir: n % 2 ? -1 : 1, speed: Math.min(330, 150 + n * 6) };
    setHud({ floors: n - 1, combo: s.combo });
  };

  const ref = useCanvas(({ ctx, w, h, dt, t }) => {
    const s = g.current;
    if (Math.abs(s.w - w) > 1 && s.floors.length === 1) {
      Object.assign(s, fresh(w));
      s.mover.x = -w * 0.6;
    }
    // ---- update ----
    const m = s.mover;
    if (state === "play" && !s.dead) {
      m.x += m.dir * m.speed * dt;
      if (m.x > w - m.w * 0.15) m.dir = -1;
      if (m.x < -m.w * 0.85) m.dir = 1;
    } else if (state === "ready") {
      // Gentle demo sway on the start screen
      m.x = w / 2 - m.w / 2 + Math.sin(t * 1.5) * w * 0.25;
    }
    // The sales-page tour reads this to drop floors right on top.
    const cv = ctx.canvas;
    if (cv.dataset) cv.dataset.off = String(Math.round(m.x - s.floors[s.floors.length - 1].x));
    const height = s.floors.length * FH;
    const targetCam = Math.max(0, height - h * 0.45);
    s.cam = lerp(s.cam, targetCam, Math.min(1, dt * 4));
    for (const c of s.chips) ((c.vy += 900 * dt), (c.x += c.vx * dt), (c.y -= c.vy * dt), (c.a += c.va * dt));
    s.chips = s.chips.filter((c) => c.y > s.cam - 200);
    s.parts = stepParticles(s.parts, dt);
    s.glow = Math.max(0, s.glow - dt * 2);
    s.pop = Math.max(0, s.pop - dt * 1.2);
    s.shake = Math.max(0, s.shake - dt);

    // ---- draw ----
    const base = h - 60; // screen y of the ground
    const sy = (y: number) => base - y + s.cam; // world height → screen y
    ctx.save();
    if (s.shake) ctx.translate((Math.random() - 0.5) * 8 * s.shake, (Math.random() - 0.5) * 8 * s.shake);
    // Sky changes from day to sunset to night as you climb.
    const alt = Math.min(1, s.cam / 1600);
    const mix = (a: number[], b: number[], k2: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k2)).join(",")})`;
    const day = [[96, 178, 255], [190, 230, 255]], dusk = [[64, 46, 140], [255, 150, 120]], night = [[8, 10, 36], [34, 30, 90]];
    const [c1, c2] = alt < 0.5 ? [mix(day[0], dusk[0], alt * 2), mix(day[1], dusk[1], alt * 2)] : [mix(dusk[0], night[0], (alt - 0.5) * 2), mix(dusk[1], night[1], (alt - 0.5) * 2)];
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, c1);
    sky.addColorStop(1, c2);
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, w + 40, h + 40);
    // Stars appear once it's dark
    if (alt > 0.4)
      for (const [sx2, sy2, tw] of s.stars) {
        const yy = ((sy2 + s.cam * 0.3) % 3000) - 3000 + h;
        if (yy < -5 || yy > h) continue;
        ctx.globalAlpha = (alt - 0.4) * 1.6 * (0.5 + 0.5 * Math.sin(t * 3 + tw * 10));
        ctx.fillStyle = "#fff";
        ctx.fillRect(sx2 * w, yy, 2, 2);
      }
    ctx.globalAlpha = 1;
    // Clouds drift past at different heights
    for (let i = 0; i < 6; i++) {
      const cy = sy(300 + i * 420) + s.cam * 0.4;
      if (cy < -60 || cy > h + 60) continue;
      const cx = ((i * 173 + t * (10 + i * 4)) % (w + 200)) - 100;
      ctx.fillStyle = `rgba(255,255,255,${0.75 - alt * 0.5})`;
      ctx.beginPath();
      for (const [dx, dy, r] of [[0, 0, 22], [24, -10, 26], [50, 0, 20], [24, 6, 22]]) (ctx.moveTo(cx + dx + r, cy + dy), ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2));
      ctx.fill();
    }
    // City skyline far behind (parallax)
    const skyY = base + s.cam * 0.5;
    if (skyY - 200 < h) {
      ctx.fillStyle = alt > 0.5 ? "#1A1840" : "#7F8FC0";
      const bl = [[0.02, 90], [0.1, 140], [0.17, 70], [0.24, 190], [0.3, 110], [0.62, 120], [0.7, 230], [0.78, 90], [0.85, 160], [0.93, 80]];
      for (const [bx, bh] of bl) ctx.fillRect(bx * w, skyY - bh, w * 0.07, bh + 80);
      // The tall needle tower
      ctx.beginPath();
      ctx.moveTo(w * 0.45, skyY + 80);
      ctx.lineTo(w * 0.47, skyY - 230);
      ctx.lineTo(w * 0.475, skyY - 300);
      ctx.lineTo(w * 0.48, skyY - 230);
      ctx.lineTo(w * 0.5, skyY + 80);
      ctx.fill();
    }
    // Ground
    const gy = sy(0);
    if (gy < h + 10) {
      const gr = ctx.createLinearGradient(0, gy, 0, gy + 60);
      gr.addColorStop(0, "#3C3A66");
      gr.addColorStop(1, "#22203F");
      ctx.fillStyle = gr;
      ctx.fillRect(-20, gy, w + 40, 80);
      ctx.fillStyle = "#59578C";
      ctx.fillRect(-20, gy, w + 40, 4);
    }
    // Tower
    s.floors.forEach((f, i) => {
      const y = sy((i + 1) * FH);
      if (y > h + FH || y < -FH * 2) return;
      drawFloor(ctx, f.x, y, f.w, f.hue, i === 0, i === s.floors.length - 1 ? s.glow : 0, t, i);
    });
    // The moving floor
    if (!s.dead) {
      const top = s.floors[s.floors.length - 1];
      const y = sy((s.floors.length + 1) * FH);
      // Guide shadow showing where it would land
      ctx.fillStyle = "rgba(255,255,255,.12)";
      ctx.fillRect(top.x, y + FH, top.w, 3);
      drawFloor(ctx, m.x, y, m.w, (top.hue + 14) % 360, false, 0, t, s.floors.length);
    }
    // Falling offcuts
    for (const c of s.chips) {
      ctx.save();
      ctx.translate(c.x + c.w / 2, sy(c.y) + FH / 2);
      ctx.rotate(c.a);
      drawFloor(ctx, -c.w / 2, -FH / 2, c.w, c.hue, false, 0, t, 0);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(0, s.cam);
    // Particles are stored in world space (height as negative y).
    ctx.translate(0, base);
    drawParticles(ctx, s.parts);
    ctx.restore();
    // Perfect banner
    if (s.pop > 0) {
      const sc = 1 + (1 - s.pop) * 0.3;
      ctx.save();
      ctx.globalAlpha = Math.min(1, s.pop * 2);
      ctx.translate(w / 2, h * 0.28);
      ctx.scale(sc, sc);
      ctx.font = "900 30px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(30,20,80,.7)";
      const txt = s.combo > 1 ? `${ui.perfect} ×${s.combo}` : ui.perfect;
      ctx.strokeText(txt, 0, 0);
      ctx.fillStyle = "#FFE27A";
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }, true);

  return (
    <>
      <GameHead k={k} />
      <ArcadeShell
        song="sky"
        title={ui.title}
        how={[ui.h1, ui.h2, ui.h3, ui.h4]}
        state={state}
        score={final}
        best={best}
        newBest={state === "over" && best === final && final > 0}
        accent="#4CC9F0"
        onStart={start}
        chips={
          <>
            <span className="ax-chip gold">🏙️ {hud.floors} {ui.floors}</span>
            {hud.combo > 1 && <span className="ax-chip">✨ ×{hud.combo}</span>}
          </>
        }
      >
        <canvas
          ref={ref}
          className="ax-canvas tall"
          aria-label={ui.title}
          tabIndex={0}
          onPointerDown={drop}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), drop())}
        />
      </ArcadeShell>
    </>
  );
}

/** One floor of the tower: a glass front with lit windows and a lighter roof on top. */
function drawFloor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, hue: number, lobby: boolean, glow: number, t: number, seed: number) {
  const d = FH * DEPTH;
  // Roof (top face, slanted back)
  ctx.fillStyle = `hsl(${hue} 70% 72%)`;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + d * 0.6, y - d);
  ctx.lineTo(x + w + d * 0.6, y - d);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();
  // Side face
  ctx.fillStyle = `hsl(${hue} 55% 34%)`;
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + d * 0.6, y - d);
  ctx.lineTo(x + w + d * 0.6, y - d + FH);
  ctx.lineTo(x + w, y + FH);
  ctx.closePath();
  ctx.fill();
  // Front
  const fr = ctx.createLinearGradient(x, y, x, y + FH);
  fr.addColorStop(0, `hsl(${hue} 65% 56%)`);
  fr.addColorStop(1, `hsl(${hue} 60% 44%)`);
  ctx.fillStyle = fr;
  ctx.fillRect(x, y, w, FH);
  // Windows
  const cols = Math.max(1, Math.floor(w / 14));
  const gap = w / cols;
  for (let i = 0; i < cols; i++) {
    const lit = ((seed * 7 + i * 13) % 5) !== 0;
    ctx.fillStyle = lobby ? "rgba(255,240,200,.85)" : lit ? `rgba(255,244,190,${0.55 + 0.3 * Math.sin(t * 0.7 + i + seed)})` : "rgba(20,30,60,.45)";
    ctx.fillRect(x + i * gap + 3, y + 6, gap - 6, FH - 12);
  }
  ctx.fillStyle = "rgba(255,255,255,.25)";
  ctx.fillRect(x, y, w, 2);
  if (glow) {
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.shadowColor = "#FFF3B0";
    ctx.shadowBlur = 24;
    ctx.strokeStyle = "#FFF3B0";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y - d, w + d * 0.6, FH + d);
    ctx.restore();
  }
}
