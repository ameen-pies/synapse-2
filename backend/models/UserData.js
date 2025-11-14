const mongoose = require('mongoose');
const userDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    default: ''
  },
  phoneCode: {  // NEW
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
    default: 'Felix'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userDataSchema.index({ email: 1 });

module.exports = mongoose.model('UserData', userDataSchema);