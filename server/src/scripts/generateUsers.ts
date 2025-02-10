import { AppDataSource } from '../database/database';
import { User } from '../entities/models/User';
import { hash } from 'bcryptjs';
import { DeepPartial } from 'typeorm';

const firstNames = [
  'Emma', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Louis', 'Sarah', 'Gabriel', 'Jade', 'Raphaël',
  'Louise', 'Arthur', 'Alice', 'Jules', 'Inès', 'Adam', 'Lina', 'Paul', 'Eva', 'Nathan',
  'Camille', 'Thomas', 'Manon', 'Théo', 'Zoé', 'Maxime', 'Clara', 'Antoine', 'Juliette', 'Alexandre',
  'Charlotte', 'Victor', 'Léna', 'Mathis', 'Nina', 'Oscar', 'Lucie', 'Ethan', 'Romane', 'Noah',
  'Maëlys', 'Valentin', 'Océane', 'Baptiste', 'Ambre', 'Samuel', 'Anaïs', 'Axel', 'Margaux', 'Robin',
  'Elise', 'Romain', 'Pauline', 'Simon', 'Agathe', 'Mathéo', 'Elsa', 'Nicolas', 'Capucine', 'Tom',
  'Adèle', 'Clément', 'Yasmine', 'Maxence', 'Jeanne', 'Augustin', 'Apolline', 'Bastien', 'Salomé', 'Gabin'
];

const lastNames = [
  'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent',
  'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard',
  'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre',
  'Mercier', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Chevalier', 'Francois', 'Legrand', 'Gauthier', 'Garcia',
  'Perrin', 'Robin', 'Clement', 'Morin', 'Nicolas', 'Henry', 'Roussel', 'Mathieu', 'Gautier', 'Masson',
  'Marchand', 'Duval', 'Denis', 'Dumont', 'Marie', 'Lemaire', 'Noel', 'Meyer', 'Dufour', 'Meunier',
  'Brun', 'Blanchard', 'Giraud', 'Joly', 'Riviere', 'Lucas', 'Brunet', 'Gaillard', 'Barbier', 'Arnaud'
];

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateRandomUser = async (index: number) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[index % lastNames.length];
  const name = `${firstName} ${lastName}`;
  // Ajout d'un index pour garantir l'unicité de l'email
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@mymood.com`;
  
  // Tous les utilisateurs sont des étudiants
  const role = 'student' as const;

  const password = await hash('Test12345', 10);

  return <DeepPartial<User>>{
    name,
    email,
    password,
    role
  };
};

const generateUsers = async (count: number) => {
  try {
    await AppDataSource.initialize();
    console.log('Base de données connectée');

    const userRepository = AppDataSource.getRepository(User);
    let createdCount = 0;

    for (let i = 0; i < count; i++) {
      const userData = await generateRandomUser(i);
      
      try {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`✅ Utilisateur créé: ${userData.name} (${userData.role})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Erreur lors de la création de l'utilisateur:`, error);
        i--; // Réessayer
      }
    }

    console.log('\n📊 Statistiques de génération:');
    console.log(`Étudiants créés: ${createdCount}`);
    console.log('\n✨ Génération des utilisateurs terminée');
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Connexion à la base de données fermée');
    }
  }
};

// Générer 20 utilisateurs
generateUsers(20).catch(console.error);