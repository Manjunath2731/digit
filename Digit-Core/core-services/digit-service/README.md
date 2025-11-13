# Digit Service - Water Tank Monitoring API

Java Spring Boot implementation of the Node.js digit-be backend for the Digit-Core platform.

## Overview

This service provides REST APIs for:
- User Authentication & Management
- Device Management
- Subscription Plans
- City/State Data
- Subscriptions
- Tank Configuration
- Complaint System
- Service Engineer Management

## Technology Stack

- Java 17
- Spring Boot 3.2.2
- Spring Data JPA
- Spring Security + JWT
- PostgreSQL (Neon Cloud)
- Flyway Migration
- Lombok
- Maven

## Database

**Connection**: Neon PostgreSQL (configured in application.properties)
- Host: ep-green-feather-a-hsyfji9-pooler.us-east-1.aws.neon.tech
- Database: neondb
- SSL: Required

## Project Structure

```
digit-service/
├── src/main/java/org/egov/digit/
│   ├── DigitServiceApplication.java       # Main application
│   ├── model/                             # JPA Entities
│   │   ├── User.java
│   │   ├── UserDevice.java
│   │   ├── Plan.java
│   │   ├── City.java
│   │   ├── Subscription.java
│   │   ├── Tank.java
│   │   ├── Complaint.java
│   │   └── ServiceEngineer.java
│   ├── repository/                        # Spring Data Repositories
│   ├── service/                           # Business Logic (TO BE CREATED)
│   ├── controller/                        # REST Controllers (TO BE CREATED)
│   ├── dto/                              # Request/Response DTOs (TO BE CREATED)
│   ├── security/                         # JWT & Security Config
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── UserPrincipal.java
│   │   └── SecurityConfig.java
│   └── util/                             # Utilities
│       ├── PasswordGenerator.java
│       └── EmailService.java
└── src/main/resources/
    ├── application.properties
    └── db/migration/
        ├── V1__init_schema.sql
        └── V2__seed_data.sql
```

## Setup & Running

### 1. Build the Project

```bash
cd C:\Users\manju\Desktop\New folder\Digit-Core\core-services\digit-service
mvn clean install
```

### 2. Update Email Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your_gmail_app_password
```

### 3. Run the Application

```bash
mvn spring-boot:run
```

The service will start on: `http://localhost:8080/digit-service`

### 4. Test Health Endpoint

```bash
curl http://localhost:8080/digit-service/health
```

## Default Credentials

After Flyway migration, two users are created:

1. **Admin**:
   - Email: admin@gmail.com
   - Password: admin123

2. **User**:
   - Email: user@gmail.com
   - Password: user123

## API Endpoints (To Be Implemented)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### User Devices
- `GET /api/users/:id/devices` - Get user devices
- `POST /api/users/:id/devices` - Add device
- `PATCH /api/users/:userId/devices/:deviceId` - Update device
- `DELETE /api/users/:userId/devices/:deviceId` - Remove device

### Plans
- `GET /api/plans` - Get all plans
- `GET /api/plans/:id` - Get plan by ID
- `GET /api/plans/profile/:profile` - Get plans by profile
- `POST /api/plans` - Create plan (Admin)
- `PATCH /api/plans/:id` - Update plan (Admin)
- `DELETE /api/plans/:id` - Delete plan (Admin)

### Cities
- `GET /api/cities` - Get all cities
- `GET /api/cities/:id` - Get city by ID
- `GET /api/cities/state/:state` - Get cities by state
- `POST /api/cities` - Create city (Admin)
- `PATCH /api/cities/:id` - Update city (Admin)
- `DELETE /api/cities/:id` - Delete city (Admin)

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `GET /api/subscriptions/device/:deviceId` - Get device subscriptions
- `POST /api/subscriptions` - Create subscription
- `PATCH /api/subscriptions/:id/status` - Update subscription status

### Tanks
- `GET /api/tanks` - Get user tanks
- `GET /api/tanks/:id` - Get tank by ID
- `GET /api/tanks/device/:deviceId` - Get tank by device
- `POST /api/tanks` - Create tank
- `PATCH /api/tanks/:id` - Update tank
- `DELETE /api/tanks/:id` - Delete tank

### Complaints
- `GET /api/complaints` - Get complaints
- `GET /api/complaints/:id` - Get complaint by ID
- `GET /api/complaints/status/:status` - Get complaints by status (Admin)
- `POST /api/complaints` - Create complaint
- `PATCH /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Service Engineers
- `GET /api/service-engineers` - Get all engineers
- `GET /api/service-engineers/:id` - Get engineer by ID
- `GET /api/service-engineers/pincode/:pincode` - Get engineers by pincode
- `POST /api/service-engineers` - Create engineer
- `PATCH /api/service-engineers/:id` - Update engineer
- `DELETE /api/service-engineers/:id` - Delete engineer

## Next Steps - Implementation Guide

### Step 1: Create DTOs

Create request/response DTOs in `dto` package:
- `LoginRequest.java` / `LoginResponse.java`
- `RegisterRequest.java`
- `UserRequest.java` / `UserResponse.java`
- `DeviceRequest.java` / `DeviceResponse.java`
- `PlanRequest.java` / `PlanResponse.java`
- And similar for other entities...
- `ApiResponse.java` - Generic response wrapper

### Step 2: Create Services

Create service classes in `service` package:
- `AuthService.java` - Login, register, JWT generation
- `UserService.java` - User CRUD operations
- `PlanService.java` - Plan management
- `CityService.java` - City management
- `SubscriptionService.java` - Subscription logic
- `TankService.java` - Tank configuration
- `ComplaintService.java` - Complaint management
- `ServiceEngineerService.java` - Engineer management

### Step 3: Create Controllers

Create REST controllers in `controller` package:
- `AuthController.java` - `/api/auth/**`
- `UserController.java` - `/api/users/**`
- `PlanController.java` - `/api/plans/**`
- `CityController.java` - `/api/cities/**`
- `SubscriptionController.java` - `/api/subscriptions/**`
- `TankController.java` - `/api/tanks/**`
- `ComplaintController.java` - `/api/complaints/**`
- `ServiceEngineerController.java` - `/api/service-engineers/**`

### Step 4: Exception Handling

Create global exception handler:
- `GlobalExceptionHandler.java` - Handle all exceptions
- `CustomException.java` - Custom exception class

### Step 5: Testing

Test all endpoints using:
- Postman/Insomnia
- cURL commands
- Automated tests

## Gateway Integration

To integrate with Digit-Core gateway:

1. Update gateway configuration
2. Add routing rules for `/digit-service/**`
3. Configure service discovery

## Troubleshooting

### Database Connection Issues
- Verify Neon PostgreSQL credentials
- Check SSL mode is set to `require`
- Ensure network connectivity

### Flyway Migration Fails
- Check if tables already exist
- Verify database user has CREATE permissions
- Check migration scripts for syntax errors

### JWT Issues
- Ensure JWT secret is at least 256 bits
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`

## Contributing

Follow Digit-Core coding standards and conventions.

## License

MIT License
