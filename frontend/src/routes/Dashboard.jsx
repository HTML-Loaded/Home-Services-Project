import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .me()
      .then((data) => {
        if (!alive) return;
        setMe(data);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message || 'Failed to load profile');
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="stack">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Welcome</h2>
        {error ? <div className="error">{error}</div> : null}
        {me ? (
          <div className="stack" style={{ gap: 6 }}>
            <div>
              Signed in as <b>{me.user?.email}</b>
            </div>
            <div className="muted">Provider account: {me.is_provider ? 'Yes' : 'No'}</div>
          </div>
        ) : (
          <div className="muted">Loading…</div>
        )}
      </div>

      <div className="grid2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Client</h3>
          <div className="stack">
            <Link to="/client/jobs">My jobs (create + list)</Link>
            <Link to="/client/providers">Provider search</Link>
            <Link to="/client/bookings">My bookings</Link>
            <Link to="/client/payments">Payments</Link>
            <Link to="/client/reviews">Reviews</Link>
            <Link to="/client/disputes">Disputes</Link>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Provider</h3>
          <div className="stack">
            {me?.is_provider ? null : <Link to="/provider/onboarding">Become a provider</Link>}
            <Link to="/provider/jobs">Browse jobs</Link>
            <Link to="/provider/bookings">My bookings</Link>
            <Link to="/provider/reviews">My reviews</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
