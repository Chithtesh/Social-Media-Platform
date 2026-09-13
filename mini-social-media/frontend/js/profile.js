// Profile module - handles viewing and editing user profiles

import {
  usersAPI,
  postsAPI,
  followAPI,
  isAuthenticated,
  getCurrentUser
} from './api.js';
import { updateNav } from './auth.js';

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Load user profile
async function loadProfile(userId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const isOwnProfile = !userId || userId === currentUser._id;
  const targetUserId = userId || currentUser._id;

  const profileHeader = document.getElementById('profile-header');
  const profilePosts = document.getElementById('profile-posts');

  if (!profileHeader) return;

  profileHeader.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading profile...</p></div>';

  try {
    const user = await usersAPI.getById(targetUserId);
    const userPosts = await postsAPI.getPosts(targetUserId);
    const followers = await usersAPI.getFollowers(targetUserId);
    const following = await usersAPI.getFollowing(targetUserId);

    const isFollowing = isOwnProfile ? false : await checkFollowStatus(targetUserId);

    // Update profile header
    profileHeader.innerHTML = `
      <img src="${user.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random'}"
           class="avatar"
           alt="${user.name}">
      <h2>${user.name}</h2>
      <p class="username">@${user.username}</p>
      <p class="bio">${user.bio || 'No bio yet'}</p>
      <div class="profile-stats">
        <div class="stat">
          <div class="count">${userPosts.length}</div>
          <div class="label">Posts</div>
        </div>
        <div class="stat">
          <div class="count">${followers.length}</div>
          <div class="label">Followers</div>
        </div>
        <div class="stat">
          <div class="count">${following.length}</div>
          <div class="label">Following</div>
        </div>
      </div>
      <div class="profile-actions" id="profile-actions">
        ${isOwnProfile ? `
          <button class="btn btn-secondary" onclick="showEditProfile()">✏️ Edit Profile</button>
          <a href="create-post.html" class="btn btn-primary" style="width: auto;">➕ Create Post</a>
          <a href="profile.html" class="btn btn-secondary" style="width: auto;">📋 My Posts</a>
        ` : `
          <button class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}"
                  id="follow-btn"
                  onclick="toggleFollow('${targetUserId}')">
            ${isFollowing ? '➖ Unfollow' : '➕ Follow'}
          </button>
          <a href="user-profile.html?id=${targetUserId}" class="btn btn-secondary" style="width: auto;">👤 View Profile</a>
        `}
      </div>
    `;

    // Show edit form if own profile
    if (isOwnProfile) {
      showEditProfileForm(user);
    }

    // Display posts
    if (profilePosts) {
      if (userPosts.length === 0) {
        profilePosts.innerHTML = `
          <div class="empty-state">
            <div class="icon">📝</div>
            <h3>No posts yet</h3>
            <p>This user hasn't posted anything yet.</p>
          </div>
        `;
      } else {
        profilePosts.innerHTML = userPosts.map(post => createPostCard(post, currentUser)).join('');
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    profileHeader.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Failed to load profile</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Check follow status
async function checkFollowStatus(userId) {
  try {
    const status = await followAPI.getStatus(userId);
    return status.isFollowing;
  } catch (error) {
    return false;
  }
}

// Show edit profile form
function showEditProfileForm(user) {
  const actions = document.getElementById('profile-actions');
  if (!actions) return;

  actions.innerHTML = `
    <div style="width: 100%; max-width: 400px; margin: 0 auto;">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="edit-name" value="${user.name || ''}">
      </div>
      <div class="form-group">
        <label>Bio</label>
        <textarea id="edit-bio" maxlength="160">${user.bio || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Profile Picture URL</label>
        <input type="text" id="edit-profile-picture" value="${user.profilePicture || ''}" placeholder="https://example.com/image.jpg">
      </div>
      <button class="btn btn-primary" onclick="saveProfile()">💾 Save Changes</button>
    </div>
  `;
}

// Save profile changes
async function saveProfile() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const name = document.getElementById('edit-name').value.trim();
  const bio = document.getElementById('edit-bio').value.trim();
  const profilePicture = document.getElementById('edit-profile-picture').value.trim();

  if (!name) {
    showToast('Name is required', 'error');
    return;
  }

  try {
    const updatedUser = await usersAPI.update(currentUser._id, { name, bio, profilePicture });

    // Update localStorage
    const user = getCurrentUser();
    user.name = updatedUser.name;
    user.bio = updatedUser.bio;
    user.profilePicture = updatedUser.profilePicture;
    localStorage.setItem('currentUser', JSON.stringify(user));

    showToast('Profile updated successfully!', 'success');
    loadProfile(currentUser._id);
  } catch (error) {
    showToast(error.message || 'Failed to update profile', 'error');
  }
}

// Toggle follow/unfollow
async function toggleFollow(userId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to follow users', 'error');
    return;
  }

  const followBtn = document.getElementById('follow-btn');

  try {
    const status = await followAPI.getStatus(userId);

    if (status.isFollowing) {
      await followAPI.unfollow(userId);
      followBtn.textContent = '➕ Follow';
      followBtn.className = 'btn btn-primary';
      showToast('Unfollowed successfully', 'success');
    } else {
      await followAPI.follow(userId);
      followBtn.textContent = '➖ Unfollow';
      followBtn.className = 'btn btn-secondary';
      showToast('Now following!', 'success');
    }
  } catch (error) {
    showToast(error.message || 'Failed to update follow status', 'error');
  }
}

// Create post card HTML
function createPostCard(post, currentUser) {
  const isLiked = post.likes && post.likes.some(like => like._id === currentUser._id);
  const isOwner = post.author._id === currentUser._id;

  return `
    <div class="post-card" data-post-id="${post._id}">
      <div class="post-header">
        <img src="${post.author.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random'}"
             class="avatar"
             alt="${post.author.name}"
             onclick="viewUserProfile('${post.author._id}')">
        <div class="user-info">
          <span class="name" onclick="viewUserProfile('${post.author._id}')">${post.author.name}</span>
          <span class="username">@${post.author.username}</span>
        </div>
        <span class="time">${formatDate(post.createdAt)}</span>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ''}
      <div class="post-actions">
        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
          <span>${isLiked ? '❤️' : '🤍'}</span>
          <span class="like-count">${post.likes ? post.likes.length : 0}</span>
        </button>
        <button onclick="toggleComments('${post._id}')">
          <span>💬</span>
          <span class="comment-count">${post.commentsCount || 0}</span>
        </button>
        ${isOwner ? `<button class="delete-btn" onclick="deletePost('${post._id}')">🗑️ Delete</button>` : ''}
      </div>
      <div class="comments-section" id="comments-${post._id}">
        <div class="comments-list" id="comments-list-${post._id}"></div>
        <div class="comment-input-area">
          <img src="${currentUser.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random'}"
               class="avatar"
               alt="${currentUser.name}">
          <input type="text"
                 placeholder="Write a comment..."
                 id="comment-input-${post._id}"
                 onkeypress="if(event.key==='Enter')addComment('${post._id}')"
                 aria-label="Write a comment">
          <button onclick="addComment('${post._id}')">Post</button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize profile page
function initProfilePage() {
  updateNav();

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  loadProfile(userId);
}

// Export functions
export {
  formatDate,
  loadProfile,
  showEditProfileForm,
  saveProfile,
  toggleFollow,
  createPostCard,
  escapeHtml,
  initProfilePage
};
