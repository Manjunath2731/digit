# Digit Backend API

Node.js + Express + PostgreSQL backend for Digit User Management System.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` file with your PostgreSQL credentials.

### 3. Create Database
```bash
psql -U postgres
CREATE DATABASE digit_db;
```

### 4. Initialize Database
```bash
npm run init-db
```

Sample users:
- Admin: admin@digit.com / admin123
- User: user@digit.com / user123

### 5. Start Server
```bash
npm run dev
```

Server: http://localhost:5000

## API Endpoints

### POST /api/auth/login
Login with email and password.

### POST /api/users
Create new user (requires JWT token).

### GET /api/users
Get all users (requires JWT token).

### PATCH /api/users/:id/status
Update user status (requires JWT token).

### DELETE /api/users/:id
Delete user (requires JWT token).
