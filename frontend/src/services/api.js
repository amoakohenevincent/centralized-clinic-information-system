import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let pendingTokenPromise = null;

/**
 * Fetches a genuine signed development JWT from /api/auth/demo-session.
 * Keeps RBAC enforcement active while allowing seamless role switching in demo/dev.
 */
export async function fetchDemoSessionToken(roleOverride) {
  if (pendingTokenPromise && !roleOverride) {
    return pendingTokenPromise;
  }

  let targetRole = roleOverride;
  if (!targetRole) {
    try {
      const savedUser = JSON.parse(localStorage.getItem('ccis_user') || '{}');
      targetRole = savedUser?.role || 'doctor';
    } catch {
      targetRole = 'doctor';
    }
  }

  const requestPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/demo-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem('ccis_token', data.token);
        localStorage.setItem('ccis_jwt', data.token);
        return data.token;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  if (!roleOverride) {
    pendingTokenPromise = requestPromise;
  }

  return requestPromise;
}

function isValidJwtFormat(token) {
  return Boolean(token && !token.startsWith('mock') && token.split('.').length === 3);
}

// Request interceptor to attach valid JWT token
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('ccis_token');
    if (!isValidJwtFormat(token)) {
      const freshToken = await fetchDemoSessionToken();
      if (freshToken) {
        token = freshToken;
      }
    }
    if (token && isValidJwtFormat(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const errorData = error.response.data?.error || {
        message: error.response.data?.message || 'Server responded with an error.',
      };

      if (error.response.status === 401) {
        console.warn('[CCIS-Auth] Session expired or invalid.');
      }

      return Promise.reject(errorData);
    }
    return Promise.reject({
      message: error.message || 'Network connection failed. Please check your backend connection.',
    });
  }
);

export default api;
