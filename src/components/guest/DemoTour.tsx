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
    home: "Menu, offers and Wi-Fi in one scan",
    call: "Call a server with one tap",
    keepy: "⚽ Keepy-uppy for the kids",
    racer: "🏎️ Car racing while they wait",
    cards: "🃏 Card games for the grown-ups",
    versus: "⚔️ Challenge another table, live!",
    yourTurn: "Your turn! Tap anything to explore.",
  },
  ar: {
    home: "القائمة والعروض والواي فاي بمسحة واحدة",
    call: "نادِ النادل بضغطة واحدة",
    keepy: "⚽ تنطيط الكرة للأطفال",
    racer: "🏎️ سباق سيارات أثناء الانتظار",
    cards: "🃏 ألعاب ورق للكبار",
    versus: "⚔️ تحدَّ طاولة أخرى مباشرة!",
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
    el.addEventListener("pointerdown", onUser, true);
    el.addEventListener("wheel", onUser, { passive: true, capture: true });
    el.addEventListener("keydown", onUser, true);
    return () => {
      clearTimeout(idle);
      el.removeEventListener("pointerdown", onUser, true);
      el.removeEventListener("wheel", onUser, true);
      el.removeEventListener("keydown", onUser, true);
    };
  }, [root]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    const back = () => tap(".g-back", 200);
    const scrollBody = async (to: number, ms = 650) => {
      body.current?.scrollTo({ top: to, behavior: "smooth" });
      await wait(ms);
    };
    const setInput = (el: HTMLInputElement, v: string) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
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

    (async () => {
      await wait(1200);
      while (ok()) {
        homeRef.current();
        await wait(300);

        await part(async () => {
          caption("home");
          await scrollBody(200);
          await scrollBody(0, 450);
          caption("call");
          await tap('[data-act="call"]', 900);
        });

        await part(async () => {
          caption("keepy");
          await tap('[data-tile="kids"]');
          await tap('[data-game="keepy"]');
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
          await wait(300);
        });

        await part(async () => {
          caption("racer");
          await tap('[data-tile="kids"]');
          await tap('[data-game="racer"]');
          await tap('[data-act="start"]', 300);
          for (const side of ["left", "right", "right", "left"]) await tap(`[data-act="${side}"]`, 300);
          await wait(250);
        });

        await part(async () => {
          caption("cards");
          await tap('[data-tile="drink"]');
          if (root.current?.querySelector('[data-act="age-yes"]')) await tap('[data-act="age-yes"]');
          await tap('[data-game="hilo"]', 400);
          await tap('[data-act="higher"]', 650);
          await tap('[data-act="lower"]', 650);
          await tap('[data-act="higher"]', 700);
        });

        await part(async () => {
          caption("versus");
          await tap('[data-tile="versus"]', 300);
          const input = (await find("#vs-to")) as HTMLInputElement;
          await moveTo(...pointOf(input));
          ripple();
          for (const d of ["", "7"]) (setInput(input, d), await wait(220));
          await tap(".vs-send", 1500);
          await tap('[data-act="vs-cancel"]', 200);
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
