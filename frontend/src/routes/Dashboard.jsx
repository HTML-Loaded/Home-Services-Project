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
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        {error ? <div className="error">{error}</div> : null}
        {me ? (
          <div className="stack" style={{ gap: 6 }}>
            <div>
              Signed in as <b>{me.user?.email}</b>
            </div>
            <div className="muted">Role: {me.is_provider ? 'Provider' : 'Client'}</div>
          </div>
        ) : (
          <div className="muted">Loading…</div>
        )}
      </div>

      {me ? (
        <div className="grid2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Client shortcuts</h3>
            <div className="stack">
              <Link to="/client/jobs">My job postings</Link>
              <Link to="/client/providers">Find providers</Link>
              <Link to="/client/bookings">Manage bookings</Link>
              <Link to="/client/payments">Payments</Link>
              <Link to="/client/reviews">Reviews</Link>
              <Link to="/client/disputes">Disputes</Link>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Provider shortcuts</h3>
            <div className="stack">
              {me.is_provider ? (
                <>
                  <Link to="/provider/jobs">Browse jobs</Link>
                  <Link to="/provider/bookings">My bookings</Link>
                  <Link to="/provider/reviews">My reviews</Link>
                </>
              ) : (
                <Link to="/provider/onboarding">Become a provider</Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
