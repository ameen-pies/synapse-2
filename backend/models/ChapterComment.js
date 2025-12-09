const mongoose = require('mongoose');

const chapterCommentSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    chapterId: { type: String, required: true },
    userId: { type: String },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'chapter_comments',
  }
);

module.exports = mongoose.model('ChapterComment', chapterCommentSchema);


