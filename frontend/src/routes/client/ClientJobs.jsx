import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';

function toIsoFromLocal(localValue) {
  if (!localValue) return '';
  return new Date(localValue).toISOString();
}

export default function ClientJobs() {
  const [categories, setCategories] = useState([]);
  const [myJobs, setMyJobs] = useState([]);

  const [categoryId, setCategoryId] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const categoryOptions = useMemo(() => {
    const opts = categories.map((c) => ({ value: String(c.category_id), label: c.category_name }));
    opts.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
    return opts;
  }, [categories]);

  async function refresh() {
    const [cats, jobs] = await Promise.all([api.categories(), api.myJobs()]);
    setCategories(Array.isArray(cats) ? cats : []);
    setMyJobs(Array.isArray(jobs) ? jobs : []);
  }

  useEffect(() => {
    let alive = true;
    refresh().catch(() => {
      if (!alive) return;
      setError('Failed to load');
    });
    return () => {
      alive = false;
    };
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.createJob({
        category_id: Number(categoryId),
        service_area: serviceArea,
        description,
        start_time: toIsoFromLocal(startTime),
        end_time: toIsoFromLocal(endTime),
      });
      setDescription('');
      await refresh();
    } catch (err) {
      setError(err.message || 'Create job failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Client: Jobs</h2>
      {error ? <div className="error">{error}</div> : null}

      <div className="grid2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Create job</h3>
          <form className="stack" onSubmit={onCreate}>
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
            <button className="button" disabled={busy || !categoryId || !serviceArea || !startTime || !endTime}>
              Create
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>My job postings</h3>
          <div className="stack">
            {myJobs.length === 0 ? <div className="muted">No jobs yet.</div> : null}
            {myJobs.map((j) => (
              <div key={j.job_id} className="card" style={{ padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 700 }}>job_id: {j.job_id}</div>
                <div className="muted">
                  {j.category_name} · {j.service_area}
                </div>
                {j.description ? <div style={{ marginTop: 8 }}>{j.description}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
