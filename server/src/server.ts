import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { NotificationService } from './services/NotificationService';
import { AppDataSource } from './database/database';
import { cleanInvalidData } from './database/utils/cleanup';
import routes from './routes';
import "reflect-metadata";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/', routes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

// Démarrage du serveur après l'initialisation de la base de données
const startServer = async () => {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log("Base de données connectée avec succès");
    
    // Démarrer le planificateur de rappels une fois la base de données connectée
    await NotificationService.scheduleDailyReminders();
    
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur:");
    console.error(error);
    process.exit(1);
  }
};

startServer();