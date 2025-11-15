const crypto = require('crypto');

// Generate 6-digit MFA code
const generateMFACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { generateMFACode };