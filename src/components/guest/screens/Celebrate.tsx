"use client";
// Celebrations: pick the occasion and a name, then turn the phone into a party card the table can hold up.
// Optionally tell the staff (they might bring a candle). Names are only sent to the venue if the guest asks.
import { useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Lang } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { useMusicBox } from "./Toddler";

type Occ = { k: string; e: string; en: string; ar: string; head: Record<Lang, string>; num?: Record<Lang, string>; c: [string, string] };
const OCCASIONS: Occ[] = [
  { k: "birthday", e: "🎂", en: "Birthday", ar: "عيد ميلاد", head: { en: "Happy Birthday, {n}!", ar: "عيد ميلاد سعيد يا {n}!" }, num: { en: "{x} today! 🎉", ar: "{x} سنة اليوم! 🎉" }, c: ["#FF5A4E", "#FFB51F"] },
  { k: "anniversary", e: "💍", en: "Anniversary", ar: "ذكرى زواج", head: { en: "Happy Anniversary, {n}!", ar: "ذكرى سعيدة يا {n}!" }, num: { en: "{x} years together ❤️", ar: "{x} سنوات معاً ❤️" }, c: ["#F0457F", "#6E4BFF"] },
  { k: "engaged", e: "💎", en: "Engagement", ar: "خطوبة", head: { en: "Congratulations, {n}!", ar: "مبروك يا {n}!" }, c: ["#6E4BFF", "#4CC9F0"] },
  { k: "graduation", e: "🎓", en: "Graduation", ar: "تخرّج", head: { en: "Well done, {n}!", ar: "أحسنت يا {n}!" }, c: ["#1B1740", "#12A594"] },
  { k: "job", e: "💼", en: "New job", ar: "وظيفة جديدة", head: { en: "Congrats on the new job, {n}!", ar: "مبروك الوظيفة الجديدة يا {n}!" }, c: ["#12A594", "#FFB51F"] },
  { k: "baby", e: "👶", en: "Baby news", ar: "مولود جديد", head: { en: "Congratulations, {n}!", ar: "ألف مبروك يا {n}!" }, c: ["#4CC9F0", "#F0457F"] },
  { k: "welcome", e: "✈️", en: "Welcome home", ar: "عودة حميدة", head: { en: "Welcome home, {n}!", ar: "أهلاً بعودتك يا {n}!" }, c: ["#0A84B5", "#FFB51F"] },
  { k: "cheers", e: "🥂", en: "Just because", ar: "بلا مناسبة", head: { en: "Cheers to {n}!", ar: "في صحة {n}!" }, c: ["#E3A94B", "#FF5A4E"] },
];

const UI: Record<Lang, Record<string, string>> = {
  en: {
    title: "Celebrations", sub: "Birthday? Anniversary? Turn your phone into a party for the table.", what: "What are we celebrating?",
    who: "Who's it for?", whoPh: "e.g. Sarah, or Sam & Alex", age: "How old? (optional)", years: "How many years? (optional)", go: "Let's celebrate! 🎉",
    from: "From everyone at table {t}", fromNoTable: "From everyone at the table", song: "Play the song", more: "More confetti", tell: "Tell the staff",
    told: "The team knows! They might just pop over. 🎂", toasts: "Toast time", back: "Change", tellNote: "Lets the staff know what you're celebrating.",
    toastSub: "Take turns. Read one out and answer it for {n}.", next: "Next", done: "Back to the party",
  },
  ar: {
    title: "احتفالات", sub: "عيد ميلاد؟ ذكرى؟ حوّل هاتفك إلى حفلة للطاولة.", what: "بماذا نحتفل؟",
    who: "لمن الاحتفال؟", whoPh: "مثلاً سارة، أو سامي وعلياء", age: "كم العمر؟ (اختياري)", years: "كم سنة؟ (اختياري)", go: "هيا نحتفل! 🎉",
    from: "من الجميع على الطاولة {t}", fromNoTable: "من الجميع على الطاولة", song: "شغّل الأغنية", more: "مزيد من القصاصات", tell: "أخبر الموظفين",
    told: "الفريق يعرف الآن! قد يمرّون عليكم. 🎂", toasts: "وقت التهاني", back: "تغيير", tellNote: "يُعلم الموظفين بمناسبتكم.",
    toastSub: "بالتناوب: اقرأ سؤالاً وأجب عنه لـ {n}.", next: "التالي", done: "العودة للحفلة",
  },
};

const TOASTS: Record<Lang, string[]> = {
  en: [
    "Share your favourite memory with {n}.", "Describe {n} in three words.", "What's the funniest thing {n} has ever done?", "What do you most admire about {n}?",
    "If {n} were a film, what would it be called?", "Where should {n} go to celebrate next?", "What's one wish you have for {n} this year?",
    "Who at the table has known {n} the longest? Tell us how you met.", "What song sums up {n}?", "Raise a glass and finish this: \"To {n}, because…\"",
  ],
  ar: [
    "شارك أجمل ذكرى لك مع {n}.", "صف {n} بثلاث كلمات.", "ما أطرف شيء فعله {n}؟", "ما أكثر ما تقدّره في {n}؟",
    "لو كان {n} فيلماً، ماذا سيكون اسمه؟", "أين يجب أن يحتفل {n} المرة القادمة؟", "ما أمنيتك لـ {n} هذا العام؟",
    "من يعرف {n} منذ أطول وقت؟ أخبرنا كيف تعارفتم.", "ما الأغنية التي تلخّص {n}؟", "ارفع كأسك وأكمل: \"إلى {n}، لأن…\"",
  ],
};

// Happy Birthday (public domain) and a short fanfare for everything else.
const BIRTHDAY: [string, number][] = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
];
const FANFARE: [string, number][] = [["C5", 0.5], ["E5", 0.5], ["G5", 0.5], ["C6", 1.5], ["G5", 0.5], ["C6", 2.5]];

function Confetti({ burst }: { burst: number }) {
  const cols = ["#FF5A4E", "#FFB51F", "#12A594", "#6E4BFF", "#F0457F", "#4CC9F0", "#FFFFFF"];
  return (
    <div className="cel-confetti" key={burst} aria-hidden="true">
      {Array.from({ length: 70 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            background: cols[i % cols.length],
            animationDelay: `${Math.random() * 1.2}s`,
            animationDuration: `${2.6 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            width: `${6 + Math.random() * 6}px`,
            height: `${10 + Math.random() * 8}px`,
          }}
        />
      ))}
    </div>
  );
}

export function Celebrate() {
  const { venue, table, lang, L, demo, log } = useGuest();
  const ui = UI[lang];
  const [occ, setOcc] = useState<Occ | null>(null);
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  const [stage, setStage] = useState<"pick" | "party" | "toasts">("pick");
  const [burst, setBurst] = useState(0);
  const [told, setTold] = useState(false);
  const [toasts, setToasts] = useState<string[]>([]);
  const [ti, setTi] = useState(0);
  const music = useMusicBox(occ?.k === "birthday" ? BIRTHDAY : FANFARE, occ?.k === "birthday" ? 120 : 140, false);

  const who = name.trim() || (lang === "ar" ? "الجميع" : "you");
  const head = occ ? occ.head[lang].replace("{n}", who) : "";
  const sub = occ?.num && num ? occ.num[lang].replace("{x}", num) : "";

  async function tell() {
    if (!occ || told) return;
    setTold(true);
    buzz();
    if (demo || venue.id === "sample" || !table) return;
    const note = `${occ.e} ${occ.en}${name.trim() ? ` · ${name.trim().slice(0, 30)}` : ""}${num ? ` · ${num}` : ""}`.slice(0, 80);
    await getBrowserClient()!.from("service_requests").insert({ venue_id: venue.id, table_label: table, kind: "celebrate", note });
  }

  if (stage === "party" && occ)
    return (
      <div className="cel-party" style={{ background: `linear-gradient(150deg, ${occ.c[0]}, ${occ.c[1]})` }}>
        <Confetti burst={burst} />
        <span className="cel-emoji" aria-hidden="true">
          {occ.e}
        </span>
        <h2>{head}</h2>
        {sub && <p className="cel-sub">{sub}</p>}
        <p className="cel-from">
          {table ? ui.from.replace("{t}", table) : ui.fromNoTable} · {L(venue.name)}
        </p>
        <div className="cel-actions">
          <button className="cel-btn" onClick={music.toggle}>
            {music.on ? "⏸" : "🎵"} {ui.song}
          </button>
          <button className="cel-btn" onClick={() => (setBurst((b) => b + 1), buzz(HAPTIC.win))}>
            🎉 {ui.more}
          </button>
          <button
            className="cel-btn"
            onClick={() => {
              setToasts(shuffle(TOASTS[lang]).map((t) => t.split("{n}").join(who)));
              setTi(0);
              setStage("toasts");
            }}
          >
            🥂 {ui.toasts}
          </button>
          {venue.modules.service && table && (
            <button className="cel-btn" data-act="cel-tell" onClick={tell} disabled={told}>
              🔔 {ui.tell}
            </button>
          )}
        </div>
        {told && <p className="cel-told">{ui.told}</p>}
        <button className="cel-change" onClick={() => setStage("pick")}>
          {ui.back}
        </button>
      </div>
    );

  if (stage === "toasts" && occ)
    return (
      <>
        <div>
          <h2 className="g-h">
            {occ.e} {ui.toasts}
          </h2>
          <p className="g-sub">{ui.toastSub.replace("{n}", who)}</p>
        </div>
        <div className="prompt date">
          <span className="count">
            {(ti % toasts.length) + 1} / {toasts.length}
          </span>
          <p>{toasts[ti % toasts.length]}</p>
        </div>
        <div className="g-row">
          <button className="g-btn alt" onClick={() => setStage("party")}>
            {ui.done}
          </button>
          <button className="g-btn" onClick={() => setTi(ti + 1)}>
            {ui.next}
          </button>
        </div>
      </>
    );

  return (
    <>
      <div>
        <h2 className="g-h">🎉 {ui.title}</h2>
        <p className="g-sub">{ui.sub}</p>
      </div>
      <span className="split-label">{ui.what}</span>
      <div className="cel-grid">
        {OCCASIONS.map((o) => (
          <button
            key={o.k}
            className={`cel-occ${occ?.k === o.k ? " on" : ""}`}
            data-occ={o.k}
            onClick={() => (setOcc(o), setNum(""))}
          >
            <span className="glass-ico" aria-hidden="true" style={{ ["--c1" as string]: o.c[0], ["--c2" as string]: o.c[1] }}>
              {o.e}
            </span>
            {lang === "ar" ? o.ar : o.en}
          </button>
        ))}
      </div>
      {occ && (
        <form
          className="split-card"
          onSubmit={(e) => {
            e.preventDefault();
            setStage("party");
            setBurst((b) => b + 1);
            buzz(HAPTIC.win);
            log("view", { module: "celebrate", item: occ.k });
          }}
        >
          <label className="split-label" htmlFor="cel-name">
            {ui.who}
          </label>
          <input id="cel-name" className="cel-input" value={name} maxLength={30} placeholder={ui.whoPh} onChange={(e) => setName(e.target.value)} />
          {occ.num && (
            <>
              <label className="split-label" htmlFor="cel-num">
                {occ.k === "birthday" ? ui.age : ui.years}
              </label>
              <input id="cel-num" className="cel-input" inputMode="numeric" value={num} maxLength={3} onChange={(e) => setNum(e.target.value.replace(/\D/g, ""))} />
            </>
          )}
          <button className="g-btn" data-act="cel-go">
            {ui.go}
          </button>
        </form>
      )}
    </>
  );
}
