const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();  // Load environment variables

const app = express();
const analyticsRoutes = require('./routes/analyticsRoutes');


app.use('/api/analytics', analyticsRoutes);
// Connect to MongoDB database
connectDB();

// MIDDLEWARE - runs before routes
app.use(cors());  // Allow frontend to make requests
app.use(express.json());  // Parse JSON request bodies

// ROUTES
app.use('/api/userdata', require('./routes/userData'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/forums', require('./routes/forums'));
app.use('/api', require('./routes/courseChapters'));
// the reports route
const reportsRouter = require('./routes/reports');
app.use('/api/reports', reportsRouter);

// Test route - check if server is running
app.get('/', (req, res) => {
  res.json({ message: '🚀 API is running...' });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


