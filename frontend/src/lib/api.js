// API service for making HTTP requests
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Generic GET request
export const get = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });
  return handleResponse(response);
};

// Generic POST request
export const post = async (endpoint, data = {}, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    body: JSON.stringify(data),
    ...options,
  });
  return handleResponse(response);
};

// Generic PUT request
export const put = async (endpoint, data = {}, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    body: JSON.stringify(data),
    ...options,
  });
  return handleResponse(response);
};

// Generic DELETE request
export const del = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });
  return handleResponse(response);
};

// File upload (for voice transcription)
export const uploadFile = async (endpoint, file, options = {}) => {
  const formData = new FormData();
  formData.append('audio', file);
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      ...options.headers,
    },
    credentials: 'include',
    body: formData,
    ...options,
  });
  return handleResponse(response);
};

// API object with common endpoints
export const api = {
  get,
  post,
  put,
  delete: del,
  uploadFile,
  
  // Journal endpoints
  journal: {
    create: (text) => post('/api/journal', { text }),
    getEntries: (limit = 20) => get(`/api/journal?limit=${limit}`),
  },
  
  // Activities endpoints
  activities: {
    getRecommendations: (data) => post('/api/activities/recommendations/activities', data),
    complete: (activityId) => post('/api/activities/complete', { activity_id: activityId }),
    getHistory: (limit = 20) => get(`/api/activities/history?limit=${limit}`),
  },
  
  // Voice endpoints
  voice: {
    transcribe: (file) => uploadFile('/api/voice/transcribe', file),
  },
  
  // Health check
  health: {
    check: () => get('/api/health'),
    db: () => get('/api/health/db'),
  },
};
