import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';
import StatusBadge from '../../ui/StatusBadge.jsx';
import StarRating from '../../ui/StarRating.jsx';
import CharCounter from '../../ui/CharCounter.jsx';

export default function ClientBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const maxComment = 1000;

  function maskCard(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 19);
    if (!digits) return '';
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`;
  }

  async function refresh() {
    const data = await api.myBookingsAsClient();
    setBookings(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refresh().catch(() => setError('Failed to load bookings'));
  }, []);

  async function act(bookingId, fn) {
    setError('');
    setSuccess('');
    setBusyId(String(bookingId));
    try {
      await fn();
      setSuccess('Saved!');
      await refresh();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Client: Bookings</h2>
      <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>

      <div className="card">
        <div className="muted">Shows bookings for your posted jobs.</div>
      </div>

      <div className="stack">
        {bookings.length === 0 ? <div className="muted">No bookings yet.</div> : null}
        {bookings.map((b) => (
          <div key={b.booking_id} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  booking_id: {b.booking_id} <StatusBadge status={b.status} />
                </div>
                <div className="muted">
                  job: {b.job_category_name} · {b.job_service_area} · provider: {b.provider_name}
                </div>
              </div>
              <div className="row">
                {b.status === 'PENDING' ? (
                  <button
                    className="button"
                    disabled={busyId === String(b.booking_id)}
                    onClick={() => act(b.booking_id, () => api.selectBooking({ booking_id: b.booking_id }))}
                  >
                    Select
                  </button>
                ) : null}
                {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' ? (
                  <button
                    className="button danger secondary"
                    disabled={busyId === String(b.booking_id)}
                    onClick={() => act(b.booking_id, () => api.cancelBooking({ booking_id: b.booking_id }))}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>

            <div className="row" style={{ marginTop: 12, alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Pay amount</div>
                <input className="input" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 100.00" />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div className="label">Method</div>
                <input className="input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} />
              </div>
              <div style={{ flex: 2, minWidth: 220 }}>
                <div className="label">Card number</div>
                <input
                  className="input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234123412341234"
                />
                <div className="muted">{cardNumber ? maskCard(cardNumber) : 'Masked: •••• •••• •••• 1234'}</div>
              </div>
              <button
                className="button secondary"
                disabled={busyId === String(b.booking_id) || b.status !== 'COMPLETED' || !payAmount || cardNumber.length < 12}
                onClick={() =>
                  act(b.booking_id, () => api.payBooking({ booking_id: b.booking_id, amount: payAmount, payment_method: payMethod }))
                }
              >
                Confirm payment
              </button>
            </div>

            <div className="row" style={{ marginTop: 12, alignItems: 'end' }}>
              <div style={{ flex: 3, minWidth: 240 }}>
                <div className="label">Comment</div>
                <textarea
                  className="input"
                  style={{ minHeight: 80, resize: 'vertical' }}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value.slice(0, maxComment))}
                />
                <CharCounter value={reviewComment} max={maxComment} />
              </div>
              <div style={{ flex: 2, minWidth: 240 }}>
                <div className="label">Rating</div>
                <StarRating value={reviewRating} onChange={setReviewRating} disabled={busyId === String(b.booking_id) || b.status !== 'COMPLETED'} />
              </div>
              <button
                className="button secondary"
                disabled={busyId === String(b.booking_id) || b.status !== 'COMPLETED' || !reviewRating}
                onClick={() =>
                  act(b.booking_id, () =>
                    api.reviewBooking({ booking_id: b.booking_id, rating: Number(reviewRating), comment: reviewComment }),
                  )
                }
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
