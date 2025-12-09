const express = require('express');
const router = express.Router();
const ChapterComment = require('../models/ChapterComment');

// GET /api/courses/:courseId/chapters/:chapterId/comments
router.get('/courses/:courseId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const comments = await ChapterComment.find({ courseId, chapterId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ comments });
  } catch (err) {
    console.error('Get chapter comments error:', err);
    res.status(500).json({ message: 'Error fetching comments: ' + err.message });
  }
});

// POST /api/courses/:courseId/chapters/:chapterId/comments
router.post('/courses/:courseId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const { userId, userName, content } = req.body;

    if (!userName || !content) {
      return res.status(400).json({ message: 'userName and content are required' });
    }

    await ChapterComment.create({
      courseId,
      chapterId,
      userId: userId || null,
      userName,
      content,
    });

    const comments = await ChapterComment.find({ courseId, chapterId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(201).json({ comments });
  } catch (err) {
    console.error('Create chapter comment error:', err);
    res.status(500).json({ message: 'Error saving comment: ' + err.message });
  }
});

module.exports = router;


