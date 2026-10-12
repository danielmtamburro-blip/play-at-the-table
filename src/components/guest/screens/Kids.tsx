"use client";
import { buzz, HAPTIC } from "@/lib/haptics";
import { useEffect, useRef, useState } from "react";
import { CHALLENGES } from "@/lib/content";
import { shuffle, useGuest } from "../context";
import { useScores } from "../Leaderboard";

/* ---------- Colouring (tap-to-fill canvas) ---------- */

const SWATCHES = ["#FF5A4E", "#FF9F1C", "#FFD23F", "#7ED957", "#12A594", "#4CC9F0", "#6E4BFF", "#F0457F", "#8D5B3A", "#FFFFFF"];
type Tpl = "fish" | "cupcake" | "pattern";
const SIZE = 600;
// Kept for the whole visit so a picture survives switching screens. Never uploaded.
const snapshots: Partial<Record<Tpl, ImageData>> = {};

function drawTemplate(ctx: CanvasRenderingContext2D, k: Tpl) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = "#1B1740";
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const path = (f: () => void) => {
    ctx.beginPath();
    f();
    ctx.stroke();
  };
  const filled = (f: () => void) => {
    ctx.beginPath();
    f();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
  };
  if (k === "fish") {
    path(() => { ctx.moveTo(0, 530); ctx.quadraticCurveTo(300, 480, 600, 530); });
    path(() => { ctx.moveTo(470, 530); ctx.quadraticCurveTo(440, 470, 480, 420); ctx.quadraticCurveTo(520, 470, 500, 530); });
    filled(() => { ctx.moveTo(420, 300); ctx.lineTo(560, 190); ctx.lineTo(540, 300); ctx.lineTo(560, 410); ctx.closePath(); });
    filled(() => { ctx.moveTo(220, 215); ctx.quadraticCurveTo(300, 90, 380, 215); });
    filled(() => { ctx.ellipse(270, 300, 180, 115, 0, 0, Math.PI * 2); });
    path(() => { ctx.moveTo(195, 205); ctx.quadraticCurveTo(250, 300, 195, 395); });
    for (const [x, y] of [[290, 250], [350, 250], [290, 330], [350, 330], [320, 290], [380, 290]])
      path(() => { ctx.arc(x, y, 26, Math.PI * 0.5, Math.PI * 1.5, true); });
    filled(() => { ctx.arc(150, 275, 24, 0, Math.PI * 2); });
    ctx.beginPath(); ctx.arc(155, 272, 9, 0, Math.PI * 2); ctx.fillStyle = "#1B1740"; ctx.fill();
    path(() => { ctx.moveTo(110, 330); ctx.quadraticCurveTo(130, 350, 155, 335); });
    for (const [x, y, r] of [[90, 180, 20], [60, 110, 14], [110, 60, 9]]) filled(() => { ctx.arc(x, y, r, 0, Math.PI * 2); });
  } else if (k === "cupcake") {
    filled(() => { ctx.ellipse(300, 545, 230, 32, 0, 0, Math.PI * 2); });
    filled(() => { ctx.moveTo(165, 330); ctx.lineTo(435, 330); ctx.lineTo(395, 540); ctx.lineTo(205, 540); ctx.closePath(); });
    for (let i = 1; i < 5; i++) path(() => { ctx.moveTo(165 + i * 54, 330); ctx.lineTo(205 + i * 38, 540); });
    filled(() => {
      ctx.moveTo(140, 338);
      ctx.bezierCurveTo(95, 260, 175, 200, 225, 222);
      ctx.bezierCurveTo(230, 140, 370, 140, 375, 222);
      ctx.bezierCurveTo(425, 200, 505, 260, 460, 338);
      ctx.closePath();
    });
    path(() => { ctx.moveTo(190, 290); ctx.quadraticCurveTo(300, 250, 410, 290); });
    for (const [x, y] of [[200, 315], [260, 300], [330, 305], [400, 318], [300, 215], [245, 250], [360, 250]])
      filled(() => { ctx.arc(x, y, 9, 0, Math.PI * 2); });
    filled(() => { ctx.arc(300, 130, 34, 0, Math.PI * 2); });
    path(() => { ctx.moveTo(310, 98); ctx.quadraticCurveTo(320, 60, 350, 45); });
    for (const [x, y] of [[80, 90], [520, 110], [520, 420], [70, 430]])
      filled(() => {
        ctx.moveTo(x, y - 26); ctx.lineTo(x + 8, y - 8); ctx.lineTo(x + 26, y); ctx.lineTo(x + 8, y + 8);
        ctx.lineTo(x, y + 26); ctx.lineTo(x - 8, y + 8); ctx.lineTo(x - 26, y); ctx.lineTo(x - 8, y - 8); ctx.closePath();
      });
  } else {
    ctx.strokeRect(40, 40, 520, 520);
    for (let i = 1; i < 4; i++) {
      path(() => { ctx.moveTo(40 + i * 130, 40); ctx.lineTo(40 + i * 130, 560); });
      path(() => { ctx.moveTo(40, 40 + i * 130); ctx.lineTo(560, 40 + i * 130); });
    }
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const cx = 105 + i * 130, cy = 105 + j * 130;
        path(() => { ctx.moveTo(cx, cy - 55); ctx.lineTo(cx + 55, cy); ctx.lineTo(cx, cy + 55); ctx.lineTo(cx - 55, cy); ctx.closePath(); });
        path(() => { ctx.moveTo(cx, cy - 28); ctx.lineTo(cx + 28, cy); ctx.lineTo(cx, cy + 28); ctx.lineTo(cx - 28, cy); ctx.closePath(); });
      }
  }
}

function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, hex: string) {
  const W = SIZE, H = SIZE;
  const img = ctx.getImageData(0, 0, W, H), d = img.data;
  const i0 = (y * W + x) * 4, r0 = d[i0], g0 = d[i0 + 1], b0 = d[i0 + 2];
  if (r0 + g0 + b0 < 200) return; // tapped an outline
  const nr = parseInt(hex.slice(1, 3), 16), ng = parseInt(hex.slice(3, 5), 16), nb = parseInt(hex.slice(5, 7), 16);
  if (Math.abs(r0 - nr) + Math.abs(g0 - ng) + Math.abs(b0 - nb) < 6) return;
  const match = (i: number) => Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) < 150;
  const seen = new Uint8Array(W * H), stack = [x, y];
  while (stack.length) {
    const py = stack.pop()!, px = stack.pop()!;
    let lx = px;
    while (lx >= 0 && !seen[py * W + lx] && match((py * W + lx) * 4)) lx--;
    lx++;
    let up = false, dn = false;
    for (let cx = lx; cx < W; cx++) {
      const p = py * W + cx;
      if (seen[p] || !match(p * 4)) break;
      seen[p] = 1; d[p * 4] = nr; d[p * 4 + 1] = ng; d[p * 4 + 2] = nb; d[p * 4 + 3] = 255;
      if (py > 0) { const q = p - W; if (!seen[q] && match(q * 4)) { if (!up) { stack.push(cx, py - 1); up = true; } } else up = false; }
      if (py < H - 1) { const q = p + W; if (!seen[q] && match(q * 4)) { if (!dn) { stack.push(cx, py + 1); dn = true; } } else dn = false; }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function Colour() {
  const { tr } = useGuest();
  const [tpl, setTpl] = useState<Tpl>("fish");
  const [colour, setColour] = useState(SWATCHES[0]);
  const [resets, setResets] = useState(0);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const snap = snapshots[tpl];
    if (snap) ctx.putImageData(snap, 0, 0);
    else drawTemplate(ctx, tpl);
  }, [tpl, resets]);

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = e.currentTarget, ctx = cv.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const r = cv.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * SIZE), y = Math.floor(((e.clientY - r.top) / r.height) * SIZE);
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    floodFill(ctx, x, y, colour);
    snapshots[tpl] = ctx.getImageData(0, 0, SIZE, SIZE);
  };

  return (
    <>
      <div>
        <h2 className="g-h">{tr("colour")}</h2>
        <p className="g-sub">{tr("colourS")}</p>
      </div>
      <div className="g-tabs" role="group">
        {(["fish", "cupcake", "pattern"] as Tpl[]).map((k) => (
          <button key={k} aria-pressed={tpl === k} onClick={() => setTpl(k)}>
            {tr(k)}
          </button>
        ))}
      </div>
      <canvas ref={ref} className="color-canvas" width={SIZE} height={SIZE} aria-label={tr("colour")} onPointerDown={onDown} />
      <div className="swatches" role="group">
        {SWATCHES.map((c) => (
          <button key={c} style={{ background: c }} aria-label={c} aria-pressed={colour === c} onClick={() => setColour(c)} />
        ))}
      </div>
      <div className="g-row">
        <button
          className="g-btn alt"
          onClick={() => {
            delete snapshots[tpl];
            setResets((n) => n + 1);
          }}
        >
          {tr("clear")}
        </button>
      </div>
      <p className="g-note" style={{ textAlign: "center" }}>
        {tr("showGrownUp")}
      </p>
    </>
  );
}

/* ---------- Memory match ---------- */

const FACES = ["🐪", "🌴", "🐠", "⭐", "🍉", "🦩", "🚀", "🦁"];
const newDeck = () => ({ cards: shuffle([...FACES, ...FACES]), open: [] as number[], done: [] as number[], moves: 0, lock: false });

export function Memory() {
  const { tr, log } = useGuest();
  const [m, setM] = useState(newDeck);
  const won = m.done.length === m.cards.length;
  const { report } = useScores();
  useEffect(() => {
    if (won) (log("game_finish", { item: "memory", value: m.moves }), report("memory", m.moves));
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i: number) => {
    if (m.lock || m.open.includes(i) || m.done.includes(i)) return;
    const open = [...m.open, i];
    if (open.length < 2) return setM({ ...m, open });
    const [x, y] = open;
    if (m.cards[x] === m.cards[y]) return (buzz(), setM({ ...m, open: [], done: [...m.done, x, y], moves: m.moves + 1 }));
    setM({ ...m, open, moves: m.moves + 1, lock: true });
    setTimeout(() => setM((s) => ({ ...s, open: [], lock: false })), 850);
  };

  return (
    <>
      <div>
        <h2 className="g-h">{tr("memory")}</h2>
        <p className="g-sub">{tr("memoryS")}</p>
      </div>
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>
          {tr("moves")}: {m.moves}
        </span>
        <span>
          {tr("pairs")}: {m.done.length / 2} / {FACES.length}
        </span>
      </div>
      <div className="mem">
        {m.cards.map((f, i) => {
          const o = m.open.includes(i), dn = m.done.includes(i);
          return (
            <button key={i} className={dn ? "done" : o ? "open" : ""} aria-label={o || dn ? f : "?"} onClick={() => flip(i)}>
              {o || dn ? f : ""}
            </button>
          );
        })}
      </div>
      {won && (
        <div className="prompt kids">
          <p>{tr("wellDone")}</p>
          <div>
            <button
              className="g-btn"
              onClick={() => {
                setM(newDeck());
                log("game_start", { item: "memory" });
              }}
            >
              {tr("playAgain")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Table challenge ---------- */

export function Challenge() {
  const { tr, L } = useGuest();
  const [n, setN] = useState(() => Math.floor(Math.random() * CHALLENGES.length));
  const next = () => {
    let k;
    do k = Math.floor(Math.random() * CHALLENGES.length);
    while (k === n);
    setN(k);
  };
  return (
    <>
      <div>
        <h2 className="g-h">{tr("challenge")}</h2>
        <p className="g-sub">{tr("challengeS")}</p>
      </div>
      <div className="prompt kids">
        <span className="count">{tr("challenge")}</span>
        <p>{L(CHALLENGES[n])}</p>
      </div>
      <button className="g-btn" onClick={next}>
        {tr("newChallenge")}
      </button>
    </>
  );
}
