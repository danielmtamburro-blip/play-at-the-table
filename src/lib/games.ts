// Every game a venue can switch on or off. Keys are stored in venues.games ({ key: false } = hidden).
export type GameGroup = "kids" | "group" | "date";

export type GameInfo = { key: string; group: GameGroup; name: string; desc: string; ages?: string };

export const GAMES: GameInfo[] = [
  { key: "colour", group: "kids", name: "Colouring", desc: "Tap-to-fill colouring: fish, cupcake and pattern.", ages: "3+" },
  { key: "memory", group: "kids", name: "Memory match", desc: "Find the matching pairs of picture cards.", ages: "4+" },
  { key: "quiz", group: "kids", name: "Kids' quiz", desc: "Five fun questions with instant answers.", ages: "6+" },
  { key: "challenge", group: "kids", name: "Table challenge", desc: "Find-it missions at the table, no photos needed.", ages: "4+" },
  { key: "quick", group: "group", name: "Quick questions", desc: "Light questions everyone answers out loud." },
  { key: "tot", group: "group", name: "This or that", desc: "Pick a side, then explain yourself." },
  { key: "picker", group: "group", name: "Party picker", desc: "The phone picks who goes next, with a fun task." },
  { key: "deck:first", group: "date", name: "First date", desc: "Light, easy conversation openers." },
  { key: "deck:couples", group: "date", name: "How well do you know me?", desc: "Guess each other's answers." },
  { key: "deck:memory", group: "date", name: "Memory lane", desc: "Shared moments and future plans." },
];

export const GROUP_LABEL: Record<GameGroup, string> = { kids: "Kids' corner", group: "Play together (friends & groups)", date: "Date night" };

export const gameOn = (games: Record<string, boolean> | undefined, key: string) => games?.[key] !== false;

export const anyGameOn = (games: Record<string, boolean> | undefined, group: GameGroup) =>
  GAMES.some((g) => g.group === group && gameOn(games, g.key));
