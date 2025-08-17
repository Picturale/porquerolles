import { trustConfig } from '../index';

export type Badge = { name: string; minT: number; invitesPerMonth: number };

export function getBadgeForT(t?: number) {
  if (typeof t !== 'number') return undefined;
  const badges: Badge[] = trustConfig.badges.slice().sort((a, b) => a.minT - b.minT);
  let current: Badge | undefined = undefined;
  for (const b of badges) {
    if (t >= b.minT) current = b;
  }
  return current;
}

export function getNextBadgeInfo(t?: number) {
  if (typeof t !== 'number') return undefined;
  const badges: Badge[] = trustConfig.badges.slice().sort((a, b) => a.minT - b.minT);
  for (const b of badges) {
    if (t < b.minT) {
      return { next: b, pointsNeeded: b.minT - t };
    }
  }
  return undefined;
}
