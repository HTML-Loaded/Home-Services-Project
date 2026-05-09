export default function CharCounter({ value, max = 1000 }) {
  const current = String(value || '').length;
  const remaining = max - current;
  const warn = remaining < 50;
  return (
    <div className={warn ? 'counter warn' : 'counter'}>
      {remaining > 0 ? `${remaining} characters remaining` : 'Character limit reached'}
    </div>
  );
}
