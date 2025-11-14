const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();  // Load environment variables

const app = express();

// Connect to MongoDB database
connectDB();

// MIDDLEWARE - runs before routes
app.use(cors());  // Allow frontend to make requests
app.use(express.json());  // Parse JSON request bodies

// ROUTES
app.use('/api/userdata', require('./routes/userData'));

// Test route - check if server is running
app.get('/', (req, res) => {
  res.json({ message: '🚀 API is running...' });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
