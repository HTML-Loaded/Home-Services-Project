export function isValidEmail(value) {
  const v = String(value || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isValidPassword(value) {
  return String(value || '').length >= 8;
}

export function validateTimeRange(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e)) return '';
  if (e <= s) return 'End time must be after start time';
  return '';
}
