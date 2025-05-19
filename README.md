# Weather Subscription Service

A weather subscription service that allows users to subscribe to weather updates for their city.

## Features

- Subscribe to weather updates for any city
- Choose between hourly or daily update frequency
- Email confirmation for subscriptions
- RESTful API endpoints

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL database
- SendGrid API key for email notifications

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=subscription_db
   DB_PORT=3306
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_SENDER=your_verified_sender@yourdomain.com
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open a new terminal and start the MySQL database:
   ```bash
   mysql -u your_db_user -p your_db_password
   ```

## Docker 
To run the application in a Docker container, follow these steps:
1. Build the Docker image:
   ```bash
   docker build -t subscription-service .
   ```
2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 --env-file .env subscription-service
   ```

## API Endpoints

- `GET /api/v1/weather` - Returns the current weather for a given city
- `POST /api/v1/subscription/subscribe` - Create new subscription
- `GET /api/v1/subscription/confirm/:token` - Confirm subscription
- `GET /api/v1/subscription/unsubscribe/:token` - Unsubscribe

## Web
You can try out this API by visiting `http://56.228.24.54/` in your browser.

## P.S.
The sended email with token could be in a spam folder. Please check it.