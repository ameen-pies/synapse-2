const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  chapterId: { type: String },
  chapterTitle: { type: String },
  timeSpent: { type: Number, default: 0 }, // in minutes
  action: { 
    type: String, 
    enum: ['started', 'continued', 'completed', 'paused'],
    default: 'continued'
  }
}, { _id: false });

const enrolledCourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  enrolledAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedChapters: { type: Number, default: 0 },
  totalChapters: { type: Number, default: 1 },
  completedChapterIds: [{ type: String }],
  thumbnail: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'paused'],
    default: 'in_progress'
  },
  completedAt: { type: Date },
  activityLog: [activityLogSchema] // Track all activity sessions
});

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  courseTitle: { type: String, required: true },
  issuedDate: { type: Date, default: Date.now },
  verificationToken: { type: String, required: true },
  imageUrl: { type: String, default: '' }, // For future PDF generation
  completionDate: { type: Date },
  totalHours: { type: Number, default: 0 }, // Hours spent on course
  grade: { type: String, default: 'Passed' }
});

const userDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  phoneCode: {
    type: String,
    default: '+33'
  },
  location: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: 'initials'
  },
  interests: [{
    type: String
  }],
  interestsSetAt: {
    type: Date
  },
  enrolledCourses: [enrolledCourseSchema],
  certificates: [certificateSchema], // NEW: Store certificates
  subscription: {
    planId: String,
    planName: String,
    price: Number,
    startDate: Date,
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    paymentMethod: String,
    nextBillingDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserData', userDataSchema);