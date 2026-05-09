import { Link, Outlet, useNavigate } from 'react-router-dom';
import { isAuthed, logout } from '../lib/auth.js';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Layout() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

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

  return (
    <div>
      <div className="nav">
        <div className="row">
          <Link to={isAuthed() ? '/dashboard' : '/'}>HomeHelp</Link>
          <span className="muted">API: /api</span>
        </div>
        <div className="row">
          {isAuthed() ? (
            <>
              <Link to="/client/jobs">Client</Link>
              <Link to="/provider/jobs">Provider</Link>
              {me?.is_provider ? null : <Link to="/provider/onboarding">Become Provider</Link>}
              <span className="muted">
                {me?.user?.name ? `${me.user.name} · ` : ''}
                {me?.is_provider ? 'Provider' : 'Client'}
              </span>
              <button className="button secondary" onClick={onLogout}>
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
