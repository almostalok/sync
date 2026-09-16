export function calculateDurationDays(start: Date | string, finish: Date | string): number {
  const s = new Date(start).getTime();
  const f = new Date(finish).getTime();
  if (isNaN(s) || isNaN(f)) return 1;
  const diffDays = Math.round((f - s) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function isWithinWindow(date: Date | string, start: Date | string, finish: Date | string): boolean {
  const d = new Date(date).getTime();
  const s = new Date(start).getTime();
  const f = new Date(finish).getTime();
  return d >= s && d <= f;
}

export function formatISODate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
