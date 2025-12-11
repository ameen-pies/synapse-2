const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const { sendReportEmail } = require('../utils/email');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'test';

// POST - Create a new report
router.post('/', async (req, res) => {
  const { contentId, contentType, reporterId, reason, message } = req.body;

  if (!contentId || !contentType || !reporterId || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Get reporter details
    const reporter = await db.collection('userdatas').findOne({ 
      _id: new ObjectId(reporterId) 
    });

    if (!reporter) {
      return res.status(404).json({ error: 'Reporter not found' });
    }

    // Get content details based on type
    let content = null;
    let contentTitle = 'Unknown Content';
    
    if (contentType === 'course') {
      content = await db.collection('courses').findOne({ 
        _id: new ObjectId(contentId) 
      });
      contentTitle = content?.title || 'Unknown Course';
    } else if (contentType === 'blog') {
      content = await db.collection('blogs').findOne({ 
        _id: new ObjectId(contentId) 
      });
      contentTitle = content?.title || 'Unknown Blog';
    } else if (contentType === 'forum') {
      content = await db.collection('forums').findOne({ 
        _id: new ObjectId(contentId) 
      });
      contentTitle = content?.title || 'Unknown Forum';
    }

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Create report document
    const report = {
      contentId: new ObjectId(contentId),
      contentType,
      contentTitle,
      reporterId: new ObjectId(reporterId),
      reporterName: reporter.name || reporter.email,
      reporterEmail: reporter.email,
      reason,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      resolvedAt: null,
      resolvedBy: null
    };

    // Insert report into database
    const result = await db.collection('reports').insertOne(report);

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendReportEmail(
        adminEmail,
        {
          reportId: result.insertedId.toString(),
          contentType,
          contentTitle,
          contentId: contentId.toString(),
          reporterName: reporter.name || reporter.email,
          reporterEmail: reporter.email,
          reason,
          message: message || 'No additional message',
          reportedAt: new Date().toLocaleString('fr-FR')
        }
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully',
      reportId: result.insertedId 
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  } finally {
    await client.close();
  }
});

// GET - Fetch all reports (admin only)
router.get('/', async (req, res) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const reports = await db.collection('reports')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(reports);

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  } finally {
    await client.close();
  }
});

// PATCH - Update report status (admin only)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, resolvedBy } = req.body;

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const updateData = {
      status,
      resolvedAt: status === 'resolved' ? new Date() : null,
      resolvedBy: resolvedBy || null
    };

    const result = await db.collection('reports').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ success: true, message: 'Report updated successfully' });

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  } finally {
    await client.close();
  }
});

module.exports = router;