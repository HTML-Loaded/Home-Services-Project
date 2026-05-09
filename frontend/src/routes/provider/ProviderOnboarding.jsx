import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';

export default function ProviderOnboarding() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [serviceArea, setServiceArea] = useState('');
  const [serviceDistance, setServiceDistance] = useState('');
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProvider, setIsProvider] = useState(false);

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

    api
      .me()
      .then((me) => {
        setIsProvider(!!me?.is_provider);
        if (!me?.is_provider) return;
        return api.providerProfile().then((p) => {
          setServiceArea(p?.service_area || '');
          setServiceDistance(p?.service_distance ? String(p.service_distance) : '');
          setSelected(Array.isArray(p?.category_ids) ? p.category_ids : []);
        });
      })
      .catch(() => {});
  }, []);

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      if (!isProvider) {
        await api.becomeProvider({
          service_area: serviceArea,
          service_distance: serviceDistance ? Number(serviceDistance) : null,
        });
        await api.setProviderCategories({ category_ids: selected });
      } else {
        await api.updateProviderProfile({
          service_area: serviceArea,
          service_distance: serviceDistance ? Number(serviceDistance) : null,
          category_ids: selected,
        });
      }
      setSuccess('Saved!');
      navigate('/provider/jobs');
    } catch (err) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>{isProvider ? 'Provider Profile' : 'Become a Provider'}</h2>
      <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>

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
            {busy ? 'Saving…' : isProvider ? 'Save' : 'Finish'}
          </button>
        </form>
      </div>
    </div>
  );
}
