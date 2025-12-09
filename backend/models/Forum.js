const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const forumSchema = new mongoose.Schema(
  {
    ownerId: { type: String },
    ownerName: { type: String },
    title: String,
    description: String,
    labels: [String],
    tags: [String],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [
      {
        userId: String,
        vote: { type: String, enum: ['up', 'down'] },
      },
    ],
    views: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    comments: [commentSchema],
  },
  {
    strict: false,
    collection: process.env.FORUMS_COLL || 'forums',
  }
);

module.exports = mongoose.model('Forum', forumSchema);
