"use client";
// Self-playing tour for the phone on the sales page. An animated finger taps through the real
// guest app. Any real touch stops it; it restarts after a quiet spell.
import { useEffect, useRef, useState } from "react";
import { useGuest } from "./context";

type Props = {
  root: React.RefObject<HTMLDivElement | null>;
  body: React.RefObject<HTMLDivElement | null>;
  onCaption?: (text: string) => void;
};

const CAPTIONS = {
  en: {
    home: "Your venue, your branding, one scan",
    call: "Call a server with one tap",
    board: "🏆 Live leaderboards for every table",
    sudoku: "🔢 Sudoku, crosswords and puzzles",
    words: "🔍 Word search while you wait",
    keepy: "⚽ Keepy-uppy for the kids",
    quiz: "🧠 Table trivia for the group",
    pour: "🍺 Drinking games: pour it right!",
    yourTurn: "Your turn! Tap anything to explore.",
  },
  ar: {
    home: "مكانك وهويتك بمسحة واحدة",
    call: "نادِ النادل بضغطة واحدة",
    board: "🏆 لوحات متصدرين مباشرة لكل طاولة",
    sudoku: "🔢 سودوكو وكلمات متقاطعة وألغاز",
    words: "🔍 البحث عن الكلمات أثناء الانتظار",
    keepy: "⚽ تنطيط الكرة للأطفال",
    quiz: "🧠 مسابقات للمجموعة",
    pour: "🍺 ألعاب المشروبات: صبّها صح!",
    yourTurn: "دورك! اضغط على أي شيء للاستكشاف.",
  },
};

const IDLE_RESTART_MS = 20_000;

export default function DemoTour({ root, body, onCaption }: Props) {
  const { home, lang } = useGuest();
  const [finger, setFinger] = useState<{ x: number; y: number; tap: number; show: boolean }>({ x: 50, y: 70, tap: 0, show: false });
  const [run, setRun] = useState(0); // bump to (re)start
  const stopped = useRef(false);
  const capRef = useRef(onCaption);
  capRef.current = onCaption;
  const langRef = useRef(lang);
  langRef.current = lang;
  // home() changes identity on every screen change; keep it in a ref so the tour doesn't restart.
  const homeRef = useRef(home);
  homeRef.current = home;

  // A real touch or click inside the phone hands control to the visitor.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onUser = (e: Event) => {
      if (!e.isTrusted) return;
      stopped.current = true;
      setFinger((f) => ({ ...f, show: false }));
      capRef.current?.(CAPTIONS[langRef.current].yourTurn);
      clearTimeout(idle);
      idle = setTimeout(() => {
        stopped.current = false;
        homeRef.current();
        setRun((r) => r + 1);
      }, IDLE_RESTART_MS);
    };
    // Only a real tap or key press hands control over; scrolling the page over the phone doesn't.
    el.addEventListener("click", onUser, true);
    el.addEventListener("keydown", onUser, true);
    return () => {
      clearTimeout(idle);
      el.removeEventListener("click", onUser, true);
      el.removeEventListener("keydown", onUser, true);
    };
  }, [root]);

  useEffect(() => {
    let alive = true;
    const ok = () => alive && !stopped.current;
    const wait = (ms: number) => new Promise<void>((res, rej) => setTimeout(() => (ok() ? res() : rej(new Error("stop"))), ms));
    const caption = (k: keyof (typeof CAPTIONS)["en"]) => capRef.current?.(CAPTIONS[langRef.current][k]);
    const find = async (sel: string, tries = 20): Promise<HTMLElement> => {
      for (let i = 0; i < tries; i++) {
        const el = root.current?.querySelector<HTMLElement>(sel);
        if (el) return el;
        await wait(150);
      }
      throw new Error(`missing ${sel}`);
    };
    /** Glide the finger to a point (relative to the phone). */
    const moveTo = async (x: number, y: number, ms = 380) => {
      setFinger((f) => ({ ...f, x, y, show: true }));
      await wait(ms);
    };
    const pointOf = (el: Element, fx = 0.5, fy = 0.5) => {
      const r = el.getBoundingClientRect(), base = root.current!.getBoundingClientRect();
      return [r.left - base.left + r.width * fx, r.top - base.top + r.height * fy] as const;
    };
    const ripple = () => setFinger((f) => ({ ...f, tap: f.tap + 1 }));
    /** Scroll only inside the phone (never the sales page) so the element is visible. */
    const reveal = async (el: HTMLElement) => {
      const b = body.current;
      if (!b) return;
      const er = el.getBoundingClientRect(), br = b.getBoundingClientRect();
      if (er.top >= br.top + 8 && er.bottom <= br.bottom - 8) return;
      b.scrollTo({ top: b.scrollTop + (er.top - br.top) - br.height / 3, behavior: "smooth" });
      await wait(320);
    };
    const tap = async (sel: string, after = 260) => {
      const el = await find(sel);
      await reveal(el);
      const [x, y] = pointOf(el);
      await moveTo(x, y);
      ripple();
      el.click();
      await wait(after);
    };
    /** pointerdown at a spot inside an element (game arenas listen for this, not click). */
    const pressAt = (el: Element, clientX: number, clientY: number) =>
      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX, clientY }));
    const scrollBody = async (to: number, ms = 650) => {
      body.current?.scrollTo({ top: to, behavior: "smooth" });
      await wait(ms);
    };
    /** Run one part of the tour; if that part isn't available (e.g. switched off), skip it. */
    const part = async (fn: () => Promise<void>) => {
      try {
        await fn();
      } catch (e) {
        if (!ok()) throw e;
      }
      homeRef.current();
      await wait(250);
    };

    /** Wait until the phone is on screen, so visitors on mobile see the tour from the start. */
    const visible = () =>
      new Promise<void>((res) => {
        const el = root.current;
        if (!el || typeof IntersectionObserver === "undefined") return res();
        const io = new IntersectionObserver((es) => {
          if (es.some((e) => e.isIntersecting)) (io.disconnect(), res());
        }, { threshold: 0.4 });
        io.observe(el);
      });

    (async () => {
      await visible();
      await wait(800);
      while (ok()) {
        homeRef.current();
        await wait(300);

        await part(async () => {
          caption("home");
          await scrollBody(240, 900);
          await scrollBody(520, 900);
          await scrollBody(0, 600);
          caption("call");
          await tap('[data-act="call"]', 900);
        });

        /** Open the Play tab, then a game card on it. */
        const openGame = async (key: string) => {
          await tap('[data-tab="play"]', 250);
          await tap(`[data-card="${key}"]`, 350);
        };

        await part(async () => {
          caption("board");
          await tap('[data-tab="play"]', 1300);
          caption("sudoku");
          await tap('[data-card="sudoku"]', 350);
          for (let n = 0; n < 4; n++) {
            // An empty cell in the top rows, so it's visible without scrolling.
            const cells = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-sol]") ?? []).filter((c) => !c.textContent);
            const cell = cells[Math.min(cells.length - 1, n * 3)];
            if (!cell) break;
            await tap(`[aria-label="${cell.getAttribute("aria-label")}"]`, 120);
            await tap(`[data-n="${cell.dataset.sol}"]`, 200);
          }
        });

        await part(async () => {
          caption("words");
          await openGame("wordsearch");
          for (let n = 0; n < 2; n++) {
            await tap(`[data-ws~="s${n}"]`, 150);
            await tap(`[data-ws~="e${n}"]`, 450);
          }
        });

        await part(async () => {
          caption("keepy");
          await openGame("keepy");
          await tap('[data-act="start"]', 150);
          for (let k = 0; k < 4; k++) {
            const arena = await find(".arena.keepy");
            const ball = await find(".keepy-ball");
            let [x, y] = pointOf(ball);
            await moveTo(x, y + 6, 160);
            const r = ball.getBoundingClientRect();
            [x, y] = pointOf(ball);
            setFinger((f) => ({ ...f, x, y: y + 6 }));
            ripple();
            pressAt(arena, r.left + r.width / 2, r.top + r.height / 2);
            await wait(380);
          }
          await wait(200);
        });

        await part(async () => {
          caption("quiz");
          await openGame("trivia");
          await tap("[data-right]", 700);
          await tap('[data-act="next"]', 250);
          await tap("[data-right]", 700);
        });

        await part(async () => {
          caption("pour");
          await tap('[data-tab="play"]', 250);
          await tap('[data-chip="drink"]', 300);
          await tap('[data-card="pour"]', 350);
          if (root.current?.querySelector('[data-act="age-yes"]')) await tap('[data-act="age-yes"]', 300);
          const stage = await find(".pour-stage");
          await reveal(stage);
          const [x, y] = pointOf(stage, 0.5, 0.75);
          await moveTo(x, y);
          ripple();
          stage.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
          // Let go once the beer (plus settling foam) reaches the middle of the band.
          const band = await find(".pour-band");
          const lo = parseFloat(band.style.bottom), hi = lo + parseFloat(band.style.height);
          for (let t = 0; t < 6000; t += 30) {
            await wait(30);
            const beer = parseFloat((root.current?.querySelector(".pour-beer") as HTMLElement)?.style.height || "0");
            const foam = parseFloat((root.current?.querySelector(".pour-foam") as HTMLElement)?.style.height || "0");
            if (beer + foam * 0.35 >= lo + (hi - lo) * 0.45) break;
          }
          stage.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
          await wait(1500);
        });

        setFinger((f) => ({ ...f, show: false }));
        await wait(700);
      }
    })().catch(() => {});

    return () => {
      alive = false;
    };
  }, [run, root, body]);

  return (
    <div className="tour-layer" aria-hidden="true">
      <span
        className={`tour-finger${finger.show ? " show" : ""}`}
        style={{ transform: `translate(${finger.x}px, ${finger.y}px)` }}
      >
        <span key={finger.tap} className="tour-ripple" />
        👆
      </span>
    </div>
  );
}
