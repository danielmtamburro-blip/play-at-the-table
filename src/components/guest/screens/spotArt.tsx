// Illustrated scenes for the grown-up spot the difference: simple vector objects in a muted palette.
export type ArtItem = { k: string; x: number; y: number; s: number; c: string; v: number; flip?: boolean; rot?: number; gone?: boolean };

export const PALETTE = ["#C8553D", "#588B8B", "#F2C14E", "#2F4858", "#E8A87C", "#8E7DBE", "#6A994E", "#D96C8A"];

const WALL = ["frame", "clock", "lamp", "frame2", "shelfplant"];
const TABLE = ["cup", "glass", "bottle", "plate", "candle", "vase", "fruit", "book", "pot", "teapot", "bowl", "jar"];

/** One object, centred on x,y with size s. v = small detail variant (0/1). */
export function ArtObject({ it }: { it: ArtItem }) {
  if (it.gone) return null;
  const { x, y, s, c, v } = it;
  const u = s / 24; // drawn on a 24-unit grid
  const tf = `translate(${x} ${y}) ${it.rot ? `rotate(${it.rot})` : ""} ${it.flip ? "scale(-1 1)" : ""} scale(${u}) translate(-12 -12)`;
  const ink = "#2B2A33";
  const shapes: Record<string, React.ReactNode> = {
    cup: (
      <>
        <path d="M5 9h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" fill={c} />
        <path d="M16 11h2a2.5 2.5 0 0 1 0 5h-2" fill="none" stroke={c} strokeWidth="1.6" />
        <ellipse cx="11" cy="21" rx="8" ry="1.4" fill="#E9E2D6" />
        {v === 1 && <path d="M9 3c-1 2 1 3 0 5M13 3c-1 2 1 3 0 5" stroke="#B9B2A8" strokeWidth="1" fill="none" />}
      </>
    ),
    glass: (
      <>
        <path d="M7 3h10c0 5-2 8-5 8s-5-3-5-8z" fill={c} fillOpacity=".85" />
        <path d="M12 11v8M8 21h8" stroke={ink} strokeWidth="1.3" />
        {v === 1 && <circle cx="15" cy="5" r="1.3" fill="#F2C14E" />}
      </>
    ),
    bottle: (
      <>
        <rect x="8" y="8" width="8" height="14" rx="2" fill={c} />
        <rect x="10.2" y="2" width="3.6" height="7" rx="1" fill={c} />
        <rect x="8" y="13" width="8" height={v === 1 ? 5 : 3} fill="#F4EDE1" />
      </>
    ),
    plate: (
      <>
        <ellipse cx="12" cy="16" rx="10" ry="4" fill="#F4EDE1" stroke="#D8CFC1" />
        <ellipse cx="12" cy="15" rx="5" ry="2" fill={c} />
        {v === 1 && <circle cx="14" cy="14" r="1.2" fill="#6A994E" />}
      </>
    ),
    candle: (
      <>
        <rect x="9" y="9" width="6" height="12" rx="1" fill="#F4EDE1" stroke="#D8CFC1" />
        <path d="M12 3c2 2.5 2 4 0 5.5-2-1.5-2-3 0-5.5z" fill={v === 1 ? "#F2C14E" : "#E8A87C"} />
        <rect x="8" y="20" width="8" height="2" rx="1" fill={c} />
      </>
    ),
    vase: (
      <>
        <path d="M9 12h6c1 3 1 6 0 10H9c-1-4-1-7 0-10z" fill={c} />
        <path d="M12 12V5M12 8l-3-3M12 9l3-3" stroke="#6A994E" strokeWidth="1.2" />
        <circle cx="12" cy="4" r="2" fill="#D96C8A" />
        <circle cx="9" cy="5" r={v === 1 ? 1.8 : 1.3} fill="#F2C14E" />
        <circle cx="15" cy="6" r="1.5" fill="#E8A87C" />
      </>
    ),
    fruit: (
      <>
        <circle cx="12" cy="14" r="7" fill={c} />
        <path d="M12 7c0-2 1-3 2-3" stroke={ink} strokeWidth="1.2" fill="none" />
        {v === 1 ? <path d="M13 6c2-2 4-1 5 0-2 1-3 1-5 0z" fill="#6A994E" /> : null}
      </>
    ),
    book: (
      <>
        <rect x="3" y="14" width="18" height="4" rx="1" fill={c} />
        <rect x="5" y="10" width="15" height="4" rx="1" fill="#2F4858" />
        {v === 1 && <rect x="4" y="6" width="14" height="4" rx="1" fill="#F2C14E" />}
      </>
    ),
    pot: (
      <>
        <path d="M7 14h10l-1.5 8h-7z" fill={c} />
        <path d="M12 14c0-4-3-6-6-7 2 3 3 5 6 7zM12 14c0-4 3-7 6-8-2 3-3 6-6 8z" fill="#6A994E" />
        {v === 1 && <path d="M12 14V5" stroke="#6A994E" strokeWidth="1.4" />}
      </>
    ),
    teapot: (
      <>
        <ellipse cx="11" cy="15" rx="7" ry="6" fill={c} />
        <path d="M18 13l4-3" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M4 13c-2 0-2 4 0 4" stroke={c} strokeWidth="1.5" fill="none" />
        <circle cx="11" cy="8.5" r="1.5" fill={v === 1 ? "#F2C14E" : c} />
      </>
    ),
    bowl: (
      <>
        <path d="M3 13h18a9 7 0 0 1-18 0z" fill={c} />
        <circle cx="9" cy="12" r="2" fill="#F2C14E" />
        <circle cx="13" cy="11.5" r="2" fill="#C8553D" />
        {v === 1 && <circle cx="16.5" cy="12" r="1.8" fill="#6A994E" />}
      </>
    ),
    jar: (
      <>
        <rect x="6" y="8" width="12" height="14" rx="3" fill={c} fillOpacity=".75" />
        <rect x="7" y="5" width="10" height="3" rx="1" fill="#2F4858" />
        {v === 1 && <rect x="8" y="13" width="8" height="4" fill="#F4EDE1" />}
      </>
    ),
    frame: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="1" fill="#F4EDE1" stroke={c} strokeWidth="2" />
        <path d={v === 1 ? "M4 18l5-6 4 4 3-3 4 5z" : "M4 18l6-8 5 6 2-2 3 4z"} fill="#588B8B" />
        <circle cx="16" cy="8" r="2" fill="#F2C14E" />
      </>
    ),
    frame2: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="1" fill="#F4EDE1" stroke={c} strokeWidth="2" />
        <circle cx="12" cy="10" r={v === 1 ? 3 : 4} fill="#D96C8A" />
        <rect x="8" y="16" width="8" height="2" fill="#2F4858" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9.5" fill="#F4EDE1" stroke={c} strokeWidth="2" />
        <path d={v === 1 ? "M12 12V6M12 12l4 2" : "M12 12V6M12 12l-4 3"} stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
    lamp: (
      <>
        <path d="M12 0v6" stroke={ink} strokeWidth="1" />
        <path d="M6 14l2-8h8l2 8z" fill={c} />
        <circle cx="12" cy="16" r={v === 1 ? 2.2 : 1.5} fill="#F2C14E" />
      </>
    ),
    shelfplant: (
      <>
        <rect x="2" y="18" width="20" height="2" fill="#8C6A4F" />
        <path d="M8 18l1-5h6l1 5z" fill={c} />
        <path d="M12 13c-1-4-5-5-7-4 2 1 4 3 7 4zM12 13c1-4 5-6 7-5-2 1-4 4-7 5z" fill="#6A994E" />
        {v === 1 && <path d="M12 13c0-3 0-5 1-7" stroke="#6A994E" strokeWidth="1.3" fill="none" />}
      </>
    ),
  };
  return <g transform={tf}>{shapes[it.k]}</g>;
}

const shuffleArr = <T,>(a: T[]) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** A café wall and table. Returns the original picture and the changed copy, plus the 7 difference spots. */
export function makeArtPuzzle(W: number, H: number) {
  const items: ArtItem[] = [];
  const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
  const colour = () => pick(PALETTE);
  // Wall: 5 slots along the top
  for (let i = 0; i < 5; i++) items.push({ k: WALL[(i + Math.floor(Math.random() * 5)) % WALL.length], x: 30 + i * 60 + (Math.random() - 0.5) * 14, y: 44 + (Math.random() - 0.5) * 14, s: 36, c: colour(), v: Math.random() < 0.5 ? 1 : 0 });
  // Table: two rows of objects
  const tableKinds = shuffleArr(TABLE);
  for (let i = 0; i < 7; i++) items.push({ k: tableKinds[i], x: 24 + i * 42 + (Math.random() - 0.5) * 8, y: 116 + (Math.random() - 0.5) * 4, s: 34, c: colour(), v: Math.random() < 0.5 ? 1 : 0 });
  for (let i = 0; i < 6; i++) items.push({ k: tableKinds[(i + 7) % tableKinds.length], x: 44 + i * 44 + (Math.random() - 0.5) * 8, y: 158 + (Math.random() - 0.5) * 4, s: 32, c: colour(), v: Math.random() < 0.5 ? 1 : 0 });

  const kinds = shuffleArr(["colour", "gone", "size", "flip", "detail", "shift", "colour", "detail", "rot"]).slice(0, 7);
  const picks = shuffleArr(items.map((_, i) => i)).slice(0, 7);
  const changed = items.map((it) => ({ ...it }));
  const diffs = picks.map((i, n) => {
    const it = changed[i], kind = kinds[n];
    if (kind === "colour") it.c = PALETTE.find((p) => p !== it.c && Math.random() < 0.5) ?? PALETTE.find((p) => p !== it.c)!;
    if (kind === "gone") it.gone = true;
    if (kind === "size") it.s *= 0.72;
    if (kind === "flip") ["cup", "teapot", "clock", "vase", "pot", "shelfplant", "frame"].includes(it.k) ? (it.flip = true) : (it.v = 1 - it.v);
    if (kind === "detail") it.v = 1 - it.v;
    if (kind === "shift") it.x += 10;
    if (kind === "rot") it.rot = 18;
    return { i, x: items[i].x, y: items[i].y };
  });
  return { items, changed, diffs, radius: 20, W, H };
}

/** Wall and table backdrop (identical in both pictures). */
export function ArtBackdrop({ W, H }: { W: number; H: number }) {
  return (
    <>
      <rect width={W} height={H} fill="#EFE7DA" />
      <rect width={W} height={86} fill="#E3D6C3" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i * 26} y={0} width="13" height={86} fill="#DECFBA" opacity=".5" />
      ))}
      <rect y={86} width={W} height={6} fill="#C9B79D" />
      <rect y={134} width={W} height={10} rx="2" fill="#9C7656" />
      <rect y={174} width={W} height={16} fill="#8C6A4F" />
    </>
  );
}
