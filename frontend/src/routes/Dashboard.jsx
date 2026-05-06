import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

function toIsoFromLocal(localValue) {
  if (!localValue) return '';
  const date = new Date(localValue);
  return date.toISOString();
}

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  const [createCategoryId, setCreateCategoryId] = useState('');
  const [createServiceArea, setCreateServiceArea] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [jobs, setJobs] = useState([]);
  const [lastCreatedJob, setLastCreatedJob] = useState(null);
  const [lastBookingId, setLastBookingId] = useState('');

  const [bookingId, setBookingId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const categoryOptions = useMemo(() => {
    const opts = categories.map((c) => ({ value: String(c.category_id), label: c.category_name }));
    opts.sort((a, b) => a.label.localeCompare(b.label));
    return opts;
  }, [categories]);

  useEffect(() => {
    let alive = true;
    api
      .categories()
      .then((data) => {
        if (!alive) return;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!alive) return;
        setCategories([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onCreateJob(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const job = await api.createJob({
        category_id: Number(createCategoryId),
        service_area: createServiceArea,
        description,
        start_time: toIsoFromLocal(startTime),
        end_time: toIsoFromLocal(endTime),
      });
      setLastCreatedJob(job);
    } catch (err) {
      setError(err.message || 'Create job failed');
    } finally {
      setBusy(false);
    }
  }

  async function onSearchJobs(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.listJobs({ categoryId, serviceArea });
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'List jobs failed');
    } finally {
      setBusy(false);
    }
  }

  async function onBook(jobId) {
    setError('');
    setBusy(true);
    try {
      const data = await api.bookJob({ jobId, price: '100.00', comment: '' });
      setLastBookingId(String(data.booking_id || ''));
      setBookingId(String(data.booking_id || ''));
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setBusy(false);
    }
  }

  async function doBookingAction(fn) {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div className="muted">Create jobs, browse jobs, manage bookings.</div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="grid2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Create job (client)</h3>
          <form className="stack" onSubmit={onCreateJob}>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">Category</div>
              <select className="input" value={createCategoryId} onChange={(e) => setCreateCategoryId(e.target.value)}>
                <option value="">Select…</option>
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">Service area</div>
              <input className="input" value={createServiceArea} onChange={(e) => setCreateServiceArea(e.target.value)} />
            </div>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">Description</div>
              <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="row">
              <div className="stack" style={{ gap: 6, flex: 1 }}>
                <div className="label">Start</div>
                <input className="input" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="stack" style={{ gap: 6, flex: 1 }}>
                <div className="label">End</div>
                <input className="input" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <button className="button" disabled={busy || !createCategoryId || !createServiceArea || !startTime || !endTime}>
              Create job
            </button>
          </form>
          {lastCreatedJob ? (
            <div className="muted" style={{ marginTop: 12 }}>
              Created job_id: <b>{lastCreatedJob.job_id}</b>
            </div>
          ) : null}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Browse jobs (provider)</h3>
          <form className="stack" onSubmit={onSearchJobs}>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">Category</div>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select…</option>
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="stack" style={{ gap: 6 }}>
              <div className="label">Service area</div>
              <input className="input" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
            </div>
            <button className="button" disabled={busy || !categoryId || !serviceArea}>
              Search
            </button>
          </form>

          <div className="stack" style={{ marginTop: 12 }}>
            {jobs.length === 0 ? <div className="muted">No results yet.</div> : null}
            {jobs.map((j) => (
              <div key={j.job_id} className="card" style={{ padding: 12, borderRadius: 8 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>job_id: {j.job_id}</div>
                    <div className="muted">service_area: {j.service_area}</div>
                  </div>
                  <button className="button" disabled={busy} onClick={() => onBook(j.job_id)}>
                    Book
                  </button>
                </div>
                {j.description ? <div style={{ marginTop: 8 }}>{j.description}</div> : null}
              </div>
            ))}
          </div>

          {lastBookingId ? (
            <div className="muted" style={{ marginTop: 12 }}>
              Last booking_id: <b>{lastBookingId}</b>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Booking actions</h3>
        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="label">booking_id</div>
            <input className="input" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
          </div>
          <button className="button secondary" disabled={busy || !bookingId} onClick={() => doBookingAction(() => api.selectBooking({ booking_id: Number(bookingId) }))}>
            Select
          </button>
          <button className="button secondary" disabled={busy || !bookingId} onClick={() => doBookingAction(() => api.cancelBooking({ booking_id: Number(bookingId) }))}>
            Cancel
          </button>
          <button className="button secondary" disabled={busy || !bookingId} onClick={() => doBookingAction(() => api.completeBooking({ booking_id: Number(bookingId) }))}>
            Complete
          </button>
        </div>

        <div className="row" style={{ marginTop: 12, alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="label">Payment amount</div>
            <input className="input" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="e.g. 100.00" />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="label">Payment method</div>
            <input className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          </div>
          <button
            className="button secondary"
            disabled={busy || !bookingId || !paymentAmount}
            onClick={() =>
              doBookingAction(() =>
                api.payBooking({ booking_id: Number(bookingId), amount: paymentAmount, payment_method: paymentMethod }),
              )
            }
          >
            Pay
          </button>
        </div>

        <div className="row" style={{ marginTop: 12, alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div className="label">Rating (1-5)</div>
            <input className="input" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} />
          </div>
          <div style={{ flex: 3, minWidth: 240 }}>
            <div className="label">Comment</div>
            <input className="input" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
          </div>
          <button
            className="button secondary"
            disabled={busy || !bookingId || !reviewRating}
            onClick={() =>
              doBookingAction(() =>
                api.reviewBooking({
                  booking_id: Number(bookingId),
                  rating: Number(reviewRating),
                  comment: reviewComment,
                }),
              )
            }
          >
            Review
          </button>
        </div>
      </div>
    </div>
  );
}
