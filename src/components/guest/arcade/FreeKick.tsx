"use client";
// Free Kick Hero: swipe from the ball to shoot. A curved swipe bends the ball around the wall.
// Ten kicks under the floodlights; corners and targets score extra.
import { useRef, useState } from "react";
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
  en: {
    title: "Free Kick Hero", h1: "Swipe from the ball towards the goal", h2: "Curve your swipe to bend it round the wall", h3: "Hit a glowing target for a bonus", h4: "10 kicks. How many can you score?",
    goal: "GOAL!", top: "TOP BINS! +2", saved: "SAVED!", wall: "Off the wall!", wide: "Wide!", over: "Over the bar!", kick: "Kick", pts: "pts",
  },
  ar: {
    title: "بطل الركلات الحرة", h1: "اسحب من الكرة نحو المرمى", h2: "اجعل سحبتك منحنية لتلتف الكرة حول الحائط", h3: "أصب هدفاً مضيئاً لنقاط إضافية", h4: "10 ركلات. كم هدفاً ستسجل؟",
    goal: "هدف!", top: "في الزاوية! +2", saved: "تصدى الحارس!", wall: "ارتدت من الحائط!", wide: "خارج المرمى!", over: "فوق العارضة!", kick: "الركلة", pts: "نقطة",
  },
};

const GW = 7.32, GH = 2.44; // goal size (m)
type Ball = { x: number; y: number; z: number; vx: number; vy: number; vz: number; spin: number; flying: boolean; trail: { x: number; y: number }[] };
type Setup = { dist: number; bx: number; wall: number[]; wallZ: number; keeperX: number; skill: number; target: { x: number; y: number } };

const newSetup = (n: number): Setup => {
  const dist = 18 + Math.random() * 8;
  const bx = (Math.random() - 0.5) * 12;
  const count = 3 + Math.min(2, Math.floor(n / 3));
  // The wall stands 9.15 m out, on the line from the ball to the middle of the goal.
  const aim = bx * (1 - 9.15 / dist);
  const wall = Array.from({ length: count }, (_, i) => aim + (i - (count - 1) / 2) * 0.62);
  const side = Math.random() < 0.5 ? -1 : 1;
  return { dist, bx, wall, wallZ: 9.15, keeperX: 0, skill: 0.45 + Math.min(0.4, n * 0.04), target: { x: side * (GW / 2 - 0.55), y: GH - 0.45 } };
};

export function FreeKick({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const [kick, setKick] = useState(0);
  const [points, setPoints] = useState(0);
  const [msg, setMsg] = useState<{ t: string; good: boolean } | null>(null);
  const g = useRef({
    setup: newSetup(0),
    ball: null as Ball | null,
    keeper: { x: 0, y: 0, dive: 0, dir: 0 },
    swipe: [] as { x: number; y: number; t: number }[],
    parts: [] as Particle[],
    result: "",
    flash: 0,
    view: { w: 1, h: 1 },
  });

  const start = () => {
    g.current.setup = newSetup(0);
    g.current.ball = null;
    g.current.keeper = { x: 0, y: 0, dive: 0, dir: 0 };
    setKick(0);
    setPoints(0);
    setMsg(null);
    setState("play");
    log("game_start", { item: k });
  };

  const settle = (text: string, good: boolean, pts: number) => {
    const s = g.current;
    if (s.result) return;
    s.result = text;
    if (good) {
      sfx.goal();
      buzz(HAPTIC.win);
      s.flash = 1;
    } else (sfx.wrong(), buzz(HAPTIC.tap));
    setMsg({ t: text, good });
    const total = points + pts;
    setPoints(total);
    setTimeout(() => {
      const nk = kick + 1;
      setMsg(null);
      s.result = "";
      s.ball = null;
      s.keeper = { x: 0, y: 0, dive: 0, dir: 0 };
      if (nk >= 10) {
        log("game_finish", { item: k, value: total });
        submit(total);
        setState("over");
      } else {
        s.setup = newSetup(nk);
        setKick(nk);
      }
    }, 1400);
  };

  // Camera: behind the ball, looking at the goal.
  const proj = (x: number, y: number, z: number) => {
    const { w, h } = g.current.view, st = g.current.setup;
    // A TV-style camera: well behind the ball, raised, zoomed in.
    const camZ = -10, camY = 3, f = h * 2.2;
    const dz = z - camZ; // distance in front of the camera
    const s = f / Math.max(0.5, dz);
    return { x: w / 2 + (x - st.bx * 0.6) * s, y: h * 0.22 + (camY - y) * s, s };
  };

  const ref = useCanvas(({ ctx, w, h, dt, t }) => {
    const s = g.current;
    s.view = { w, h };
    const st = s.setup;
    // ---- physics (z counts metres from the ball towards the goal line at z = dist) ----
    const b = s.ball;
    if (b?.flying) {
      b.vx += b.spin * dt;
      b.vy -= 9.8 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;
      const p = proj(b.x, b.y, b.z);
      b.trail.push({ x: p.x, y: p.y });
      if (b.trail.length > 16) b.trail.shift();
      // Keeper reacts once the ball is past the wall
      if (b.z > st.wallZ && !s.keeper.dir) {
        const predX = b.x + b.vx * ((st.dist - b.z) / b.vz);
        s.keeper.dir = Math.sign(predX) || 1;
        s.keeper.dive = Math.min(GW / 2, Math.abs(predX) * (0.5 + st.skill * 0.6));
      }
      if (s.keeper.dir) {
        s.keeper.x += (s.keeper.dir * s.keeper.dive - s.keeper.x) * Math.min(1, dt * (3 + st.skill * 4));
        s.keeper.y = Math.min(1.2, Math.abs(s.keeper.x) * 0.35);
      }
      // Wall
      if (b.z >= st.wallZ && b.z - b.vz * dt < st.wallZ && b.y < 2.0 && st.wall.some((wx) => Math.abs(wx - b.x) < 0.38)) {
        b.flying = false;
        settle(ui.wall, false, 0);
      }
      if (b.flying && b.z >= st.dist) {
        b.flying = false;
        const inGoal = Math.abs(b.x) < GW / 2 - 0.1 && b.y > 0 && b.y < GH - 0.05;
        const reach = 1.0 + st.skill * 0.4;
        const kept = Math.hypot(b.x - s.keeper.x, b.y - (0.9 + s.keeper.y)) < reach;
        if (!inGoal) settle(b.y >= GH ? ui.over : ui.wide, false, 0);
        else if (kept) settle(ui.saved, false, 0);
        else {
          const target = Math.hypot(b.x - st.target.x, b.y - st.target.y) < 0.6;
          for (let i = 0; i < 40; i++) {
            const p2 = proj(b.x, b.y, st.dist);
            s.parts.push({ x: p2.x, y: p2.y, vx: (Math.random() - 0.5) * 420, vy: (Math.random() - 0.8) * 420, life: 1, max: 1, c: ["#FFD34D", "#FF5A4E", "#4FE0C8", "#fff"][i % 4], r: 3, g: 500 });
          }
          settle(target ? ui.top : ui.goal, true, target ? 3 : 1);
        }
      }
    }
    s.parts = stepParticles(s.parts, dt);
    s.flash = Math.max(0, s.flash - dt * 1.5);

    // ---- draw ----
    // Night sky and floodlights
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    sky.addColorStop(0, "#070B24");
    sky.addColorStop(1, "#1C2A5C");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    for (const lx of [w * 0.12, w * 0.88]) {
      const lg = ctx.createRadialGradient(lx, h * 0.06, 2, lx, h * 0.06, w * 0.45);
      lg.addColorStop(0, "rgba(255,255,230,.85)");
      lg.addColorStop(0.08, "rgba(255,255,220,.35)");
      lg.addColorStop(1, "rgba(255,255,220,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, w, h);
    }
    // Crowd
    const crowdY = h * 0.27;
    ctx.fillStyle = "#141B3D";
    ctx.fillRect(0, crowdY, w, h * 0.12);
    for (let i = 0; i < 260; i++) {
      const x = (i * 37.3) % w, y = crowdY + ((i * 13.7) % (h * 0.11));
      ctx.fillStyle = ["#FF5A4E", "#FFD34D", "#4FA3FF", "#fff", "#9A82FF"][i % 5];
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 3 + i);
      ctx.fillRect(x, y + Math.sin(t * 4 + i) * (s.flash ? 4 : 1), 3, 3);
    }
    ctx.globalAlpha = 1;
    // Pitch with mowing stripes
    const horizon = proj(0, 0, st.dist + 12).y;
    const pitch = ctx.createLinearGradient(0, horizon, 0, h);
    pitch.addColorStop(0, "#1E7A3E");
    pitch.addColorStop(1, "#2FA552");
    ctx.fillStyle = pitch;
    ctx.fillRect(0, horizon, w, h - horizon);
    for (let z = st.dist + 12; z > -6; z -= 3) {
      const a = proj(-40, 0, z), b2 = proj(40, 0, z - 1.5);
      if (Math.round(z / 3) % 2) {
        ctx.fillStyle = "rgba(255,255,255,.05)";
        ctx.fillRect(0, a.y, w, Math.max(1, b2.y - a.y));
      }
    }
    // Goal area lines
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 2;
    const l1 = proj(-20, 0, st.dist), l2 = proj(20, 0, st.dist);
    ctx.beginPath();
    ctx.moveTo(l1.x, l1.y);
    ctx.lineTo(l2.x, l2.y);
    ctx.stroke();
    for (const [x0, x1, z0] of [[-9.16, 9.16, st.dist - 5.5], [-20.16, 20.16, st.dist - 16.5]] as [number, number, number][]) {
      const a = proj(x0, 0, st.dist), b2 = proj(x0, 0, z0), c = proj(x1, 0, z0), d = proj(x1, 0, st.dist);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }
    // Net and goal frame
    const gl = proj(-GW / 2, GH, st.dist), gr = proj(GW / 2, 0, st.dist);
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fillRect(gl.x, gl.y, gr.x - gl.x, gr.y - gl.y);
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const x = gl.x + ((gr.x - gl.x) * i) / 20;
      ctx.beginPath();
      ctx.moveTo(x, gl.y);
      ctx.lineTo(x, gr.y);
      ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
      const y = gl.y + ((gr.y - gl.y) * i) / 8;
      ctx.beginPath();
      ctx.moveTo(gl.x, y);
      ctx.lineTo(gr.x, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = Math.max(3, gl.s * 0.12);
    ctx.beginPath();
    ctx.moveTo(gl.x, gr.y);
    ctx.lineTo(gl.x, gl.y);
    ctx.lineTo(gr.x, gl.y);
    ctx.lineTo(gr.x, gr.y);
    ctx.stroke();
    // Target
    const tp = proj(st.target.x, st.target.y, st.dist);
    ctx.strokeStyle = `rgba(255,214,77,${0.6 + 0.4 * Math.sin(t * 6)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, tp.s * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, tp.s * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    // Player figure (keeper or wall)
    const person = (x: number, y: number, z: number, shirt: string, armsUp: number, tilt = 0) => {
      const p = proj(x, y, z), u = p.s;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(tilt);
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.beginPath();
      ctx.ellipse(0, 0, u * 0.35, u * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1B1740";
      rr(ctx, -u * 0.2, -u * 0.85, u * 0.16, u * 0.85, u * 0.05);
      ctx.fill();
      rr(ctx, u * 0.04, -u * 0.85, u * 0.16, u * 0.85, u * 0.05);
      ctx.fill();
      ctx.fillStyle = shirt;
      rr(ctx, -u * 0.26, -u * 1.5, u * 0.52, u * 0.7, u * 0.12);
      ctx.fill();
      ctx.strokeStyle = shirt;
      ctx.lineWidth = u * 0.12;
      ctx.lineCap = "round";
      for (const sg of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sg * u * 0.24, -u * 1.4);
        ctx.lineTo(sg * u * (0.35 + armsUp * 0.15), -u * (1.1 + armsUp * 0.75));
        ctx.stroke();
      }
      ctx.fillStyle = "#C68A64";
      ctx.beginPath();
      ctx.arc(0, -u * 1.68, u * 0.17, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    // Keeper
    person(s.keeper.x, s.keeper.y, st.dist - 0.4, "#FFB51F", 1, s.keeper.dir * Math.min(1.2, Math.abs(s.keeper.x) * 0.35));
    // Wall
    for (const wx of st.wall) person(wx, 0, st.wallZ, "#E8384F", 0.1);
    // Ball and shadow
    const ball = s.ball ?? { x: st.bx, y: 0, z: 0, trail: [] as { x: number; y: number }[] };
    const bx = ball.x;
    const bp = proj(bx, ball.y + 0.11, ball.z), shadow = proj(bx, 0, ball.z);
    if (s.ball) {
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = Math.max(2, bp.s * 0.12);
      ctx.beginPath();
      s.ball.trail.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, bp.s * 0.13, bp.s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    const br = Math.max(4, bp.s * 0.11);
    const bg2 = ctx.createRadialGradient(bp.x - br * 0.35, bp.y - br * 0.35, br * 0.1, bp.x, bp.y, br);
    bg2.addColorStop(0, "#fff");
    bg2.addColorStop(1, "#C9CCD8");
    ctx.fillStyle = bg2;
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1B1740";
    ctx.save();
    ctx.translate(bp.x, bp.y);
    ctx.rotate(t * (s.ball?.flying ? 14 : 0));
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.arc(br * 0.55, 0, br * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Swipe trail
    if (s.swipe.length > 1) {
      ctx.strokeStyle = "rgba(255,214,77,.85)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      s.swipe.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
    drawParticles(ctx, s.parts);
    if (s.flash) {
      ctx.fillStyle = `rgba(255,255,255,${s.flash * 0.25})`;
      ctx.fillRect(0, 0, w, h);
    }
  }, true);

  // Swipe: direction aims, speed is power, how much it bends is spin.
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (state !== "play" || g.current.ball) return;
    const r = e.currentTarget.getBoundingClientRect();
    g.current.swipe = [{ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }];
    capture(e);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = g.current;
    if (!s.swipe.length) return;
    const r = e.currentTarget.getBoundingClientRect();
    s.swipe.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
  };
  const onUp = () => {
    const s = g.current, pts = s.swipe;
    s.swipe = [];
    if (pts.length < 3 || s.ball) return;
    const a = pts[0], z = pts[pts.length - 1];
    const dx = z.x - a.x, dy = a.y - z.y, dur = Math.max(60, z.t - a.t);
    if (dy < 30) return;
    // Bend: how far the middle of the swipe is from the straight line.
    const m = pts[Math.floor(pts.length / 2)];
    const bend = ((m.x - a.x) * dy - (a.y - m.y) * dx) / Math.max(1, Math.hypot(dx, dy));
    const { w, h } = s.view;
    const st = s.setup;
    const speed = Math.min(32, 17 + (Math.hypot(dx, dy) / dur) * 8);
    const T = st.dist / speed; // flight time to the goal line
    // Where the swipe points: follow its direction to the goal line for the side,
    // and use its length (compared with the distance to the crossbar) for the height.
    const gl = proj(0, 0, st.dist), gt = proj(0, GH, st.dist);
    const tLine = (a.y - gl.y) / Math.max(1, dy);
    const sxAtGoal = a.x + dx * tLine;
    const aimX = st.bx * 0.6 + (sxAtGoal - w / 2) / gl.s;
    const reach = Math.hypot(dx, dy) / Math.max(1, a.y - gt.y);
    const aimY = Math.max(0.2, Math.min(1.5, reach)) * GH * 0.92;
    const spin = bend * 0.06;
    s.ball = {
      x: st.bx, y: 0, z: 0, vz: speed,
      vy: (aimY + 0.5 * 9.8 * T * T) / T,
      // A curved swipe bends the flight and pulls the finish a little the same way.
      vx: (aimX - st.bx) / T - 0.25 * spin * T,
      spin, flying: true, trail: [],
    };
    sfx.kick();
    buzz(HAPTIC.tap);
  };

  return (
    <>
      <GameHead k={k} />
      <ArcadeShell
        song="sunny"
        title={ui.title}
        how={[ui.h1, ui.h2, ui.h3, ui.h4]}
        state={state}
        score={`${points} ${ui.pts}`}
        best={best}
        newBest={state === "over" && best === points && points > 0}
        accent="#2FA552"
        onStart={start}
        chips={
          <>
            <span className="ax-chip">⚽ {ui.kick} {kick + 1}/10</span>
            <span className="ax-chip gold">⭐ {points}</span>
          </>
        }
      >
        <canvas ref={ref} className="ax-canvas tall" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-label={ui.title} />
        {msg && <div className={`ax-toast${msg.good ? " good" : ""}`}>{msg.t}</div>}
      </ArcadeShell>
    </>
  );
}
