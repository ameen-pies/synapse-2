const express = require('express');
const router = express.Router();
const Forum = require('../models/Forum');

// GET /api/forums - list all forum threads (global)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const forums = await Forum.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(forums);
  } catch (err) {
    console.error('Get forums error:', err);
    res.status(500).json({ message: 'Error fetching forums: ' + err.message });
  }
});

// GET /api/forums/:id - single forum thread + comments
router.get('/:id', async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id).lean();
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Increment view count (fire and forget)
    Forum.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.json(forum);
  } catch (err) {
    console.error('Get forum error:', err);
    res.status(500).json({ message: 'Error fetching forum: ' + err.message });
  }
});

// POST /api/forums - create new thread
router.post('/', async (req, res) => {
  try {
    const { title, description, labels, tags, userId, userName } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const forum = await Forum.create({
      ownerId: userId || null,
      ownerName: userName || 'Utilisateur',
      title,
      description,
      labels: labels || [],
      tags: tags || [],
    });

    res.status(201).json(forum);
  } catch (err) {
    console.error('Create forum error:', err);
    res.status(500).json({ message: 'Error creating forum: ' + err.message });
  }
});

// POST /api/forums/:id/comments - add a new global comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, userName, content } = req.body;

    if (!content || !userName) {
      return res.status(400).json({ message: 'userName and content are required' });
    }

    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const comment = {
      userId: userId || null,
      userName,
      content,
      createdAt: new Date(),
    };

    if (!forum.comments) forum.comments = [];
    forum.comments.unshift(comment);
    forum.replies = (forum.replies || 0) + 1;

    await forum.save();

    res.json({
      message: 'Comment added',
      forum,
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Error adding comment: ' + err.message });
  }
});

// DELETE /api/forums/:id - delete a thread (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body;

    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    if (forum.ownerId && forum.ownerId !== (userId || '')) {
      return res.status(403).json({ message: 'Not authorized to delete this forum' });
    }

    await forum.deleteOne();
    res.json({ message: 'Forum deleted' });
  } catch (err) {
    console.error('Delete forum error:', err);
    res.status(500).json({ message: 'Error deleting forum: ' + err.message });
  }
});

// POST /api/forums/:id/vote - up/down vote a thread
router.post('/:id/vote', async (req, res) => {
  try {
    const { userId, vote } = req.body; // vote: 'up' | 'down'
    if (!vote || !['up', 'down'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote' });
    }

    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const uid = userId || 'anonymous';
    forum.voters = forum.voters || [];

    const existing = forum.voters.find((v) => v.userId === uid);

    if (existing && existing.vote === vote) {
      // remove vote
      if (vote === 'up') forum.upvotes = Math.max(0, (forum.upvotes || 0) - 1);
      else forum.downvotes = Math.max(0, (forum.downvotes || 0) - 1);
      forum.voters = forum.voters.filter((v) => v.userId !== uid);
    } else {
      if (existing) {
        // switch vote
        if (existing.vote === 'up') {
          forum.upvotes = Math.max(0, (forum.upvotes || 0) - 1);
        } else {
          forum.downvotes = Math.max(0, (forum.downvotes || 0) - 1);
        }
        existing.vote = vote;
      } else {
        forum.voters.push({ userId: uid, vote });
      }

      if (vote === 'up') forum.upvotes = (forum.upvotes || 0) + 1;
      else forum.downvotes = (forum.downvotes || 0) + 1;
    }

    await forum.save();
    res.json({ message: 'Vote updated', forum });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ message: 'Error updating vote: ' + err.message });
  }
});

// POST /api/forums/:id/comments/:index/like - like/unlike a comment
router.post('/:id/comments/:index/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const idx = parseInt(req.params.index, 10);

    const forum = await Forum.findById(req.params.id);
    if (!forum || !forum.comments || idx < 0 || idx >= forum.comments.length) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const uid = userId || 'anonymous';
    const comment = forum.comments[idx];
    comment.likedBy = comment.likedBy || [];
    comment.likes = comment.likes || 0;

    if (comment.likedBy.includes(uid)) {
      comment.likedBy = comment.likedBy.filter((u) => u !== uid);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.likedBy.push(uid);
      comment.likes += 1;
    }

    await forum.save();
    res.json({ message: 'Comment like updated', forum });
  } catch (err) {
    console.error('Like comment error:', err);
    res.status(500).json({ message: 'Error liking comment: ' + err.message });
  }
});

// DELETE /api/forums/:id/comments/:index - delete a comment (owner or thread owner)
router.delete('/:id/comments/:index', async (req, res) => {
  try {
    const { userId } = req.body;
    const idx = parseInt(req.params.index, 10);

    const forum = await Forum.findById(req.params.id);
    if (!forum || !forum.comments || idx < 0 || idx >= forum.comments.length) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = forum.comments[idx];
    const uid = userId || '';

    if (comment.userId && comment.userId !== uid && forum.ownerId !== uid) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    forum.comments.splice(idx, 1);
    forum.replies = Math.max(0, (forum.replies || 1) - 1);

    await forum.save();

    res.json({ message: 'Comment deleted', forum });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: 'Error deleting comment: ' + err.message });
  }
});

// Add these routes to your backend forum routes (usually in routes/forum.js or similar)

// Add reply to a comment
router.post('/:id/comments/:commentId/replies', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { userId, userName, content } = req.body;

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Find the comment by _id
    const comment = forum.comments.id(commentId);
    if (!comment) {
      // Try to find by index if _id not found
      const commentIndex = parseInt(commentId);
      if (isNaN(commentIndex) || commentIndex < 0 || commentIndex >= forum.comments.length) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      const commentByIndex = forum.comments[commentIndex];
      commentByIndex.replies.push({
        userId,
        userName,
        content,
        likes: 0,
        likedBy: []
      });
    } else {
      comment.replies.push({
        userId,
        userName,
        content,
        likes: 0,
        likedBy: []
      });
    }

    await forum.save();
    res.json({ forum });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Error adding reply' });
  }
});

// Like a reply
router.post('/:id/comments/:commentId/replies/:replyId/like', async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Find the comment by _id
    let comment = forum.comments.id(commentId);
    if (!comment) {
      // Try to find by index if _id not found
      const commentIndex = parseInt(commentId);
      if (isNaN(commentIndex) || commentIndex < 0 || commentIndex >= forum.comments.length) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      comment = forum.comments[commentIndex];
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const userLikedIndex = reply.likedBy?.indexOf(userId) ?? -1;
    
    if (userLikedIndex === -1) {
      // User hasn't liked yet - add like
      reply.likes = (reply.likes || 0) + 1;
      if (!reply.likedBy) reply.likedBy = [];
      reply.likedBy.push(userId);
    } else {
      // User already liked - remove like
      reply.likes = Math.max(0, (reply.likes || 1) - 1);
      reply.likedBy.splice(userLikedIndex, 1);
    }

    await forum.save();
    res.json({ forum });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ message: 'Error liking reply' });
  }
});

// Delete a reply
router.delete('/:id/comments/:commentId/replies/:replyId', async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;
    const { userId } = req.body;

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    // Find the comment by _id
    let comment = forum.comments.id(commentId);
    if (!comment) {
      // Try to find by index if _id not found
      const commentIndex = parseInt(commentId);
      if (isNaN(commentIndex) || commentIndex < 0 || commentIndex >= forum.comments.length) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      comment = forum.comments[commentIndex];
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check permissions
    if (reply.userId !== userId && forum.ownerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    reply.deleteOne();
    await forum.save();
    res.json({ forum });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Error deleting reply' });
  }
});
module.exports = router;


