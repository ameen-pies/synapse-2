from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Atlas configuration - FIXED
MONGODB_URI = os.getenv('MONGODB_URI')
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set")

# Extract database name from URI or use default
# URI format: mongodb+srv://user:pass@cluster.mongodb.net/dbname?params
try:
    client = MongoClient(MONGODB_URI)
    # Try to get database name from URI, otherwise use 'synapse' as default
    if '/' in MONGODB_URI.split('@')[-1]:
        db_name = MONGODB_URI.split('@')[-1].split('/')[1].split('?')[0]
        if not db_name:
            db_name = 'synapse'
    else:
        db_name = 'synapse'
    
    db = client[db_name]
    print(f"✅ Using database: {db_name}")
except Exception as e:
    print(f"❌ MongoDB URI parsing error: {str(e)}")
    raise

# Collections
users_collection = db['userdatas']
mfa_codes_collection = db['mfacodes']

# Email configuration
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'sender_email': os.getenv('SENDER_EMAIL'),
    'sender_password': os.getenv('SENDER_PASSWORD')
}

# Validate email configuration
if not EMAIL_CONFIG['sender_email'] or not EMAIL_CONFIG['sender_password']:
    print("⚠️  WARNING: Email configuration is incomplete. Set SENDER_EMAIL and SENDER_PASSWORD in .env")

# Pydantic models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyMFA(BaseModel):
    email: EmailStr
    code: str

class ResendCode(BaseModel):
    email: EmailStr

# Email sending function
def send_mfa_email(email: str, code: str, user_name: str = ""):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG['sender_email']
        msg['To'] = email
        msg['Subject'] = "Code de vérification Synapse"

        html = f"""
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {{ 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
              }}
              .container {{ 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 40px 20px;
                background-color: #ffffff;
              }}
              .header {{ 
                text-align: center; 
                margin-bottom: 30px;
              }}
              .logo {{ 
                font-size: 32px; 
                font-weight: bold; 
                color: #7c3aed;
                margin-bottom: 10px;
              }}
              .title {{
                font-size: 24px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 10px 0;
              }}
              .subtitle {{
                font-size: 16px;
                color: #6b7280;
                margin: 0;
              }}
              .code-box {{ 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px; 
                padding: 30px; 
                text-align: center; 
                margin: 30px 0;
              }}
              .code {{ 
                font-size: 42px; 
                font-weight: bold; 
                letter-spacing: 12px; 
                color: #ffffff;
                margin: 0;
              }}
              .message {{
                font-size: 16px;
                color: #4b5563;
                line-height: 1.6;
                margin: 20px 0;
              }}
              .warning {{
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }}
              .warning-text {{
                font-size: 14px;
                color: #92400e;
                margin: 0;
              }}
              .footer {{ 
                text-align: center; 
                color: #9ca3af; 
                font-size: 14px; 
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">synapse</div>
                <h1 class="title">Code de Vérification</h1>
                <p class="subtitle">Bonjour{' ' + user_name if user_name else ''} !</p>
              </div>
              
              <p class="message">
                Voici votre code de vérification pour vous connecter à Synapse :
              </p>
              
              <div class="code-box">
                <p class="code">{code}</p>
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
        """

        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
        server.sendmail(EMAIL_CONFIG['sender_email'], email, msg.as_string())
        server.quit()

        print(f"✅ MFA email sent successfully to: {email}")
        return True

    except Exception as e:
        print(f"❌ Error sending MFA email: {str(e)}")
        return False

# Generate MFA code
def generate_mfa_code():
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

@app.on_event("startup")
async def startup():
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        print(f"✅ MongoDB Atlas Connected Successfully to database: {db_name}")
        
        # Create indexes
        mfa_codes_collection.create_index("expiresAt", expireAfterSeconds=0)
        mfa_codes_collection.create_index([("email", 1), ("createdAt", -1)])
        print("✅ Database indexes created")
        
        # Print collection names for verification
        collections = db.list_collection_names()
        print(f"📦 Available collections: {collections}")
        
    except Exception as e:
        print(f"❌ MongoDB Connection Error: {str(e)}")
        raise

@app.post("/api/login")
async def login(user: UserLogin):
    try:
        # Find user by email
        db_user = users_collection.find_one({"email": user.email.lower()})
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        # Verify password
        # Handle both string and bytes password from database
        stored_password = db_user['password']
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
        
        if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        # Generate and send MFA code
        mfa_code = generate_mfa_code()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Save MFA code to MongoDB
        mfa_codes_collection.insert_one({
            "email": user.email.lower(),
            "code": mfa_code,
            "expiresAt": expires_at,
            "used": False,
            "createdAt": datetime.utcnow()
        })
        
        # Send email
        user_name = db_user.get('name', '')
        if not send_mfa_email(user.email, mfa_code, user_name):
            raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email")
        
        return {"message": "Code de vérification envoyé à votre email"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la connexion: {str(e)}")

@app.post("/api/verify-mfa")
async def verify_mfa(verify: VerifyMFA):
    try:
        # Find the most recent unused code
        mfa_record = mfa_codes_collection.find_one({
            "email": verify.email.lower(),
            "code": verify.code,
            "used": False,
            "expiresAt": {"$gt": datetime.utcnow()}
        }, sort=[("createdAt", -1)])
        
        if not mfa_record:
            raise HTTPException(status_code=401, detail="Code invalide ou expiré")
        
        # Mark code as used
        mfa_codes_collection.update_one(
            {"_id": mfa_record["_id"]},
            {"$set": {"used": True}}
        )
        
        # Get user details
        user = users_collection.find_one({"email": verify.email.lower()})
        
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Return user data (excluding password)
        user_response = {
            "id": str(user['_id']),
            "email": user['email'],
            "full_name": user.get('name', ''),
            "phone": user.get('phone', ''),
            "phoneCode": user.get('phoneCode', '+33'),
            "location": user.get('location', ''),
            "occupation": user.get('occupation', ''),
            "bio": user.get('bio', ''),
            "avatar": user.get('avatar', 'Felix')
        }
        
        return {
            "message": "Vérification réussie",
            "user": user_response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ MFA verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la vérification: {str(e)}")

@app.post("/api/resend-code")
async def resend_code(data: ResendCode):
    try:
        # Check if user exists
        user = users_collection.find_one({"email": data.email.lower()})
        
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Generate new code
        mfa_code = generate_mfa_code()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Save new code
        mfa_codes_collection.insert_one({
            "email": data.email.lower(),
            "code": mfa_code,
            "expiresAt": expires_at,
            "used": False,
            "createdAt": datetime.utcnow()
        })
        
        # Send email
        user_name = user.get('name', '')
        if not send_mfa_email(data.email, mfa_code, user_name):
            raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email")
        
        return {"message": "Nouveau code envoyé"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Resend code error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "MFA Authentication API - MongoDB Atlas",
        "database": db_name,
        "collections": db.list_collection_names()
    }

@app.get("/health")
async def health():
    try:
        # Test database connection
        client.admin.command('ping')
        return {
            "status": "healthy",
            "database": db_name,
            "mongodb": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)