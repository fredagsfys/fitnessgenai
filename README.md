# Fitness Coach Monorepo

A complete fitness coaching application with a Spring Boot backend API and React Native mobile app.

## Project Structure

```
fitness-coach-monorepo/
├── backend/          # Spring Boot REST API
├── mobile/           # React Native mobile app
├── package.json      # Monorepo workspace configuration
└── README.md         # This file
```

## Prerequisites

- Java 21
- Maven 3.6+
- Node.js 18+
- npm 9+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the backend API:**
   ```bash
   npm run start:backend
   ```

3. **Start the mobile app:**
   ```bash
   npm run start:mobile
   ```

## Backend API

The backend is a Spring Boot application that provides REST APIs for:
- User management and authentication
- Exercise library and categories
- Workout creation and tracking
- Progress monitoring

**API Base URL:** `http://localhost:8080/api`

### Key Endpoints
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/category/{category}` - Get exercises by category
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create new workout
- `GET /api/users/{id}/progress` - Get user progress

## Mobile App

React Native app providing:
- Exercise browsing and search
- Workout creation and execution
- Progress tracking and analytics
- User profile management

## Development Scripts

- `npm run dev` - Start both backend and mobile in development mode
- `npm run test:backend` - Run backend tests
- `npm run test:mobile` - Run mobile tests
- `npm run build:backend` - Build backend JAR
- `npm run build:mobile` - Build mobile app

## Database

The backend uses H2 in-memory database by default. Access the H2 console at:
`http://localhost:8080/h2-console`

## Contributing

1. Make changes in the appropriate workspace (`backend/` or `mobile/`)
2. Run tests before committing
3. Follow the existing code style and conventions