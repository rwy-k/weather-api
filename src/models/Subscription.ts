import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../db';
import { config } from '../config';
import { Frequency, Subscription as SubscriptionType } from '../types';
import crypto from 'crypto';
import { Email } from './Email';

export class Subscription {
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async sendConfirmationEmail(token: string): Promise<boolean> {
    const subscription = await this.findByToken(token);
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    const email = subscription.email;
    const confirmationUrl = `${config.frontendUrl}/confirm/${token}`;
    const htmlContent = `Please confirm your subscription by clicking <a href="${confirmationUrl}">here</a> or use this token to manage your subscription: ${token}`;
    
    await Email.sendEmail(email, 'Subscription Confirmation', htmlContent);
    
    return true;
  }

  static async create(email: string, city: string, frequency: Frequency): Promise<{ id: number; token: string }> {
    const token = this.generateToken();
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO subscription (email, city, frequency, token) VALUES (?, ?, ?, ?)',
      [email, city, frequency, token]
    );

    await this.sendConfirmationEmail(token);

    return {
      id: result.insertId,
      token
    };
  }

  static async confirm(token: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE subscription SET confirmed = true WHERE token = ? AND confirmed = false',
      [token]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(token: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM subscription WHERE token = ?',
      [token]
    );

    return result.affectedRows > 0;
  }

  static async findByToken(token: string): Promise<SubscriptionType | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM subscription WHERE token = ?',
      [token]
    );

    if (!rows.length) {
      return null;
    }

    const subscription = rows[0] as SubscriptionType;
    return subscription;
  }

  static async findByEmail(email: string): Promise<SubscriptionType[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM subscription WHERE email = ?',
      [email]
    );

    return rows as SubscriptionType[];
  }

  static async findActiveSubscriptionsByEmail(email: string): Promise<SubscriptionType[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM subscription WHERE confirmed = true AND email = ?',
      [email]
    );

    return rows as SubscriptionType[];
  }
} 