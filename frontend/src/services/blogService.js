import api from '../utils/api';

export const blogService = {
  // Create blog
  createBlog: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  // Get my drafts
  getMyDrafts: async (page = 0, size = 10) => {
    const response = await api.get('/blogs/me/drafts', {
      params: { page, size },
    });
    return response.data;
  },

  // Get my published blogs
  getMyPublishedBlogs: async (page = 0, size = 10) => {
    const response = await api.get('/blogs/me/published', {
      params: { page, size },
    });
    return response.data;
  },

  // Get my blog by ID
  getMyBlogById: async (blogId) => {
    const response = await api.get(`/blogs/me/${blogId}`);
    return response.data;
  },

  // Get published blogs (public) with optional category filtering
  getPublishedBlogs: async (categoryId = null, page = 0, size = 10) => {
    const response = await api.get('/blogs/published', {
      params: { categoryId, page, size },
    });
    return response.data;
  },

  getFollowingFeed: async (page = 0, size = 10) => {
    const response = await api.get('/blogs/published/following', {
      params: { page, size },
    });
    return response.data;
  },

  getTrendingFeed: async (page = 0, size = 10) => {
    const response = await api.get('/blogs/published/trending', {
      params: { page, size },
    });
    return response.data;
  },

  // Get single published blog (public)
  getPublishedBlogById: async (blogId) => {
    const response = await api.get(`/blogs/published/${blogId}`);
    return response.data;
  },

  // Update blog
  updateBlog: async (blogId, blogData) => {
    const response = await api.put(`/blogs/${blogId}`, blogData);
    return response.data;
  },

  // Publish blog
  publishBlog: async (blogId) => {
    const response = await api.put(`/blogs/${blogId}/publish`);
    return response.data;
  },

  // Delete blog
  deleteBlog: async (blogId) => {
    const response = await api.delete(`/blogs/${blogId}`);
    return response.data;
  },

  // Regenerate summary
  regenerateSummary: async (blogId) => {
    const response = await api.post(`/blogs/${blogId}/generate-summary`);
    return response.data;
  },

  // Search by title
  searchByTitle: async (query, page = 0, size = 10) => {
    const response = await api.get('/blogs/search/title', {
      params: { q: query, page, size },
    });
    return response.data;
  },

  // Search by tag
  searchByTag: async (tag, page = 0, size = 10) => {
    const response = await api.get('/blogs/search/tag', {
      params: { tag, page, size },
    });
    return response.data;
  },

  // Search by author
  searchByAuthor: async (username, page = 0, size = 10) => {
    const response = await api.get('/blogs/search/author', {
      params: { username, page, size },
    });
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/meta/categories');
    return response.data;
  },

  // Get tags
  getTags: async () => {
    const response = await api.get('/meta/tags');
    return response.data;
  },

  addComment: async (blogId, content, parentId = null) => {
    const response = await api.post(`/blogs/${blogId}/comments`, { content, parentId });
    return response.data;
  },

  getComments: async (blogId, page = 0, size = 10) => {
    const response = await api.get(`/blogs/${blogId}/comments`, {
      params: { page, size },
    });
    return response.data;
  },

  likeComment: async (commentId) => {
    const response = await api.post(`/blogs/comments/${commentId}/like`);
    return response.data;
  },

  getCommentLikeStatus: async (commentId) => {
    const response = await api.get(`/blogs/comments/${commentId}/likes`);
    return response.data;
  },

  toggleLike: async (blogId) => {
    const response = await api.post(`/blogs/${blogId}/like`);
    return response.data;
  },

  getLikeStatus: async (blogId) => {
    const response = await api.get(`/blogs/${blogId}/likes`);
    return response.data;
  },
};
