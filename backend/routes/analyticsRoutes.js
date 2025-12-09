const express = require('express');
const router = express.Router();
const UserData = require('../models/UserData');
const Course = require('../models/Course');

// Add CORS headers to all analytics routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// GET /api/analytics/:userId - Get user learning analytics
router.get('/:userId', async (req, res) => {
  try {
    const user = await UserData.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enrolledCourses = user.enrolledCourses || [];
    
    // Calculate stats
    const completedCourses = enrolledCourses.filter(c => c.status === 'completed').length;
    const enrolledCount = enrolledCourses.length;
    
    // Calculate total hours from activity logs
    let totalMinutes = 0;
    enrolledCourses.forEach(course => {
      if (course.activityLog && course.activityLog.length > 0) {
        course.activityLog.forEach(log => {
          totalMinutes += log.timeSpent || 0;
        });
      }
    });
    const totalHours = Math.round(totalMinutes / 60);
    
    // Calculate overall progress
    const avgProgress = enrolledCount > 0 
      ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCount)
      : 0;
    
    const certificates = user.certificates ? user.certificates.length : 0;
    
    const averageTimePerCourse = enrolledCount > 0 ? totalHours / enrolledCount : 0;

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    const today = new Date();
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      let dayMinutes = 0;
      enrolledCourses.forEach(course => {
        if (course.activityLog) {
          course.activityLog.forEach(log => {
            const logDate = new Date(log.date);
            if (logDate >= date && logDate < nextDate) {
              dayMinutes += log.timeSpent || 0;
            }
          });
        }
      });
      
      weeklyActivity.push({
        day: daysOfWeek[date.getDay()],
        hours: Math.round(dayMinutes / 60 * 10) / 10
      });
    }

    // Category progress - fetch actual course data
    const categoryMap = new Map();
    
    for (const enrollment of enrolledCourses) {
      try {
        // Fetch actual course data to get category
        const course = await Course.findById(enrollment.courseId);
        const category = course?.category || 'Général';
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            subject: category,
            courses: 0,
            totalProgress: 0,
            totalTime: 0
          });
        }
        
        const cat = categoryMap.get(category);
        cat.courses += 1;
        cat.totalProgress += enrollment.progress || 0;
        
        // Calculate time for this course
        let courseMinutes = 0;
        if (enrollment.activityLog) {
          enrollment.activityLog.forEach(log => {
            courseMinutes += log.timeSpent || 0;
          });
        }
        cat.totalTime += Math.round(courseMinutes / 60 * 10) / 10;
      } catch (err) {
        console.error('Error fetching course:', err);
      }
    }
    
    const categoryProgress = Array.from(categoryMap.values()).map(cat => ({
      subject: cat.subject,
      courses: cat.courses,
      progress: cat.courses > 0 ? Math.round(cat.totalProgress / cat.courses) : 0,
      totalTime: cat.totalTime
    }));

    // Completion trend (last 6 months)
    const completionTrend = [];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const completed = enrolledCourses.filter(course => {
        if (course.completedAt) {
          const completedDate = new Date(course.completedAt);
          return completedDate >= monthStart && completedDate <= monthEnd;
        }
        return false;
      }).length;
      
      completionTrend.push({
        month: months[date.getMonth()],
        completed
      });
    }

    // Status distribution
    const statusDistribution = {
      completed: enrolledCourses.filter(c => c.status === 'completed').length,
      in_progress: enrolledCourses.filter(c => c.status === 'in_progress').length,
      paused: enrolledCourses.filter(c => c.status === 'paused').length,
      not_started: enrolledCourses.filter(c => c.status === 'not_started').length
    };

    console.log('Analytics Response:', {
      completedCourses,
      totalHours,
      certificates,
      overallProgress: avgProgress,
      enrolledCount,
      averageTimePerCourse: Math.round(averageTimePerCourse * 10) / 10,
      weeklyActivity,
      categoryProgress,
      statusDistribution
    });

    res.json({
      stats: {
        completedCourses,
        totalHours,
        certificates,
        overallProgress: avgProgress,
        enrolledCount,
        averageTimePerCourse: Math.round(averageTimePerCourse * 10) / 10
      },
      weeklyActivity,
      categoryProgress,
      completionTrend,
      statusDistribution
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Error fetching analytics: ' + err.message });
  }
});

module.exports = router;