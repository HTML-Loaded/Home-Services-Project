import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import Banner from '../../ui/Banner.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');

  async function refresh() {
    const data = await api.adminUsers();
    setUsers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message || 'Failed to load users'));
  }, []);

  async function deactivate(userId) {
    setError('');
    setSuccess('');
    setBusyId(String(userId));
    try {
      await api.adminDeactivateUser(userId);
      setSuccess('User deactivated.');
      await refresh();
    } catch (err) {
      setError(err.message || 'Deactivate failed');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Admin: Users</h2>
      <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>

      <div className="stack">
        {users.map((u) => (
          <div key={u.user_id} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{u.email}</div>
                <div className="muted">user_id: {u.user_id} · active: {u.is_active ? 'Yes' : 'No'}</div>
              </div>
              {u.is_active ? (
                <button className="button danger secondary" disabled={busyId === String(u.user_id)} onClick={() => deactivate(u.user_id)}>
                  Deactivate
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
