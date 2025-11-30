// Create this file in: backend/models/PaymentVerification.js
const mongoose = require('mongoose');

const paymentVerificationSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  planData: {
    type: Object,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentVerification', paymentVerificationSchema);