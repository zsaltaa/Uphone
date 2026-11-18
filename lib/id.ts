export type EntityPrefix =
  | 'usr'
  | 'chr'
  | 'cnv'
  | 'msg'
  | 'grp'
  | 'gmb'
  | 'mem'
  | 'mlk'
  | 'api'
  | 'set'
  | 'ast'
  | 'cf';

/**
 * Generates a stable, unique, prefix-scoped identifier.
 * Uses Web Crypto UUID v4 when available, with a monotonic random fallback.
 */
export function createId(prefix: EntityPrefix): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  const timeHex = Date.now().toString(16);
  const randA = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');
  const randB = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');

  return `${prefix}_${timeHex}-${randA}-${randB}`;
}

export function isScopedId(value: string, prefix?: EntityPrefix): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const idx = value.indexOf('_');
  if (idx <= 0 || idx === value.length - 1) {
    return false;
  }
  if (prefix) {
    return value.startsWith(`${prefix}_`);
  }
  return true;
}
