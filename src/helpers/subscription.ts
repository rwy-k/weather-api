import { RequestHandler, Request, Response } from 'express';
import { Frequency } from '../types';
import { Subscription } from '../models/Subscription';

export const addNewSubscription: RequestHandler = async (req: Request, res: Response) => {
    const { city, email, frequency } = req.body;

    if (!city || !email) {
        res.status(400).json({ error: 'City and email are required' });
        return;
    }
    if (!Object.values(Frequency).includes(frequency)) {
        res.status(400).json({ 
            error: 'Invalid frequency value. Must be either "hourly" or "daily"',
            validValues: Object.values(Frequency)
        });
        return;
    }

    try {
        const existingSubscriptions = await Subscription.findActiveSubscriptionsByEmail(email);
        console.log(existingSubscriptions);
        if (existingSubscriptions.length > 0) {
            res.status(409).json({ error: 'Email already subscribed' });
            return;
        }
        const { token } = await Subscription.create(email, city, frequency as Frequency);
        res.status(200).json({ 
            message: 'Subscription created successfully. Please check your email to confirm.',
            token 
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
} 

export const confirmSubscription: RequestHandler = async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
        res.status(400).json({ error: 'Invalid token' });
        return;
    }

    try {
        const success = await Subscription.confirm(token);
        if (success) {
            res.json({ message: 'Subscription confirmed successfully' });
        } else {
            res.status(404).json({ error: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error('Error confirming subscription:', error);
        res.status(500).json({ error: 'Failed to confirm subscription' });
    }
}

export const unsubscribe: RequestHandler = async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
        res.status(400).json({ error: 'Invalid token' });
        return;
    }

    try {
        const success = await Subscription.delete(token);
        if (success) {
            res.json({ message: 'Successfully unsubscribed' });
        } else {
            res.status(404).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
}