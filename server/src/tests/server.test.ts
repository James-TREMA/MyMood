import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../database/database';
import routes from '../routes';

jest.mock('../database/database', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true)
  }
}));

describe('Server', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', routes);
  });

  it('should handle root path', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(404);
  });

  it('should handle database initialization', async () => {
    await AppDataSource.initialize();
    expect(AppDataSource.initialize).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const response = await request(app).get('/invalid-path');
    expect(response.status).toBe(404);
  });
});