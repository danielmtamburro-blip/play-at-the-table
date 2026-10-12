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
  drink: (
    <svg {...base}>
      <path d="M5 5h8l-1 8a3 3 0 0 1-6 0z" />
      <path d="M9 16v8M6 24h6" />
      <path d="M19 5h8l-1 8a3 3 0 0 1-6 0z" />
      <path d="M23 16v8M20 24h6" />
    </svg>
  ),
  versus: (
    <svg {...base}>
      <path d="M5 4l13 13M4 20l4-4M7 21l-3-3" />
      <path d="M27 4L14 17M28 20l-4-4M25 21l3-3" />
    </svg>
  ),
  feedback: (
    <svg {...base}>
      <circle cx="16" cy="16" r="12" />
      <path d="M11 19c1.3 1.7 3 2.5 5 2.5s3.7-.8 5-2.5" />
      <circle cx="12" cy="13" r="1.4" fill="currentColor" />
      <circle cx="20" cy="13" r="1.4" fill="currentColor" />
    </svg>
  ),
  celebrate: (
    <svg {...base}>
      <path d="M5 28l6-17 10 10z" />
      <path d="M11 11c1-4 4-6 8-5M18 16c3-2 7-2 9 1M21 6l1-3M26 10l3-1M24 21l3 2" />
    </svg>
  ),
  nearby: (
    <svg {...base}>
      <path d="M16 29s-9-8.5-9-15a9 9 0 0 1 18 0c0 6.5-9 15-9 15z" />
      <circle cx="16" cy="14" r="3.5" />
    </svg>
  ),
  home: (
    <svg {...base}>
      <path d="M4 15L16 5l12 10" />
      <path d="M8 12v14h16V12" />
      <path d="M13 26v-7h6v7" />
    </svg>
  ),
  play: (
    <svg {...base}>
      <rect x="3" y="9" width="26" height="15" rx="7.5" />
      <path d="M10 13v7M6.5 16.5h7" />
      <circle cx="21" cy="15" r="1.4" fill="currentColor" />
      <circle cx="24" cy="18.5" r="1.4" fill="currentColor" />
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
