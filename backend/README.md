# Fitness Coach Backend API

A comprehensive REST API for fitness workout tracking built with Java 21 and Spring Boot 3.2.0.

## Features

- User management with registration and authentication
- Workout planning and tracking
- Exercise management with detailed sets and reps
- Comprehensive statistics and analytics
- RESTful API endpoints
- H2 in-memory database for development
- PostgreSQL support for production
- Global exception handling
- Input validation

## Technology Stack

- **Java 21** - Latest LTS version
- **Spring Boot 3.2.0** - Latest framework version
- **Spring Data JPA** - Data persistence
- **Spring Security** - Authentication and authorization
- **H2 Database** - Development database
- **PostgreSQL** - Production database support
- **Maven** - Build tool

## Quick Start

1. **Prerequisites**
   - Java 21 or higher
   - Maven 3.8+

2. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

3. **Access the API**
   - Base URL: `http://localhost:8080`
   - H2 Console: `http://localhost:8080/h2-console`
     - JDBC URL: `jdbc:h2:mem:fitnesscoach`
     - Username: `sa`
     - Password: `password`

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Workouts
- `POST /api/workouts` - Create a new workout
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/{id}` - Get workout by ID
- `GET /api/workouts/user/{userId}` - Get workouts by user
- `PATCH /api/workouts/{id}/start` - Start a workout
- `PATCH /api/workouts/{id}/complete` - Complete a workout
- `PUT /api/workouts/{id}` - Update workout
- `DELETE /api/workouts/{id}` - Delete workout

### Exercises
- `POST /api/exercises` - Create a new exercise
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/{id}` - Get exercise by ID
- `GET /api/exercises/workout/{workoutId}` - Get exercises by workout
- `GET /api/exercises/user/{userId}` - Get exercises by user
- `PUT /api/exercises/{id}` - Update exercise
- `DELETE /api/exercises/{id}` - Delete exercise

## Authentication

The API uses HTTP Basic Authentication. Default credentials:
- Username: `admin`
- Password: `password`

## Data Models

### User
- Basic profile information
- Fitness level and goals
- Physical measurements
- Workout history

### Workout
- Name and description
- Scheduled date and time
- Duration and calories burned
- Status tracking (planned, in-progress, completed)
- Associated exercises

### Exercise
- Name and instructions
- Category and muscle groups
- Sets, reps, weight, and duration tracking
- Rest time recommendations

## Development

The application uses an H2 in-memory database by default, which is perfect for development and testing. Data is automatically reset when the application restarts.

For production, update the `application.yml` file to use PostgreSQL or your preferred database.

## Building

```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package the application
mvn package

# Run the packaged application
java -jar target/fitness-coach-backend-1.0.0.jar
```