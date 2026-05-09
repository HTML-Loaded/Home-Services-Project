import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';
import StarRating from '../../ui/StarRating.jsx';
import CharCounter from '../../ui/CharCounter.jsx';

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editId, setEditId] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const maxComment = 1000;

  async function refresh() {
    const data = await api.myReviewsAsClient();
    setReviews(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message || 'Failed to load reviews'));
  }, []);

  async function save(bookingId) {
    setError('');
    setSuccess('');
    try {
      await api.updateReview(bookingId, { rating: editRating, comment: editComment });
      setSuccess('Updated!');
      setEditId('');
      await refresh();
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Client: Reviews</h2>
      <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>
      <div className="stack">
        {reviews.length === 0 ? <div className="muted">No reviews yet.</div> : null}
        {reviews.map((r) => (
          <div key={r.booking_id} className="card">
            <div style={{ fontWeight: 700 }}>booking_id: {r.booking_id}</div>
            <div className="muted">rating: {r.rating} · {r.review_date}</div>
            {r.comment ? <div style={{ marginTop: 8 }}>{r.comment}</div> : null}

            {editId === String(r.booking_id) ? (
              <div className="stack" style={{ marginTop: 12 }}>
                <div>
                  <div className="label">Rating</div>
                  <StarRating value={editRating} onChange={setEditRating} />
                </div>
                <div>
                  <div className="label">Comment</div>
                  <textarea
                    className="input"
                    style={{ minHeight: 80, resize: 'vertical' }}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value.slice(0, maxComment))}
                  />
                  <CharCounter value={editComment} max={maxComment} />
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <button className="button" type="button" onClick={() => save(r.booking_id)}>
                    Save
                  </button>
                  <button className="button secondary" type="button" onClick={() => setEditId('')}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    setEditId(String(r.booking_id));
                    setEditRating(Number(r.rating || 5));
                    setEditComment(r.comment || '');
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
