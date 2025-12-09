const mongoose = require('mongoose');

// Very flexible course schema – we don't enforce fields so it can
// directly mirror whatever is stored in the Mongo "courses" collection
const courseSchema = new mongoose.Schema(
  {
    // Common fields (optional, purely for documentation/autocomplete)
    title: String,
    description: String,
    category: String,
    tags: [String],
    images: {
      cover_image: String,
    },
    difficulty: String,
    duration_hours: Number,
    author: String,
    chapters: [
      {
        id: Number,
        title: String,
        duration: String,
        videoUrl: String,
        transcription: String,
      },
    ],
  },
  {
    strict: false, // allow any extra fields coming from the recommendation DB
    collection: process.env.COURSES_COLL || 'courses',
  }
);

module.exports = mongoose.model('Course', courseSchema);


