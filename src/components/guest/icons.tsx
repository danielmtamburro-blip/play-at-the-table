const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const ICON: Record<string, React.ReactNode> = {
  menu: (
    <svg {...base}>
      <path d="M9 4v9a3 3 0 0 0 3 3v12M15 4v9a3 3 0 0 1-3 3M12 4v7" />
      <path d="M23 28V4c-3 2-4 6-4 11h4" />
    </svg>
  ),
  drinks: (
    <svg {...base}>
      <path d="M8 6h16l-2 22H10z" />
      <path d="M9 13h14" />
      <path d="M19 6l3-4" />
    </svg>
  ),
  kids: (
    <svg {...base}>
      <path d="M16 3l3.7 7.6 8.3 1.2-6 5.9 1.4 8.3L16 22.1 8.6 26l1.4-8.3-6-5.9 8.3-1.2z" />
    </svg>
  ),
  group: (
    <svg {...base}>
      <rect x="5" y="5" width="22" height="22" rx="5" />
      {[[11, 11], [21, 21], [16, 16], [21, 11], [11, 21]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill="currentColor" />
      ))}
    </svg>
  ),
  date: (
    <svg {...base}>
      <path d="M16 27S4 20 4 11.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 12 3.5C28 20 16 27 16 27z" />
    </svg>
  ),
  events: (
    <svg {...base}>
      <path d="M12 24V8l14-3v16" />
      <circle cx="8.5" cy="24" r="3.5" />
      <circle cx="22.5" cy="21" r="3.5" />
    </svg>
  ),
  offers: (
    <svg {...base}>
      <path d="M4 16V6a2 2 0 0 1 2-2h10l12 12-12 12z" />
      <circle cx="10" cy="10" r="2" />
    </svg>
  ),
};

export const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12.5 4L6.5 10l6 6" />
  </svg>
);
