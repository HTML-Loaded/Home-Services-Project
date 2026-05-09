import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function ProviderReviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .myReviewsAsProvider()
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Failed to load reviews'));
  }, []);

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Provider: Reviews</h2>
      {error ? <div className="error">{error}</div> : null}
      <div className="stack">
        {reviews.length === 0 ? <div className="muted">No reviews yet.</div> : null}
        {reviews.map((r) => (
          <div key={r.booking_id} className="card">
            <div style={{ fontWeight: 700 }}>booking_id: {r.booking_id}</div>
            <div className="muted">rating: {r.rating} · {r.review_date}</div>
            {r.comment ? <div style={{ marginTop: 8 }}>{r.comment}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
