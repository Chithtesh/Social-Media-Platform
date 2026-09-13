// Posts module - handles creating posts

import { postsAPI, isAuthenticated, getCurrentUser } from './api.js';
import { updateNav } from './auth.js';

// Handle create post form submission
async function handleCreatePost(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to create a post', 'error');
    window.location.href = 'login.html';
    return;
  }

  const content = document.getElementById('post-content').value.trim();
  const image = document.getElementById('post-image').value.trim();
  const errorEl = document.getElementById('post-error');
  const successEl = document.getElementById('post-success');
  const submitBtn = event.target.querySelector('button[type="submit"]');

  // Validation
  if (!content) {
    errorEl.textContent = 'Post content is required';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    return;
  }

  if (content.length > 500) {
    errorEl.textContent = 'Post cannot be more than 500 characters';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    return;
  }

  errorEl.style.display = 'none';
  successEl.textContent = 'Publishing post...';
  successEl.style.display = 'block';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Publishing...';

  try {
    const post = await postsAPI.create({ content, image });

    showToast('Post published successfully!', 'success');
    window.location.href = 'index.html';
  } catch (error) {
    errorEl.textContent = error.message || 'Failed to create post. Please try again.';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = '📤 Publish';
  }
}

// Show image preview
function showImagePreview() {
  const imageUrl = document.getElementById('post-image').value.trim();
  const preview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');

  if (imageUrl) {
    previewImg.src = imageUrl;
    preview.style.display = 'block';
    previewImg.onerror = () => {
      preview.style.display = 'none';
    };
  } else {
    preview.style.display = 'none';
  }
}

// Initialize create post page
function initCreatePostPage() {
  updateNav();

  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('create-post-form');
  const imageInput = document.getElementById('post-image');

  if (form) {
    form.addEventListener('submit', handleCreatePost);
  }

  if (imageInput) {
    imageInput.addEventListener('input', showImagePreview);
  }
}

// Export functions
export {
  handleCreatePost,
  showImagePreview,
  initCreatePostPage
};
