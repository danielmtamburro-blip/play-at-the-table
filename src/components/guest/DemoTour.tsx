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
    home: "Your venue's own page: one scan, no app",
    menu: "🥗 Your menu, filtered by dietary needs",
    drinks: "🍹 And the drinks menu",
    slice: "🍉 Fruit Slash",
    stack: "🏙️ Sky Tower",
    hoops: "🏀 Hoop Shot",
    sudoku: "🔢 Sudoku",
    words: "🔍 Word search",
    sports: "⚽ Sports trivia",
    date: "❤️ First-date questions",
    darts: "🎯 Darts scorer",
    pool: "🎱 Pool scoreboard",
    versus: "🏆 Challenge another table",
    board: "🏅 Live leaderboards",
    yourTurn: "Your turn! Tap anything to explore.",
  },
  ar: {
    home: "صفحة مكانك الخاصة: مسحة واحدة بدون تطبيق",
    menu: "🥗 قائمتك مع فلتر الأنظمة الغذائية",
    drinks: "🍹 وقائمة المشروبات",
    slice: "🍉 تقطيع الفواكه",
    stack: "🏙️ برج السماء",
    hoops: "🏀 رمية السلة",
    sudoku: "🔢 سودوكو",
    words: "🔍 البحث عن الكلمات",
    sports: "⚽ مسابقة رياضية",
    date: "❤️ أسئلة الموعد الأول",
    darts: "🎯 حاسبة السهام",
    pool: "🎱 لوحة البلياردو",
    versus: "🏆 تحدَّ طاولة أخرى",
    board: "🏅 لوحات المتصدرين",
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
    const moveTo = async (x: number, y: number, ms = 260) => {
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
    const tap = async (sel: string, after = 200) => {
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
        // ?tour=now starts straight away (handy for testing and screen recordings).
        if (!el || typeof IntersectionObserver === "undefined" || location.search.includes("tour=now")) return res();
        const io = new IntersectionObserver((es) => {
          if (es.some((e) => e.isIntersecting)) (io.disconnect(), res());
        }, { threshold: 0.15 });
        io.observe(el);
      });

    (async () => {
      await visible();
      while (ok()) {
        homeRef.current();
        await wait(60);

        /** Open the Play tab, then a game card on it. */
        const openGame = async (key: string, chip?: string) => {
          await tap('[data-tab="play"]', 250);
          if (chip) await tap(`[data-chip="${chip}"]`, 250);
          await tap(`[data-card="${key}"]`, 350);
        };
        const setInput = (el: HTMLInputElement, v: string) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        };

        const canvasPt = (cv: Element, fx: number, fy: number) => {
          const r = cv.getBoundingClientRect();
          return [r.left + r.width * fx, r.top + r.height * fy] as const;
        };
        const fire = (cv: Element, type: string, cx: number, cy: number) =>
          cv.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: cx, clientY: cy, pointerId: 7, isPrimary: true }));
        /** Drag the finger across a game canvas (fractions of its size), sending real pointer events. */
        const drag = async (cv: Element, from: [number, number], to: [number, number], ms: number, steps = 8) => {
          const [x0, y0] = canvasPt(cv, ...from);
          await moveTo(...pointOf(cv, ...from), 120);
          ripple();
          fire(cv, "pointerdown", x0, y0);
          for (let i = 1; i <= steps; i++) {
            const fx = from[0] + ((to[0] - from[0]) * i) / steps, fy = from[1] + ((to[1] - from[1]) * i) / steps;
            const [x, y] = canvasPt(cv, fx, fy);
            setFinger((f) => ({ ...f, ...(() => { const [px, py] = pointOf(cv, fx, fy); return { x: px, y: py }; })() }));
            fire(cv, "pointermove", x, y);
            await wait(ms / steps);
          }
          const [x1, y1] = canvasPt(cv, ...to);
          fire(cv, "pointerup", x1, y1);
        };
        const startGame = async (key: string, chip?: string) => {
          await openGame(key, chip);
          await tap('[data-act="start"]', 250);
          return find(".ax-canvas");
        };

        // The venue's page, then the menu filtered by diet, then drinks
        await part(async () => {
          caption("home");
          const row = await find(".g-scroll-sec .g-scroller").catch(() => null);
          if (row) {
            const [x, y] = pointOf(row, 0.7, 0.5);
            await moveTo(x, y, 200);
            row.scrollTo({ left: 240, behavior: "smooth" });
            await wait(700);
          }
          caption("menu");
          await tap('[data-q="menu"]', 350);
          await tap('[data-act="diet"]', 300);
          await tap('[data-diet="v"]', 700);
          await scrollBody(260, 600);
        });
        await part(async () => {
          caption("drinks");
          if (root.current?.querySelector('[data-q="drinks"]')) await tap('[data-q="drinks"]', 400);
          else (await tap('[data-q="menu"]', 300), await tap('[data-act="menu-drinks"]', 400));
          await scrollBody(240, 700);
        });

        // Fruit Slash: swipe through the fruit
        await part(async () => {
          caption("slice");
          const cv = (await startGame("slice")) as HTMLCanvasElement;
          // Swipe through whichever fruit is in the air, for about five seconds.
          for (let t = 0, n = 0; t < 5200 && n < 7; ) {
            const fr = (cv.dataset.fruit || "").split(" ").filter(Boolean).map((p) => p.split(",").map((v) => Number(v) / 1000));
            const target = fr.find(([, y]) => y > 0.12 && y < 0.8);
            if (!target) (await wait(80), (t += 80));
            else {
              const [fx, fy] = target, dir = n % 2 ? -1 : 1;
              await drag(cv, [Math.min(0.95, Math.max(0.05, fx - 0.28 * dir)), fy - 0.05], [Math.min(0.95, Math.max(0.05, fx + 0.28 * dir)), fy + 0.05], 110, 5);
              n++;
              await wait(220);
              t += 600;
            }
          }
          await wait(400);
        });

        // Sky Tower: drop each floor right on top
        await part(async () => {
          caption("stack");
          const cv = (await startGame("stack")) as HTMLCanvasElement;
          const [x, y] = pointOf(cv, 0.5, 0.45);
          await moveTo(x, y, 150);
          for (let n = 0; n < 5; n++) {
            for (let t = 0; t < 2500; t += 20) {
              await wait(20);
              if (Math.abs(Number(cv.dataset.off ?? 999)) < 5) break;
            }
            ripple();
            fire(cv, "pointerdown", ...canvasPt(cv, 0.5, 0.45));
            await wait(120);
          }
          await wait(500);
        });

        // Hoop Shot: flick it in
        await part(async () => {
          caption("hoops");
          const cv = await startGame("hoops");
          for (let n = 0; n < 2; n++) {
            const h = cv.getBoundingClientRect().height;
            const by = (h - 78) / h;
            await drag(cv, [0.5, by], [0.5, by - 90 / h], 100, 5);
            await wait(1350);
          }
        });

        // Puzzles: sudoku and word search
        await part(async () => {
          caption("sudoku");
          await openGame("sudoku");
          for (let n = 0; n < 3; n++) {
            const cell = await find(".sudoku [data-sol]");
            const sol = cell.dataset.sol;
            await tap(".sudoku [data-sol]", 120);
            await tap(`.numpad [data-n="${sol}"]`, 220);
          }
          await wait(300);
        });
        await part(async () => {
          caption("words");
          await openGame("wordsearch");
          for (const n of [0, 1]) {
            await tap(`.ws [data-ws~="s${n}"]`, 150);
            await tap(`.ws [data-ws~="e${n}"]`, 450);
          }
        });

        // Sports trivia
        await part(async () => {
          caption("sports");
          await openGame("sports");
          await tap("[data-right]", 900);
        });

        // Date night: first-date questions
        await part(async () => {
          caption("date");
          await tap('[data-tile="date"]', 250);
          await tap('[data-game="deck:first"]', 900);
          await tap('[data-act="next"]', 900);
        });

        // Darts and pool scorers
        await part(async () => {
          caption("darts");
          await tap('[data-tile="bar"]', 250);
          await tap('[data-game="darts"]', 300);
          await tap('[data-act="darts-start"]', 300);
          for (const v of [60, 140, 180]) {
            await tap(`[data-score="${v}"]`, 150);
            await tap('[data-act="darts-enter"]', 350);
          }
        });
        await part(async () => {
          caption("pool");
          await tap('[data-tile="bar"]', 250);
          await tap('[data-game="pool"]', 300);
          await tap('[data-act="pool-start"]', 350);
          await tap('[data-act="pool-won"]', 450);
          await tap('.pool-p:nth-child(2) [data-act="pool-won"]', 450);
          await tap('[data-act="pool-won"]', 700);
        });

        // Challenge another table
        await part(async () => {
          caption("versus");
          await tap('[data-tab="play"]', 250);
          await tap('[data-tile="versus"]', 450);
          const to = (await find("#vs-to")) as HTMLInputElement;
          await moveTo(...pointOf(to));
          ripple();
          setInput(to, "7");
          await wait(300);
          const team = (await find("#vs-team")) as HTMLInputElement;
          await moveTo(...pointOf(team));
          ripple();
          for (const v of ["The", "The Cham", "The Champions"]) (setInput(team, v), await wait(150));
          await wait(800);
        });

        // Leaderboards
        await part(async () => {
          caption("board");
          await tap('[data-tab="play"]', 1300);
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
