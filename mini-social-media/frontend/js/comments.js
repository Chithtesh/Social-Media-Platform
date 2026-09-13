// Comments module - handles comment operations

import { commentsAPI, isAuthenticated, getCurrentUser } from './api.js';
import { updateNav } from './auth.js';

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// View user profile
function viewUserProfile(userId) {
  window.location.href = `user-profile.html?id=${userId}`;
}

// Initialize comments page
function initCommentsPage() {
  updateNav();

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
}

// Export functions
export {
  formatDate,
  escapeHtml,
  viewUserProfile,
  initCommentsPage
};
