import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';
import StatusBadge from '../../ui/StatusBadge.jsx';

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');

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
              </div>
              {b.status === 'ACCEPTED' ? (
                <button className="button secondary" disabled={busyId === String(b.booking_id)} onClick={() => complete(b.booking_id)}>
                  Mark complete
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
