import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [serviceArea, setServiceArea] = useState('');
  const [serviceDistance, setServiceDistance] = useState('');
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const categoryOptions = useMemo(() => {
    const opts = categories.map((c) => ({ id: c.category_id, label: c.category_name }));
    opts.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
    return opts;
  }, [categories]);

  useEffect(() => {
    api
      .categories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.becomeProvider({
        service_area: serviceArea,
        service_distance: serviceDistance ? Number(serviceDistance) : null,
      });
      await api.setProviderCategories({ category_ids: selected });
      navigate('/provider/jobs');
    } catch (err) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Become a Provider</h2>
      {error ? <div className="error">{error}</div> : null}

      <div className="card" style={{ maxWidth: 720 }}>
        <form className="stack" onSubmit={onSubmit}>
          <div className="stack" style={{ gap: 6 }}>
            <div className="label">Service area</div>
            <input className="input" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
          </div>
          <div className="stack" style={{ gap: 6 }}>
            <div className="label">Service distance (miles, optional)</div>
            <input className="input" value={serviceDistance} onChange={(e) => setServiceDistance(e.target.value)} />
          </div>

          <div className="stack" style={{ gap: 6 }}>
            <div className="label">Categories you provide</div>
            <div className="stack" style={{ gap: 8 }}>
              {categoryOptions.map((c) => (
                <label key={c.id} className="row" style={{ gap: 8 }}>
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="button" disabled={busy || !serviceArea || selected.length === 0}>
            {busy ? 'Saving…' : 'Finish'}
          </button>
        </form>
      </div>
    </div>
  );
}
