# Implementation Completion Guide for Digit Service

## ✅ What's Already Implemented

1. **Project Structure** - Complete Maven project with proper directory structure
2. **Database Configuration** - Connected to Neon PostgreSQL with SSL
3. **JPA Entities** - All 8 entities (User, UserDevice, Plan, City, Subscription, Tank, Complaint, ServiceEngineer)
4. **Repositories** - Spring Data JPA repositories for all entities
5. **Security** - JWT authentication, Spring Security configuration
6. **Utilities** - PasswordGenerator, EmailService
7. **Flyway Migrations** - Schema initialization and seed data

## 📝 How to Complete the Implementation

### Quick Start Template - Auth Service & Controller

Create these files to get a working auth endpoint:

#### 1. `dto/LoginRequest.java`:
```java
package org.egov.digit.dto;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}
```

#### 2. `dto/LoginResponse.java`:
```java
package org.egov.digit.dto;
import lombok.*;

@Data @Builder
public class LoginResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;
}
```

#### 3. `dto/ApiResponse.java`:
```java
package org.egov.digit.dto;
import lombok.*;

@Data @Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Integer count;
}
```

#### 4. `service/AuthService.java`:
```java
package org.egov.digit.service;

import lombok.RequiredArgsConstructor;
import org.egov.digit.dto.*;
import org.egov.digit.model.User;
import org.egov.digit.repository.UserRepository;
import org.egov.digit.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!"active".equals(user.getStatus())) {
            throw new RuntimeException("User account is inactive");
        }

        // Update last login
        user.setLastLoginDate(java.time.LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
```

#### 5. `controller/AuthController.java`:
```java
package org.egov.digit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.egov.digit.dto.*;
import org.egov.digit.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .build());
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Digit Service is running")
                .data("OK")
                .build());
    }
}
```

#### 6. `controller/GlobalExceptionHandler.java`:
```java
package org.egov.digit.controller;

import org.egov.digit.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.builder()
                        .success(false)
                        .message("Internal server error")
                        .build());
    }
}
```

## 🚀 Running the Service

### Step 1: Build
```bash
cd "C:\Users\manju\Desktop\New folder\Digit-Core\core-services\digit-service"
mvn clean install -DskipTests
```

### Step 2: Run
```bash
mvn spring-boot:run
```

### Step 3: Test Login
```bash
curl -X POST http://localhost:8080/digit-service/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gmail.com\",\"password\":\"admin123\"}"
```

Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": 1,
    "name": "Admin User",
    "email": "admin@gmail.com",
    "role": "admin"
  }
}
```

### Step 4: Test Protected Endpoint
```bash
curl -X GET http://localhost:8080/digit-service/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📦 Complete All Remaining Controllers

Follow the same pattern for:
- UserController
- PlanController
- CityController
- SubscriptionController
- TankController
- ComplaintController
- ServiceEngineerController

### Template for Service Classes:
```java
@Service
@RequiredArgsConstructor
public class XyzService {
    private final XyzRepository repository;

    public List<Xyz> getAll() {
        return repository.findAll();
    }

    public Xyz getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Not found"));
    }

    public Xyz create(XyzRequest request) {
        // Validation
        // Map request to entity
        // Save and return
    }

    public Xyz update(Long id, XyzRequest request) {
        // Find existing
        // Update fields
        // Save and return
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
```

### Template for Controller Classes:
```java
@RestController
@RequestMapping("/api/xyz")
@RequiredArgsConstructor
public class XyzController {
    private final XyzService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Xyz>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<Xyz>>builder()
            .success(true)
            .data(service.getAll())
            .count(service.getAll().size())
            .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Xyz>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<Xyz>builder()
            .success(true)
            .data(service.getById(id))
            .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Xyz>> create(@Valid @RequestBody XyzRequest request) {
        return ResponseEntity.ok(ApiResponse.<Xyz>builder()
            .success(true)
            .message("Created successfully")
            .data(service.create(request))
            .build());
    }
}
```

## 🔌 Gateway Integration

To access via gateway, configure routes in gateway service.

For local testing WITHOUT gateway:
- Direct access: `http://localhost:8080/digit-service/api/**`

For production WITH gateway:
- Gateway access: `http://gateway:port/digit-service/api/**`

## ⚙️ Configuration Checklist

- [ ] Update `spring.mail.username` and `spring.mail.password` in application.properties
- [ ] Change `jwt.secret` to a strong secret (min 256 bits)
- [ ] Verify database connection works
- [ ] Test Flyway migrations
- [ ] Test login endpoint
- [ ] Implement remaining controllers
- [ ] Add input validation
- [ ] Add proper error handling
- [ ] Write unit tests
- [ ] Configure gateway routes

## 🐛 Common Issues & Solutions

### Issue: "No suitable driver found for jdbc:postgresql"
**Solution**: PostgreSQL driver is in pom.xml, run `mvn clean install`

### Issue: "Flyway migration failed"
**Solution**: Check if tables exist, drop them or set `spring.flyway.baseline-on-migrate=true`

### Issue: "JWT signature does not match"
**Solution**: Ensure jwt.secret is at least 256 bits (32+ characters)

### Issue: "Cannot send email"
**Solution**: Use Gmail App Password, not regular password. Enable 2FA and generate app password.

### Issue: "CORS error from frontend"
**Solution**: Already configured in SecurityConfig, check allowed origins

## 📚 Reference Implementation

Check the Node.js backend for business logic reference:
- Location: `C:\Users\manju\Desktop\New folder\digit-be`
- Match the same validation rules
- Match the same response formats
- Match the same error messages

## ✅ Testing Checklist

Test each endpoint:
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register
- [ ] GET /api/users
- [ ] POST /api/users
- [ ] GET /api/plans
- [ ] POST /api/subscriptions
- [ ] GET /api/tanks
- [ ] POST /api/complaints
- [ ] GET /api/service-engineers

## 🎯 Success Criteria

Your implementation is complete when:
1. All 40+ API endpoints work
2. JWT authentication is enforced
3. Role-based authorization works
4. Database constraints are respected
5. Email notifications are sent
6. All validations match Node.js version
7. Error responses are consistent
8. Gateway integration works

Good luck! 🚀
