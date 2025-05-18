import request from 'supertest';
import express from 'express';
import { Subscription } from '../models/Subscription';
import { Frequency } from '../types';
import subscriptionRouter from '../routes/subscription';

jest.mock('../models/Subscription');

const app = express();
app.use(express.json());
app.use('/api/v1/subscription', subscriptionRouter);

describe('Subscription API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/subscription/subscribe', () => {
    it('should create a new subscription successfully', async () => {
      const mockToken = 'mock-token-123';
      (Subscription.findActiveSubscriptionsByEmail as jest.Mock).mockResolvedValue([]);
      (Subscription.create as jest.Mock).mockResolvedValue({ token: mockToken });

      const response = await request(app)
        .post('/api/v1/subscription/subscribe')
        .send({
          email: 'test@example.com',
          city: 'New York',
          frequency: Frequency.Daily
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Subscription created successfully. Please check your email to confirm.',
        token: mockToken
      });
      expect(Subscription.create).toHaveBeenCalledWith(
        'test@example.com',
        'New York',
        Frequency.Daily
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/subscription/subscribe')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'City and email are required'
      });
    });

    it('should return 400 if frequency is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/subscription/subscribe')
        .send({
          email: 'test@example.com',
          city: 'New York',
          frequency: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid frequency value. Must be either "hourly" or "daily"');
      expect(response.body.validValues).toEqual(Object.values(Frequency));
    });

    it('should return 409 if email is already subscribed', async () => {
      (Subscription.findActiveSubscriptionsByEmail as jest.Mock).mockResolvedValue([
        { email: 'test@example.com' }
      ]);

      const response = await request(app)
        .post('/api/v1/subscription/subscribe')
        .send({
          email: 'test@example.com',
          city: 'New York',
          frequency: Frequency.Daily
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'Email already subscribed'
      });
    });

    it('should return 500 if subscription creation fails', async () => {
      (Subscription.findActiveSubscriptionsByEmail as jest.Mock).mockResolvedValue([]);
      (Subscription.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/v1/subscription/subscribe')
        .send({
          email: 'test@example.com',
          city: 'New York',
          frequency: Frequency.Daily
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to create subscription'
      });
    });
  });

  describe('GET /api/v1/subscription/confirm/:token', () => {
    it('should confirm subscription successfully', async () => {
      (Subscription.confirm as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get('/api/v1/subscription/confirm/valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Subscription confirmed successfully'
      });
      expect(Subscription.confirm).toHaveBeenCalledWith('valid-token');
    });

    it('should return 404 if token is invalid', async () => {
      (Subscription.confirm as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .get('/api/v1/subscription/confirm/invalid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Invalid or expired token'
      });
    });

    it('should return 500 if confirmation fails', async () => {
      (Subscription.confirm as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/subscription/confirm/valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to confirm subscription'
      });
    });
  });

  describe('GET /api/v1/subscription/unsubscribe/:token', () => {
    it('should unsubscribe successfully', async () => {
      (Subscription.delete as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get('/api/v1/subscription/unsubscribe/valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Successfully unsubscribed'
      });
      expect(Subscription.delete).toHaveBeenCalledWith('valid-token');
    });

    it('should return 404 if token is invalid', async () => {
      (Subscription.delete as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .get('/api/v1/subscription/unsubscribe/invalid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Invalid token'
      });
    });

    it('should return 500 if unsubscribe fails', async () => {
      (Subscription.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/subscription/unsubscribe/valid-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to unsubscribe'
      });
    });
  });
}); 