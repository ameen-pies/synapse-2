// Uses oembed to get video info (no API key needed)
// node addChapters.js

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name';

// Extract YouTube video ID
function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// Get video info using oembed (no API key)
async function getVideoInfo(videoUrl) {
  try {
    const response = await axios.get('https://www.youtube.com/oembed', {
      params: { url: videoUrl, format: 'json' }
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

// Scrape duration from YouTube page (backup method)
async function scrapeVideoDuration(videoId) {
  try {
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = response.data;
    
    // Try to find duration in multiple places
    const patterns = [
      /"lengthSeconds":"(\d+)"/,
      /\\"lengthSeconds\\":\\"(\d+)\\"/,
      /"approxDurationMs":"(\d+)"/
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const seconds = parseInt(match[1]);
        return Math.ceil(seconds / 60); // Convert to minutes
      }
    }
  } catch (error) {
    // Silently fail
  }
  return null;
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

async function addChaptersToAllCourses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const coursesCollection = db.collection('courses');

    const courses = await coursesCollection.find({}).toArray();
    console.log(`📚 Found ${courses.length} courses\n`);

    let updated = 0;
    let realDurations = 0;
    let fallbacks = 0;

    for (const course of courses) {
      const videoUrl = course.youtube_url || course.youtubeUrl || course.video_url;
      
      if (!videoUrl) {
        console.log(`⏭️  Skip: ${course.title} (no video)`);
        continue;
      }

      console.log(`\n🔍 Processing: ${course.title}`);
      
      let totalMinutes = null;
      const videoId = extractVideoId(videoUrl);
      
      if (videoId) {
        // Method 1: Try scraping
        totalMinutes = await scrapeVideoDuration(videoId);
        
        if (totalMinutes) {
          console.log(`   ✅ Found duration: ${formatDuration(totalMinutes)}`);
          realDurations++;
        } else {
          // Method 2: Try oembed (gives title at least)
          const info = await getVideoInfo(videoUrl);
          if (info?.title) {
            console.log(`   📹 Video exists: ${info.title.substring(0, 50)}...`);
          }
          
          // Use intelligent fallback based on title/category
          const title = (course.title || '').toLowerCase();
          if (title.includes('introduction') || title.includes('démarrer')) {
            totalMinutes = 30;
          } else if (title.includes('avancé') || title.includes('complet')) {
            totalMinutes = 120;
          } else {
            totalMinutes = 60;
          }
          console.log(`   ⚠️  Using smart fallback: ${formatDuration(totalMinutes)}`);
          fallbacks++;
        }
      } else {
        totalMinutes = 60;
        console.log(`   ⚠️  Invalid URL, using default: ${formatDuration(totalMinutes)}`);
        fallbacks++;
      }

      // Random chapters (3-6)
      const numChapters = Math.floor(Math.random() * 4) + 3;
      
      const chapters = [];
      for (let i = 1; i <= numChapters; i++) {
        chapters.push({
          id: i,
          title: `Chapitre ${i}`,
          duration: formatDuration(totalMinutes),
          youtube_url: videoUrl,
          videoUrl: videoUrl,
          transcription: `Contenu du chapitre ${i} du cours ${course.title}.`
        });
      }

      await coursesCollection.updateOne(
        { _id: course._id },
        { 
          $set: { chapters },
          $unset: { duration_hours: "" }
        }
      );

      updated++;
      console.log(`   ✅ Added ${numChapters} chapters`);
      
      // Be nice to YouTube
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`   ✅ Total updated: ${updated}`);
    console.log(`   🎥 Real durations found: ${realDurations}`);
    console.log(`   ⚠️  Fallback used: ${fallbacks}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addChaptersToAllCourses();