const API = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    // Try refresh
    const refreshRes = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem('accessToken', data.accessToken);
      headers['Authorization'] = `Bearer ${data.accessToken}`;
      const retry = await fetch(`${API}${path}`, { ...options, headers, credentials: 'include' });
      return retry.json();
    }
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => {
    const token = localStorage.getItem('accessToken');
    return fetch(`${API}${path}`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    }).then(r => r.json());
  },
};
