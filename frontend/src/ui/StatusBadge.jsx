function normalize(status) {
  return String(status || '').toUpperCase();
}

export default function StatusBadge({ status }) {
  const s = normalize(status);
  let cls = 'badge';
  if (s === 'PENDING') cls += ' pending';
  else if (s === 'ACCEPTED') cls += ' accepted';
  else if (s === 'COMPLETED') cls += ' completed';
  else if (s === 'CANCELLED') cls += ' cancelled';
  else cls += '';

  return <span className={cls}>{s || 'UNKNOWN'}</span>;
}
