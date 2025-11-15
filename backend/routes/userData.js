const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserData = require('../models/UserData');
const MFACode = require('../models/MFACode');
const { sendMFAEmail } = require('../utils/email');
const { generateMFACode } = require('../utils/mfaHelper');

// GET all user data
router.get('/', async (req, res) => {
  try {
    const data = await UserData.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data: ' + err.message });
  }
});

// CHECK if email exists
router.get('/check-email/:email', async (req, res) => {
  try {
    const user = await UserData.findOne({ email: req.params.email.toLowerCase() });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ message: 'Error checking email: ' + err.message });
  }
});

// LOGIN endpoint - Step 1: Verify credentials and send MFA code
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserData.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Generate MFA code
    const mfaCode = generateMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save MFA code to database
    await MFACode.create({
      email: user.email,
      code: mfaCode,
      expiresAt: expiresAt,
      used: false
    });

    // Send email
    const emailSent = await sendMFAEmail(user.email, mfaCode, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.json({ 
      message: 'Code de vérification envoyé à votre email',
      email: user.email
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login: ' + err.message });
  }
});

// VERIFY MFA - Step 2: Verify code and complete login
router.post('/verify-mfa', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find the most recent unused code
    const mfaRecord = await MFACode.findOne({
      email: email.toLowerCase(),
      code: code,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!mfaRecord) {
      return res.status(401).json({ message: 'Code invalide ou expiré' });
    }

    // Mark code as used
    mfaRecord.used = true;
    await mfaRecord.save();

    // Get user data
    const user = await UserData.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Return user data (excluding password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      phoneCode: user.phoneCode,
      location: user.location,
      occupation: user.occupation,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({ 
      message: 'Vérification réussie',
      user: userResponse
    });
  } catch (err) {
    console.error('MFA verification error:', err);
    res.status(500).json({ message: 'Error during verification: ' + err.message });
  }
});

// RESEND MFA CODE
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await UserData.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Generate new MFA code
    const mfaCode = generateMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save new code
    await MFACode.create({
      email: user.email,
      code: mfaCode,
      expiresAt: expiresAt,
      used: false
    });

    // Send email
    const emailSent = await sendMFAEmail(user.email, mfaCode, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.json({ message: 'Nouveau code envoyé' });
  } catch (err) {
    console.error('Resend code error:', err);
    res.status(500).json({ message: 'Error resending code: ' + err.message });
  }
});

// GET single user data by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await UserData.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data: ' + err.message });
  }
});

// POST - Create new user (SIGNUP with MFA)
router.post('/', async (req, res) => {
  try {
    // Check if email exists
    const existingUser = await UserData.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const userData = new UserData({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      phone: req.body.phone || '',
      phoneCode: req.body.phoneCode || '+33',
      location: req.body.location || '',
      occupation: req.body.occupation || '',
      bio: req.body.bio || '',
      avatar: req.body.avatar || 'initials'
    });

    const newUser = await userData.save();

    // Generate MFA code
    const mfaCode = generateMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save MFA code
    await MFACode.create({
      email: newUser.email,
      code: mfaCode,
      expiresAt: expiresAt,
      used: false
    });

    // Send email
    const emailSent = await sendMFAEmail(newUser.email, mfaCode, newUser.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.status(201).json({
      message: 'Inscription réussie. Vérifiez votre email.',
      email: newUser.email
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ message: 'Error saving data: ' + err.message });
  }
});

// PUT - Update existing user data
router.put('/:id', async (req, res) => {
  try {
    // If password is being updated, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedData = await UserData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedData) {
      return res.status(404).json({ message: 'Data not found' });
    }
    
    res.json(updatedData);
  } catch (err) {
    res.status(400).json({ message: 'Error updating data: ' + err.message });
  }
});

// DELETE - Remove user data
router.delete('/:id', async (req, res) => {
  try {
    const deletedData = await UserData.findByIdAndDelete(req.params.id);
    
    if (!deletedData) {
      return res.status(404).json({ message: 'Data not found' });
    }
    
    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting data: ' + err.message });
  }
});

module.exports = router;