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

// Generate unique verification token
const generateVerificationToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Send Payment Verification Email - IMPROVED DESIGN
const sendPaymentVerificationEmail = async (email, userName, plan, verificationToken) => {
  try {
    // FIXED: Changed to port 8080
    const verificationLink = `http://localhost:8080/verify-payment/${verificationToken}`;
    
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Confirmez votre paiement - Synapse',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              .plan-name {
                font-size: 28px;
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 10px;
              }
              .plan-price {
                font-size: 42px;
                font-weight: bold;
                color: #ffffff;
                margin: 10px 0;
              }
              .plan-note {
                font-size: 14px;
                color: #ffffff;
                opacity: 0.9;
              }
              .message {
                font-size: 16px;
                color: #4b5563;
                line-height: 1.6;
                margin: 20px 0;
              }
              .details-box {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
                font-size: 15px;
              }
              .detail-row:last-child {
                border-bottom: none;
                font-weight: 600;
                padding-top: 12px;
                margin-top: 5px;
                border-top: 2px solid #7c3aed;
              }
              .detail-label {
                color: #6b7280;
              }
              .detail-value {
                color: #1f2937;
                font-weight: 500;
              }
              .detail-row:last-child .detail-value {
                color: #7c3aed;
                font-size: 18px;
              }
              .confirm-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 48px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
              .link-text {
                color: #6b7280;
                font-size: 12px;
                margin-top: 15px;
                word-break: break-all;
                text-align: center;
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
                <p class="plan-name">${plan.name}</p>
                <p class="plan-price">${(parseFloat(plan.price) * 1.19).toFixed(3)} TND</p>
                <p class="plan-note">TVA incluse (19%)</p>
              </div>
              
              <div class="details-box">
                <div class="detail-row">
                  <span class="detail-label">Plan sélectionné</span>
                  <span class="detail-value">${plan.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Prix mensuel</span>
                  <span class="detail-value">${plan.price} TND</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">TVA (19%)</span>
                  <span class="detail-value">${(parseFloat(plan.price) * 0.19).toFixed(3)} TND</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total à payer</span>
                  <span class="detail-value">${(parseFloat(plan.price) * 1.19).toFixed(3)} TND</span>
                </div>
              </div>
              
              <p class="message" style="text-align: center;">
                Cliquez sur le bouton ci-dessous pour confirmer votre paiement et activer votre abonnement.
              </p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="confirm-button">
                  ✓ Confirmer le paiement
                </a>
              </div>

              <p class="message" style="text-align: center; font-size: 14px;">
                Ce lien de confirmation expire dans <strong>30 minutes</strong>.
              </p>

              <p class="link-text">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${verificationLink}" style="color: #7c3aed;">${verificationLink}</a>
              </p>
              
              <div class="warning">
                <p class="warning-text">
                  <strong>⚠️ Sécurité :</strong> Si vous n'avez pas initié ce paiement, ignorez cet email et assurez-vous que votre compte est sécurisé.
                </p>
              </div>
              
              <div class="footer">
                <p>© 2024 Synapse. Tous droits réservés.</p>
                <p>Plateforme d'apprentissage intelligente</p>
                <p style="margin-top: 10px; font-size: 12px;">
                  Besoin d'aide ? <a href="mailto:support@synapse.com" style="color: #7c3aed;">support@synapse.com</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Payment verification email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending payment verification email:', error);
    return false;
  }
};

// Send Payment Success Email (after confirmation) - IMPROVED
const sendPaymentSuccessEmail = async (email, userName, plan) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: '🎉 Paiement confirmé - Bienvenue sur Synapse !',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              .success-icon {
                font-size: 64px;
                margin: 20px 0;
              }
              .title {
                font-size: 28px;
                font-weight: 600;
                color: #1f2937;
                margin: 10px 0;
              }
              .message {
                font-size: 16px;
                color: #4b5563;
                line-height: 1.6;
                margin: 20px 0;
              }
              .success-box {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                color: white;
              }
              .plan-name {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .plan-price {
                font-size: 36px;
                font-weight: bold;
                margin: 10px 0;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 25px 0;
              }
              .info-item {
                background-color: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
              }
              .info-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                margin-bottom: 8px;
              }
              .info-value {
                font-size: 16px;
                color: #1f2937;
                font-weight: 600;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 48px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .footer { 
                text-align: center; 
                color: #9ca3af; 
                font-size: 14px; 
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
              @media only screen and (max-width: 600px) {
                .info-grid {
                  grid-template-columns: 1fr;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">synapse</div>
                <div class="success-icon">🎉</div>
                <h1 class="title">Paiement Confirmé !</h1>
              </div>
              
              <p class="message">
                Bonjour ${userName},<br><br>
                Votre paiement a été confirmé avec succès ! Votre abonnement <strong>${plan.name}</strong> est maintenant actif.
              </p>

              <div class="success-box">
                <div class="plan-name">${plan.name}</div>
                <div class="plan-price">${(parseFloat(plan.price) * 1.19).toFixed(3)} TND</div>
                <p style="margin: 0; opacity: 0.9;">TVA incluse • Activé aujourd'hui</p>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Montant payé</div>
                  <div class="info-value">${(parseFloat(plan.price) * 1.19).toFixed(3)} TND</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Prochain paiement</div>
                  <div class="info-value">${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                </div>
              </div>

              <p class="message">
                <strong>Ce que vous pouvez faire maintenant :</strong><br>
                • Accédez immédiatement à tous les cours de votre plan<br>
                • Obtenez des certificats professionnels reconnus<br>
                • Rejoignez notre communauté d'apprenants<br>
                • Profitez du support prioritaire 24/7
              </p>
              
              <div style="text-align: center;">
                <a href="http://localhost:8080/dashboard" class="cta-button">
                  🚀 Commencer l'apprentissage
                </a>
              </div>

              <p class="message" style="font-size: 14px; color: #6b7280;">
                Montant payé : <strong>${(parseFloat(plan.price) * 1.19).toFixed(3)} TND</strong> (TVA incluse)<br>
                Date d'activation : <strong>${new Date().toLocaleDateString('fr-FR')}</strong><br>
                Prochain paiement : <strong>${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</strong>
              </p>
              
              <div class="footer">
                <p>© 2024 Synapse. Tous droits réservés.</p>
                <p style="margin-top: 10px;">
                  Des questions ? <a href="mailto:support@synapse.com" style="color: #7c3aed;">Contactez-nous</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Payment success email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending success email:', error);
    return false;
  }
};

module.exports = { 
  sendPaymentVerificationEmail, 
  sendPaymentSuccessEmail,
  generateVerificationToken 
};