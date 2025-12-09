const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    content: String,
    category: String,
    tags: [String],
    images: {
      cover_image: String,
    },
    author: String,
    created_at: Date,
    read_time: String,
  },
  {
    strict: false,
    collection: process.env.BLOGS_COLL || 'blogs',
  }
);

module.exports = mongoose.model('Blog', blogSchema);


