// Authentication module - handles login, register, logout

import {
  authAPI,
  setToken,
  setCurrentUser,
  removeToken,
  removeCurrentUser,
  isAuthenticated
} from './api.js';

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Update navigation based on auth state
function updateNav() {
  const authLinks = document.getElementById('auth-links');
  const userLinks = document.getElementById('user-links');

  if (isAuthenticated()) {
    if (authLinks) authLinks.style.display = 'none';
    if (userLinks) userLinks.style.display = 'flex';
  } else {
    if (authLinks) authLinks.style.display = 'flex';
    if (userLinks) userLinks.style.display = 'none';
  }
}

// Handle registration
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const errorEl = document.getElementById('reg-error');
  const successEl = document.getElementById('reg-success');
  const submitBtn = event.target.querySelector('button[type="submit"]');

  // Validation
  if (!name || !username || !email || !password || !confirmPassword) {
    errorEl.textContent = 'Please fill in all fields';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    return;
  }

  if (password !== confirmPassword) {
    errorEl.textContent = 'Passwords do not match';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    return;
  }

  errorEl.style.display = 'none';
  successEl.textContent = 'Creating account...';
  successEl.style.display = 'block';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    const response = await authAPI.register({ name, username, email, password });

    setToken(response.token);
    setCurrentUser(response);

    showToast('Registration successful! Welcome!', 'success');
    window.location.href = 'index.html';
  } catch (error) {
    errorEl.textContent = error.message || 'Registration failed. Please try again.';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = '📝 Register';
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();

  const identifier = document.getElementById('login-identifier').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const successEl = document.getElementById('login-success');
  const submitBtn = event.target.querySelector('button[type="submit"]');

  if (!identifier || !password) {
    errorEl.textContent = 'Please fill in all fields';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    return;
  }

  errorEl.style.display = 'none';
  successEl.textContent = 'Logging in...';
  successEl.style.display = 'block';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const response = await authAPI.login({ identifier, password });

    setToken(response.token);
    setCurrentUser(response);

    showToast('Login successful! Welcome back!', 'success');
    window.location.href = 'index.html';
  } catch (error) {
    errorEl.textContent = error.message || 'Invalid credentials. Please try again.';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = '🔑 Login';
  }
}

// Handle logout
function handleLogout() {
  removeToken();
  removeCurrentUser();
  showToast('Logged out successfully', 'info');
  window.location.href = 'login.html';
}

// Check auth on page load
function checkAuth() {
  if (isAuthenticated()) {
    updateNav();
  }
}

// Initialize auth page
function initAuthPage() {
  const regForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (regForm) {
    regForm.addEventListener('submit', handleRegister);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  updateNav();
}

// Export functions
export {
  showToast,
  updateNav,
  handleRegister,
  handleLogin,
  handleLogout,
  checkAuth,
  initAuthPage,
  isAuthenticated
};
