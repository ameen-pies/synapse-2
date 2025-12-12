const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with explicit configuration for better compatibility
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Use port 587 instead of 465
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  },
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send MFA email
const sendMFAEmail = async (email, code, userName = '') => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Code de vérification Synapse',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 40px 20px;
                background-color: #ffffff;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
              }
              .logo { 
                font-size: 32px; 
                font-weight: bold; 
                color: #7c3aed;
                margin-bottom: 10px;
              }
              .title {
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 10px 0;
              }
              .subtitle {
                font-size: 16px;
                color: #6b7280;
                margin: 0;
              }
              .code-box { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px; 
                padding: 30px; 
                text-align: center; 
                margin: 30px 0;
              }
              .code { 
                font-size: 42px; 
                font-weight: bold; 
                letter-spacing: 12px; 
                color: #ffffff;
                margin: 0;
              }
              .message {
                font-size: 16px;
                color: #4b5563;
                line-height: 1.6;
                margin: 20px 0;
              }
              .warning {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .warning-text {
                font-size: 14px;
                color: #92400e;
                margin: 0;
              }
              .footer { 
                text-align: center; 
                color: #9ca3af; 
                font-size: 14px; 
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">synapse</div>
                <h1 class="title">Code de Vérification</h1>
                <p class="subtitle">Bonjour${userName ? ' ' + userName : ''} !</p>
              </div>
              
              <p class="message">
                Voici votre code de vérification pour vous connecter à Synapse :
              </p>
              
              <div class="code-box">
                <p class="code">${code}</p>
              </div>
              
              <p class="message">
                Ce code expire dans <strong>10 minutes</strong>.
              </p>
              
              <div class="warning">
                <p class="warning-text">
                  <strong>⚠️ Sécurité :</strong> Si vous n'avez pas demandé ce code, ignorez cet email et assurez-vous que votre compte est sécurisé.
                </p>
              </div>
              
              <div class="footer">
                <p>© 2025 Synapse. Tous droits réservés.</p>
                <p>Plateforme d'apprentissage intelligente</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ MFA email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending MFA email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

// Send certificate email
const sendCertificateEmail = async (recipientEmail, recipientName, courseName, certificateId, completionDate, category) => {
  try {
    const formattedDate = new Date(completionDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const mailOptions = {
      from: `"Synapse" <${process.env.SENDER_EMAIL}>`,
      to: recipientEmail,
      subject: `🏆 Certificat obtenu : ${courseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Crimson+Text:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: #374151;
              background: linear-gradient(135deg, #667eea15 0%, #764ba215 50%, #f5f7fa 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
            }
            
            .email-wrapper {
              max-width: 650px;
              margin: 0 auto;
              background: white;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(103, 126, 234, 0.1);
              border: 1px solid #e5e7eb;
            }
            
            /* Header */
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 50px 40px 40px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%);
            }
            
            .logo {
              font-size: 42px;
              font-weight: 700;
              letter-spacing: -1px;
              margin-bottom: 16px;
              position: relative;
              display: inline-block;
            }
            
            .logo::after {
              content: '';
              position: absolute;
              bottom: -8px;
              left: 25%;
              width: 50%;
              height: 3px;
              background: rgba(255, 255, 255, 0.3);
              border-radius: 2px;
            }
            
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin: 0 0 12px 0;
              letter-spacing: -0.5px;
            }
            
            .header-subtitle {
              font-size: 16px;
              opacity: 0.9;
              font-weight: 400;
              margin: 0;
            }
            
            /* Content */
            .content {
              padding: 50px 40px;
            }
            
            .greeting {
              font-size: 18px;
              margin-bottom: 32px;
              color: #4b5563;
            }
            
            .greeting strong {
              color: #1f2937;
            }
            
            /* Certificate Preview */
            .certificate-preview-wrapper {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 20px;
              padding: 40px;
              margin: 40px 0;
              position: relative;
              overflow: hidden;
              text-align: center;
            }
            
            .certificate-preview-wrapper::before {
              content: '';
              position: absolute;
              inset: 4px;
              border: 2px dashed #cbd5e1;
              border-radius: 16px;
              pointer-events: none;
            }
            
            .certificate-icon {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              display: inline-block;
              margin: 0 auto 24px;
              box-shadow: 0 10px 20px rgba(103, 126, 234, 0.2);
              line-height: 80px;
              font-size: 40px;
            }
            
            .course-title {
              font-family: 'Crimson Text', Georgia, serif;
              font-size: 28px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 12px;
              line-height: 1.3;
            }
            
            .course-category {
              display: inline-block;
              background: #e0e7ff;
              color: #4f46e5;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 20px;
            }
            
            .completion-info {
              color: #64748b;
              font-size: 15px;
              margin-bottom: 24px;
            }
            
            .certificate-id-badge {
              display: inline-block;
              background: #f1f5f9;
              color: #475569;
              padding: 10px 20px;
              border-radius: 12px;
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 14px;
              letter-spacing: 1px;
              border: 1px solid #cbd5e1;
            }
            
            /* Stats */
            .stats-grid {
              display: table;
              width: 100%;
              margin: 40px 0;
            }
            
            .stat-card {
              display: table-cell;
              background: #f8fafc;
              border-radius: 16px;
              padding: 24px 12px;
              text-align: center;
              border: 1px solid #e2e8f0;
              width: 33.33%;
            }
            
            .stat-card + .stat-card {
              border-left: none;
            }
            
            .stat-icon {
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%);
              border-radius: 12px;
              display: inline-block;
              margin: 0 auto 16px;
              line-height: 48px;
              font-size: 24px;
              color: #4f46e5;
            }
            
            .stat-value {
              font-size: 16px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 4px;
            }
            
            .stat-label {
              font-size: 12px;
              color: #64748b;
              font-weight: 500;
            }
            
            /* CTA Button */
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              padding: 18px 40px;
              border-radius: 14px;
              font-weight: 600;
              font-size: 16px;
              margin: 30px 0;
              text-align: center;
              box-shadow: 0 10px 25px rgba(103, 126, 234, 0.3);
            }
            
            .cta-container {
              text-align: center;
              margin: 40px 0;
            }
            
            /* Tips */
            .tips {
              background: #f0f9ff;
              border-radius: 16px;
              padding: 28px;
              margin: 40px 0;
              border-left: 4px solid #0ea5e9;
            }
            
            .tip-title {
              font-size: 18px;
              font-weight: 600;
              color: #0369a1;
              margin-bottom: 12px;
            }
            
            .tip-content {
              color: #0c4a6e;
              font-size: 15px;
              line-height: 1.6;
            }
            
            /* Footer */
            .footer {
              background: #f8fafc;
              padding: 40px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            
            .footer-logo {
              font-size: 28px;
              font-weight: 700;
              color: #667eea;
              margin-bottom: 16px;
              letter-spacing: -0.5px;
            }
            
            .footer-tagline {
              color: #64748b;
              font-size: 15px;
              margin-bottom: 24px;
              font-weight: 500;
            }
            
            .social-links {
              margin: 24px 0;
            }
            
            .social-link {
              display: inline-block;
              width: 40px;
              height: 40px;
              background: #e2e8f0;
              border-radius: 50%;
              color: #64748b;
              text-decoration: none;
              font-size: 16px;
              margin: 0 10px;
              line-height: 40px;
            }
            
            .copyright {
              color: #94a3b8;
              font-size: 14px;
              margin-top: 24px;
            }
            
            /* Responsive */
            @media only screen and (max-width: 600px) {
              .email-wrapper {
                border-radius: 16px;
              }
              
              .header, .content {
                padding: 30px 20px !important;
              }
              
              .header h1 {
                font-size: 26px !important;
              }
              
              .course-title {
                font-size: 22px !important;
              }
              
              .stats-grid {
                display: block !important;
              }
              
              .stat-card {
                display: block !important;
                width: 100% !important;
                margin-bottom: 15px !important;
              }
              
              .certificate-preview-wrapper {
                padding: 25px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <!-- Header -->
            <div class="header">
              <div class="logo">synapse</div>
              <h1>Certificat Obtenu &#127881;</h1>
              <p class="header-subtitle">Félicitations pour votre accomplissement !</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">
                Bonjour <strong>${recipientName}</strong>,<br>
                Nous sommes ravis de vous annoncer que vous avez obtenu un nouveau certificat !
              </p>
              
              <!-- Certificate Preview -->
              <div class="certificate-preview-wrapper">
                <div class="certificate-icon">&#127942;</div>
                <h2 class="course-title">${courseName}</h2>
                <div class="course-category">${category || 'Développement Professionnel'}</div>
                <p class="completion-info">
                  Complété avec succès le <strong>${formattedDate}</strong>
                </p>
                <div class="certificate-id-badge">${certificateId}</div>
              </div>
              
              <!-- Stats -->
              <table class="stats-grid" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="stat-card">
                    <div class="stat-icon">&#10004;</div>
                    <div class="stat-value">Cours Complété</div>
                    <div class="stat-label">100% de progression</div>
                  </td>
                  <td class="stat-card">
                    <div class="stat-icon">&#127919;</div>
                    <div class="stat-value">Compétences</div>
                    <div class="stat-label">Niveau expert validé</div>
                  </td>
                  <td class="stat-card">
                    <div class="stat-icon">&#11088;</div>
                    <div class="stat-value">Certification</div>
                    <div class="stat-label">Reconnue professionnellement</div>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${frontendURL}/certificates" class="cta-button">
                  Voir Mes Certificats &#8594;
                </a>
                <p style="color: #64748b; font-size: 14px; margin-top: 12px;">
                  Accédez à votre tableau de bord pour télécharger et partager votre certificat
                </p>
              </div>
              
              <!-- Tips -->
              <div class="tips">
                <div class="tip-title">&#128161; Conseil Pro</div>
                <p class="tip-content">
                  Partagez votre certificat sur LinkedIn et ajoutez-le à votre profil professionnel pour valoriser 
                  vos nouvelles compétences auprès des recruteurs et développer votre réseau.
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 15px; text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                Continuez votre parcours d'apprentissage et découvrez de nouveaux cours adaptés à vos intérêts !
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-logo">synapse</div>
              <p class="footer-tagline">Votre plateforme d'apprentissage intelligente</p>
              
              <div class="social-links">
                <a href="#" class="social-link">X</a>
                <a href="#" class="social-link">in</a>
                <a href="#" class="social-link">f</a>
                <a href="#" class="social-link">&#128247;</a>
              </div>
              
              <p class="copyright">
                &copy; 2025 Synapse. Tous droits réservés.<br>
                <small>Cet email vous a été envoyé car vous êtes inscrit sur notre plateforme.</small>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Certificate email sent successfully to:', recipientEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending certificate email:', error);
    return false;
  }
};

// Send report email to admin
const sendReportEmail = async (adminEmail, reportData) => {
  try {
    const {
      reportId,
      contentType,
      contentTitle,
      contentId,
      reporterName,
      reporterEmail,
      reason,
      message,
      reportedAt
    } = reportData;

    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const contentTypeLabel = {
      course: 'Cours',
      blog: 'Blog',
      forum: 'Forum'
    }[contentType] || 'Contenu';

    const mailOptions = {
      from: `"Synapse Reports" <${process.env.SENDER_EMAIL}>`,
      to: adminEmail,
      subject: `🚨 Nouveau signalement: ${contentTypeLabel} - ${contentTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              line-height: 1.6;
              color: #374151;
              background-color: #f9fafb;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .alert-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
            }
            .info-section {
              background: #f9fafb;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #3b82f6;
            }
            .info-row {
              display: flex;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
              min-width: 140px;
            }
            .info-value {
              color: #1f2937;
              flex: 1;
            }
            .reason-box {
              background: #fef3c7;
              border: 2px solid #fbbf24;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
            }
            .reason-label {
              font-weight: 600;
              color: #92400e;
              margin-bottom: 8px;
              font-size: 14px;
              text-transform: uppercase;
            }
            .reason-text {
              color: #78350f;
              font-size: 16px;
              font-weight: 500;
            }
            .message-box {
              background: #f0f9ff;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
            }
            .message-label {
              font-weight: 600;
              color: #0369a1;
              margin-bottom: 8px;
            }
            .message-text {
              color: #0c4a6e;
              white-space: pre-wrap;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 10px;
              font-weight: 600;
              margin: 10px 5px;
              text-align: center;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .report-id {
              font-family: 'Monaco', monospace;
              background: #e5e7eb;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="alert-icon">🚨</div>
              <h1>Nouveau Signalement</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Action requise</p>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Un utilisateur a signalé du contenu qui nécessite votre attention.
              </p>
              
              <div class="info-section">
                <div class="info-row">
                  <div class="info-label">ID Signalement:</div>
                  <div class="info-value"><span class="report-id">${reportId}</span></div>
                </div>
                <div class="info-row">
                  <div class="info-label">Type de contenu:</div>
                  <div class="info-value"><strong>${contentTypeLabel}</strong></div>
                </div>
                <div class="info-row">
                  <div class="info-label">Titre du contenu:</div>
                  <div class="info-value"><strong>${contentTitle}</strong></div>
                </div>
                <div class="info-row">
                  <div class="info-label">ID du contenu:</div>
                  <div class="info-value"><span class="report-id">${contentId}</span></div>
                </div>
                <div class="info-row">
                  <div class="info-label">Signalé par:</div>
                  <div class="info-value">${reporterName}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${reporterEmail}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Date:</div>
                  <div class="info-value">${reportedAt}</div>
                </div>
              </div>
              
              <div class="reason-box">
                <div class="reason-label">⚠️ Raison du signalement</div>
                <div class="reason-text">${reason}</div>
              </div>
              
              ${message ? `
              <div class="message-box">
                <div class="message-label">💬 Message de l'utilisateur</div>
                <div class="message-text">${message}</div>
              </div>
              ` : ''}
              
              <div class="button-container">
                <a href="${frontendURL}/admin/reports" class="cta-button">
                  Voir tous les signalements
                </a>
                <a href="${frontendURL}/${contentType}/${contentId}" class="cta-button">
                  Voir le contenu
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Ce signalement a été automatiquement enregistré dans la base de données avec le statut "pending".
              </p>
            </div>
            
            <div class="footer">
              <strong>synapse</strong><br>
              © 2025 Synapse. Tous droits réservés.
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Report email sent successfully to admin:', adminEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending report email:', error);
    return false;
  }
};

module.exports = { sendMFAEmail, sendCertificateEmail, sendReportEmail };
