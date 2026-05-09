import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function ClientPayments() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .myPayments()
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Failed to load payments'));
  }, []);

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Client: Payments</h2>
      {error ? <div className="error">{error}</div> : null}
      <div className="stack">
        {payments.length === 0 ? <div className="muted">No payments yet.</div> : null}
        {payments.map((p) => (
          <div key={p.booking_id} className="card">
            <div style={{ fontWeight: 700 }}>booking_id: {p.booking_id}</div>
            <div className="muted">
              {p.amount} · {p.payment_method} · {p.payment_date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
