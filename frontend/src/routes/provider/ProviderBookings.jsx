import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';
import StatusBadge from '../../ui/StatusBadge.jsx';

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');
  const [editId, setEditId] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editComment, setEditComment] = useState('');

  async function refresh() {
    const data = await api.myBookingsAsProvider();
    setBookings(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refresh().catch(() => setError('Failed to load bookings'));
  }, []);

  async function complete(bookingId) {
    setError('');
    setSuccess('');
    setBusyId(String(bookingId));
    try {
      await api.completeBooking({ booking_id: bookingId });
      setSuccess('Booking marked complete!');
      await refresh();
    } catch (err) {
      setError(err.message || 'Complete failed');
    } finally {
      setBusyId('');
    }
  }

  async function save(bookingId) {
    setError('');
    setSuccess('');
    setBusyId(String(bookingId));
    try {
      await api.updateBooking(bookingId, { price: editPrice, comment: editComment });
      setSuccess('Updated!');
      setEditId('');
      await refresh();
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Provider: Bookings</h2>
      <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>

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
                  job: {b.job_category_name} · {b.job_service_area}
                </div>
                {b.price ? <div className="muted">price: {b.price}</div> : null}
                {b.comment ? <div className="muted">comment: {b.comment}</div> : null}
              </div>
              <div className="row" style={{ gap: 10 }}>
                {b.status === 'CONFIRMED' ? (
                  <button className="button secondary" disabled={busyId === String(b.booking_id)} onClick={() => complete(b.booking_id)}>
                    Mark complete
                  </button>
                ) : null}

                {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.status !== 'REJECTED' ? (
                  <button
                    className="button secondary"
                    type="button"
                    disabled={busyId === String(b.booking_id)}
                    onClick={() => {
                      setEditId(String(b.booking_id));
                      setEditPrice(b.price || '');
                      setEditComment(b.comment || '');
                    }}
                  >
                    Edit
                  </button>
                ) : null}
              </div>
            </div>

            {editId === String(b.booking_id) ? (
              <div className="row" style={{ marginTop: 12, alignItems: 'end' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div className="label">Price</div>
                  <input className="input" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                </div>
                <div style={{ flex: 3, minWidth: 240 }}>
                  <div className="label">Comment</div>
                  <input className="input" value={editComment} onChange={(e) => setEditComment(e.target.value)} />
                </div>
                <button className="button" disabled={busyId === String(b.booking_id) || !editPrice} onClick={() => save(b.booking_id)}>
                  Save
                </button>
                <button className="button secondary" type="button" disabled={busyId === String(b.booking_id)} onClick={() => setEditId('')}>
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
