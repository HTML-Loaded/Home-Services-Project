export default function Banner({ kind, children }) {
  if (!children) return null;
  const cls = kind === 'success' ? 'success' : kind === 'error' ? 'error' : 'muted';
  return (
    <div className={`banner ${cls}`}>
      {children}
    </div>
  );
}
