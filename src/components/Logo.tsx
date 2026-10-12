/** The Play at the Table mark: a five-colour ring with a play button. */
export function LogoMark({ size = 38, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true" style={{ flex: "none" }}>
      <circle cx="20" cy="20" r="19" fill="#FF5A4E" />
      <path d="M20 1a19 19 0 0 1 18.07 13.13L20 20z" fill="#FFB51F" />
      <path d="M38.07 14.13A19 19 0 0 1 31.17 35.37L20 20z" fill="#12A594" />
      <path d="M31.17 35.37a19 19 0 0 1-22.34 0L20 20z" fill="#6E4BFF" />
      <path d="M8.83 35.37A19 19 0 0 1 1.93 14.13L20 20z" fill="#F0457F" />
      <circle cx="20" cy="20" r="11" fill="#fff" />
      <path d="M17 14.8v10.4l8.6-5.2z" fill="#1B1740" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <a className="logo" href={href} aria-label="Play at the Table home">
      <LogoMark className="logo-mark" />
      <span>Play at the Table</span>
    </a>
  );
}
