// Centralized API utility for all frontend API requests

const API_BASE = 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Set auth token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove auth token
const removeToken = () => localStorage.removeItem('token');

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Set current user in localStorage
const setCurrentUser = (user) => localStorage.setItem('currentUser', JSON.stringify(user));

// Remove current user
const removeCurrentUser = () => localStorage.removeItem('currentUser');

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  // If body is FormData, don't set Content-Type (let browser set it with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// GET request
async function get(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

// POST request
async function post(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// PUT request
async function put(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

// DELETE request
async function del(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

// Auth API
const authAPI = {
  register: (data) => post('/auth/register', data),
  login: (data) => post('/auth/login', data),
  getMe: () => get('/auth/me')
};

// Users API
const usersAPI = {
  getAll: () => get('/users'),
  getById: (id) => get(`/users/${id}`),
  update: (id, data) => put(`/users/${id}`, data),
  getPosts: (id) => get(`/users/${id}/posts`),
  getFollowers: (id) => get(`/users/${id}/followers`),
  getFollowing: (id) => get(`/users/${id}/following`),
  getFollowStatus: (id) => get(`/users/${id}/follow-status`)
};

// Posts API
const postsAPI = {
  getFeed: () => get('/posts/feed'),
  getAll: () => get('/posts'),
  getById: (id) => get(`/posts/${id}`),
  create: (data) => post('/posts', data),
  delete: (id) => del(`/posts/${id}`),
  like: (id) => post(`/posts/${id}/like`, {}),
  unlike: (id) => del(`/posts/${id}/like`)
};

// Comments API
const commentsAPI = {
  getByPost: (postId) => get(`/posts/${postId}/comments`),
  create: (postId, text) => post(`/posts/${postId}/comments`, { text }),
  delete: (commentId) => del(`/comments/${commentId}`)
};

// Follow API
const followAPI = {
  follow: (userId) => post(`/users/${userId}/follow`, {}),
  unfollow: (userId) => del(`/users/${userId}/follow`),
  getStatus: (userId) => get(`/users/${userId}/follow-status`)
};

// Export all APIs
export {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
  apiRequest,
  get,
  post,
  put,
  del,
  authAPI,
  usersAPI,
  postsAPI,
  commentsAPI,
  followAPI
};
