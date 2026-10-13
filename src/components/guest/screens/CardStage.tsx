"use client";
// A modern card stack for question games: progress bar, stacked cards behind, swipe or tap to move on.
import { useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

/** Keep receiving the pointer even if it leaves the element (ignored if the browser refuses). */
const capture = (e: React.PointerEvent) => {
  try {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  } catch {}
};

export type Tone = "kids" | "group" | "date" | "drink";

export function CardStage({ tone, index, total, label, children, onNext, footer }: {
  tone: Tone;
  index: number;
  total: number;
  label?: string;
  children: React.ReactNode;
  onNext?: () => void;
  footer?: React.ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0);
  const start = useRef<number | null>(null);

  const go = (dir: 1 | -1) => {
    if (!onNext || leaving) return;
    sfx.swipe();
    setLeaving(dir);
    setTimeout(() => {
      setLeaving(0);
      setDx(0);
      onNext();
    }, 260);
  };

  return (
    <div className={`cs cs-${tone}`}>
      <div className="cs-progress" aria-hidden="true">
        <i style={{ width: `${((index % total) + 1) / total * 100}%` }} />
      </div>
      <div className="cs-meta">
        <span>{label}</span>
        <span>
          {(index % total) + 1} / {total}
        </span>
      </div>
      <div className="cs-stack">
        <span className="cs-back cs-b2" aria-hidden="true" />
        <span className="cs-back cs-b1" aria-hidden="true" />
        <div
          key={index}
          className={`cs-card${leaving ? " leave" : ""}`}
          style={{
            transform: leaving ? `translateX(${leaving * 120}%) rotate(${leaving * 18}deg)` : dx ? `translateX(${dx}px) rotate(${dx / 18}deg)` : undefined,
            transition: dx && !leaving ? "none" : undefined,
          }}
          onPointerDown={(e) => {
            if (!onNext) return;
            start.current = e.clientX;
            capture(e);
          }}
          onPointerMove={(e) => start.current != null && setDx(e.clientX - start.current)}
          onPointerUp={() => {
            if (start.current == null) return;
            start.current = null;
            if (Math.abs(dx) > 80) go(dx > 0 ? 1 : -1);
            else setDx(0);
          }}
          onPointerCancel={() => ((start.current = null), setDx(0))}
        >
          <span className="cs-shape s1" aria-hidden="true" />
          <span className="cs-shape s2" aria-hidden="true" />
          <div className="cs-body">{children}</div>
        </div>
      </div>
      {footer}
    </div>
  );
}
