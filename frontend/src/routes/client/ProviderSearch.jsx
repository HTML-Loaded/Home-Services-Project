import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';

function Stars({ rating }) {
  const r = Math.round(Number(rating || 0));
  const full = '★★★★★'.slice(0, Math.max(0, Math.min(5, r)));
  const empty = '☆☆☆☆☆'.slice(0, 5 - full.length);
  return (
    <span>
      {full}
      <span className="muted">{empty}</span>
    </span>
  );
}

export default function ProviderSearch() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [providers, setProviders] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setBusy(true);
    try {
      const data = await api.listProviders({ categoryId, serviceArea });
      setProviders(Array.isArray(data) ? data : []);
      setSuccess('Providers loaded.');
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Provider Search</h2>
      <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>

      <div className="card">
        <form className="row" onSubmit={onSearch} style={{ alignItems: 'end' }}>
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
          <button className="button" disabled={busy || !categoryId || !serviceArea}>
            Search
          </button>
        </form>
      </div>

      <div className="stack">
        {providers.length === 0 ? <div className="muted">No results yet.</div> : null}
        {providers
          .slice()
          .sort((a, b) => Number(b.average_rating || 0) - Number(a.average_rating || 0))
          .map((p) => (
            <div key={p.provider?.user_id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.provider?.name}</div>
                  <div className="muted">
                    <Stars rating={p.average_rating} /> · {p.service_area}
                  </div>
                </div>
                <div className="muted">Booking is done from provider side</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
