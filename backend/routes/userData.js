const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserData = require('../models/UserData');
const MFACode = require('../models/MFACode');
const { sendMFAEmail } = require('../utils/email');
const { generateMFACode } = require('../utils/mfaHelper');
const { sendPaymentVerificationEmail, sendPaymentSuccessEmail, generateVerificationToken } = require('../utils/paymentEmail');
const PaymentVerification = require('../models/PaymentVerification');

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

    const user = await UserData.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const mfaCode = generateMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await MFACode.create({
      email: user.email,
      code: mfaCode,
      expiresAt: expiresAt,
      used: false
    });

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

    const mfaRecord = await MFACode.findOne({
      email: email.toLowerCase(),
      code: code,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!mfaRecord) {
      return res.status(401).json({ message: 'Code invalide ou expiré' });
    }

    mfaRecord.used = true;
    await mfaRecord.save();

    const user = await UserData.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

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

    const user = await UserData.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const mfaCode = generateMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await MFACode.create({
      email: user.email,
      code: mfaCode,
      expiresAt: expiresAt,
      used: false
    });

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

// NEW: SAVE USER INTERESTS
router.post('/save-interests', async (req, res) => {
  try {
    const { userId, email, interests } = req.body;

    let user;
    if (userId) {
      user = await UserData.findById(userId);
    } else if (email) {
      user = await UserData.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.interests = interests;
    user.interestsSetAt = new Date();
    await user.save();

    res.json({ 
      message: 'Intérêts enregistrés avec succès',
      interests: user.interests
    });
  } catch (err) {
    console.error('Save interests error:', err);
    res.status(500).json({ message: 'Error saving interests: ' + err.message });
  }
});

// NEW: ENROLL IN COURSE
router.post('/enroll-course', async (req, res) => {
  try {
    const { userId, courseId, courseTitle, totalChapters, thumbnail } = req.body;

    const user = await UserData.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Check if already enrolled
    const existing = user.enrolledCourses?.find(c => c.courseId === courseId);
    if (existing) {
      return res.json({ 
        message: 'Déjà inscrit à ce cours',
        enrollment: existing
      });
    }

    // Add new enrollment
    if (!user.enrolledCourses) user.enrolledCourses = [];
    
    const newEnrollment = {
      courseId,
      title: courseTitle,
      enrolledAt: new Date(),
      lastAccessed: new Date(),
      progress: 0,
      completedChapters: 0,
      totalChapters: totalChapters || 1,
      completedChapterIds: [],
      thumbnail: thumbnail || '',
      status: 'in_progress',
      activityLog: []
    };

    user.enrolledCourses.push(newEnrollment);
    await user.save();

    res.json({ 
      message: 'Inscription réussie',
      enrollment: newEnrollment
    });
  } catch (err) {
    console.error('Enroll course error:', err);
    res.status(500).json({ message: 'Error enrolling: ' + err.message });
  }
});

// TRACK ACTIVITY - Call this when user watches a chapter
router.post('/track-activity', async (req, res) => {
  try {
    const { userId, courseId, chapterId, chapterTitle, timeSpent, action } = req.body;

    const user = await UserData.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const enrollment = user.enrolledCourses?.find(c => c.courseId === courseId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Initialize activity log if it doesn't exist
    if (!enrollment.activityLog) {
      enrollment.activityLog = [];
    }

    // Add activity entry
    enrollment.activityLog.push({
      date: new Date(),
      chapterId,
      chapterTitle,
      timeSpent: timeSpent || 0, // in minutes
      action: action || 'continued'
    });

    // Update last accessed
    enrollment.lastAccessed = new Date();

    await user.save();

    res.json({ 
      message: 'Activité enregistrée',
      totalTime: enrollment.activityLog.reduce((acc, log) => acc + (log.timeSpent || 0), 0)
    });
  } catch (err) {
    console.error('Track activity error:', err);
    res.status(500).json({ message: 'Error tracking activity: ' + err.message });
  }
});



// GET ENROLLED COURSES
router.get('/enrolled-courses/:userId', async (req, res) => {
  try {
    const user = await UserData.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const enrolledCourses = user.enrolledCourses || [];
    
    res.json(enrolledCourses);
  } catch (err) {
    console.error('Get enrolled courses error:', err);
    res.status(500).json({ message: 'Error fetching courses: ' + err.message });
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
    const existingUser = await UserData.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userData = new UserData({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      phone: req.body.phone || '',
      phoneCode: req.body.phoneCode || '+33',
      location: req.body.location || '',
      occupation: req.body.occupation || '',
      bio: req.body.bio || '',
      avatar: req.body.avatar || 'initials',
      interests: [],
      enrolledCourses: [],
      certificates: []
    });

    const newUser = await userData.save();

    const mfaCode = generateMFACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await MFACode.create({
      email: newUser.email,
      code: mfaCode,
      expiresAt: expiresAt,
      used: false
    });

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

// PAYMENT ROUTES
router.post('/initiate-payment', async (req, res) => {
  try {
    const { userId, email, planId, plan, paymentMethod } = req.body;

    const user = await UserData.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PaymentVerification.create({
      token: verificationToken,
      userId: userId,
      email: email,
      planId: planId,
      planData: plan,
      paymentMethod: paymentMethod,
      verified: false,
      expiresAt: expiresAt
    });

    const emailSent = await sendPaymentVerificationEmail(
      email, 
      user.name, 
      plan, 
      verificationToken
    );

    if (!emailSent) {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.json({ 
      message: 'Email de vérification envoyé',
      success: true 
    });
  } catch (err) {
    console.error('Payment initiation error:', err);
    res.status(500).json({ message: 'Erreur lors de l\'initiation du paiement: ' + err.message });
  }
});

router.post('/verify-payment/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const verification = await PaymentVerification.findOne({
      token: token,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(401).json({ 
        message: 'Lien invalide ou expiré',
        success: false 
      });
    }

    verification.verified = true;
    await verification.save();

    const user = await UserData.findById(verification.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.subscription = {
      planId: verification.planId,
      planName: verification.planData.name,
      price: verification.planData.price,
      startDate: new Date(),
      status: 'active',
      paymentMethod: verification.paymentMethod,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    await user.save();

    await sendPaymentSuccessEmail(
      verification.email,
      user.name,
      verification.planData
    );

    res.json({ 
      message: 'Paiement confirmé avec succès',
      success: true,
      subscription: user.subscription
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: 'Erreur lors de la vérification: ' + err.message });
  }
});

router.get('/check-verification/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const verification = await PaymentVerification.findOne({ token });

    if (!verification) {
      return res.json({ verified: false, expired: true });
    }

    if (verification.expiresAt < new Date()) {
      return res.json({ verified: false, expired: true });
    }

    if (verification.verified) {
      const user = await UserData.findById(verification.userId);
      return res.json({ 
        verified: true, 
        expired: false,
        subscription: user.subscription 
      });
    }

    res.json({ verified: false, expired: false });
  } catch (err) {
    console.error('Check verification error:', err);
    res.status(500).json({ message: 'Erreur: ' + err.message });
  }
});


// Helper function to generate certificate ID
function generateCertificateId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CERT-${year}-${random}`;
}


// REMOVE THE DUPLICATE - Keep only this one at the END of your userData.js file
// Place this BEFORE module.exports = router;

// GET USER CERTIFICATES - Single unified endpoint
router.get('/certificates/:userId', async (req, res) => {
  try {
    const user = await UserData.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé',
        certificates: []
      });
    }

    const certificates = user.certificates || [];
    
    // Return certificates directly as an object with certificates array
    res.json({
      certificates: certificates
    });
  } catch (err) {
    console.error('Get certificates error:', err);
    res.status(500).json({ 
      message: 'Error fetching certificates: ' + err.message,
      certificates: []
    });
  }
});

// Helper function to generate certificate ID
function generateCertificateId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CERT-${year}-${random}`;
}



  
   
// UPDATE YOUR userData.js route - Find the /update-progress route and replace it with this:

// UPDATE COURSE PROGRESS with Certificate Generation
router.post('/update-progress', async (req, res) => {
  try {
    const { userId, courseId, chapterId, completed } = req.body;

    console.log('Update progress called:', { userId, courseId, chapterId, completed });

    const user = await UserData.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const enrollment = user.enrolledCourses?.find(c => c.courseId === courseId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Initialize completed chapters array
    if (!enrollment.completedChapterIds) {
      enrollment.completedChapterIds = [];
    }

    // Update completion status
    if (completed && !enrollment.completedChapterIds.includes(chapterId)) {
      enrollment.completedChapterIds.push(chapterId);
      enrollment.completedChapters = enrollment.completedChapterIds.length;
    }

    // Calculate progress
    const newProgress = Math.round((enrollment.completedChapters / enrollment.totalChapters) * 100);
    enrollment.progress = newProgress;
    enrollment.lastAccessed = new Date();

    console.log('Progress calculated:', {
      completedChapters: enrollment.completedChapters,
      totalChapters: enrollment.totalChapters,
      progress: newProgress
    });

    // Check if course is completed (100%)
    let certificateGenerated = false;
    let certificate = null;
    
    if (enrollment.progress >= 100 && enrollment.status !== 'completed') {
      console.log('Course completed! Generating certificate...');
      
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();

      // Initialize certificates array
      if (!user.certificates) {
        user.certificates = [];
      }

      // Check if certificate already exists
      const existingCert = user.certificates.find(c => c.courseId === courseId);
      
      if (!existingCert) {
        console.log('Creating new certificate...');
        
        // Fetch course details for category
        const Course = require('../models/Course');
        const courseDetails = await Course.findById(courseId);
        
        // Generate certificate
        const certificateId = generateCertificateId();
        const verificationToken = `VERIFY-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;

        // Calculate total time spent
        const totalMinutes = enrollment.activityLog 
          ? enrollment.activityLog.reduce((acc, log) => acc + (log.timeSpent || 0), 0)
          : 0;
        const totalHours = parseFloat((totalMinutes / 60).toFixed(1));

        certificate = {
          certificateId,
          courseId,
          courseTitle: enrollment.title,
          category: courseDetails?.category || 'Développement Professionnel',
          issuedDate: new Date(),
          completionDate: new Date(),
          verificationToken,
          imageUrl: '',
          totalHours,
          grade: 'Passed'
        };

        user.certificates.push(certificate);
        certificateGenerated = true;
        
        console.log('Certificate created:', certificate);

        // ✅ AUTOMATICALLY SEND CERTIFICATE EMAIL
        try {
          const { sendCertificateEmail } = require('../utils/email');
          
          console.log('Sending certificate email to:', user.email);
          
          const emailSent = await sendCertificateEmail(
            user.email,
            user.name,
            enrollment.title,
            certificateId,
            new Date(),
            certificate.category
          );

          if (emailSent) {
            console.log('✅ Certificate email sent successfully!');
          } else {
            console.log('⚠️ Certificate email failed to send');
          }
        } catch (emailError) {
          console.error('❌ Error sending certificate email:', emailError);
          // Don't fail the whole request if email fails
        }
      } else {
        console.log('Certificate already exists for this course');
      }
    }

    await user.save();
    console.log('User saved successfully');

    res.json({ 
      message: 'Progression mise à jour',
      enrollment,
      certificateGenerated,
      certificate
    });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ message: 'Error updating progress: ' + err.message });
  }
});

// Helper function to generate certificate ID (keep this if not already present)
function generateCertificateId() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CERT-${year}-${random}`;
}

// POST - Send certificate via email
router.post('/send-certificate-email', async (req, res) => {
  try {
    const { userId, email, certificateId, courseName, completionDate } = req.body;

    const user = await UserData.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Find the certificate
    const certificate = user.certificates?.find(c => c.certificateId === certificateId);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificat non trouvé' });
    }

    // Send certificate email
    const emailSent = await sendCertificateEmail(
      email,
      user.name,
      courseName,
      certificateId,
      completionDate,
      certificate.category || 'Développement Professionnel'
    );

    if (!emailSent) {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.json({ 
      message: 'Certificat envoyé par email avec succès',
      success: true 
    });
  } catch (err) {
    console.error('Send certificate email error:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi: ' + err.message });
  }
});
module.exports = router;