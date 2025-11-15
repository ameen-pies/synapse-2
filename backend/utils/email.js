const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD
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
                <p>© 2024 Synapse. Tous droits réservés.</p>
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
    return false;
  }
};

module.exports = { sendMFAEmail };