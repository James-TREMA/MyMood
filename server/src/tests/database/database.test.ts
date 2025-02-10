import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from '../../entities/models/User';
import { Cohort } from '../../entities/models/Cohort';
import { CohortAssignment } from '../../entities/models/CohortAssignment';
import { MoodScore } from '../../entities/models/MoodScore';
import { Alert } from '../../entities/models/Alert';
import { MoodHistory } from '../../entities/models/MoodHistory';
import { BlacklistedStudent } from '../../entities/models/BlacklistedStudent';
import { Initial1705789000000 } from '../../database/migrations/1_initial';

// Créer un tableau d'entités pour les tests
const testEntities = [
  User,
  Cohort,
  CohortAssignment,
  MoodScore,
  Alert,
  MoodHistory,
  BlacklistedStudent
];

// Configuration de base pour les tests
const defaultConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'mymood', 
  entities: testEntities,
  migrations: [Initial1705789000000],
  synchronize: false,
  logging: false,
  migrationsRun: true,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false
};

// Mock de DataSource
const mockDataSource = {
  initialize: jest.fn().mockResolvedValue({}),
  destroy: jest.fn(),
  isInitialized: false,
  options: { ...defaultConfig }
};

// Mock du module database
jest.mock('../../database/database', () => ({
  AppDataSource: mockDataSource,
  initializeDatabase: jest.requireActual('../../database/database').initializeDatabase
}));

// Mock de typeorm
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation((config) => ({
      ...mockDataSource,
      options: { ...defaultConfig, ...config }
    }))
  };
});

import { AppDataSource, initializeDatabase } from '../../database/database';

describe('Database Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use default configuration', () => {
    expect(AppDataSource.options).toEqual(
      expect.objectContaining({
        type: 'postgres',
        host: 'localhost',
        port: 5435,
        username: 'postgres',
        password: 'Test12345',
        database: 'mood_tracker'
      })
    );
  });

  it('should use environment variables when provided', () => {
    process.env.DB_HOST = 'test-host';
    process.env.DB_PORT = '5433';
    process.env.DB_USER = 'test-user';
    process.env.DB_PASSWORD = 'test-pass';
    process.env.DB_NAME = 'test-db';

    const testConfig = {
      ...defaultConfig,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };

    const ds = new DataSource(testConfig);
    
    expect(ds.options).toEqual(expect.objectContaining({
      host: 'test-host',
      port: 5433,
      username: 'test-user',
      password: 'test-pass',
      database: 'test-db'
    }));
  });

  it('should configure SSL in production', () => {
    process.env.NODE_ENV = 'production';
    const ds = new DataSource({
      ...defaultConfig,
      ssl: { rejectUnauthorized: false }
    } as PostgresConnectionOptions);
    
    expect((ds.options as PostgresConnectionOptions).ssl)
      .toEqual({ rejectUnauthorized: false });
  });

  it('should disable SSL in development', () => {
    process.env.NODE_ENV = 'development';
    const ds = new DataSource({
      ...defaultConfig,
      ssl: false
    } as PostgresConnectionOptions);
    
    expect((ds.options as PostgresConnectionOptions).ssl).toBeFalsy();
  });

  it('should include all required entities', () => {
    expect(AppDataSource.options.entities).toEqual(testEntities);
  });

  it('should include initial migration', () => {
    expect(AppDataSource.options.migrations).toEqual([Initial1705789000000]);
  });
});

describe('Database Initialization', () => {
  const consoleSpy = jest.spyOn(console, 'log');
  const consoleErrorSpy = jest.spyOn(console, 'error');

  beforeEach(() => {
    consoleSpy.mockClear();
    consoleErrorSpy.mockClear();
    mockDataSource.initialize.mockReset();
  });

  it('should initialize database successfully', async () => {
    mockDataSource.initialize.mockResolvedValueOnce(mockDataSource);
    
    const result = await initializeDatabase(); 
    
    expect(result).toEqual(expect.objectContaining({
      isInitialized: false,
      options: expect.any(Object)
    }));
    expect(consoleSpy).toHaveBeenCalledWith('Base de données connectée avec succès');
  });

  it('should handle initialization error', async () => {
    const error = new Error('Connection failed');
    mockDataSource.initialize.mockRejectedValueOnce(error);

    await expect(initializeDatabase()).rejects.toThrow(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la connexion à la base de données: Connection failed'
    );
  });
});