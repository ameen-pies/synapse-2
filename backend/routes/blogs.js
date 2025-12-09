const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// GET /api/blogs - list blogs
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const blogs = await Blog.find().sort({ created_at: -1 }).limit(limit).lean();
    res.json(blogs);
  } catch (err) {
    console.error('Get blogs error:', err);
    res.status(500).json({ message: 'Error fetching blogs: ' + err.message });
  }
});

// GET /api/blogs/:id - single blog by id
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error('Get blog error:', err);
    res.status(500).json({ message: 'Error fetching blog: ' + err.message });
  }
});

module.exports = router;


