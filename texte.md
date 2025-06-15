Exemple de structure du projet:
whatsapp-clone/
├── public/                     # Fichiers statiques (images, favicon, etc.)
│   └── assets/
│       └── logo.png
│
├── src/
│   ├── api/                    # Appels à JSON Server
│   │   └── api.js
│   │
│   ├── components/             # Composants JS (ex: contact, message, input)
│   │   ├── ContactList.js
│   │   ├── MessageBubble.js
│   │   └── MessageInput.js
│   │
│   ├── pages/                  # Vues ou pages (login, chat, etc.)
│   │   ├── Login.js
│   │   └── Chat.js
│   │
│   ├── styles/                 # Fichiers CSS spécifiques (optionnels)
│   │   └── overrides.css       # Pour personnaliser ou compléter Tailwind
│   │
│   ├── utils/                  # Fonctions utilitaires
│   │   └── helpers.js
│   │
│   ├── app.js                  # Logique générale de l’application
│   └── main.js                 # Point d'entrée (chargé dans index.html)
│
├── index.html                  # Page HTML principale (utilise Tailwind)
├── tailwind.config.js          # Config Tailwind CSS
├── postcss.config.js           # Config PostCSS pour Tailwind
├── db.json                     # Base de données JSON Server
├── package.json
├── vite.config.js              # Config du bundler Vite
└── README.md

Fonctionnalités:

✅ Connexion de l'utilisateur (saisie du nom et téléphone)

✅ Liste de contacts (affichage des utilisateurs, chargés via JSON Server)

✅ Sélection d’un contact pour discuter

✅ Zone de chat avec :

Affichage des messages

Zone de texte + bouton d’envoi

✅ Envoi de messages

Message envoyé s’affiche grace à setInterval qui apres chaque 5s envoie une requete GET par fecth pour recupérer les nouveaux messages s'il y en a

Stocké dans JSON Server (PATCH ou PUT sur la conversation)

✅ Affichage des messages existants (chargés depuis JSON Server)

✅ Historique des conversations persisté (via base JSON)

✅ Affichage des heures de messages

✅ Style de bulle de messages (envoyés à droite, reçus à gauche)

✅ Ajout d’un nouveau contact

Formulaire simple (nom, telephone)

Requête POST vers /users dans JSON Server

Actualisation de la liste des contacts

✅ Recherche de contact en direct (filtrage de la liste)

✅ Affichage des messages non lus (notifications dans la liste de contacts)

✅ Suppression d’un message

Via un menu sur chaque message

Mise à jour de la conversation

✅ Suppression d’un contact

DELETE sur /users/:id

Mise à jour de la liste des contacts

✅ Création de groupes (participants multiples)

Utilisateur connecté devient automatiquement admin et à la possibilité de nommer d'autres membres comme admin

Stockés dans /conversations avec plusieurs participants

Suppression d'un membre du groupe

Affichage des noms dans les messages

✅ Réorganisation des conversations (tri par dernier message)

✅ Envoi d’image ou fichier

Via <input type="file">

Image convertie en base64, stockée dans un message

✅ Thème sombre / clair (mode nuit)

Bouton pour basculer entre les deux

Stockage du thème en localStorage

✅ Statuts (type story) : un utilisateur peut envoyé un message temporaire

✅ Déconnexion / Changement d'utilisateur

✅ Animations (entrée de message, transitions)

Je veux reproduire l'application whatsapp en js vanilla avec vite et tailwind. Comme indiqué dans la structure j'utillise json server.
Utilise l'image comme repere et donne moi un projet fini
NB: C'est un projet vite, tailwind, js vanila json server pas de websocket pas de code html ne mettez rien dans le code html tous sera gerer par le js et tailwind 
pour l'interface referer vous de la capture que je vous ai envoyé en quelque sorte je veux un whatshap reel avec toutes les fonctionnalités appelle videos, vocal ect.... simulation avec setinterval pour les envoie reel de message et reception faites un whatshap reel et donnez moi le zip










✅ Fonctionnalités essentielles (avec JSON Server)
1. 🔐 Authentification
 Page de connexion (fetch GET /users)

 Page d'inscription (fetch POST /users)

 Authentification locale (via localStorage)

 Redirection selon l’état connecté

2. 👤 Profil utilisateur
 Modifier nom d’utilisateur

 Modifier photo de profil (URL)

 Voir profil des autres utilisateurs

3. 👥 Liste de contacts
 GET /users pour récupérer tous les contacts sauf soi-même

 Recherche de contacts

 Ajouter en favoris (bonus)

4. 💬 Messagerie (texte uniquement)
 Créer une conversation (si inexistante)

 Envoyer un message (POST /messages)

 Afficher messages d’une conversation (GET /messages?conversationId=123)

 Afficher date/heure de chaque message

 Différencier messages envoyés/reçus

 Scroll vers le bas automatique

 "Marqué comme lu" (via un champ dans JSON)

5. 📁 Médias (simple)
 Envoi de messages avec image (champ image dans message)

 Affichage image dans le chat

6. 🔄 Rafraîchissement automatique
 Rafraîchissement toutes les 5 sec (via setInterval)

 Mise à jour manuelle (bouton refresh)

✨ Fonctionnalités supplémentaires possibles
 Statut "en ligne" (timestamp + comparaison)

 Statuts (texte ou image, champ /status)

 Reactions (likes, emoji dans /reactions)

 Suppression message (DELETE /messages/:id)

 Groupes (table /groups + /groupMessages)

 Mode sombre

 Édition de message






Je vous ai fourni les fichiers nécessaires, y compris ceux envoyés précédemment.
Vous voyez la capture d’écran de WhatsApp : je souhaite que mon projet soit adapté à ce design sur le plan visuel (UI).
Ensuite, je veux que vous continuiez mon projet en y ajoutant toutes les fonctionnalités complètes et normales de WhatsApp Web, comme dans la version réelle :

envoi de messages textes,

messages vocaux,

appels audio,

appels vidéo,

et toutes les autres fonctionnalités de WhatsApp Web.

Attention, je travaille avec :

un projet basé sur Vite,

en Vanilla JavaScript,

avec Tailwind CSS,

sans classes,

sans POO,

et sans WebSocket.

Le backend est géré avec JSON Server.

Je vous demande donc de continuer mon projet, de l’adapter au design WhatsApp, et de me fournir un fichier .zip complet du projet final, prêt à l’emploi.
