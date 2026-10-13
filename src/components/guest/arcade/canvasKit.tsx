"use client";
// Shared pieces for the canvas games: a sharp, resizing canvas, a frame loop and swipe input.
import { useEffect, useRef } from "react";

export type Frame = { ctx: CanvasRenderingContext2D; w: number; h: number; dt: number; t: number };

/** A canvas that fills its box at device resolution and calls draw() every frame while running. */
export function useCanvas(draw: (f: Frame) => void, running: boolean) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, last = 0, t = 0, w = 0, h = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const loop = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      if (running) t += dt;
      drawRef.current({ ctx, w, h, dt: running ? dt : 0, t });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => (cancelAnimationFrame(raf), ro.disconnect());
  }, [running]);
  return ref;
}

/** Swipe detection on an element: calls back with "left" | "right" | "up" | "down" (or "tap"). */
export function swipeHandlers(on: (dir: "left" | "right" | "up" | "down" | "tap") => void) {
  let sx = 0, sy = 0, st = 0, done = false;
  return {
    onPointerDown: (e: React.PointerEvent) => ((sx = e.clientX), (sy = e.clientY), (st = Date.now()), (done = false)),
    onPointerMove: (e: React.PointerEvent) => {
      if (done || !st) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.hypot(dx, dy) > 28) {
        done = true;
        on(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
      }
    },
    onPointerUp: () => {
      if (!done && st && Date.now() - st < 300) on("tap");
      st = 0;
    },
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Rounded rectangle path. */
export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Floating particles (dust, sparks, confetti). */
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number; g?: number };
export function stepParticles(ps: Particle[], dt: number) {
  for (const p of ps) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.g ?? 0) * dt;
    p.life -= dt;
  }
  return ps.filter((p) => p.life > 0);
}
export function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[]) {
  for (const p of ps) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
