"use client";
import { buzz, HAPTIC } from "@/lib/haptics";
import { useEffect, useRef, useState } from "react";
import { CHALLENGES } from "@/lib/content";
import { shuffle, useGuest } from "../context";
import { useScores } from "../Leaderboard";
import type { Lang } from "@/lib/types";
import { sfx } from "@/lib/sfx";
import { drawPicture, fillShape, lineLayer, PICTURE_NAMES, PICTURES, SIZE, type Picture } from "./colouring";

/* ---------- Colouring: pick a picture, then fill shapes or draw with the pen ---------- */

const SWATCHES = ["#FF5A4E", "#FF9F1C", "#FFD23F", "#7ED957", "#12A594", "#4CC9F0", "#6E4BFF", "#B98CFF", "#F0457F", "#FFB3C7", "#8D5B3A", "#1B1740"];
type Tool = "fill" | "pen" | "rubber";
const BRUSH = [8, 18, 34];
const COL_UI: Record<Lang, Record<string, string>> = {
  en: { sub: "Pick a picture, then fill the shapes or draw with the pen", fill: "Fill", pen: "Pen", rubber: "Rubber", undo: "Undo", save: "Save" },
  ar: { sub: "اختر صورة، ثم لوّن الأشكال أو ارسم بالقلم", fill: "تعبئة", pen: "قلم", rubber: "ممحاة", undo: "تراجع", save: "احفظ" },
};
// Kept for the whole visit so a picture survives switching screens. Never uploaded.
const paints: Partial<Record<Picture, ImageData>> = {};
const layers: Partial<Record<Picture, ReturnType<typeof lineLayer>>> = {};
const layer = (k: Picture) => (layers[k] ??= lineLayer(k));

export function Colour() {
  const { tr, lang } = useGuest();
  const t = COL_UI[lang];
  const [pic, setPic] = useState<Picture>("fish");
  const [colour, setColour] = useState(SWATCHES[0]);
  const [tool, setTool] = useState<Tool>("fill");
  const [brush, setBrush] = useState(1);
  const [thumbs, setThumbs] = useState<Partial<Record<Picture, string>>>({});
  const [undos, setUndos] = useState(0);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const history = useRef<ImageData[]>([]);
  const last = useRef<[number, number] | null>(null);

  // Little previews for the picture picker.
  useEffect(() => {
    const big = document.createElement("canvas"), small = document.createElement("canvas");
    big.width = big.height = SIZE;
    small.width = small.height = 120;
    const b = big.getContext("2d")!, s = small.getContext("2d")!;
    const out: Partial<Record<Picture, string>> = {};
    for (const k of PICTURES) {
      drawPicture(b, k);
      s.clearRect(0, 0, 120, 120);
      s.drawImage(big, 0, 0, 120, 120);
      out[k] = small.toDataURL("image/png");
    }
    setThumbs(out);
  }, []);

  useEffect(() => {
    const p = paintRef.current?.getContext("2d", { willReadFrequently: true }), l = lineRef.current?.getContext("2d");
    if (!p || !l) return;
    l.putImageData(layer(pic).lines, 0, 0);
    const snap = paints[pic];
    if (snap) p.putImageData(snap, 0, 0);
    else (p.fillStyle = "#fff"), p.fillRect(0, 0, SIZE, SIZE);
    history.current = [];
    setUndos(0);
  }, [pic]);

  const ctx = () => paintRef.current!.getContext("2d", { willReadFrequently: true })!;
  const remember = () => {
    history.current.push(ctx().getImageData(0, 0, SIZE, SIZE));
    if (history.current.length > 15) history.current.shift();
    setUndos(history.current.length);
  };
  const save = () => (paints[pic] = ctx().getImageData(0, 0, SIZE, SIZE));
  const at = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  };
  const stroke = (from: [number, number], to: [number, number]) => {
    const c = ctx();
    c.strokeStyle = tool === "rubber" ? "#fff" : colour;
    c.lineWidth = BRUSH[brush] * (tool === "rubber" ? 1.6 : 1);
    c.lineCap = c.lineJoin = "round";
    c.beginPath();
    c.moveTo(from[0], from[1]);
    c.lineTo(to[0], to[1]);
    c.stroke();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = at(e);
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    if (tool === "fill") {
      const c = ctx(), img = c.getImageData(0, 0, SIZE, SIZE);
      const before = c.getImageData(0, 0, SIZE, SIZE);
      if (!fillShape(img, layer(pic).wall, Math.floor(x), Math.floor(y), colour)) return;
      history.current.push(before);
      if (history.current.length > 15) history.current.shift();
      setUndos(history.current.length);
      c.putImageData(img, 0, 0);
      sfx.tap();
      save();
      return;
    }
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    remember();
    last.current = [x, y];
    stroke([x, y], [x + 0.1, y + 0.1]);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    const p = at(e);
    stroke(last.current, p);
    last.current = p;
  };
  const onUp = () => {
    if (!last.current) return;
    last.current = null;
    save();
  };
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    ctx().putImageData(prev, 0, 0);
    setUndos(history.current.length);
    save();
  };
  const download = () => {
    const out = document.createElement("canvas");
    out.width = out.height = SIZE;
    const o = out.getContext("2d")!;
    o.drawImage(paintRef.current!, 0, 0);
    o.drawImage(lineRef.current!, 0, 0);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = `my-${pic}.png`;
    a.click();
  };

  return (
    <>
      <div>
        <h2 className="g-h">{tr("colour")}</h2>
        <p className="g-sub">{t.sub}</p>
      </div>
      <div className="col-pick" role="group">
        {PICTURES.map((k) => (
          <button key={k} aria-pressed={pic === k} onClick={() => setPic(k)}>
            {thumbs[k] ? <img src={thumbs[k]} alt="" /> : <i />}
            <span>{PICTURE_NAMES[lang][k]}</span>
          </button>
        ))}
      </div>
      <div className="col-tools" role="group">
        {(["fill", "pen", "rubber"] as Tool[]).map((k) => (
          <button key={k} aria-pressed={tool === k} onClick={() => setTool(k)}>
            <span aria-hidden="true">{k === "fill" ? "🪣" : k === "pen" ? "✏️" : "🧽"}</span>
            {t[k]}
          </button>
        ))}
        {tool !== "fill" &&
          BRUSH.map((b, i) => (
            <button key={b} className="col-size" aria-pressed={brush === i} aria-label={`${b}`} onClick={() => setBrush(i)}>
              <i style={{ width: 6 + i * 7, height: 6 + i * 7, background: tool === "rubber" ? "var(--muted)" : colour }} />
            </button>
          ))}
      </div>
      <div className="col-wrap">
        <canvas
          ref={paintRef}
          className={`color-canvas col-${tool}`}
          width={SIZE}
          height={SIZE}
          aria-label={tr("colour")}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        <canvas ref={lineRef} className="color-lines" width={SIZE} height={SIZE} aria-hidden="true" />
      </div>
      <div className="swatches" role="group">
        {SWATCHES.map((c) => (
          <button key={c} style={{ background: c }} aria-label={c} aria-pressed={colour === c} onClick={() => (setColour(c), tool === "rubber" && setTool("pen"))} />
        ))}
      </div>
      <div className="col-actions">
        <button className="g-btn alt" onClick={undo} disabled={!undos}>
          ↶ {t.undo}
        </button>
        <button
          className="g-btn alt"
          onClick={() => {
            remember();
            const c = ctx();
            c.fillStyle = "#fff";
            c.fillRect(0, 0, SIZE, SIZE);
            delete paints[pic];
          }}
        >
          {tr("clear")}
        </button>
        <button className="g-btn" onClick={download}>
          {t.save}
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
    if (m.cards[x] === m.cards[y]) return (buzz(), sfx.correct(), setM({ ...m, open: [], done: [...m.done, x, y], moves: m.moves + 1 }));
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
