import { Link, Outlet, useNavigate } from 'react-router-dom';
import { isAuthed, logout } from '../lib/auth.js';
import { useEffect, useState } from 'react';
import { api, getTokenExpiryMs, setTokens } from '../lib/api.js';
import Banner from './Banner.jsx';

export default function Layout() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [sessionWarning, setSessionWarning] = useState('');

  function onLogout() {
    logout();
    navigate('/login');
  }

  useEffect(() => {
    let alive = true;
    if (!isAuthed()) return;
    api
      .me()
      .then((data) => {
        if (!alive) return;
        setMe(data);
      })
      .catch(() => {
        if (!alive) return;
        setMe(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthed()) return;

    const tick = async () => {
      const access = localStorage.getItem('access') || '';
      const expMs = getTokenExpiryMs(access);
      if (!expMs) return;
      const remainingMs = expMs - Date.now();
      if (remainingMs <= 0) {
        logout();
        navigate('/login', { replace: true, state: { message: 'Your session has expired. Please log in again.' } });
        return;
      }

      if (remainingMs <= 5 * 60 * 1000) {
        const minutes = Math.max(1, Math.ceil(remainingMs / 60000));
        setSessionWarning(`Your session will expire in ${minutes} minutes. Click here to stay logged in.`);
      } else {
        setSessionWarning('');
      }
    };

    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [navigate]);

  async function onRefreshSession() {
    try {
      const tokens = await api.refresh();
      setTokens(tokens);
      setSessionWarning('');
    } catch {
      logout();
      navigate('/login', { replace: true, state: { message: 'Your session has expired. Please log in again.' } });
    }
  }

  return (
    <div>
      {isAuthed() && sessionWarning ? (
        <div className="container" style={{ paddingBottom: 0 }}>
          <div onClick={onRefreshSession} style={{ cursor: 'pointer' }}>
            <Banner kind="error">{sessionWarning}</Banner>
          </div>
        </div>
      ) : null}
      <div className="nav">
        <div className="row">
          <Link to={isAuthed() ? '/dashboard' : '/'}>HomeHelp</Link>
        </div>
        <div className="row">
          {isAuthed() ? (
            <>
              <Link to="/client/jobs">Jobs</Link>
              <Link to="/client/providers">Providers</Link>
              <Link to="/client/bookings">Bookings</Link>
              <Link to="/client/payments">Payments</Link>
              <Link to="/client/reviews">Reviews</Link>
              <Link to="/client/disputes">Disputes</Link>

              {me?.is_provider ? (
                <>
                  <span className="muted">|</span>
                  <Link to="/provider/jobs">Provider jobs</Link>
                  <Link to="/provider/bookings">Provider bookings</Link>
                  <Link to="/provider/reviews">Provider reviews</Link>
                </>
              ) : (
                <Link to="/provider/onboarding">Become Provider</Link>
              )}
              {me?.is_staff ? (
                <>
                  <span className="muted">|</span>
                  <Link to="/admin/users">Admin</Link>
                </>
              ) : null}
              <span className="muted">
                {me?.user?.name ? `${me.user.name} · ` : ''}
                {me?.is_provider ? 'Client · Provider' : 'Client'}
              </span>
              <button className="button secondary" onClick={onLogout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
}
