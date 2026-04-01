import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Attach token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ecmeet_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → logout
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ecmeet_token');
      localStorage.removeItem('ecmeet_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify')
};

export const eventsAPI = {
  getAll: () => api.get('/events'),
  getOne: (id) => api.get(`/events/${id}`),
  register: (data) => api.post('/events/register', data),
  myRegistrations: () => api.get('/events/my/registrations'),
  cancel: (eventId) => api.delete(`/events/register/${eventId}`)
};

export const userAPI = {
  me: () => api.get('/users/me'),
  update: (data) => api.patch('/users/me', data),
  revealHouse: (data) => api.post('/users/reveal-house', data)
};

export default api;
