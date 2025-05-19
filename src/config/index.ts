import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '../../.env');
  console.log('Loading .env file from:', envPath);
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Environment variables loaded successfully');
  }
}

export const config = {
  server: {
    port: process.env.PORT || 3000
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY || 'development'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'subscription_db',
    port: parseInt(process.env.DB_PORT || '3306')
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://56.228.24.54/',
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY || 'development',
    sender: process.env.EMAIL_SENDER || 'noreply@example.com'
  }
};

// Only check required vars in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [];
  
  // Add database variables
  if (!config.database.user || !config.database.password) {
    requiredEnvVars.push('DB_USER', 'DB_PASSWORD');
  }

  if (requiredEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${requiredEnvVars.join(', ')}`);
  }
} 