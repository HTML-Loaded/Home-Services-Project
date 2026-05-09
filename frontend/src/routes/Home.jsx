import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="stack" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>HomeHelp</h1>
        <div className="muted">
          Find trusted local providers for home services — post a job, get bookings, pay, and review.
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <Link className="button" to="/login">
            Login
          </Link>
          <Link className="button secondary" to="/register">
            Register
          </Link>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Clients</h3>
          <div className="muted">Post a job request and manage bookings end-to-end.</div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Providers</h3>
          <div className="muted">Browse jobs, accept work, and build reviews.</div>
        </div>
      </div>
    </div>
  );
}
