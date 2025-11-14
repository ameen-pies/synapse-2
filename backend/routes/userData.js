const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserData = require('../models/UserData');

// GET all user data - retrieves everything from database
router.get('/', async (req, res) => {
  try {
    // Find all documents and sort by newest first
    const data = await UserData.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data: ' + err.message });
  }
});

// CHECK if email exists (MUST be before /:id route)
router.get('/check-email/:email', async (req, res) => {
  try {
    const user = await UserData.findOne({ email: req.params.email.toLowerCase() });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ message: 'Error checking email: ' + err.message });
  }
});

// LOGIN endpoint - verify email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserData.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Return user data (excluding password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      occupation: user.occupation,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({ 
      message: 'Connexion réussie',
      user: userResponse
    });
  } catch (err) {
    res.status(500).json({ message: 'Error during login: ' + err.message });
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

// POST - Create new user data (SIGNUP)
router.post('/', async (req, res) => {
  // Check if email already exists
  try {
    const existingUser = await UserData.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Error checking email: ' + err.message });
  }

  // Hash the password before saving
  let hashedPassword;
  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(req.body.password, salt);
  } catch (err) {
    return res.status(500).json({ message: 'Error hashing password: ' + err.message });
  }

  // Create new document with data from request body
  const userData = new UserData({
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    password: hashedPassword, // Store hashed password
    phone: req.body.phone || '',
    location: req.body.location || '',
    occupation: req.body.occupation || '',
    bio: req.body.bio || '',
    avatar: req.body.avatar || 'Felix'
  });

  try {
    // Save to database
    const newData = await userData.save();
    
    // Return user data without password
    const userResponse = {
      _id: newData._id,
      name: newData.name,
      email: newData.email,
      phone: newData.phone,
      location: newData.location,
      occupation: newData.occupation,
      bio: newData.bio,
      avatar: newData.avatar,
      createdAt: newData.createdAt
    };
    
    res.status(201).json(userResponse);  // 201 = Created
  } catch (err) {
    res.status(400).json({ message: 'Error saving data: ' + err.message });
  }
});

// PUT - Update existing user data
router.put('/:id', async (req, res) => {
  try {
    // If password is being updated, hash it first
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedData = await UserData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }  // Return updated document
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