import { Subscription } from '../models/Subscription';
import { Email } from '../models/Email';
import pool from '../db';
import { Frequency } from '../types';

// Mock the dependencies
jest.mock('../db');
jest.mock('../models/Email');
jest.mock('../config', () => ({
  config: {
    frontendUrl: 'http://localhost:3000',
    email: {
      sender: 'test@test.com'
    },
    database: {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'test_db'
    }
  }
}));
jest.mock('crypto', () => ({
  randomBytes: () => ({
    toString: () => 'mock-token'
  })
}));

describe('Subscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new subscription and send confirmation email', async () => {
      const mockSubscription = {
        id: 1,
        email: 'test@example.com',
        city: 'New York',
        frequency: Frequency.Daily,
        token: 'mock-token',
        confirmed: false
      };

      const mockExecute = jest.fn()
        .mockImplementationOnce(() => [{ insertId: 1 }])
        .mockImplementationOnce(() => [[mockSubscription]]);
      
      (pool.execute as jest.Mock).mockImplementation(mockExecute);
      (Email.sendEmail as jest.Mock).mockResolvedValue(true);

      const result = await Subscription.create('test@example.com', 'New York', Frequency.Daily);

      expect(result).toEqual({
        id: 1,
        token: 'mock-token'
      });

      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO subscription (email, city, frequency, token) VALUES (?, ?, ?, ?)',
        ['test@example.com', 'New York', Frequency.Daily, 'mock-token']
      );

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM subscription WHERE token = ?',
        ['mock-token']
      );

      expect(Email.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Subscription Confirmation',
        expect.stringContaining('http://localhost:3000/confirm/mock-token')
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a subscription', async () => {
      const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);

      const result = await Subscription.confirm('test-token');

      expect(result).toBe(true);
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE subscription SET confirmed = true WHERE token = ? AND confirmed = false',
        ['test-token']
      );
    });

    it('should return false when subscription not found', async () => {
      const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 0 }]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);

      const result = await Subscription.confirm('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a subscription', async () => {
      const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);

      const result = await Subscription.delete('test-token');

      expect(result).toBe(true);
      expect(mockExecute).toHaveBeenCalledWith(
        'DELETE FROM subscription WHERE token = ?',
        ['test-token']
      );
    });
  });

  describe('findByToken', () => {
    it('should find a subscription by token', async () => {
      const mockSubscription = {
        id: 1,
        email: 'test@example.com',
        city: 'New York',
        frequency: Frequency.Daily,
        token: 'test-token',
        confirmed: true
      };
      const mockExecute = jest.fn().mockResolvedValue([[mockSubscription]]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);

      const result = await Subscription.findByToken('test-token');

      expect(result).toEqual(mockSubscription);
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM subscription WHERE token = ?',
        ['test-token']
      );
    });

    it('should return null when subscription not found', async () => {
      const mockExecute = jest.fn().mockResolvedValue([[]]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);

      const result = await Subscription.findByToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find subscriptions by email', async () => {
      const mockSubscriptions = [{
        id: 1,
        email: 'test@example.com',
        city: 'New York',
        frequency: Frequency.Daily,
        token: 'test-token',
        confirmed: true
      }];
      const mockExecute = jest.fn().mockResolvedValue([mockSubscriptions]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);

      const result = await Subscription.findByEmail('test@example.com');

      expect(result).toEqual(mockSubscriptions);
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM subscription WHERE email = ?',
        ['test@example.com']
      );
    });
  });

  describe('sendConfirmationEmail', () => {
    it('should send confirmation email for valid token', async () => {
      const mockSubscription = {
        email: 'test@example.com',
        token: 'test-token'
      };
      const mockExecute = jest.fn().mockResolvedValue([[mockSubscription]]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);
      (Email.sendEmail as jest.Mock).mockResolvedValue(true);

      const result = await Subscription.sendConfirmationEmail('test-token');

      expect(result).toBe(true);
      expect(Email.sendEmail).toHaveBeenCalled();
    });

    it('should throw error for invalid token', async () => {
      const mockExecute = jest.fn().mockResolvedValue([[]]);
      (pool.execute as jest.Mock).mockImplementation(mockExecute);

      await expect(Subscription.sendConfirmationEmail('invalid-token'))
        .rejects
        .toThrow('Subscription not found');
    });
  });
});