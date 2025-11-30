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
    default: 'Felix'
  },
  // NEW: Subscription field
  subscription: {
    planId: {
      type: String,
      enum: ['basic', 'pro', 'premium', ''],
      default: ''
    },
    planName: {
      type: String,
      default: ''
    },
    price: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', ''],
      default: ''
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'mobile', ''],
      default: ''
    },
    nextBillingDate: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userDataSchema.index({ email: 1 });

module.exports = mongoose.model('UserData', userDataSchema);