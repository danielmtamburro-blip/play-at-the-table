"use client";
// Parent controls: "Dinner's here!" locks the games straight away, or a play timer locks them when it runs out.
// Only a grown-up can unlock (a quick sum). The lock survives a page refresh.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import type { Lang } from "@/lib/types";
import { useGuest } from "./context";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    parents: "For parents", dinner: "Dinner's here!", dinnerS: "Lock the games while you eat", timer: "Play timer", min: "min",
    left: "left", cancel: "Cancel timer", dinnerT: "Dinner's here!", dinnerP: "Time to eat with your family. The games will be waiting for you after.",
    timeT: "Time's up!", timeP: "Food's coming soon. Come back and play after you've eaten!", yum: "Yum yum!",
    grown: "Grown-ups: unlock", gateQ: "What is {a} × {b}?", ok: "Unlock", wrong: "Not quite. Ask a grown-up!", back: "Back",
    pill: "Kids timer", sheet: "Kids timer", close: "Close", lockNow: "Lock now: dinner's here",
  },
  ar: {
    parents: "للأهل", dinner: "وصل العشاء!", dinnerS: "أوقف الألعاب أثناء الأكل", timer: "مؤقت اللعب", min: "د",
    left: "متبقية", cancel: "إلغاء المؤقت", dinnerT: "وصل العشاء!", dinnerP: "حان وقت الأكل مع عائلتك. الألعاب ستنتظرك بعد ذلك.",
    timeT: "انتهى الوقت!", timeP: "الطعام في الطريق. عد والعب بعد أن تأكل!", yum: "لذيذ!",
    grown: "للكبار: فتح القفل", gateQ: "كم يساوي {a} × {b}؟", ok: "فتح", wrong: "ليس تماماً. اطلب من أحد الكبار!", back: "رجوع",
    pill: "مؤقت الأطفال", sheet: "مؤقت الأطفال", close: "إغلاق", lockNow: "أوقف الآن: وصل العشاء",
  },
};

type State = { until: number | null; locked: "dinner" | "time" | null };
type Ctx = State & { lockNow: () => void; startTimer: (min: number) => void; cancelTimer: () => void; openSheet: () => void };
const KidsContext = createContext<Ctx | null>(null);
export const useKids = () => useContext(KidsContext);

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function KidsLockProvider({ children }: { children: React.ReactNode }) {
  const { venue, demo, log } = useGuest();
  const key = `patt-kids-${venue.id}`;
  const [st, setSt] = useState<State>({ until: null, locked: null });
  const [sheet, setSheet] = useState(false);
  const [, tick] = useState(0);

  // Restore after a refresh (not in the sales-page demo).
  useEffect(() => {
    if (demo) return;
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null") as State | null;
      if (v) setSt(v);
    } catch {}
  }, [key, demo]);
  const save = useCallback(
    (v: State) => {
      setSt(v);
      if (demo) return;
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
    },
    [key, demo],
  );

  // Count down; lock when the timer runs out.
  useEffect(() => {
    if (!st.until || st.locked) return;
    const t = setInterval(() => {
      if (Date.now() >= st.until!) {
        save({ until: null, locked: "time" });
        buzz(HAPTIC.win);
      } else tick((n) => n + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [st.until, st.locked, save]);

  const ctx: Ctx = {
    ...st,
    lockNow: () => (save({ until: null, locked: "dinner" }), setSheet(false), log("view", { module: "kids_lock" })),
    startTimer: (min) => (save({ until: Date.now() + min * 60_000, locked: null }), setSheet(false), log("view", { module: "kids_timer", item: String(min) })),
    cancelTimer: () => save({ until: null, locked: null }),
    openSheet: () => setSheet(true),
  };

  return (
    <KidsContext.Provider value={ctx}>
      {children}
      {sheet && !st.locked && <TimerSheet onClose={() => setSheet(false)} />}
      {st.locked && <LockScreen reason={st.locked} onUnlock={() => save({ until: null, locked: null })} />}
    </KidsContext.Provider>
  );
}

/** Dinner's-here button and timer choices. Used on the kids page and in the pop-up sheet. */
export function ParentControls() {
  const { lang } = useGuest();
  const k = useKids();
  const u = UI[lang];
  if (!k) return null;
  return (
    <div className="kl-controls">
      <button className="kl-dinner" onClick={k.lockNow}>
        <span aria-hidden="true">🍽️</span>
        <span>
          <b>{u.dinner}</b>
          <small>{u.dinnerS}</small>
        </span>
      </button>
      {k.until ? (
        <div className="kl-running">
          <span>
            ⏱ <b>{fmt(k.until - Date.now())}</b> {u.left}
          </span>
          <button className="g-btn alt" onClick={k.cancelTimer}>
            {u.cancel}
          </button>
        </div>
      ) : (
        <div className="kl-timer">
          <span>⏱ {u.timer}</span>
          <div className="g-seg">
            {[10, 15, 20, 30].map((m) => (
              <button key={m} type="button" onClick={() => k.startTimer(m)}>
                {m} {u.min}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** "For parents" card at the top of the kids page. */
export function ParentBar() {
  const { lang } = useGuest();
  return (
    <section className="kl-bar">
      <h3 className="g-band-h">👪 {UI[lang].parents}</h3>
      <ParentControls />
    </section>
  );
}

/** Small floating pill on kids' game screens: shows the countdown, opens the parent sheet. */
export function KidsPill() {
  const { lang } = useGuest();
  const k = useKids();
  if (!k || k.locked) return null;
  return (
    <button className={`kl-pill${k.until ? " on" : ""}`} onClick={k.openSheet} data-act="kids-timer">
      {k.until ? `⏱ ${fmt(k.until - Date.now())}` : `⏱ ${UI[lang].pill}`}
    </button>
  );
}

function TimerSheet({ onClose }: { onClose: () => void }) {
  const { lang } = useGuest();
  const u = UI[lang];
  return (
    <div className="sheet kl-sheet" role="dialog" aria-label={u.sheet}>
      <h3>👪 {u.sheet}</h3>
      <ParentControls />
      <button className="g-btn alt" onClick={onClose}>
        {u.close}
      </button>
    </div>
  );
}

function LockScreen({ reason, onUnlock }: { reason: "dinner" | "time"; onUnlock: () => void }) {
  const { lang } = useGuest();
  const u = UI[lang];
  const [gate, setGate] = useState(false);
  const [q] = useState(() => ({ a: 3 + Math.floor(Math.random() * 7), b: 3 + Math.floor(Math.random() * 7) }));
  const [ans, setAns] = useState("");
  const [bad, setBad] = useState(false);

  return (
    <div className={`kl-lock ${reason}`} role="dialog" aria-modal="true" aria-label={reason === "dinner" ? u.dinnerT : u.timeT}>
      <div className="kl-float" aria-hidden="true">
        {["🍕", "🍝", "🥗", "🍔", "🍟", "🥤", "🍦", "🍓", "🥪", "🍗"].map((e, i) => (
          <span key={i} className={`kf kf${i}`}>
            {e}
          </span>
        ))}
      </div>
      <div className="kl-card">
        <span className="kl-plate" aria-hidden="true">
          {reason === "dinner" ? "🍽️" : "⏰"}
        </span>
        <h2>{reason === "dinner" ? u.dinnerT : u.timeT}</h2>
        <p>{reason === "dinner" ? u.dinnerP : u.timeP}</p>
        <span className="kl-yum">{u.yum} 😋</span>
        {!gate ? (
          <button className="kl-grown" onClick={() => setGate(true)}>
            🔒 {u.grown}
          </button>
        ) : (
          <form
            className="kl-gate"
            onSubmit={(e) => {
              e.preventDefault();
              if (Number(ans) === q.a * q.b) onUnlock();
              else (setBad(true), setAns(""), buzz(HAPTIC.bad));
            }}
          >
            <label htmlFor="kl-ans">{u.gateQ.replace("{a}", String(q.a)).replace("{b}", String(q.b))}</label>
            <div className="g-row">
              <input id="kl-ans" inputMode="numeric" value={ans} onChange={(e) => (setAns(e.target.value.replace(/\D/g, "").slice(0, 3)), setBad(false))} autoFocus />
              <button className="g-btn">{u.ok}</button>
            </div>
            {bad && <span className="kl-bad">{u.wrong}</span>}
            <button type="button" className="kl-cancel" onClick={() => setGate(false)}>
              {u.back}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
