"use client";
import { getBrowserClient } from "./supabase/client";

export const BUCKET = "venue-assets";
export const MAX_BYTES = 10 * 1024 * 1024;

/** Upload to venue-assets/<venueId>/<name>-<time>.<ext> and return the public URL. */
export async function uploadVenueFile(venueId: string, file: Blob, name: string, ext: string): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error("That file is over 10 MB. Please use a smaller one.");
  const sb = getBrowserClient()!;
  const path = `${venueId}/${name}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Remove a file we uploaded earlier (ignores URLs from elsewhere). */
export async function removeVenueFile(publicUrl: string) {
  const marker = `/object/public/${BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i < 0) return;
  await getBrowserClient()!.storage.from(BUCKET).remove([decodeURIComponent(publicUrl.slice(i + marker.length))]);
}

/** Render page 1 of a PDF (e.g. a logo) to a transparent PNG, trimmed to its content. */
export async function pdfToPng(file: File, maxPx = 1200): Promise<Blob> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await doc.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: maxPx / Math.max(base.width, base.height) });
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(viewport.width);
  cv.height = Math.ceil(viewport.height);
  const ctx = cv.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, background: "rgba(0,0,0,0)" }).promise;
  return await new Promise<Blob>((ok, fail) => trim(cv).toBlob((b) => (b ? ok(b) : fail(new Error("Could not read that PDF"))), "image/png"));
}

/** Crop transparent (and pure white) margins so the logo fills its space on the coaster. */
function trim(cv: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = cv.getContext("2d")!;
  const { width: w, height: h } = cv;
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const blank = d[i + 3] < 10 || (d[i] > 248 && d[i + 1] > 248 && d[i + 2] > 248);
      if (!blank) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  if (x1 < 0) return cv;
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")!.drawImage(cv, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}
