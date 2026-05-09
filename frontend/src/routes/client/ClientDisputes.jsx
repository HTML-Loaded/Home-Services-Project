import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';
import CharCounter from '../../ui/CharCounter.jsx';

export default function ClientDisputes() {
  const [searchParams] = useSearchParams();
  const [disputes, setDisputes] = useState([]);
  const [bookingId, setBookingId] = useState(searchParams.get('booking_id') || '');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const maxDescription = 1000;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function refresh() {
    const data = await api.listDisputes();
    setDisputes(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refresh().catch(() => setError('Failed to load disputes'));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await api.createDispute({ booking_id: Number(bookingId), reason, description });
      setSuccess('Dispute submitted.');
      setBookingId('');
      setReason('');
      setDescription('');
      await refresh();
    } catch (err) {
      setError(err.message || 'Create dispute failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Disputes</h2>
      <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>

      <div className="grid2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>File a dispute</h3>
          <div className="muted">A dispute is a formal complaint tied to a booking.</div>
          <form className="stack" onSubmit={onSubmit}>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">booking_id</div>
              <input className="input" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
            </div>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">Reason</div>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">Description</div>
              <textarea
                className="input"
                style={{ minHeight: 90, resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, maxDescription))}
              />
              <CharCounter value={description} max={maxDescription} />
            </div>
            <button className="button" disabled={busy || !bookingId}>
              Submit
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>My disputes</h3>
          <div className="stack">
            {disputes.length === 0 ? <div className="muted">No disputes yet.</div> : null}
            {disputes.map((d) => (
              <div key={d.dispute_id} className="card" style={{ padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 700 }}>dispute_id: {d.dispute_id}</div>
                <div className="muted">booking: {d.booking} · claimant: {d.claimant} · defendant: {d.defendant}</div>
                {d.reason ? <div style={{ marginTop: 8 }}>{d.reason}</div> : null}
                {d.description ? <div className="muted" style={{ marginTop: 6 }}>{d.description}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
