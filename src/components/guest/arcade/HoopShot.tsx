"use client";
// Hoop Shot: flick the ball up into the net. 45 seconds, swishes score extra, three in a row sets you on fire.
import { useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { useBest } from "../screens/Arcade";
import { GameHead } from "../screens/Engines";
import { drawParticles, rr, stepParticles, useCanvas, type Particle } from "./canvasKit";
import { ArcadeShell } from "./Shell";

const UI: Record<Lang, Record<string, string>> = {
  en: { title: "Hoop Shot", h1: "Flick the ball up towards the hoop", h2: "Clean swish = 3 points, off the rim = 2", h3: "3 in a row and you're ON FIRE 🔥 (double points)", h4: "45 seconds on the clock", swish: "SWISH!", fire: "ON FIRE!", flick: "Flick ↑" },
  ar: { title: "رمية السلة", h1: "اسحب الكرة للأعلى نحو السلة", h2: "رمية نظيفة = 3 نقاط، من الحلقة = 2", h3: "3 متتالية وتصبح مشتعلاً 🔥 (نقاط مضاعفة)", h4: "45 ثانية على الساعة", swish: "نظيفة!", fire: "مشتعل!", flick: "اسحب ↑" },
};

const TIME = 45;
type Ball = { x: number; y: number; vx: number; vy: number; spin: number; a: number; s: number; flying: boolean; t: number; touched: boolean; scored: boolean; prevY: number; behind: boolean };
type Pop = { x: number; y: number; text: string; life: number; c: string };

export function HoopShot({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const [hud, setHud] = useState({ score: 0, time: TIME, streak: 0 });
  const [final, setFinal] = useState(0);
  const newBall = (w: number, h: number): Ball => ({ x: w / 2, y: h - 78, vx: 0, vy: 0, spin: 0, a: 0, s: 1, flying: false, t: 0, touched: false, scored: false, prevY: h, behind: false });
  const fresh = (w = 340, h = 420) => ({ ball: newBall(w, h), score: 0, baskets: 0, streak: 0, clock: TIME, hoopX: w / 2, hoopDir: 1, net: 0, parts: [] as Particle[], pops: [] as Pop[], drag: null as null | { x: number; y: number; t: number }[], over: false, w, h, lastSec: TIME, crowd: Array.from({ length: 40 }, () => [Math.random(), Math.random(), Math.random()]) as [number, number, number][] });
  const g = useRef(fresh());

  const start = () => {
    const { w, h } = g.current;
    g.current = fresh(w, h);
    setHud({ score: 0, time: TIME, streak: 0 });
    setState("play");
    log("game_start", { item: k });
  };

  const ref = useCanvas(({ ctx, w, h, dt, t }) => {
    const s = g.current;
    if (s.w !== w || s.h !== h) ((s.w = w), (s.h = h), !s.ball.flying && (s.ball = newBall(w, h)), (s.hoopX = w / 2));
    const R = w * 0.085; // ball radius up close
    const hy = h * 0.3; // rim height
    const rimW = w * 0.3;
    const FAR = 0.58; // ball scale at the hoop
    const G = h * 2.7;

    // ---- update ----
    if (state === "play" && !s.over) {
      s.clock -= dt;
      const sec = Math.ceil(s.clock);
      if (sec !== s.lastSec) {
        s.lastSec = sec;
        if (sec <= 5 && sec > 0) sfx.count();
        setHud((x) => ({ ...x, time: Math.max(0, sec) }));
      }
      if (s.clock <= 0) {
        s.over = true;
        sfx.count(true);
        setFinal(s.score);
        log("game_finish", { item: k, value: s.score });
        setTimeout(() => (submit(s.score), setState("over")), 900);
      }
      // After 6 baskets the hoop starts to slide, then speeds up.
      if (s.baskets >= 6) {
        const sp = w * (0.12 + Math.min(0.25, (s.baskets - 6) * 0.02));
        s.hoopX += s.hoopDir * sp * dt;
        if (s.hoopX > w - rimW * 0.75) s.hoopDir = -1;
        if (s.hoopX < rimW * 0.75) s.hoopDir = 1;
      }
    }
    const b = s.ball;
    if (b.flying) {
      b.t += dt;
      b.prevY = b.y;
      b.vy += G * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.a += b.spin * dt;
      b.s = Math.max(FAR, 1 - (1 - FAR) * Math.min(1, b.t / 0.5));
      if (b.vy > 0 && b.s <= FAR + 0.001) b.behind = true;
      const r = R * b.s;
      if (b.behind) {
        // Rim edges are two small circles the ball can bounce off.
        for (const ex of [s.hoopX - rimW / 2, s.hoopX + rimW / 2]) {
          const dx = b.x - ex, dy = b.y - hy, d = Math.hypot(dx, dy), min = r + 3;
          if (d < min && d > 0) {
            const nx = dx / d, ny = dy / d, dot = b.vx * nx + b.vy * ny;
            if (dot < 0) {
              b.vx -= 1.55 * dot * nx;
              b.vy -= 1.55 * dot * ny;
              b.vx *= 0.8;
              b.x = ex + nx * min;
              b.y = hy + ny * min;
              if (!b.touched) sfx.rim();
              b.touched = true;
            }
          }
        }
        // Backboard: a ball that's dropped onto the hoop area from too high bounces off its face.
        const boardTop = hy - rimW * 0.62, boardH = rimW * 0.62;
        if (b.y - r < boardTop + boardH && b.y > boardTop && Math.abs(b.x - s.hoopX) < rimW * 0.62 && b.vy < 0) ((b.vy *= -0.3), sfx.thud());
        // Basket: the centre drops through the rim line between the edges.
        if (!b.scored && b.prevY < hy && b.y >= hy && Math.abs(b.x - s.hoopX) < rimW / 2 - r * 0.3) {
          b.scored = true;
          s.baskets += 1;
          s.streak += 1;
          const fire = s.streak >= 3;
          const pts = (b.touched ? 2 : 3) * (fire ? 2 : 1);
          s.score += pts;
          s.net = 1;
          b.vx *= 0.3;
          b.vy *= 0.5;
          if (b.touched) sfx.goal();
          else sfx.swish();
          buzz(HAPTIC.good);
          s.pops.push({ x: s.hoopX, y: hy - 40, text: `${!b.touched ? ui.swish + " " : ""}+${pts}`, life: 1.1, c: fire ? "#FF8A3D" : "#FFE27A" });
          if (s.streak === 3) s.pops.push({ x: w / 2, y: h * 0.55, text: `🔥 ${ui.fire}`, life: 1.4, c: "#FF5A4E" });
          for (let i = 0; i < 26; i++) {
            const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 200;
            s.parts.push({ x: s.hoopX, y: hy + 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, life: 0.9, max: 0.9, c: ["#FFE27A", "#FF5A4E", "#4CC9F0", "#7ED957", "#fff"][i % 5], r: 2 + Math.random() * 2.5, g: 380 });
          }
          setHud({ score: s.score, time: Math.max(0, Math.ceil(s.clock)), streak: s.streak });
        }
      }
      // Floor bounce once it's back down
      const floor = h - 40;
      if (b.behind && b.y + r > floor && b.vy > 0) {
        b.y = floor - r;
        b.vy *= -0.45;
        b.vx *= 0.7;
        if (Math.abs(b.vy) > 60) sfx.bounce();
      }
      if (s.streak >= 3 && Math.random() < 0.8)
        s.parts.push({ x: b.x + (Math.random() - 0.5) * r, y: b.y + (Math.random() - 0.5) * r, vx: -b.vx * 0.1 + (Math.random() - 0.5) * 30, vy: -b.vy * 0.1 - 40, life: 0.4, max: 0.4, c: Math.random() < 0.5 ? "#FFB51F" : "#FF5A2E", r: r * 0.25 * Math.random() + 2 });
      if (b.t > 2.4 || b.x < -80 || b.x > w + 80) {
        if (!b.scored && state === "play") {
          if (s.streak) setHud((x) => ({ ...x, streak: 0 }));
          s.streak = 0;
        }
        s.ball = newBall(w, h);
      }
    }
    s.net = Math.max(0, s.net - dt * 1.8);
    s.parts = stepParticles(s.parts, dt);
    for (const p of s.pops) ((p.life -= dt), (p.y -= 34 * dt));
    s.pops = s.pops.filter((p) => p.life > 0);

    // ---- draw ----
    // Arena back wall with crowd lights
    const wall = ctx.createLinearGradient(0, 0, 0, h);
    wall.addColorStop(0, "#0E0B2A");
    wall.addColorStop(0.55, "#251C55");
    wall.addColorStop(1, "#1A1440");
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, h);
    for (const [cx, cy, c] of s.crowd) {
      const x = cx * w, y = h * 0.08 + cy * h * 0.42;
      const flick = 0.25 + 0.25 * Math.sin(t * (1 + c * 3) + c * 20);
      ctx.fillStyle = `rgba(${c < 0.3 ? "255,90,120" : c < 0.6 ? "120,200,255" : "255,220,140"},${flick})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + c * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Spotlights
    for (const sx of [0.2, 0.8]) {
      const sp = ctx.createLinearGradient(w * sx, 0, w / 2, h);
      sp.addColorStop(0, "rgba(255,255,230,.16)");
      sp.addColorStop(1, "rgba(255,255,230,0)");
      ctx.fillStyle = sp;
      ctx.beginPath();
      ctx.moveTo(w * sx - 10, 0);
      ctx.lineTo(w * sx + 10, 0);
      ctx.lineTo(w / 2 + w * 0.35, h);
      ctx.lineTo(w / 2 - w * 0.35, h);
      ctx.fill();
    }
    // Wooden court floor in perspective
    const fy = h * 0.62;
    const floorG = ctx.createLinearGradient(0, fy, 0, h);
    floorG.addColorStop(0, "#B9763C");
    floorG.addColorStop(1, "#E3A35E");
    ctx.fillStyle = floorG;
    ctx.fillRect(0, fy, w, h - fy);
    ctx.strokeStyle = "rgba(90,45,15,.28)";
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + i * w * 0.05, fy);
      ctx.lineTo(w / 2 + i * w * 0.16, h);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 10, w * 0.42, h * 0.16, 0, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fillRect(0, fy, w, 6);

    // Hoop pieces
    const hx = s.hoopX;
    const drawBoard = () => {
      const bw = rimW * 1.25, bh = rimW * 0.8, bx = hx - bw / 2, by = hy - bh * 0.85;
      ctx.fillStyle = "#3A3A55";
      ctx.fillRect(hx - 4, by + bh, 8, fy - (by + bh) + 10); // pole
      rr(ctx, bx, by, bw, bh, 8);
      ctx.fillStyle = "rgba(235,245,255,.92)";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#E8454F";
      ctx.stroke();
      ctx.strokeStyle = "#E8454F";
      ctx.lineWidth = 3;
      ctx.strokeRect(hx - rimW * 0.28, hy - bh * 0.45, rimW * 0.56, bh * 0.4);
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.beginPath();
      ctx.moveTo(bx + 10, by + 6);
      ctx.lineTo(bx + bw * 0.35, by + 6);
      ctx.lineTo(bx + bw * 0.2, by + bh - 6);
      ctx.lineTo(bx + 10 - 4, by + bh - 6);
      ctx.fill();
    };
    const drawBackRim = () => {
      ctx.strokeStyle = "#C2410C";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(hx, hy, rimW / 2, rimW * 0.09, 0, Math.PI, 0);
      ctx.stroke();
    };
    const drawNetAndFront = () => {
      const sway = Math.sin(t * 30) * 6 * s.net, stretch = 1 + 0.35 * s.net;
      const top = hy, depth = rimW * 0.55 * stretch, bot = rimW * 0.3;
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.6;
      const N = 8;
      for (let i = 0; i <= N; i++) {
        const u = i / N, x1 = hx - rimW / 2 + u * rimW, x2 = hx - bot / 2 + u * bot + sway;
        ctx.beginPath();
        ctx.moveTo(x1, top);
        ctx.quadraticCurveTo((x1 + x2) / 2 + sway * 0.5, top + depth * 0.55, x2, top + depth);
        ctx.stroke();
      }
      for (let j = 1; j <= 4; j++) {
        const v = j / 4, wv = rimW + (bot - rimW) * v;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const x = hx - wv / 2 + (i / N) * wv + sway * v, y = top + depth * v + (i % 2 ? 3 : -3) * (1 - v);
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = "#F97316";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(hx, hy, rimW / 2, rimW * 0.09, 0, 0, Math.PI);
      ctx.stroke();
    };
    drawBoard();
    drawBackRim();
    if (b.behind) drawBall(ctx, b, R, s.streak >= 3);
    drawNetAndFront();
    // Ball shadow on the floor
    const shY = h - 44;
    ctx.fillStyle = `rgba(0,0,0,${0.25 * b.s})`;
    ctx.beginPath();
    ctx.ellipse(b.x, b.behind ? fy + 40 : shY + R * 0.6, R * b.s * 0.9, R * b.s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!b.behind) drawBall(ctx, b, R, s.streak >= 3);
    drawParticles(ctx, s.parts);
    // Flick hint
    if (state === "play" && !b.flying && s.baskets === 0) {
      const yy = h - 78 - R - 30 - ((t * 40) % 30);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "#fff";
      ctx.font = "800 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ui.flick, w / 2, yy);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "center";
    for (const p of s.pops) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.font = "900 26px system-ui, sans-serif";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(20,10,50,.75)";
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.c;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    // Last 5 seconds: red pulse around the edge
    if (state === "play" && s.clock < 5 && s.clock > 0) {
      ctx.strokeStyle = `rgba(255,60,60,${0.35 + 0.3 * Math.sin(t * 12)})`;
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, w, h);
    }
  }, true);

  const pt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() / 1000 };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = g.current;
    if (state !== "play" || s.over || s.ball.flying) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    s.drag = [pt(e)];
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = g.current;
    if (!s.drag) return;
    s.drag.push(pt(e));
    if (s.drag.length > 8) s.drag.shift();
    // Ball follows the finger a little while you line up the flick
    const p = s.drag[s.drag.length - 1];
    s.ball.x = s.w / 2 + Math.max(-40, Math.min(40, (p.x - s.drag[0].x) * 0.3));
  };
  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = g.current;
    if (!s.drag) return;
    const pts = [...s.drag, pt(e)];
    s.drag = null;
    const a = pts[0], z = pts[pts.length - 1], dtm = Math.max(0.03, z.t - a.t);
    const vx = (z.x - a.x) / dtm, vy = (z.y - a.y) / dtm;
    if (vy > -250) return (s.ball.x = s.w / 2); // not a real upward flick
    const b = s.ball;
    b.flying = true;
    b.vy = Math.max(-s.h * 3.1, Math.min(-s.h * 1.2, vy));
    b.vx = Math.max(-s.w * 1.2, Math.min(s.w * 1.2, vx * 0.55));
    b.spin = -b.vx * 0.02 - 6;
    sfx.swipe();
  };

  return (
    <>
      <GameHead k={k} />
      <ArcadeShell
        song="arena"
        title={ui.title}
        how={[ui.h1, ui.h2, ui.h3, ui.h4]}
        state={state}
        score={final}
        best={best}
        newBest={state === "over" && best === final && final > 0}
        accent="#F97316"
        onStart={start}
        chips={
          <>
            <span className="ax-chip gold">🏀 {hud.score}</span>
            {hud.streak >= 3 && <span className="ax-chip">🔥 ×2</span>}
            <span className="ax-chip">⏱ {hud.time}s</span>
          </>
        }
      >
        <canvas ref={ref} className="ax-canvas tall" aria-label={ui.title} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => (g.current.drag = null)} />
      </ArcadeShell>
    </>
  );
}

function drawBall(ctx: CanvasRenderingContext2D, b: Ball, R: number, fire: boolean) {
  const r = R * b.s;
  ctx.save();
  ctx.translate(b.x, b.y);
  if (fire) {
    const gl = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.8);
    gl.addColorStop(0, "rgba(255,140,40,.55)");
    gl.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  const gr = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  gr.addColorStop(0, "#FFA552");
  gr.addColorStop(0.7, "#E8650F");
  gr.addColorStop(1, "#A8420A");
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // Seams, rotating with the spin
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.rotate(b.a);
  ctx.strokeStyle = "#3A1A06";
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  ctx.beginPath();
  ctx.moveTo(-r, 0);
  ctx.lineTo(r, 0);
  ctx.moveTo(0, -r);
  ctx.lineTo(0, r);
  ctx.stroke();
  for (const sgn of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sgn * r * 1.05, 0, r * 0.6, r * 1.1, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  const sh = ctx.createRadialGradient(-r * 0.4, -r * 0.45, 0, -r * 0.4, -r * 0.45, r * 0.6);
  sh.addColorStop(0, "rgba(255,255,255,.45)");
  sh.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
