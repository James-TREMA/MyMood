import { Initial1705789000000 } from '../../../database/migrations/1_initial';
import { QueryRunner } from 'typeorm';

describe('Initial Migration', () => {
  let migration: Initial1705789000000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    mockQueryRunner = {
      query: jest.fn().mockResolvedValue(undefined)
    } as any;
    migration = new Initial1705789000000();
  });

  it('should have correct name', () => {
    expect(migration.name).toBe('Initial1705789000000');
  });

  describe('up method', () => {
    it('should create users table', async () => {
      await migration.up(mockQueryRunner);
      
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "users"')
      );
    });

    it('should create cohorts table', async () => {
      await migration.up(mockQueryRunner);
      
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "cohorts"')
      );
    });

    it('should create cohort_assignments table', async () => {
      await migration.up(mockQueryRunner);
      
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "cohort_assignments"')
      );
    });

    it('should create mood_scores table', async () => {
      await migration.up(mockQueryRunner);
      
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "mood_scores"')
      );
    });

    it('should create alerts table', async () => {
      await migration.up(mockQueryRunner);
      
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "alerts"')
      );
    });

    it('should create mood_history table', async () => {
      await migration.up(mockQueryRunner);
      
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "mood_history"')
      );
    });

    it('should create blacklisted_students table', async () => {
      await migration.up(mockQueryRunner);
      
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS "blacklisted_students"')
      );
    });
  });

  describe('down method', () => {
    it('should drop all tables in correct order', async () => {
      await migration.down(mockQueryRunner);

      const calls = mockQueryRunner.query.mock.calls.map(call => call[0]);
      
      expect(calls).toEqual([
        'DROP TABLE IF EXISTS "blacklisted_students"',
        'DROP TABLE IF EXISTS "mood_history"',
        'DROP TABLE IF EXISTS "alerts"',
        'DROP TABLE IF EXISTS "mood_scores"',
        'DROP TABLE IF EXISTS "cohort_assignments"',
        'DROP TABLE IF EXISTS "cohorts"',
        'DROP TABLE IF EXISTS "users"'
      ]);
    });
  });
});