// Explore module - handles searching and exploring users

import { usersAPI, followAPI, isAuthenticated, getCurrentUser } from './api.js';
import { updateNav } from './auth.js';

// Load all users
async function loadUsers(searchQuery = '') {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const container = document.getElementById('users-list');
  if (!container) return;

  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading users...</p></div>';

  try {
    let users;

    if (searchQuery) {
      // Search users by username or name
      const allUsers = await usersAPI.getAll();
      const query = searchQuery.toLowerCase();
      users = allUsers.filter(user =>
        user._id !== currentUser._id &&
        (user.username.toLowerCase().includes(query) ||
         user.name.toLowerCase().includes(query))
      );
    } else {
      users = await usersAPI.getAll();
      // Filter out current user
      users = users.filter(user => user._id !== currentUser._id);
    }

    if (users.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>No users found</h3>
          <p>${searchQuery ? 'Try a different search term' : 'No other users available yet'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = users.map(user => createUserCard(user, currentUser)).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Failed to load users</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Create user card HTML
function createUserCard(user, currentUser) {
  return `
    <div class="user-card" id="user-card-${user._id}">
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
        <button class="btn btn-primary btn-sm" id="follow-btn-${user._id}" onclick="toggleFollow('${user._id}')">Follow</button>
      </div>
    </div>
  `;
}

// Toggle follow/unfollow
async function toggleFollow(userId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to follow users', 'error');
    return;
  }

  const followBtn = document.getElementById(`follow-btn-${userId}`);

  try {
    const status = await followAPI.getStatus(userId);

    if (status.isFollowing) {
      await followAPI.unfollow(userId);
      if (followBtn) {
        followBtn.textContent = 'Follow';
        followBtn.className = 'btn btn-primary btn-sm';
      }
      showToast('Unfollowed successfully', 'success');
    } else {
      await followAPI.follow(userId);
      if (followBtn) {
        followBtn.textContent = 'Unfollow';
        followBtn.className = 'btn btn-secondary btn-sm';
      }
      showToast('Now following!', 'success');
    }
  } catch (error) {
    showToast(error.message || 'Failed to update follow status', 'error');
  }
}

// View user profile
function viewUserProfile(userId) {
  window.location.href = `user-profile.html?id=${userId}`;
}

// Initialize explore page
function initExplorePage() {
  updateNav();

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const searchInput = document.getElementById('search-input');

  // Load all users initially
  loadUsers();

  // Search functionality
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadUsers(e.target.value.trim());
      }, 300);
    });
  }
}

// Export functions
export {
  loadUsers,
  createUserCard,
  toggleFollow,
  viewUserProfile,
  initExplorePage
};
