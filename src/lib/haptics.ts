"use client";
// Short vibrations for goals, kicks and right answers. Off inside the sales-page demo phone.
let enabled = true;
export const setHaptics = (on: boolean) => (enabled = on);

export const HAPTIC = { tap: 12, good: 35, win: [40, 60, 80] as number[], bad: 70 };

export function buzz(pattern: number | number[] = HAPTIC.good) {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}
