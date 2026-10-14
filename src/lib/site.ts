/** The public address guests use. QR codes always point here, even when the portal is opened on the old netlify.app address. */
export const SITE_URL = "https://playatyourtable.com";

/** Origin for printed QR codes: the live domain in production, the current origin when testing locally. */
export function qrOrigin(): string {
  if (typeof location === "undefined") return SITE_URL;
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) ? location.origin : SITE_URL;
}
