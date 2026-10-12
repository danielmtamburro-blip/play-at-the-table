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
    home: "Your menu, offers and Wi-Fi, all in one place",
    call: "Guests call staff with one tap",
    kids: "Kids colour in while they wait",
    sport: "Games for every age, from 3 to teens",
    bill: "…and the table spins to see who pays!",
    menu: "Prices, allergens and today's specials",
    yourTurn: "Your turn! Tap anything to explore.",
  },
  ar: {
    home: "القائمة والعروض والواي فاي في مكان واحد",
    call: "الضيوف ينادون الموظفين بضغطة واحدة",
    kids: "الأطفال يلوّنون أثناء الانتظار",
    sport: "ألعاب لكل الأعمار",
    bill: "…والطاولة تلف العجلة لترى من يدفع!",
    menu: "الأسعار ومسببات الحساسية وأطباق اليوم",
    yourTurn: "دورك! اضغط على أي شيء للاستكشاف.",
  },
};

const DEMO_NAMES = ["Sara", "Omar", "Dan", "Lily"];
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
    const prevNames = (() => {
      try {
        return sessionStorage.getItem("patt-names");
      } catch {
        return null;
      }
    })();
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
    /** Glide the finger to a point (relative to the phone) and tap. */
    const moveTo = async (x: number, y: number) => {
      setFinger((f) => ({ ...f, x, y, show: true }));
      await wait(650);
    };
    const pointOf = (el: Element, fx = 0.5, fy = 0.5) => {
      const r = el.getBoundingClientRect(), base = root.current!.getBoundingClientRect();
      return [r.left - base.left + r.width * fx, r.top - base.top + r.height * fy] as const;
    };
    /** Scroll only inside the phone (never the sales page) so the element is visible. */
    const reveal = async (el: HTMLElement) => {
      const b = body.current;
      if (!b) return;
      const er = el.getBoundingClientRect(), br = b.getBoundingClientRect();
      if (er.top >= br.top + 8 && er.bottom <= br.bottom - 8) return;
      b.scrollTo({ top: b.scrollTop + (er.top - br.top) - br.height / 3, behavior: "smooth" });
      await wait(450);
    };
    const tap = async (sel: string) => {
      const el = await find(sel);
      await reveal(el);
      const [x, y] = pointOf(el);
      await moveTo(x, y);
      setFinger((f) => ({ ...f, tap: f.tap + 1 }));
      el.click();
      await wait(450);
    };
    /** Tap a spot inside an element that listens for pointerdown (canvas, arenas). */
    const press = async (sel: string, fx: number, fy: number) => {
      const el = await find(sel);
      await reveal(el);
      const [x, y] = pointOf(el, fx, fy);
      await moveTo(x, y);
      setFinger((f) => ({ ...f, tap: f.tap + 1 }));
      const r = el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * fx, clientY: r.top + r.height * fy }));
      await wait(500);
    };
    const back = () => tap(".g-back");
    const scrollBody = async (to: number) => {
      body.current?.scrollTo({ top: to, behavior: "smooth" });
      await wait(1100);
    };

    (async () => {
      await wait(1800);
      while (ok()) {
        homeRef.current();
        await wait(400);
        caption("home");
        await scrollBody(260);
        await scrollBody(0);
        caption("call");
        await tap('[data-act="call"]');
        await wait(1400);

        caption("kids");
        await tap('[data-tile="kids"]');
        await tap('[data-game="colour"]');
        await wait(500);
        const fills: [number, number, number][] = [[0, 0.45, 0.5], [2, 0.88, 0.5], [5, 0.2, 0.2], [7, 0.3, 0.95]];
        for (const [sw, fx, fy] of fills) {
          await tap(`.swatches button:nth-child(${sw + 1})`);
          await press(".color-canvas", fx, fy);
        }
        await wait(900);
        await back();

        caption("sport");
        await tap('[data-game="penalty"]');
        await wait(1200);
        await tap('[data-act="shoot"]');
        await wait(2200);
        await back();
        await back();

        caption("bill");
        try {
          sessionStorage.setItem("patt-names", JSON.stringify(DEMO_NAMES));
        } catch {}
        await tap('[data-tile="group"]');
        await tap('[data-game="bill"]');
        await wait(500);
        await tap('[data-act="spin"]');
        await wait(5200);
        await back();
        await back();

        caption("menu");
        await tap('[data-tile="menu"]');
        await tap(".g-tabs button:nth-child(2)");
        await scrollBody(240);
        await wait(800);
        await scrollBody(0);
        await back();
        setFinger((f) => ({ ...f, show: false }));
        await wait(1500);
      }
    })().catch(() => {});

    return () => {
      alive = false;
      try {
        if (prevNames == null) sessionStorage.removeItem("patt-names");
        else sessionStorage.setItem("patt-names", prevNames);
      } catch {}
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
