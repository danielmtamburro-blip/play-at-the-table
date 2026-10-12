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
    offers: "📣 Tonight's offers and what's on",
    menu: "🍽️ Your menu, with prices and allergens",
    lock: "🍽️ Dinner's here! Parents pause the games",
    baby: "🍓 Dancing fruit for babies and toddlers",
    keepy: "⚽ Keepy-uppy for the kids",
    racer: "🏎️ Car racing while they wait",
    quiz: "🧠 Table trivia for the grown-ups",
    split: "🧮 Split the bill in seconds",
    wheel: "🎡 Who pays? Spin the wheel!",
    pour: "🍺 Drinking games, age-checked",
    date: "❤️ First-date questions for couples",
    board: "🏆 Live leaderboards keep tables playing",
    yourTurn: "Your turn! Tap anything to explore.",
  },
  ar: {
    home: "صفحة مكانك الخاصة: مسحة واحدة بدون تطبيق",
    offers: "📣 عروض الليلة والفعاليات",
    menu: "🍽️ قائمتك بالأسعار ومسببات الحساسية",
    lock: "🍽️ وصل العشاء! الأهل يوقفون الألعاب",
    baby: "🍓 فواكه راقصة للرضّع والصغار",
    keepy: "⚽ تنطيط الكرة للأطفال",
    racer: "🏎️ سباق سيارات أثناء الانتظار",
    quiz: "🧠 مسابقات للكبار",
    split: "🧮 قسّم الحساب في ثوانٍ",
    wheel: "🎡 من يدفع؟ لف العجلة!",
    pour: "🍺 ألعاب المشروبات مع التحقق من العمر",
    date: "❤️ أسئلة الموعد الأول للأزواج",
    board: "🏆 لوحات المتصدرين تبقي الطاولات تلعب",
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
        // ?tour=now starts straight away (handy for testing and screen recordings).
        if (!el || typeof IntersectionObserver === "undefined" || location.search.includes("tour=now")) return res();
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

        const kicks = async (n: number) => {
          for (let k = 0; k < n; k++) {
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
        };

        // The venue's page, tonight's offers and events
        await part(async () => {
          caption("home");
          await wait(700);
          caption("offers");
          const row = await find(".g-scroll-sec .g-scroller");
          await reveal(row);
          for (const left of [230, 460, 0]) {
            const [x, y] = pointOf(row, 0.7, 0.5);
            await moveTo(x, y, 250);
            row.scrollTo({ left, behavior: "smooth" });
            await wait(650);
          }
        });

        // Menu, then drinks
        await part(async () => {
          caption("menu");
          await tap('[data-q="menu"]', 500);
          await scrollBody(220, 700);
          await tap('[data-act="menu-drinks"]', 700);
        });

        // Dinner's here: lock, then a grown-up unlocks
        await part(async () => {
          caption("lock");
          await tap('[data-tile="kids"]', 350);
          await tap(".kl-dinner", 1400);
          await tap(".kl-grown", 250);
          const label = (await find(".kl-gate label")).textContent ?? "";
          const m = label.match(/(\d+)\s*×\s*(\d+)/);
          const ans = (await find("#kl-ans")) as HTMLInputElement;
          await moveTo(...pointOf(ans));
          ripple();
          setInput(ans, m ? String(Number(m[1]) * Number(m[2])) : "");
          await wait(250);
          await tap(".kl-gate .g-btn", 250);
        });

        // Babies and toddlers: dancing fruit
        await part(async () => {
          caption("baby");
          await tap('[data-tile="kids"]', 300);
          await tap('[data-game="fruit"]', 700);
          await tap(".fruit-stage .fruit:nth-child(2)", 500);
          await tap(".fruit-stage .fruit:nth-child(6)", 700);
        });

        // Kids: keepy-uppy and car racing
        await part(async () => {
          caption("keepy");
          await openGame("keepy");
          await tap('[data-act="start"]', 150);
          await kicks(3);
        });
        await part(async () => {
          caption("racer");
          await openGame("racer");
          await tap('[data-act="start"]', 250);
          for (const side of ["left", "right", "right"]) await tap(`[data-act="${side}"]`, 280);
        });

        // Adults: trivia
        await part(async () => {
          caption("quiz");
          await openGame("trivia");
          await tap("[data-right]", 900);
        });

        // Split the bill
        await part(async () => {
          caption("split");
          await tap('[data-tile="group"]', 300);
          await tap('[data-game="split"]', 400);
          const total = (await find("#split-total")) as HTMLInputElement;
          await moveTo(...pointOf(total));
          ripple();
          for (const v of ["3", "34", "348"]) (setInput(total, v), await wait(160));
          await tap('[aria-label="One more person"]', 200);
          await tap('[aria-label="One more person"]', 200);
          await tap(".split-card .g-seg button:nth-child(3)", 900);
        });

        // Who pays? Spin the wheel
        await part(async () => {
          caption("wheel");
          await tap('[data-tile="group"]', 300);
          await tap('[data-game="bill"]', 400);
          await tap('[data-act="spin"]', 4700);
        });

        // Drinking games: pour it right
        await part(async () => {
          caption("pour");
          await openGame("pour", "drink");
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
          await wait(1100);
        });

        // Date night: first-date questions
        await part(async () => {
          caption("date");
          await tap('[data-tile="date"]', 300);
          await tap('[data-game="deck:first"]', 1100);
          await tap('[data-act="next"]', 1100);
        });

        // Leaderboards
        await part(async () => {
          caption("board");
          await tap('[data-tab="play"]', 1600);
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
