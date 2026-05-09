import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { saveLogin } from '../lib/auth.js';
import Banner from '../ui/Banner.jsx';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [asProvider, setAsProvider] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Medium' : 'Weak';

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.register({ name, email, DOB: dob || null, password });
      const tokens = await api.login({ email, password });
      saveLogin(tokens);
      setSuccess('Account created!');
      const me = await api.me();
      navigate(asProvider || me?.is_provider ? '/provider/onboarding' : '/client/jobs');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Register</h2>
      <form className="stack" onSubmit={onSubmit}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="label">Full name</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <div className="label">Email</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <div className="label">Date of birth (optional)</div>
          <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <div className="label">Password</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="muted">Strength: {strength}</div>
        </div>
        <label className="row" style={{ gap: 8 }}>
          <input type="checkbox" checked={asProvider} onChange={(e) => setAsProvider(e.target.checked)} />
          <span>Register as provider (you’ll set categories next)</span>
        </label>
        <Banner kind={success ? 'success' : error ? 'error' : ''}>{success || error}</Banner>
        <button className="button" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <div className="muted">
          Already registered? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
