import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../ui/Layout.jsx';
import Home from './Home.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import ClientBookings from './client/ClientBookings.jsx';
import ClientDisputes from './client/ClientDisputes.jsx';
import ClientJobs from './client/ClientJobs.jsx';
import ClientPayments from './client/ClientPayments.jsx';
import ClientReviews from './client/ClientReviews.jsx';
import ProviderSearch from './client/ProviderSearch.jsx';
import ProviderOnboarding from './provider/ProviderOnboarding.jsx';
import ProviderBookings from './provider/ProviderBookings.jsx';
import ProviderBrowseJobs from './provider/ProviderBrowseJobs.jsx';
import ProviderReviews from './provider/ProviderReviews.jsx';
import { isAuthed } from '../lib/auth.js';

function ProtectedRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={isAuthed() ? <Navigate to="/dashboard" replace /> : <Home />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/jobs"
          element={
            <ProtectedRoute>
              <ClientJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/providers"
          element={
            <ProtectedRoute>
              <ProviderSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/bookings"
          element={
            <ProtectedRoute>
              <ClientBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/payments"
          element={
            <ProtectedRoute>
              <ClientPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/reviews"
          element={
            <ProtectedRoute>
              <ClientReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/disputes"
          element={
            <ProtectedRoute>
              <ClientDisputes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/provider/onboarding"
          element={
            <ProtectedRoute>
              <ProviderOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/jobs"
          element={
            <ProtectedRoute>
              <ProviderBrowseJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/bookings"
          element={
            <ProtectedRoute>
              <ProviderBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/reviews"
          element={
            <ProtectedRoute>
              <ProviderReviews />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
