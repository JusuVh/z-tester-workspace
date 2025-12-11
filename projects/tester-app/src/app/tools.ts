export function minmax(min: number, max: number, ...args: number[]) {
  return Math.min(max, Math.max(min, ...args));
}
