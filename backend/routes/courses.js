const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Helper function to parse duration and calculate total
function calculateCourseDuration(chapters) {
  if (!chapters || chapters.length === 0) return null;
  
  let totalMinutes = 0;
  let hasValidDuration = false;
  
  chapters.forEach(chapter => {
    if (chapter.duration) {
      const durationStr = chapter.duration.toLowerCase();
      
      // Match hours
      const hourMatch = durationStr.match(/(\d+)\s*h/i);
      if (hourMatch) {
        totalMinutes += parseInt(hourMatch[1]) * 60;
        hasValidDuration = true;
      }
      
      // Match minutes
      const minMatch = durationStr.match(/(\d+)\s*min/i);
      if (minMatch) {
        totalMinutes += parseInt(minMatch[1]);
        hasValidDuration = true;
      }
    }
  });
  
  if (!hasValidDuration || totalMinutes === 0) {
    return null;
  }
  
  // Convert to hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
}

// GET /api/courses - list all courses with calculated durations
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const courses = await Course.find().limit(limit).lean();
    
    // Calculate proper duration for each course
    const coursesWithDuration = courses.map(course => {
      const calculatedDuration = calculateCourseDuration(course.chapters);
      
      return {
        ...course,
        // Only use duration_hours if it's reasonable (<100) and no chapters exist
        duration_hours: calculatedDuration ? undefined : 
          (course.duration_hours && course.duration_hours < 100 ? course.duration_hours : undefined),
        calculated_duration: calculatedDuration,
        total_chapters: course.chapters ? course.chapters.length : 0
      };
    });
    
    res.json(coursesWithDuration);
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Error fetching courses: ' + err.message });
  }
});

// GET /api/courses/:id - single course with calculated duration
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const calculatedDuration = calculateCourseDuration(course.chapters);
    
    const courseWithDuration = {
      ...course,
      duration_hours: calculatedDuration ? undefined : 
        (course.duration_hours && course.duration_hours < 100 ? course.duration_hours : undefined),
      calculated_duration: calculatedDuration,
      total_chapters: course.chapters ? course.chapters.length : 0
    };
    
    res.json(courseWithDuration);
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Error fetching course: ' + err.message });
  }
});

module.exports = router;