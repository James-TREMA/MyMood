# MyMood - Application de Suivi d'Humeur

MyMood est une application web complète permettant aux étudiants de suivre leur humeur quotidienne et aux superviseurs de monitorer le bien-être de leurs groupes.

## 🚀 Technologies Utilisées

### Front-end (Angular 17)
- Angular Material pour l'interface utilisateur
- RxJS pour la gestion des états et des flux de données
- TypeScript pour un typage fort
- CSS moderne avec Flexbox et Grid
- Responsive design

### Back-end (Node.js + TypeScript)
- Express.js comme framework web
- TypeORM pour la gestion de la base de données
- PostgreSQL comme base de données
- JWT pour l'authentification
- BCrypt pour le hachage des mots de passe

## 📋 Fonctionnalités

### Pour les Étudiants
- Enregistrement quotidien de l'humeur
- Visualisation de l'historique personnel
- Système d'alerte en cas de besoin
- Gestion des préférences de notifications

### Pour les Superviseurs
- Dashboard de suivi des groupes
- Visualisation des moyennes d'humeur
- Gestion des alertes
- Suivi individuel des étudiants

### Pour les Administrateurs
- Gestion complète des utilisateurs
- Création et gestion des formations
- Accès à l'historique global
- Configuration système

## 🛠 Installation

### Prérequis
- Node.js (v18+)
- PostgreSQL (v14+)
- Angular CLI (v17+)

### Configuration de la Base de Données
```bash
# Créer la base de données PostgreSQL
docker run --name mood_tracker_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=Test12345 \
  -e POSTGRES_DB=mood_tracker \
  -p 3000:5432 \
  -d postgres
```

### Installation du Back-end
```bash
# Dans le dossier /server
npm install
npm run migration:run
npm run dev
```

### Installation du Front-end
```bash
# Dans le dossier /client
npm install
npm run start
```

## 🏗 Structure du Projet

### Front-end (/client)
```
src/
├── app/
│   ├── auth/           # Composants d'authentification
│   ├── core/           # Services et guards
│   ├── pages/          # Pages principales
│   └── shared/         # Composants partagés
├── assets/            # Ressources statiques
└── environments/      # Configuration par environnement
```

### Back-end (/server)
```
src/
├── controllers/       # Logique métier
├── database/         # Configuration et migrations
├── entities/         # Modèles de données
├── middleware/       # Middlewares Express
├── routes/          # Routes API
├── services/        # Services métier
└── tests/           # Tests unitaires et d'intégration
```

## 📊 Modèles de Données

### Principales Entités
- User (Utilisateur)
- Cohort (Formation)
- MoodScore (Score d'humeur)
- Alert (Alerte)
- MoodHistory (Historique)

## 🔒 Sécurité

- Authentification JWT
- Hachage des mots de passe avec BCrypt
- Row Level Security dans PostgreSQL
- Validation des entrées
- Protection CORS
- Gestion des rôles (student, supervisor, admin)

## 🧪 Tests

### Back-end
```bash
npm run test        # Exécuter les tests unitaires
```

### Front-end
```bash
ng test            # Exécuter les tests Karma
```

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte à tous les écrans :
- Desktop (> 1024px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🔄 Workflow de Développement

1. Créer une branche pour la fonctionnalité
2. Développer et tester localement
3. Exécuter les tests unitaires
4. Créer une Pull Request
5. Review du code
6. Merge après validation

## 📈 Performances

- Lazy loading des modules Angular
- Optimisation des requêtes SQL
- Mise en cache des données
- Compression des assets
- Optimisation des images

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.