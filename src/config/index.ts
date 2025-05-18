import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.join(__dirname, '../../.env');
console.log('Loading .env file from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
}

export const config = {
  server: {
    port: process.env.PORT || 3000
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'subscription_db',
    port: parseInt(process.env.DB_PORT || '3306')
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    sender: process.env.EMAIL_SENDER || 'noreply@yourdomain.com'
  }
};

// Required environment variables
const requiredEnvVars = [
  'SENDGRID_API_KEY',
  'EMAIL_SENDER'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
} 