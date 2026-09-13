// Feed module - handles displaying posts on the home page

import {
  postsAPI,
  commentsAPI,
  followAPI,
  isAuthenticated,
  getCurrentUser
} from './api.js';
import { updateNav } from './auth.js';

// Format date to relative time
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load and display feed
async function loadFeed() {
  const feedContainer = document.getElementById('feed-posts');
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  if (!feedContainer) return;

  feedContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading your feed...</p></div>';

  try {
    const posts = await postsAPI.getFeed();

    if (posts.length === 0) {
      feedContainer.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <h3>Your feed is empty</h3>
          <p>Follow some users to see their posts in your feed, or create your first post!</p>
          <a href="explore.html" class="btn btn-primary" style="width: auto; display: inline-flex;">Explore Users</a>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = posts.map(post => createPostCard(post, currentUser)).join('');

    // Load comments for each post
    for (const post of posts) {
      await loadComments(post._id);
    }
  } catch (error) {
    console.error('Error loading feed:', error);
    feedContainer.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Failed to load feed</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Load comments for a post
async function loadComments(postId) {
  const commentsList = document.getElementById(`comments-list-${postId}`);
  if (!commentsList) return;

  try {
    const comments = await commentsAPI.getByPost(postId);
    const currentUser = getCurrentUser();

    if (comments.length === 0) {
      commentsList.innerHTML = '<p style="color: var(--text-lighter); font-size: 0.85rem; padding: 8px 0;">No comments yet. Be the first!</p>';
      return;
    }

    commentsList.innerHTML = comments.map(comment => `
      <div class="comment" data-comment-id="${comment._id}">
        <img src="${comment.author.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random'}"
             class="avatar"
             alt="${comment.author.name}"
             onclick="viewUserProfile('${comment.author._id}')">
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author" onclick="viewUserProfile('${comment.author._id}')">${comment.author.name}</span>
            <span class="comment-time">${formatDate(comment.createdAt)}</span>
            ${comment.author._id === currentUser._id ? `<button class="comment-delete" onclick="deleteComment('${comment._id}', '${postId}')">Delete</button>` : ''}
          </div>
          <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

// Toggle like on a post
async function toggleLike(postId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to like posts', 'error');
    return;
  }

  const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
  const likeCount = likeBtn.querySelector('.like-count');
  const likeIcon = likeBtn.querySelector('span:first-child');

  try {
    // Check current like status
    const post = await postsAPI.getById(postId);
    const isLiked = post.likes && post.likes.some(like => like._id === currentUser._id);

    if (isLiked) {
      await postsAPI.unlike(postId);
      likeBtn.classList.remove('liked');
      likeIcon.textContent = '🤍';
    } else {
      await postsAPI.like(postId);
      likeBtn.classList.add('liked');
      likeIcon.textContent = '❤️';
    }

    // Update count
    const updatedPost = await postsAPI.getById(postId);
    likeCount.textContent = updatedPost.likes ? updatedPost.likes.length : 0;
  } catch (error) {
    showToast(error.message || 'Failed to update like', 'error');
  }
}

// Toggle comments section
function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection) {
    commentsSection.classList.toggle('open');
  }
}

// Add comment to a post
async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();

  if (!text) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to comment', 'error');
    return;
  }

  try {
    await commentsAPI.create(postId, text);
    input.value = '';
    await loadComments(postId);

    // Update comment count
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    const commentCount = postCard.querySelector('.comment-count');
    const currentCount = parseInt(commentCount.textContent);
    commentCount.textContent = currentCount + 1;

    showToast('Comment added!', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to add comment', 'error');
  }
}

// Delete a comment
async function deleteComment(commentId, postId) {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  try {
    await commentsAPI.delete(commentId);
    await loadComments(postId);

    // Update comment count
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    const commentCount = postCard.querySelector('.comment-count');
    const currentCount = parseInt(commentCount.textContent);
    commentCount.textContent = Math.max(0, currentCount - 1);

    showToast('Comment deleted', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to delete comment', 'error');
  }
}

// Delete a post
async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

  try {
    await postsAPI.delete(postId);
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    postCard.style.opacity = '0';
    postCard.style.transform = 'translateX(100px)';
    setTimeout(() => postCard.remove(), 300);
    showToast('Post deleted', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to delete post', 'error');
  }
}

// View user profile
function viewUserProfile(userId) {
  window.location.href = `user-profile.html?id=${userId}`;
}

// Initialize feed page
function initFeedPage() {
  updateNav();

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  loadFeed();
}

// Export functions
export {
  formatDate,
  createPostCard,
  escapeHtml,
  loadFeed,
  loadComments,
  toggleLike,
  toggleComments,
  addComment,
  deleteComment,
  deletePost,
  viewUserProfile,
  initFeedPage
};
