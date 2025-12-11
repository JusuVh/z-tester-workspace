export function minmax(min: number, max: number, ...args: Array<number>) {
  return Math.min(max, Math.max(min, ...args));
}
