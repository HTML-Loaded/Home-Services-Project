const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function getAccessToken() {
  return localStorage.getItem('access') || '';
}

function getRefreshToken() {
  return localStorage.getItem('refresh') || '';
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

export function getTokenExpiryMs(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return 0;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const exp = Number(payload?.exp || 0);
    if (!exp) return 0;
    return exp * 1000;
  } catch {
    return 0;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const detail = data?.detail || 'Request failed';
    const err = new Error(detail);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function withQuery(path, query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const api = {
  register: (payload) => request('/api/auth/register/', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login/', { method: 'POST', body: payload, auth: false }),
  refresh: () => request('/api/auth/refresh/', { method: 'POST', body: { refresh: getRefreshToken() }, auth: false }),
  me: () => request('/api/me/'),
  categories: () => request('/api/categories/', { method: 'GET', auth: false }),

  becomeProvider: (payload) => request('/api/providers/become/', { method: 'POST', body: payload }),
  setProviderCategories: (payload) => request('/api/providers/categories/', { method: 'PUT', body: payload }),
  providerProfile: () => request('/api/providers/profile/'),
  updateProviderProfile: (payload) => request('/api/providers/profile/', { method: 'PATCH', body: payload }),

  createJob: (payload) => request('/api/jobs/', { method: 'POST', body: payload }),
  myJobs: () => request('/api/jobs/mine/'),
  deleteJob: (jobId) => request(`/api/jobs/${jobId}/`, { method: 'DELETE' }),
  updateJob: (jobId, payload) => request(`/api/jobs/${jobId}/`, { method: 'PATCH', body: payload }),
  listJobs: ({ categoryId, serviceArea }) =>
    request(withQuery('/api/jobs/list/', { category_id: categoryId, service_area: serviceArea })),

  bookJob: ({ jobId, ...payload }) => request(`/api/jobs/${jobId}/book/`, { method: 'POST', body: payload }),

  myBookingsAsClient: () => request('/api/bookings/mine/'),
  myBookingsAsProvider: () => request(withQuery('/api/bookings/mine/', { as: 'provider' })),
  updateBooking: (bookingId, payload) => request(`/api/bookings/${bookingId}/`, { method: 'PATCH', body: payload }),
  selectBooking: (payload) => request('/api/bookings/select/', { method: 'POST', body: payload }),
  cancelBooking: (payload) => request('/api/bookings/cancel/', { method: 'POST', body: payload }),
  completeBooking: (payload) => request('/api/bookings/complete/', { method: 'POST', body: payload }),
  payBooking: (payload) => request('/api/bookings/pay/', { method: 'POST', body: payload }),
  reviewBooking: (payload) => request('/api/bookings/review/', { method: 'POST', body: payload }),

  myPayments: () => request('/api/payments/mine/'),

  myReviewsAsClient: () => request('/api/reviews/mine/'),
  myReviewsAsProvider: () => request(withQuery('/api/reviews/mine/', { as: 'provider' })),
  updateReview: (bookingId, payload) => request(`/api/reviews/${bookingId}/`, { method: 'PATCH', body: payload }),

  adminUsers: () => request('/api/admin/users/'),
  adminDeactivateUser: (userId) => request(`/api/admin/users/${userId}/deactivate/`, { method: 'POST' }),

  createDispute: (payload) => request('/api/disputes/', { method: 'POST', body: payload }),
  listDisputes: () => request('/api/disputes/list/'),

  listProviders: ({ categoryId, serviceArea }) =>
    request(withQuery('/api/providers/list/', { category_id: categoryId, service_area: serviceArea })),
};
