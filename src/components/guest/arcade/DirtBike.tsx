"use client";
// Dune Rider: hill-climb dirt bike. Hold GAS to ride (and to tilt back in the air), LEAN to tilt forward.
// Land on both wheels; flips score a bonus.
import { useEffect, useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { useBest } from "../screens/Arcade";
import { GameHead } from "../screens/Engines";
import { drawParticles, rr, stepParticles, useCanvas, type Particle } from "./canvasKit";
import { ArcadeShell } from "./Shell";

/** Keep receiving the pointer even if it leaves the element (ignored if the browser refuses). */
const capture = (e: React.PointerEvent) => {
  try {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  } catch {}
};

const UI: Record<Lang, Record<string, string>> = {
  en: { title: "Dune Rider", h1: "Hold GAS to ride over the dunes", h2: "In the air: GAS tilts back, LEAN tilts forward", h3: "Land on both wheels, or you crash!", h4: "Flips = bonus points", gas: "GAS", lean: "LEAN", flip: "FLIP! +100", m: "m", stall: "Out of steam!" },
  ar: { title: "سائق الكثبان", h1: "اضغط مطولاً على الوقود لتعبر الكثبان", h2: "في الهواء: الوقود يميل للخلف، والميل يميل للأمام", h3: "اهبط على العجلتين وإلا ستسقط!", h4: "الدورات = نقاط إضافية", gas: "وقود", lean: "ميل", flip: "دورة! +100", m: "م", stall: "توقفت!" },
};

/** Ground height (m) at x (m). Gentle at first, bigger dunes and ramps further on. */
function ground(x: number) {
  if (x < 12) return 0;
  const k = Math.min(1, (x - 12) / 300) + 0.35;
  let y = k * (2.2 * Math.sin(x * 0.07) + 1.1 * Math.sin(x * 0.19 + 1.3) + 0.45 * Math.sin(x * 0.53));
  const m = x % 70; // a kicker ramp every 70 m
  if (m > 52 && m < 60) y += ((m - 52) / 8) * 2.4 * k;
  return y - (x < 20 ? (1 - (x - 12) / 8) * y : 0);
}
const slopeAt = (x: number) => Math.atan2(ground(x + 0.25) - ground(x - 0.25), 0.5);

export function DirtBike({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const [hud, setHud] = useState({ dist: 0, bonus: 0 });
  const [final, setFinal] = useState(0);
  const [toast, setToast] = useState("");
  const input = useRef({ gas: false, lean: false });
  const b = useRef(fresh());
  function fresh() {
    return { x: 4, y: 0, vx: 0, vy: 0, a: 0, w: 0, onGround: true, rot: 0, bonus: 0, dead: false, stall: 0, wheel: 0, parts: [] as Particle[], best: 0 };
  }

  const start = () => {
    b.current = fresh();
    setHud({ dist: 0, bonus: 0 });
    setState("play");
    log("game_start", { item: k });
  };
  const crash = (why = "") => {
    const s = b.current;
    if (s.dead) return;
    s.dead = true;
    sfx.crash();
    buzz(HAPTIC.bad);
    for (let i = 0; i < 26; i++) s.parts.push({ x: s.x, y: s.y + 0.6, vx: (Math.random() - 0.5) * 8, vy: Math.random() * 7, life: 0.9, max: 0.9, c: i % 2 ? "#E8B27A" : "#FF6B3D", r: 0.12, g: -14 });
    const score = Math.floor(s.best) + s.bonus;
    setFinal(score);
    if (why) setToast(why);
    log("game_finish", { item: k, value: score });
    setTimeout(() => (submit(score), setState("over"), setToast("")), 900);
  };

  // Keyboard: right/up = gas, left/down = lean
  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      if (["ArrowRight", "ArrowUp"].includes(e.key)) input.current.gas = v;
      if (["ArrowLeft", "ArrowDown"].includes(e.key)) input.current.lean = v;
    };
    const dn = (e: KeyboardEvent) => set(e, true), up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => (window.removeEventListener("keydown", dn), window.removeEventListener("keyup", up));
  }, []);

  const ref = useCanvas(({ ctx, w, h, dt, t }) => {
    const s = b.current;
    const PX = w / 11; // pixels per metre
    const R = 0.42, HALF = 0.72; // wheel radius, half wheelbase

    // ---- physics ----
    if (state === "play" && !s.dead) {
      const { gas, lean } = input.current;
      const sl = slopeAt(s.x);
      if (s.onGround) {
        if (gas) s.vx += 9 * dt;
        if (lean) s.vx -= 6 * dt;
        s.vx -= 9.8 * Math.sin(sl) * 0.7 * dt; // gravity along the slope
        s.vx *= 1 - 0.25 * dt;
        s.vx = Math.max(-2, Math.min(24, s.vx));
        const nx = s.x + s.vx * dt;
        const vyGround = (ground(nx) - ground(s.x)) / Math.max(dt, 1e-3);
        // Leave the ground when it drops away faster than gravity can follow.
        if (vyGround < s.vy - 20 * dt && s.vx > 4) {
          s.onGround = false;
          s.rot = 0;
        } else {
          s.vy = vyGround;
          s.y = ground(nx);
          s.a += (sl - s.a) * Math.min(1, dt * 12);
          s.w = 0;
        }
        s.x = nx;
        if (gas && Math.random() < 0.7) s.parts.push({ x: s.x - HALF, y: s.y + 0.1, vx: -s.vx * 0.3 - Math.random() * 2, vy: Math.random() * 2.5, life: 0.6, max: 0.6, c: "rgba(214,170,120,.8)", r: 0.12 + Math.random() * 0.12, g: -2 });
        if (s.vx < 0.6 && s.x > 15) {
          s.stall += dt;
          if (s.stall > 2.5) crash(ui.stall);
        } else s.stall = 0;
      }
      if (!s.onGround) {
        if (gas) s.w += 4.2 * dt;
        if (lean) s.w -= 4.2 * dt;
        s.w *= 1 - 0.6 * dt;
        s.vy -= 20 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.a += s.w * dt;
        s.rot += s.w * dt;
        if (s.y <= ground(s.x)) {
          const diff = Math.atan2(Math.sin(s.a - slopeAt(s.x)), Math.cos(s.a - slopeAt(s.x)));
          if (Math.abs(diff) > 0.85) return crash();
          s.onGround = true;
          s.y = ground(s.x);
          s.a = slopeAt(s.x);
          s.vx *= Math.abs(diff) > 0.4 ? 0.7 : 0.95;
          const flips = Math.floor(Math.abs(s.rot) / (Math.PI * 2) + 0.15);
          if (flips > 0) {
            s.bonus += flips * 100;
            sfx.goal();
            buzz(HAPTIC.win);
            setToast(ui.flip);
            setTimeout(() => setToast(""), 1200);
          } else sfx.kick();
        }
      }
      s.wheel += s.vx * dt / R;
      s.best = Math.max(s.best, s.x - 4);
      if (Math.random() < dt * 10) sfx.engine(input.current.gas ? 1 : 0.2);
      if (Math.floor(t * 5) !== Math.floor((t - dt) * 5)) setHud({ dist: Math.floor(s.best), bonus: s.bonus });
    }
    s.parts = stepParticles(s.parts, dt);

    // ---- draw ----
    const camX = s.x - 3.2;
    const baseY = h * 0.7 + ground(s.x) * PX * 0.6;
    const sx = (x: number) => (x - camX) * PX;
    const sy = (y: number) => baseY - y * PX;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#4FB3FF");
    sky.addColorStop(0.6, "#BFE6FF");
    sky.addColorStop(1, "#FFE3B8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,250,220,.9)";
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.18, h * 0.07, 0, Math.PI * 2);
    ctx.fill();
    // Clouds
    ctx.fillStyle = "rgba(255,255,255,.75)";
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 260 - camX * PX * 0.1) % (w + 200) + w + 200) % (w + 200) - 100, cy = h * (0.12 + (i % 2) * 0.08);
      for (const [dx, r] of [[0, 18], [20, 24], [44, 16]]) (ctx.beginPath(), ctx.arc(cx + dx, cy, r, 0, Math.PI * 2), ctx.fill());
    }
    // Parallax mountains and dunes
    for (const [col, sp, amp, yy] of [["#C9A27E", 0.2, 50, 0.55], ["#E2B887", 0.45, 30, 0.62]] as [string, number, number, number][]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 10) {
        const wx = x + camX * PX * sp;
        ctx.lineTo(x, h * yy - amp * (0.6 + 0.4 * Math.sin(wx / 90)) * (0.7 + 0.3 * Math.sin(wx / 37)));
      }
      ctx.lineTo(w, h);
      ctx.fill();
    }
    // Ground
    const gg = ctx.createLinearGradient(0, h * 0.5, 0, h);
    gg.addColorStop(0, "#F2C287");
    gg.addColorStop(1, "#C98A4F");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let px = 0; px <= w + 8; px += 6) ctx.lineTo(px, sy(ground(camX + px / PX)));
    ctx.lineTo(w, h);
    ctx.fill();
    ctx.strokeStyle = "#B8763F";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= w + 8; px += 6) (px ? ctx.lineTo : ctx.moveTo).call(ctx, px, sy(ground(camX + px / PX)) + 1);
    ctx.stroke();
    // Distance flags every 50 m
    for (let m = Math.ceil(camX / 50) * 50; m < camX + w / PX; m += 50) {
      if (m <= 0) continue;
      const x = sx(m), y = sy(ground(m));
      ctx.strokeStyle = "#5A3A22";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 46);
      ctx.stroke();
      ctx.fillStyle = "#FF5A4E";
      ctx.beginPath();
      ctx.moveTo(x, y - 46);
      ctx.lineTo(x + 26, y - 39);
      ctx.lineTo(x, y - 32);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px system-ui";
      ctx.fillText(`${m}`, x + 3, y - 36);
    }
    // Cacti
    for (let c = Math.floor(camX / 23) * 23; c < camX + w / PX + 23; c += 23) {
      const cxp = sx(c + 7), cy = sy(ground(c + 7));
      ctx.fillStyle = "#4F8A4A";
      rr(ctx, cxp - 4, cy - 30, 8, 30, 4);
      ctx.fill();
      rr(ctx, cxp - 13, cy - 22, 6, 12, 3);
      ctx.fill();
      rr(ctx, cxp + 7, cy - 26, 6, 12, 3);
      ctx.fill();
    }
    // Dust and sparks (world units → screen)
    ctx.save();
    ctx.translate(-camX * PX, baseY);
    ctx.scale(PX, -PX);
    drawParticles(ctx, s.parts);
    ctx.restore();

    // Bike and rider
    if (!s.dead || Math.floor(t * 10) % 2) {
      const cxp = sx(s.x), cyp = sy(s.y + R);
      ctx.save();
      ctx.translate(cxp, cyp);
      ctx.rotate(-s.a);
      const P = PX;
      const wheel = (dx: number) => {
        ctx.save();
        ctx.translate(dx * P, 0);
        ctx.fillStyle = "#1E1E24";
        ctx.beginPath();
        ctx.arc(0, 0, R * P, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FF8A3D";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, R * P * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(-s.wheel);
        ctx.strokeStyle = "#D8D8DE";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(R * P * 0.6, 0);
          ctx.stroke();
        }
        ctx.restore();
      };
      wheel(-HALF);
      wheel(HALF);
      // Frame
      ctx.strokeStyle = "#FF5A1F";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-HALF * P, 0);
      ctx.lineTo(-0.1 * P, -0.55 * P);
      ctx.lineTo(0.5 * P, -0.6 * P);
      ctx.lineTo(HALF * P, 0);
      ctx.stroke();
      ctx.fillStyle = "#FF5A1F";
      rr(ctx, -0.35 * P, -0.78 * P, 0.7 * P, 0.22 * P, 6);
      ctx.fill();
      ctx.fillStyle = "#2B2B33";
      rr(ctx, -0.4 * P, -0.86 * P, 0.4 * P, 0.1 * P, 4);
      ctx.fill();
      ctx.strokeStyle = "#C9C9D2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0.5 * P, -0.6 * P);
      ctx.lineTo(0.62 * P, -1.0 * P);
      ctx.stroke();
      // Rider
      const leanBack = input.current.gas && !s.onGround ? 0.15 : input.current.lean ? -0.2 : 0;
      ctx.save();
      ctx.translate(-0.15 * P, -0.86 * P);
      ctx.rotate(leanBack);
      ctx.strokeStyle = "#2C3E8C";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0.35 * P, 0.35 * P);
      ctx.stroke();
      ctx.strokeStyle = "#1F7AE0";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0.2 * P, -0.55 * P);
      ctx.stroke();
      ctx.strokeStyle = "#1F7AE0";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0.18 * P, -0.45 * P);
      ctx.lineTo(0.75 * P, -0.18 * P);
      ctx.stroke();
      ctx.fillStyle = "#FFB51F";
      ctx.beginPath();
      ctx.arc(0.24 * P, -0.78 * P, 0.22 * P, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1B1740";
      rr(ctx, 0.28 * P, -0.86 * P, 0.2 * P, 0.12 * P, 3);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }
  }, true);

  const hold = (key: "gas" | "lean") => ({
    onPointerDown: (e: React.PointerEvent) => ((input.current[key] = true), capture(e)),
    onPointerUp: () => (input.current[key] = false),
    onPointerCancel: () => (input.current[key] = false),
    onPointerLeave: () => (input.current[key] = false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

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
        accent="#1F7AE0"
        onStart={start}
        chips={
          <>
            <span className="ax-chip">🏍️ {hud.dist} {ui.m}</span>
            {hud.bonus > 0 && <span className="ax-chip gold">⭐ {hud.bonus}</span>}
          </>
        }
      >
        <canvas ref={ref} className="ax-canvas" aria-label={ui.title} />
        {toast && <div className="ax-toast">{toast}</div>}
      </ArcadeShell>
      {state === "play" && (
        <div className="ax-pedals">
          <button className="lean" data-act="lean" {...hold("lean")}>
            ↺ {ui.lean}
          </button>
          <button className="gas" data-act="gas" {...hold("gas")}>
            {ui.gas} ↻
          </button>
        </div>
      )}
    </>
  );
}
