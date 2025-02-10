import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { entities } from "../entities";
import { checkSchemaChanges } from "./utils/schema-sync";
import dotenv from "dotenv";
import "reflect-metadata";

dotenv.config();

// Vérifier que les variables d'environnement requises sont définies
if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error('Variables d\'environnement de base de données manquantes. Veuillez configurer le fichier .env');
}

const config: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Test12345",
  database: process.env.DB_NAME || "mood_tracker",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: entities,
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
  migrationsRun: false,
  ssl: process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false } 
    : false
};

export const AppDataSource = new DataSource(config);

// Initialisation de la connexion
const initializeDatabase = async () => {
  try {
    // Vérifier si la connexion est déjà initialisée
    if (AppDataSource.isInitialized) {
      return AppDataSource;
    }
    
    // Initialiser la connexion
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    
    console.log("Base de données connectée avec succès");
    return AppDataSource;
  } catch (error) {
    // Gérer l'erreur de manière plus détaillée
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`Erreur lors de la connexion à la base de données: ${errorMessage}`);
    throw error;
  }
};

export { initializeDatabase };