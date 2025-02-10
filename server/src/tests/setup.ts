import dotenv from 'dotenv';

// Charger les variables d'environnement pour les tests
dotenv.config({ path: '.env.test' });

// Configuration globale pour les tests
beforeAll(() => {
  // Initialiser les mocks globaux si nécessaire
});

afterAll(() => {
  // Nettoyer les mocks globaux si nécessaire
});