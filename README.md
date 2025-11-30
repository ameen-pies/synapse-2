# 🎓 Synapse - Plateforme d'Apprentissage Intelligente

<div>
  
```ascii
   ███████╗██╗   ██╗███╗   ██╗ █████╗ ██████╗ ███████╗███████╗
   ██╔════╝╚██╗ ██╔╝████╗  ██║██╔══██╗██╔══██╗██╔════╝██╔════╝
   ███████╗ ╚████╔╝ ██╔██╗ ██║███████║██████╔╝███████╗█████╗  
   ╚════██║  ╚██╔╝  ██║╚██╗██║██╔══██║██╔═══╝ ╚════██║██╔══╝  
   ███████║   ██║   ██║ ╚████║██║  ██║██║     ███████║███████╗
   ╚══════╝   ╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚══════╝╚══════╝
```

**Une plateforme moderne d'apprentissage en ligne offrant des cours de qualité, des certificats professionnels et une communauté d'apprenants.**

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
</div>

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🌟 À Propos

**Synapse** est une plateforme d'apprentissage en ligne moderne conçue pour offrir une expérience d'apprentissage exceptionnelle. Elle permet aux étudiants d'accéder à des cours de qualité et de rejoindre une communauté active d'apprenants.

### Pourquoi Synapse ?

- ✨ **Interface Moderne** - Design épuré et intuitif
- 🎯 **Apprentissage Ciblé** - Cours organisés par niveau et thématique
- 💬 **Communauté Active** - Forums et groupes d'étude
- 📊 **Suivi de Progression** - Tableaux de bord personnalisés
- 🔒 **Sécurisé** - Authentification MFA et paiements sécurisés

---

## ✨ Fonctionnalités

### Pour les Étudiants

- 📚 **Bibliothèque de Cours**
  - Accès à plus de 50+ cours
  - Filtrage par niveau (Débutant, Intermédiaire, Avancé)
  - Système de recherche avancé
  - Contenu téléchargeable

- 📊 **Tableau de Bord Personnel**
  - Suivi de progression en temps réel
  - Statistiques détaillées
  - Cours recommandés
  - Historique d'apprentissage

- 💳 **Gestion des Abonnements**
  - Plans Basique, Professionnel et Premium
  - Paiements sécurisés (Carte, Virement, Mobile)
  - Vérification par email
  - Annulation en un clic

### Pour la Plateforme

- 🔐 **Authentification Avancée**
  - Inscription/Connexion sécurisée
  - Vérification MFA par email
  - Gestion des sessions
  - Récupération de mot de passe

- 💌 **Système d'Emails**
  - Emails de vérification
  - Confirmations de paiement
  - Notifications de cours
  - Reçus automatiques

- 👥 **Communauté**
  - Forums de discussion

---

## 🛠 Technologies

### Frontend

- **Framework**: React 18.3 avec TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4

### Backend

- **Database**: MongoDB Atlas
- **Authentication**: bcrypt + JWT

### DevOps & Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **API Client**: FastAPI

---

## 🚀 Installation

### Prérequis

Assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (v20 ou supérieur)
- [npm](https://www.npmjs.com/) (v9 ou supérieur)
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (compte gratuit)

### Installation du Projet

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/synapse.git

# 2. Naviguer dans le dossier du projet
cd synapse

# 3. Installer les dépendances du frontend
npm install

# 4. Installer les dépendances du backend
cd backend
npm install
cd ..
```

---

## ⚙️ Configuration

### Backend (.env)

Créez un fichier `.env` dans le dossier `backend/` :

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/synapse?retryWrites=true&w=majority

# Email Configuration (Gmail)
SENDER_EMAIL=votre-email@gmail.com
SENDER_PASSWORD=votre-mot-de-passe-app

# Server Configuration
PORT=5000


### Configuration MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster (gratuit)
3. Créez un utilisateur de base de données
4. Autorisez votre IP (ou 0.0.0.0/0 pour le développement)
5. Récupérez votre URI de connexion
6. Remplacez `<password>` par votre mot de passe dans l'URI

### Configuration Email (Gmail)

1. Activez la vérification en 2 étapes sur votre compte Gmail
2. Générez un mot de passe d'application :
   - Compte Google → Sécurité → Vérification en 2 étapes
   - Mots de passe d'application → Générer
3. Utilisez ce mot de passe dans `SENDER_PASSWORD`

---

## 💻 Utilisation

### Démarrage en Développement

```bash
# Terminal 1 - Frontend (port 8080)
npm run dev

# Terminal 2 - Backend (port 5000)
cd backend
npm run dev
```

L'application sera accessible sur :
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000

---

## 📁 Structure du Projet

```
synapse/
├── src/                          # Code source frontend
│   ├── components/              # Composants React
│   │   ├── ui/                 # Composants UI (shadcn)
│   │   ├── AppSidebar.tsx      # Barre latérale
│   │   ├── CourseCard.tsx      # Carte de cours
│   │   ├── CourseProgress.tsx  # Progression
│   │   └── DashboardLayout.tsx # Layout principal
│   ├── pages/                   # Pages de l'application
│   │   ├── Dashboard.tsx       # Tableau de bord
│   │   ├── Login.tsx           # Connexion
│   │   ├── Signup.tsx          # Inscription
│   │   ├── Subscription.tsx    # Gestion abonnements
│   │   ├── PaymentCheckout.tsx # Paiement
│   │   ├── PaymentSuccess.tsx  # Confirmation
│   │   └── ...                 # Autres pages
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilitaires et helpers
│   ├── App.tsx                  # Composant racine
│   └── main.tsx                 # Point d'entrée
├── backend/                      # Code source backend
│   ├── models/                  # Modèles Mongoose
│   │   ├── UserData.js         # Modèle utilisateur
│   │   ├── MFACode.js          # Codes MFA
│   │   └── PaymentVerification.js # Vérifications paiement
│   ├── routes/                  # Routes API
│   │   └── userData.js         # Routes utilisateurs
│   ├── utils/                   # Utilitaires backend
│   │   ├── email.js            # Envoi d'emails
│   │   ├── paymentEmail.js     # Emails de paiement
│   │   └── mfaHelper.js        # Helpers MFA
│   └── server.js               # Serveur Express
├── public/                       # Assets statiques
├── .env                         # Variables d'environnement (frontend)
├── backend/.env                 # Variables d'environnement (backend)
├── package.json                 # Dépendances frontend
├── backend/package.json         # Dépendances backend
├── tailwind.config.ts           # Configuration Tailwind
├── tsconfig.json                # Configuration TypeScript
└── vite.config.ts               # Configuration Vite
```

---

## 📚 Documentation

### API Endpoints

#### Authentification
```
POST   /api/userdata/login              # Connexion
POST   /api/userdata/verify-mfa         # Vérification MFA
POST   /api/userdata/                   # Inscription
POST   /api/userdata/resend-code        # Renvoyer code MFA
```

#### Utilisateurs
```
GET    /api/userdata/                   # Liste utilisateurs
GET    /api/userdata/:id                # Détails utilisateur
PUT    /api/userdata/:id                # Mise à jour utilisateur
DELETE /api/userdata/:id                # Supprimer utilisateur
GET    /api/userdata/check-email/:email # Vérifier email
```

#### Paiements
```
POST   /api/userdata/initiate-payment          # Initier paiement
POST   /api/userdata/verify-payment/:token     # Vérifier paiement
GET    /api/userdata/check-verification/:token # Statut vérification
```

### Plans d'Abonnement

| Plan | Prix/mois | Fonctionnalités |
|------|-----------|-----------------|
| **Basique** | 29.99 TND | 50+ cours, Certificats de base, Support email |
| **Professionnel** | 59.99 TND | Cours illimités, Certificats pro, Support 24/7, Mentorat |
| **Premium** | 119.99 TND | Tout + Coaching 1-on-1, Projets réels, Garantie emploi |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** votre branche (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add: Amazing Feature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### Guidelines de Contribution

- Suivez les conventions de code existantes
- Ajoutez des tests si nécessaire
- Mettez à jour la documentation
- Décrivez clairement vos changements dans la PR

---

## 📝 Roadmap

- [ ] Application mobile (React Native)
- [ ] Mode hors ligne
- [ ] Système de quiz interactifs
- [ ] Intégration vidéo en direct
- [ ] Marketplace de cours
- [ ] API publique pour développeurs
- [ ] Support multilingue
- [ ] Gamification avancée
- [ ] Themes

---


## 👥 Équipe

- **Développeur** - [@Doua Ben Rejeb](https://github.com/doas-is)
- **Développeur** - [@Mohamed Amin Helali](https://github.com/ameen-pies)

---

## 📄 License

Ce projet est sous licence MIT.

---

<div align="center">

**Fait avec ❤️ par l'équipe Synapse**

[⬆ Retour en haut](#-synapse---plateforme-dapprentissage-intelligente)

</div>
