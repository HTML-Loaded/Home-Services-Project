import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';

export default function ProviderBrowseJobs() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const categoryOptions = useMemo(() => {
    const opts = categories.map((c) => ({ value: String(c.category_id), label: c.category_name }));
    opts.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
    return opts;
  }, [categories]);

  useEffect(() => {
    api
      .categories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  async function onSearch(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.listJobs({ categoryId, serviceArea });
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setBusy(false);
    }
  }

  async function onBook(jobId) {
    setError('');
    setBusy(true);
    try {
      await api.bookJob({ jobId, price: '100.00', comment: '' });
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Provider: Browse Jobs</h2>
      {error ? <div className="error">{error}</div> : null}

      <div className="card">
        <form className="stack" onSubmit={onSearch}>
          <div className="row">
            <div style={{ flex: 2, minWidth: 220 }}>
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
            <div style={{ flex: 3, minWidth: 220 }}>
              <div className="label">Service area</div>
              <input className="input" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
            </div>
            <div style={{ alignSelf: 'end' }}>
              <button className="button" disabled={busy || !categoryId || !serviceArea}>
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="stack">
        {jobs.length === 0 ? <div className="muted">No results yet.</div> : null}
        {jobs.map((j) => (
          <div key={j.job_id} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>job_id: {j.job_id}</div>
                <div className="muted">service_area: {j.service_area}</div>
              </div>
              <button className="button secondary" disabled={busy} onClick={() => onBook(j.job_id)}>
                Book
              </button>
            </div>
            {j.description ? <div style={{ marginTop: 8 }}>{j.description}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
