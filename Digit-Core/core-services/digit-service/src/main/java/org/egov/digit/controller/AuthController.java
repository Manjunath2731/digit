package org.egov.digit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.egov.digit.dto.ApiResponse;
import org.egov.digit.dto.ForgotPasswordRequest;
import org.egov.digit.dto.LoginRequest;
import org.egov.digit.dto.LoginResponse;
import org.egov.digit.dto.RegisterRequest;
import org.egov.digit.dto.ResetPasswordRequest;
import org.egov.digit.model.User;
import org.egov.digit.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("service", "digit-service");
        healthData.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Digit Service is running")
                .data(healthData)
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true)
                .message("User registered successfully")
                .data(user)
                .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Password reset OTP has been sent to your email")
                .data("OTP sent successfully")
                .build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Password has been reset successfully")
                .data("Password reset successful")
                .build());
    }

    // Endpoint to create admin user
    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse<User>> createAdminUser() {
        User adminUser = authService.createAdminUser();
        
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .success(true)
                .message("Admin user created successfully")
                .data(adminUser)
                .build());
    }
}