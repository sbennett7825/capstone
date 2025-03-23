# GLPAAC Back-End

This is the back-end server for the GLPAAC (Gestalt Language Processors Augmentative and Alternative Communication) application.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

## Setup Instructions

1. Clone the repository
2. Navigate to the `GLPAAC-back-end` directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Create a PostgreSQL database:
   ```
   createdb glpaac_db
   ```
6. Initialize the database:
   ```
   npm run init-db
   ```
7. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user information (requires JWT token)

### Testing

- `GET /api/test-db` - Test database connection