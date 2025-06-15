# WhatsApp Web Clone

Une reproduction complète de WhatsApp Web avec toutes les fonctionnalités modernes, développée en JavaScript vanilla avec Tailwind CSS et JSON Server.

## 🚀 Fonctionnalités

### ✅ Messagerie
- **Messages en temps réel** (simulation avec setInterval)
- **Messages texte, images, vidéos, audio et documents**
- **Messages vocaux** avec enregistrement microphone
- **Indicateur de frappe** en temps réel
- **Statuts de lecture** (envoyé, livré, lu)
- **Recherche de conversations**
- **Filtres** (toutes, non lues, favoris, groupes)

### ✅ Appels
- **Appels vocaux** avec visualisation des ondes audio
- **Appels vidéo** avec flux simulé
- **Contrôles d'appel** (muet, haut-parleur, raccrocher)
- **Interface d'appel** réaliste
- **Appels entrants simulés**

### ✅ Notifications
- **Notifications navigateur** pour nouveaux messages
- **Notifications in-app** avec son
- **Badges de messages non lus**
- **Sons de notification**

### ✅ Interface utilisateur
- **Design fidèle à WhatsApp Web**
- **Mode responsive** (mobile/desktop)
- **Animations fluides**
- **Thème sombre WhatsApp**
- **Avatars et statuts en ligne**

### ✅ Authentification
- **Système de connexion** simple
- **Gestion des sessions**
- **Profils utilisateur**
- **Déconnexion sécurisée**

## 🛠️ Technologies utilisées

- **Frontend**: JavaScript Vanilla (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: JSON Server
- **Build Tool**: Vite
- **APIs**: Web Audio API, MediaDevices API, Notifications API

## 📦 Installation

1. **Cloner le projet**
\`\`\`bash
git clone <repository-url>
cd whatsapp-clone
\`\`\`

2. **Installer les dépendances**
\`\`\`bash
npm install
\`\`\`

3. **Démarrer l'application**
\`\`\`bash
npm run dev
\`\`\`

Cela démarre :
- Le serveur JSON Server sur `http://localhost:5001`
- L'application Vite sur `http://localhost:5173`

## 🎮 Utilisation

### Connexion
Utilisez un des comptes de test :
- **Zafe** - 777867740
- **Abdallah** - 778123456
- **Ousmane Marra** - 776543210
- **Maman Dié ODC** - 775555555
- **Zeynabe Ba** - 774444444

### Multi-utilisateurs
1. Ouvrez plusieurs onglets/navigateurs
2. Connectez-vous avec différents comptes
3. Envoyez des messages entre les comptes
4. Les messages apparaissent en temps réel

### Fonctionnalités avancées
- **Messages vocaux** : Cliquez sur le microphone
- **Appels** : Utilisez les boutons d'appel dans l'en-tête
- **Fichiers** : Cliquez sur le trombone pour joindre
- **Recherche** : Tapez dans la barre de recherche
- **Profil** : Cliquez sur votre avatar

## 🏗️ Architecture

\`\`\`
src/
├── script.js              # Point d'entrée principal
├── style.css              # Styles Tailwind personnalisés
└── utils/
    ├── api.js             # Appels API JSON Server
    ├── auth.js            # Authentification
    ├── calls.js           # Gestion des appels
    ├── notifications.js   # Système de notifications
    └── realtime.js        # Synchronisation temps réel
\`\`\`

## 🔧 Configuration

### JSON Server
Le serveur utilise le fichier `db.json` comme base de données. Structure :
- `chats` : Utilisateurs et leurs messages
- `notifications` : Notifications système
- `calls` : Historique des appels
- `status` : Statuts utilisateurs

### Temps réel
La synchronisation se fait via `setInterval` toutes les 2 secondes :
- Vérification de nouveaux messages
- Mise à jour des statuts utilisateurs
- Notifications automatiques

## 🎨 Personnalisation

### Couleurs WhatsApp
Les couleurs sont définies dans `tailwind.config.js` :
\`\`\`javascript
whatsapp: {
  light: "#25D366",
  dark: "#1ea952",
  bg: "#111b21",
  sidebar: "#222e35",
  chat: "#202c33",
  input: "#2a3942",
}
\`\`\`

### Réponses automatiques
Modifiez le tableau `responses` dans `script.js` pour personnaliser les réponses automatiques.

## 🚀 Déploiement

### Build de production
\`\`\`bash
npm run build
\`\`\`

### Déploiement
1. **Frontend** : Déployez le dossier `dist/` sur votre hébergeur
2. **Backend** : Déployez JSON Server sur Heroku, Railway, etc.
3. **Configuration** : Mettez à jour `API_URL` dans `api.js`

## 🐛 Dépannage

### Problèmes courants
1. **CORS** : Vérifiez la configuration dans `server.cjs`
2. **Microphone** : Autorisez l'accès dans le navigateur
3. **Notifications** : Autorisez les notifications du site

### Logs
- Serveur : Console du terminal
- Client : Console du navigateur (F12)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Design inspiré de WhatsApp Web
- Icônes de Font Awesome
- Framework Tailwind CSS

---

**Note** : Ce projet est à des fins éducatives et de démonstration. Il n'est pas affilié à WhatsApp ou Meta.
