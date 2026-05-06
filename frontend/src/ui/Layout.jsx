import { Link, Outlet, useNavigate } from 'react-router-dom';
import { isAuthed, logout } from '../lib/auth.js';

export default function Layout() {
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div>
      <div className="nav">
        <div className="row">
          <Link to="/dashboard">Home Services</Link>
          <span className="muted">API: /api</span>
        </div>
        <div className="row">
          {isAuthed() ? (
            <button className="button secondary" onClick={onLogout}>
              Logout
            </button>
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
