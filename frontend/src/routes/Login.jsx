import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { saveLogin } from '../lib/auth.js';
import Banner from '../ui/Banner.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokens = await api.login({ email, password });
      saveLogin(tokens);
      const me = await api.me();
      navigate(me?.is_provider ? '/provider/jobs' : '/client/jobs');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <form className="stack" onSubmit={onSubmit}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="label">Email</div>
          <input className="input" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <div className="label">Password</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Banner kind={error ? 'error' : ''}>{error}</Banner>
        <button className="button" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <div>
          <a className="muted" href="#" onClick={(e) => e.preventDefault()}>
            Forgot Password
          </a>
        </div>
        <div className="muted">
          No account? <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
