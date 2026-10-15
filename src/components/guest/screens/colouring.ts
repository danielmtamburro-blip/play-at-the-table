// Line drawings for the colouring game, drawn on a 600×600 canvas. Every shape is closed so it can be filled.
import type { Lang } from "@/lib/types";

export const PICTURES = ["fish", "butterfly", "rocket", "house", "cupcake", "flower", "cat", "car", "turtle", "icecream", "rainbow", "pattern"] as const;
export type Picture = (typeof PICTURES)[number];

export const PICTURE_NAMES: Record<Lang, Record<Picture, string>> = {
  en: {
    fish: "Fish", butterfly: "Butterfly", rocket: "Rocket", house: "House", cupcake: "Cupcake", flower: "Flower",
    cat: "Cat", car: "Car", turtle: "Turtle", icecream: "Ice cream", rainbow: "Rainbow", pattern: "Pattern",
  },
  ar: {
    fish: "سمكة", butterfly: "فراشة", rocket: "صاروخ", house: "بيت", cupcake: "كب كيك", flower: "زهرة",
    cat: "قطة", car: "سيارة", turtle: "سلحفاة", icecream: "آيس كريم", rainbow: "قوس قزح", pattern: "زخرفة",
  },
};

export const SIZE = 600;
const INK = "#1B1740";

export function drawPicture(ctx: CanvasRenderingContext2D, k: Picture) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const path = (f: () => void) => {
    ctx.beginPath();
    f();
    ctx.stroke();
  };
  // A white shape with an outline, covering anything drawn underneath it.
  const filled = (f: () => void) => {
    ctx.beginPath();
    f();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.stroke();
  };
  const circle = (x: number, y: number, r: number) => filled(() => ctx.arc(x, y, r, 0, Math.PI * 2));
  const dot = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  };
  // One outline around several overlapping circles (clouds, bushes).
  const blob = (cs: [number, number, number][]) => {
    ctx.lineWidth = 14;
    for (const [x, y, r] of cs) path(() => ctx.arc(x, y, r, 0, Math.PI * 2));
    ctx.lineWidth = 7;
    ctx.fillStyle = "#fff";
    for (const [x, y, r] of cs) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const star = (x: number, y: number, r: number) =>
    filled(() => {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
        if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath();
    });
  // Lines kept inside a shape (shell pattern, cone criss-cross).
  const inside = (clip: () => void, f: () => void) => {
    ctx.save();
    ctx.beginPath();
    clip();
    ctx.clip();
    f();
    ctx.restore();
    path(clip);
  };
  const mirror = (f: (s: (x: number) => number) => void) => {
    f((x) => x);
    f((x) => SIZE - x);
  };

  if (k === "fish") {
    path(() => { ctx.moveTo(0, 530); ctx.quadraticCurveTo(300, 480, 600, 530); });
    path(() => { ctx.moveTo(470, 530); ctx.quadraticCurveTo(440, 470, 480, 420); ctx.quadraticCurveTo(520, 470, 500, 530); });
    filled(() => { ctx.moveTo(420, 300); ctx.lineTo(560, 190); ctx.lineTo(540, 300); ctx.lineTo(560, 410); ctx.closePath(); });
    filled(() => { ctx.moveTo(220, 215); ctx.quadraticCurveTo(300, 90, 380, 215); });
    filled(() => { ctx.ellipse(270, 300, 180, 115, 0, 0, Math.PI * 2); });
    path(() => { ctx.moveTo(195, 205); ctx.quadraticCurveTo(250, 300, 195, 395); });
    for (const [x, y] of [[290, 250], [350, 250], [290, 330], [350, 330], [320, 290], [380, 290]])
      path(() => { ctx.arc(x, y, 26, Math.PI * 0.5, Math.PI * 1.5, true); });
    circle(150, 275, 24);
    dot(155, 272, 9);
    path(() => { ctx.moveTo(110, 330); ctx.quadraticCurveTo(130, 350, 155, 335); });
    for (const [x, y, r] of [[90, 180, 20], [60, 110, 14], [110, 60, 9]]) circle(x, y, r);
  } else if (k === "butterfly") {
    mirror((s) => {
      filled(() => { ctx.moveTo(s(290), 260); ctx.bezierCurveTo(s(200), 70, s(30), 80, s(60), 230); ctx.bezierCurveTo(s(80), 310, s(200), 315, s(290), 300); ctx.closePath(); });
      filled(() => { ctx.moveTo(s(290), 310); ctx.bezierCurveTo(s(180), 320, s(70), 380, s(110), 490); ctx.bezierCurveTo(s(150), 560, s(260), 480, s(290), 400); ctx.closePath(); });
      circle(s(165), 205, 38);
      circle(s(110), 245, 16);
      circle(s(170), 425, 30);
      path(() => { ctx.moveTo(s(292), 118); ctx.quadraticCurveTo(s(262), 60, s(225), 48); });
      circle(s(222), 46, 12);
    });
    filled(() => ctx.ellipse(300, 330, 24, 150, 0, 0, Math.PI * 2));
    circle(300, 150, 32);
    for (const y of [260, 320, 380]) path(() => { ctx.moveTo(280, y); ctx.lineTo(320, y); });
  } else if (k === "rocket") {
    for (const [x, y, r] of [[80, 90, 30], [520, 120, 22], [500, 470, 30], [90, 420, 22], [140, 250, 14], [470, 300, 14]]) star(x, y, r);
    mirror((s) => filled(() => { ctx.moveTo(s(232), 320); ctx.lineTo(s(140), 470); ctx.lineTo(s(232), 430); ctx.closePath(); }));
    filled(() => { ctx.moveTo(240, 425); ctx.quadraticCurveTo(255, 520, 300, 575); ctx.quadraticCurveTo(345, 520, 360, 425); ctx.closePath(); });
    filled(() => { ctx.moveTo(270, 425); ctx.quadraticCurveTo(282, 490, 300, 515); ctx.quadraticCurveTo(318, 490, 330, 425); ctx.closePath(); });
    filled(() => { ctx.moveTo(300, 50); ctx.bezierCurveTo(395, 130, 405, 270, 380, 430); ctx.lineTo(220, 430); ctx.bezierCurveTo(195, 270, 205, 130, 300, 50); ctx.closePath(); });
    path(() => { ctx.moveTo(244, 132); ctx.quadraticCurveTo(300, 112, 356, 132); });
    circle(300, 230, 48);
    path(() => ctx.arc(300, 230, 30, 0, Math.PI * 2));
    path(() => { ctx.moveTo(224, 360); ctx.lineTo(376, 360); });
  } else if (k === "house") {
    circle(90, 90, 46);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      path(() => { ctx.moveTo(90 + Math.cos(a) * 62, 90 + Math.sin(a) * 62); ctx.lineTo(90 + Math.cos(a) * 84, 90 + Math.sin(a) * 84); });
    }
    blob([[430, 80, 34], [470, 62, 40], [515, 85, 32], [475, 100, 30]]);
    path(() => { ctx.moveTo(0, 540); ctx.lineTo(600, 540); });
    filled(() => ctx.rect(380, 140, 52, 110));
    filled(() => ctx.rect(130, 270, 340, 270));
    filled(() => { ctx.moveTo(100, 285); ctx.lineTo(300, 115); ctx.lineTo(500, 285); ctx.closePath(); });
    circle(300, 215, 32);
    filled(() => ctx.rect(258, 400, 84, 140));
    dot(325, 470, 7);
    for (const x of [160, 360]) {
      filled(() => ctx.rect(x, 320, 82, 72));
      path(() => { ctx.moveTo(x + 41, 320); ctx.lineTo(x + 41, 392); ctx.moveTo(x, 356); ctx.lineTo(x + 82, 356); });
    }
    path(() => { ctx.moveTo(258, 540); ctx.lineTo(225, 600); ctx.moveTo(342, 540); ctx.lineTo(375, 600); });
    blob([[60, 520, 30], [95, 505, 34], [125, 525, 24]]);
    blob([[505, 520, 28], [540, 502, 34], [572, 522, 26]]);
  } else if (k === "cupcake") {
    filled(() => { ctx.ellipse(300, 545, 230, 32, 0, 0, Math.PI * 2); });
    filled(() => { ctx.moveTo(165, 330); ctx.lineTo(435, 330); ctx.lineTo(395, 540); ctx.lineTo(205, 540); ctx.closePath(); });
    for (let i = 1; i < 5; i++) path(() => { ctx.moveTo(165 + i * 54, 330); ctx.lineTo(205 + i * 38, 540); });
    filled(() => {
      ctx.moveTo(140, 338);
      ctx.bezierCurveTo(95, 260, 175, 200, 225, 222);
      ctx.bezierCurveTo(230, 140, 370, 140, 375, 222);
      ctx.bezierCurveTo(425, 200, 505, 260, 460, 338);
      ctx.closePath();
    });
    path(() => { ctx.moveTo(190, 290); ctx.quadraticCurveTo(300, 250, 410, 290); });
    for (const [x, y] of [[200, 315], [260, 300], [330, 305], [400, 318], [300, 215], [245, 250], [360, 250]]) circle(x, y, 9);
    circle(300, 130, 34);
    path(() => { ctx.moveTo(310, 98); ctx.quadraticCurveTo(320, 60, 350, 45); });
    for (const [x, y] of [[80, 90], [520, 110], [520, 420], [70, 430]]) star(x, y, 28);
  } else if (k === "flower") {
    path(() => { ctx.moveTo(0, 560); for (let x = 0; x <= 600; x += 30) ctx.lineTo(x, x % 60 ? 530 : 560); });
    path(() => { ctx.moveTo(296, 320); ctx.quadraticCurveTo(270, 440, 300, 548); });
    path(() => { ctx.moveTo(316, 320); ctx.quadraticCurveTo(290, 440, 318, 548); });
    filled(() => { ctx.moveTo(292, 450); ctx.quadraticCurveTo(220, 380, 170, 420); ctx.quadraticCurveTo(220, 490, 292, 465); ctx.closePath(); });
    filled(() => { ctx.moveTo(312, 400); ctx.quadraticCurveTo(390, 330, 440, 370); ctx.quadraticCurveTo(390, 440, 312, 418); ctx.closePath(); });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      filled(() => ctx.ellipse(305 + Math.cos(a) * 92, 220 + Math.sin(a) * 92, 62, 36, a, 0, Math.PI * 2));
    }
    circle(305, 220, 56);
    for (const [x, y] of [[285, 205], [325, 205], [305, 240]]) circle(x, y, 9);
    filled(() => { ctx.ellipse(500, 130, 34, 24, -0.4, 0, Math.PI * 2); });
    filled(() => { ctx.ellipse(470, 105, 30, 20, 0.6, 0, Math.PI * 2); });
    filled(() => { ctx.ellipse(110, 380, 30, 22, 0.3, 0, Math.PI * 2); });
    filled(() => { ctx.ellipse(132, 352, 26, 18, -0.8, 0, Math.PI * 2); });
  } else if (k === "cat") {
    filled(() => { ctx.moveTo(430, 475); ctx.bezierCurveTo(565, 470, 565, 300, 500, 278); ctx.bezierCurveTo(476, 272, 468, 302, 492, 312); ctx.bezierCurveTo(528, 330, 522, 430, 430, 440); ctx.closePath(); });
    filled(() => ctx.ellipse(300, 420, 150, 115, 0, 0, Math.PI * 2));
    filled(() => ctx.ellipse(300, 440, 70, 75, 0, 0, Math.PI * 2));
    mirror((s) => {
      filled(() => { ctx.moveTo(s(200), 190); ctx.lineTo(s(212), 72); ctx.lineTo(s(285), 125); ctx.closePath(); });
      filled(() => ctx.ellipse(s(235), 528, 44, 24, 0, 0, Math.PI * 2));
    });
    circle(300, 235, 112);
    mirror((s) => {
      path(() => { ctx.moveTo(s(218), 160); ctx.lineTo(s(225), 108); ctx.lineTo(s(260), 132); });
      filled(() => ctx.ellipse(s(258), 220, 18, 25, 0, 0, Math.PI * 2));
      dot(s(260), 224, 9);
      path(() => { ctx.moveTo(s(275), 278); ctx.lineTo(s(185), 268); ctx.moveTo(s(275), 288); ctx.lineTo(s(188), 300); });
    });
    filled(() => { ctx.moveTo(286, 262); ctx.lineTo(314, 262); ctx.lineTo(300, 278); ctx.closePath(); });
    path(() => { ctx.moveTo(300, 278); ctx.quadraticCurveTo(290, 300, 272, 295); ctx.moveTo(300, 278); ctx.quadraticCurveTo(310, 300, 328, 295); });
  } else if (k === "car") {
    circle(500, 90, 44);
    blob([[110, 90, 32], [150, 70, 40], [195, 92, 30], [150, 105, 30]]);
    path(() => { ctx.moveTo(0, 470); ctx.lineTo(600, 470); });
    for (let x = 20; x < 600; x += 110) path(() => { ctx.moveTo(x, 535); ctx.lineTo(x + 60, 535); });
    filled(() => {
      ctx.moveTo(60, 405); ctx.lineTo(60, 335); ctx.quadraticCurveTo(62, 300, 105, 296); ctx.lineTo(170, 290);
      ctx.lineTo(232, 200); ctx.lineTo(400, 200); ctx.lineTo(472, 290); ctx.lineTo(510, 296);
      ctx.quadraticCurveTo(545, 302, 545, 342); ctx.lineTo(545, 405); ctx.closePath();
    });
    filled(() => { ctx.moveTo(192, 290); ctx.lineTo(246, 222); ctx.lineTo(310, 222); ctx.lineTo(310, 290); ctx.closePath(); });
    filled(() => { ctx.moveTo(332, 222); ctx.lineTo(392, 222); ctx.lineTo(446, 290); ctx.lineTo(332, 290); ctx.closePath(); });
    path(() => { ctx.moveTo(321, 296); ctx.lineTo(321, 395); });
    path(() => { ctx.moveTo(280, 320); ctx.lineTo(300, 320); ctx.moveTo(345, 320); ctx.lineTo(365, 320); });
    circle(520, 335, 13);
    filled(() => ctx.rect(52, 360, 30, 22));
    for (const x of [170, 440]) {
      circle(x, 410, 56);
      circle(x, 410, 22);
    }
  } else if (k === "turtle") {
    path(() => { ctx.moveTo(0, 520); ctx.quadraticCurveTo(300, 490, 600, 520); });
    filled(() => ctx.ellipse(510, 335, 52, 44, -0.2, 0, Math.PI * 2));
    dot(525, 322, 8);
    path(() => { ctx.moveTo(505, 352); ctx.quadraticCurveTo(530, 370, 550, 350); });
    filled(() => { ctx.moveTo(140, 382); ctx.lineTo(80, 398); ctx.lineTo(140, 400); ctx.closePath(); });
    for (const x of [185, 415]) filled(() => ctx.ellipse(x, 430, 42, 50, 0, 0, Math.PI * 2));
    filled(() => { ctx.moveTo(120, 380); ctx.lineTo(480, 380); ctx.quadraticCurveTo(486, 412, 455, 412); ctx.lineTo(148, 412); ctx.quadraticCurveTo(114, 412, 120, 380); ctx.closePath(); });
    const dome = () => { ctx.moveTo(140, 380); ctx.bezierCurveTo(140, 170, 460, 170, 460, 380); ctx.closePath(); };
    filled(dome);
    inside(dome, () => {
      const hx = 300, hy = 300, r = 55, pts: [number, number][] = [];
      for (let i = 0; i < 6; i++) pts.push([hx + Math.cos((i * Math.PI) / 3) * r, hy + Math.sin((i * Math.PI) / 3) * r * 0.85]);
      path(() => { pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); });
      for (const [x, y] of pts) path(() => { ctx.moveTo(x, y); ctx.lineTo(hx + (x - hx) * 4, hy + (y - hy) * 4); });
    });
    for (const [x, y, r] of [[90, 110, 26], [150, 60, 16], [480, 90, 22]]) circle(x, y, r);
  } else if (k === "icecream") {
    const cone = () => { ctx.moveTo(205, 300); ctx.lineTo(395, 300); ctx.lineTo(300, 570); ctx.closePath(); };
    filled(cone);
    inside(cone, () => {
      for (let i = -6; i <= 6; i++) {
        path(() => { ctx.moveTo(300 + i * 40 - 200, 300); ctx.lineTo(300 + i * 40 + 200, 600); });
        path(() => { ctx.moveTo(300 + i * 40 + 200, 300); ctx.lineTo(300 + i * 40 - 200, 600); });
      }
    });
    filled(() => {
      ctx.arc(300, 270, 105, Math.PI * 0.93, Math.PI * 2.07);
      ctx.quadraticCurveTo(385, 345, 352, 300); ctx.quadraticCurveTo(326, 350, 300, 302);
      ctx.quadraticCurveTo(274, 350, 248, 300); ctx.quadraticCurveTo(215, 345, 198, 293);
      ctx.closePath();
    });
    circle(300, 160, 82);
    path(() => { ctx.moveTo(300, 52); ctx.quadraticCurveTo(310, 20, 340, 14); });
    circle(300, 72, 26);
    for (const [x, y] of [[260, 140], [330, 125], [300, 190], [250, 230], [350, 240], [300, 260]]) filled(() => ctx.ellipse(x, y, 12, 6, x / 50, 0, Math.PI * 2));
    for (const [x, y] of [[90, 120], [510, 140], [500, 450], [100, 460]]) star(x, y, 30);
  } else if (k === "rainbow") {
    for (let r = 260; r >= 110; r -= 30) path(() => ctx.arc(300, 430, r, Math.PI, 0));
    path(() => { ctx.moveTo(40, 430); ctx.lineTo(560, 430); });
    blob([[60, 440, 42], [110, 420, 48], [155, 448, 36], [100, 465, 34]]);
    blob([[445, 448, 36], [490, 420, 48], [540, 440, 42], [500, 465, 34]]);
    circle(520, 100, 50);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      path(() => { ctx.moveTo(520 + Math.cos(a) * 66, 100 + Math.sin(a) * 66); ctx.lineTo(520 + Math.cos(a) * 88, 100 + Math.sin(a) * 88); });
    }
    for (const [x, y] of [[80, 90], [180, 60], [400, 70]]) star(x, y, 24);
    for (const [x, y] of [[180, 540], [300, 520], [420, 545]])
      filled(() => { ctx.moveTo(x, y - 30); ctx.quadraticCurveTo(x + 24, y, x + 18, y + 14); ctx.arc(x, y + 12, 18, 0.1, Math.PI - 0.1); ctx.quadraticCurveTo(x - 24, y, x, y - 30); ctx.closePath(); });
  } else {
    ctx.strokeRect(40, 40, 520, 520);
    for (let i = 1; i < 4; i++) {
      path(() => { ctx.moveTo(40 + i * 130, 40); ctx.lineTo(40 + i * 130, 560); });
      path(() => { ctx.moveTo(40, 40 + i * 130); ctx.lineTo(560, 40 + i * 130); });
    }
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        const cx = 105 + i * 130, cy = 105 + j * 130;
        path(() => { ctx.moveTo(cx, cy - 55); ctx.lineTo(cx + 55, cy); ctx.lineTo(cx, cy + 55); ctx.lineTo(cx - 55, cy); ctx.closePath(); });
        path(() => { ctx.moveTo(cx, cy - 28); ctx.lineTo(cx + 28, cy); ctx.lineTo(cx, cy + 28); ctx.lineTo(cx - 28, cy); ctx.closePath(); });
      }
  }
}

/** The outline as a see-through layer (lines only) and a mask of which pixels are lines. */
export function lineLayer(k: Picture): { lines: ImageData; wall: Uint8Array } {
  const cv = document.createElement("canvas");
  cv.width = cv.height = SIZE;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  drawPicture(ctx, k);
  const src = ctx.getImageData(0, 0, SIZE, SIZE), d = src.data;
  const lines = ctx.createImageData(SIZE, SIZE), o = lines.data;
  const wall = new Uint8Array(SIZE * SIZE);
  for (let p = 0; p < SIZE * SIZE; p++) {
    const lum = (d[p * 4] + d[p * 4 + 1] + d[p * 4 + 2]) / 3;
    o[p * 4] = 0x1b; o[p * 4 + 1] = 0x17; o[p * 4 + 2] = 0x40;
    o[p * 4 + 3] = Math.min(255, Math.max(0, (255 - lum) * 1.25));
    if (lum < 150) wall[p] = 1;
  }
  return { lines, wall };
}

/** Bucket fill: colours the whole shape under (x, y), bounded by the outline only, and tucks the colour under the lines. */
export function fillShape(paint: ImageData, wall: Uint8Array, x: number, y: number, hex: string): boolean {
  const W = SIZE, H = SIZE, d = paint.data;
  if (wall[y * W + x]) return false;
  const nr = parseInt(hex.slice(1, 3), 16), ng = parseInt(hex.slice(3, 5), 16), nb = parseInt(hex.slice(5, 7), 16);
  const seen = new Uint8Array(W * H), stack = [x, y];
  const set = (p: number) => { d[p * 4] = nr; d[p * 4 + 1] = ng; d[p * 4 + 2] = nb; d[p * 4 + 3] = 255; };
  while (stack.length) {
    const py = stack.pop()!, px = stack.pop()!;
    let lx = px;
    while (lx >= 0 && !seen[py * W + lx] && !wall[py * W + lx]) lx--;
    lx++;
    let up = false, dn = false;
    for (let cx = lx; cx < W; cx++) {
      const p = py * W + cx;
      if (seen[p] || wall[p]) break;
      seen[p] = 1;
      set(p);
      if (py > 0) { const q = p - W; if (!seen[q] && !wall[q]) { if (!up) { stack.push(cx, py - 1); up = true; } } else up = false; }
      if (py < H - 1) { const q = p + W; if (!seen[q] && !wall[q]) { if (!dn) { stack.push(cx, py + 1); dn = true; } } else dn = false; }
    }
  }
  // Spread a few pixels into the line so there's no white edge between colour and outline.
  const R = 4;
  for (let py = 1; py < H - 1; py++)
    for (let px = 1; px < W - 1; px++) {
      const p = py * W + px;
      if (seen[p] !== 1 || !(wall[p - 1] || wall[p + 1] || wall[p - W] || wall[p + W])) continue;
      for (let dy = -R; dy <= R; dy++)
        for (let dx = -R; dx <= R; dx++) {
          const qx = px + dx, qy = py + dy;
          if (qx < 0 || qy < 0 || qx >= W || qy >= H) continue;
          const q = qy * W + qx;
          if (wall[q] && seen[q] !== 1) { seen[q] = 2; set(q); }
        }
    }
  return true;
}
