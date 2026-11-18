import type { QuoteItem } from './types';

export const HOME_QUOTES: readonly QuoteItem[] = [
  {
    id: 'q1',
    textZh: '缓慢而清晰地走过今天，比匆忙赶路更重要。',
    textEn: 'Moving through today with clarity matters more than rushing.',
    author: 'Uphone Note',
  },
  {
    id: 'q2',
    textZh: '保持心里的一块留白，留给真正想说的话。',
    textEn: 'Keep a quiet margin in your day for the words that matter.',
    author: 'Uphone Note',
  },
  {
    id: 'q3',
    textZh: '每次认真记录的片刻，都会成为未来的记忆锚点。',
    textEn: 'Every moment carefully noted becomes an anchor for tomorrow.',
    author: 'Uphone Note',
  },
  {
    id: 'q4',
    textZh: '安静的工具不会催促你，它只在你需要时恰好出现。',
    textEn: 'Quiet tools never rush you; they simply appear when needed.',
    author: 'Uphone Note',
  },
  {
    id: 'q5',
    textZh: '光线温柔的时候，适合把未完成的想法写下来。',
    textEn: 'Soft light is made for writing down unfinished thoughts.',
    author: 'Uphone Note',
  },
] as const;

export function pickNextQuote(
  currentId: string,
  quotes: readonly QuoteItem[] = HOME_QUOTES,
  randomFn: () => number = Math.random,
): QuoteItem {
  if (quotes.length === 0) {
    return {
      id: 'fallback',
      textZh: '保持留白，记录此刻。',
      textEn: 'Keep space for the present moment.',
      author: 'Uphone',
    };
  }
  if (quotes.length === 1) {
    return quotes[0];
  }
  const candidates = quotes.filter((item) => item.id !== currentId);
  const index = Math.min(candidates.length - 1, Math.floor(randomFn() * candidates.length));
  return candidates[index];
}
