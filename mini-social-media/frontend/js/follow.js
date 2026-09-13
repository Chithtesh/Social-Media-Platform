// Follow module - handles followers and following pages

import { usersAPI, followAPI, isAuthenticated, getCurrentUser } from './api.js';
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

// Load followers list
async function loadFollowers() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const container = document.getElementById('users-list');
  if (!container) return;

  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading followers...</p></div>';

  try {
    const followers = await usersAPI.getFollowers(currentUser._id);

    if (followers.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">👥</div>
          <h3>No followers yet</h3>
          <p>When someone follows you, they will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = followers.map(user => createUserCard(user, currentUser)).join('');
  } catch (error) {
    console.error('Error loading followers:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Failed to load followers</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Load following list
async function loadFollowing() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const container = document.getElementById('users-list');
  if (!container) return;

  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading following...</p></div>';

  try {
    const following = await usersAPI.getFollowing(currentUser._id);

    if (following.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">👤</div>
          <h3>Not following anyone</h3>
          <p>Explore users and follow people you find interesting!</p>
          <a href="explore.html" class="btn btn-primary" style="width: auto; display: inline-flex;">Explore Users</a>
        </div>
      `;
      return;
    }

    container.innerHTML = following.map(user => createUserCard(user, currentUser, true)).join('');
  } catch (error) {
    console.error('Error loading following:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Failed to load following</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Create user card HTML
function createUserCard(user, currentUser, showUnfollow = false) {
  const isFollowing = user._id !== currentUser._id;

  return `
    <div class="user-card">
      <img src="${user.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random'}"
           class="avatar"
           alt="${user.name}"
           onclick="viewUserProfile('${user._id}')">
      <div class="user-info">
        <div class="name" onclick="viewUserProfile('${user._id}')">${user.name}</div>
        <div class="username">@${user.username}</div>
        <div class="bio">${user.bio || 'No bio'}</div>
      </div>
      <div class="user-stats">
        <div class="count" id="followers-count-${user._id}">-</div>
        <div class="label">Followers</div>
      </div>
      <div class="user-actions">
        <a href="user-profile.html?id=${user._id}" class="btn btn-secondary btn-sm">View Profile</a>
        ${isFollowing && showUnfollow ? `
          <button class="btn btn-danger btn-sm" onclick="unfollowUser('${user._id}')">Unfollow</button>
        ` : ''}
      </div>
    </div>
  `;
}

// Unfollow a user
async function unfollowUser(userId) {
  if (!confirm('Are you sure you want to unfollow this user?')) return;

  try {
    await followAPI.unfollow(userId);
    showToast('Unfollowed successfully', 'success');
    loadFollowing();
  } catch (error) {
    showToast(error.message || 'Failed to unfollow', 'error');
  }
}

// View user profile
function viewUserProfile(userId) {
  window.location.href = `user-profile.html?id=${userId}`;
}

// Initialize followers page
function initFollowersPage() {
  updateNav();

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  loadFollowers();
}

// Initialize following page
function initFollowingPage() {
  updateNav();

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  loadFollowing();
}

// Export functions
export {
  formatDate,
  loadFollowers,
  loadFollowing,
  createUserCard,
  unfollowUser,
  viewUserProfile,
  initFollowersPage,
  initFollowingPage
};
