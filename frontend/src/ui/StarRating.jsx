export default function StarRating({ value, onChange, disabled }) {
  const v = Number(value || 0);

  return (
    <div className="row" style={{ gap: 6 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = n <= v;
        return (
          <button
            key={n}
            type="button"
            className="button secondary"
            style={{
              padding: '6px 8px',
              borderColor: active ? '#111827' : '#d1d5db',
              background: active ? '#111827' : 'white',
              color: active ? 'white' : '#111827',
              lineHeight: 1,
            }}
            disabled={disabled}
            onClick={() => onChange?.(n)}
            aria-label={`Set rating to ${n}`}
          >
            ★
          </button>
        );
      })}
      <span className="muted">You selected {v || 0} out of 5 stars</span>
    </div>
  );
}
