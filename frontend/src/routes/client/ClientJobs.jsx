import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { validateTimeRange } from '../../lib/validation.js';

function toIsoFromLocal(localValue) {
  if (!localValue) return '';
  const d = new Date(localValue);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toISOString();
}

function toLocalFromIso(isoValue) {
  if (!isoValue) return '';
  const d = new Date(isoValue);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function ClientJobs() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [myJobs, setMyJobs] = useState([]);

  const [categoryId, setCategoryId] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editServiceArea, setEditServiceArea] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  const createTimeError = validateTimeRange(toIsoFromLocal(startTime), toIsoFromLocal(endTime));
  const editTimeError = validateTimeRange(toIsoFromLocal(editStartTime), toIsoFromLocal(editEndTime));

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
    const qpCategoryId = searchParams.get('category_id');
    const qpServiceArea = searchParams.get('service_area');
    if (qpCategoryId && !categoryId) setCategoryId(String(qpCategoryId));
    if (qpServiceArea && !serviceArea) setServiceArea(String(qpServiceArea));
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

  async function onDelete(jobId) {
    setError('');
    setDeletingId(jobId);
    try {
      await api.deleteJob(jobId);
      await refresh();
    } catch (err) {
      setError(err.message || 'Delete job failed');
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(job) {
    setEditingId(job.job_id);
    setEditCategoryId(String(job.category || ''));
    setEditServiceArea(job.service_area || '');
    setEditDescription(job.description || '');
    setEditStartTime(toLocalFromIso(job.start_time));
    setEditEndTime(toLocalFromIso(job.end_time));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditCategoryId('');
    setEditServiceArea('');
    setEditDescription('');
    setEditStartTime('');
    setEditEndTime('');
  }

  async function onSave(jobId) {
    setError('');
    setBusy(true);
    try {
      await api.updateJob(jobId, {
        category_id: Number(editCategoryId),
        service_area: editServiceArea,
        description: editDescription,
        start_time: toIsoFromLocal(editStartTime),
        end_time: toIsoFromLocal(editEndTime),
      });
      cancelEdit();
      await refresh();
    } catch (err) {
      setError(err.message || 'Update job failed');
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
            {createTimeError ? <div className="fieldError">{createTimeError}</div> : null}
            <button
              className="button"
              disabled={busy || !categoryId || !serviceArea || !startTime || !endTime || !!createTimeError}
            >
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
                <div style={{ marginTop: 10 }}>
                  {editingId === j.job_id ? (
                    <div className="stack" style={{ gap: 10 }}>
                      <div className="row" style={{ gap: 10 }}>
                        <select className="input" value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                          <option value="">Select…</option>
                          {categoryOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <input className="input" value={editServiceArea} onChange={(e) => setEditServiceArea(e.target.value)} />
                      </div>
                      <input className="input" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                      <div className="row">
                        <input className="input" type="datetime-local" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
                        <input className="input" type="datetime-local" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} />
                      </div>
                      <div className="row" style={{ gap: 10 }}>
                        <button
                          className="button"
                          disabled={
                            busy ||
                            !editCategoryId ||
                            !editServiceArea ||
                            !editStartTime ||
                            !editEndTime ||
                            !!editTimeError
                          }
                          onClick={() => onSave(j.job_id)}
                        >
                          Save
                        </button>
                        <button className="button secondary" disabled={busy} onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                      {editTimeError ? <div className="fieldError">{editTimeError}</div> : null}
                    </div>
                  ) : (
                    <div className="row" style={{ gap: 10 }}>
                      <button className="button secondary" disabled={busy} onClick={() => startEdit(j)}>
                        Edit
                      </button>
                      <button
                        className="button secondary"
                        disabled={busy || deletingId === j.job_id}
                        onClick={() => onDelete(j.job_id)}
                      >
                        {deletingId === j.job_id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
