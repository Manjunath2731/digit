package org.egov.digit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.egov.digit.dto.ForgotPasswordRequest;
import org.egov.digit.dto.LoginRequest;
import org.egov.digit.dto.LoginResponse;
import org.egov.digit.dto.RegisterRequest;
import org.egov.digit.dto.ResetPasswordRequest;
import org.egov.digit.model.PasswordResetToken;
import org.egov.digit.model.User;
import org.egov.digit.repository.PasswordResetTokenRepository;
import org.egov.digit.repository.UserRepository;
import org.egov.digit.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        if (!"active".equals(user.getStatus())) {
            log.warn("Inactive user login attempt: {}", request.getEmail());
            throw new RuntimeException("User account is inactive");
        }

        // Update last login date
        user.setLastLoginDate(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        log.info("Login successful for user: {}", user.getEmail());

        // Build user response
        LoginResponse.UserResponse userResponse = LoginResponse.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .accessLevel(user.getAccessLevel())
                .status(user.getStatus())
                .noOfSecUser(user.getNoOfSecUser())
                .address(user.getAddress())
                .addressDetails(user.getAddressDetails())
                .lastLoginDate(user.getLastLoginDate())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();

        return LoginResponse.builder()
                .success(true)
                .message("Login successful")
                .token(token)
                .user(userResponse)
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        // Delete any existing reset tokens for this email
        passwordResetTokenRepository.deleteByEmail(request.getEmail());

        // Generate 6-digit OTP
        Integer otp = generateOTP();

        // Create and save password reset token
        PasswordResetToken token = PasswordResetToken.builder()
                .email(request.getEmail())
                .otp(otp)
                .used(false)
                .build();

        passwordResetTokenRepository.save(token);

        // TODO: Send OTP via email
        // For now, we'll just log it (in production, integrate with email service)
        log.info("Password reset OTP for {}: {}", request.getEmail(), otp);
        
        // In a real application, send email here
        // emailService.sendPasswordResetOTP(user.getEmail(), otp);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Reset password request for email: {}", request.getEmail());

        // Find the reset token
        PasswordResetToken token = passwordResetTokenRepository
                .findByEmailAndOtpAndUsedFalse(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        // Check if token is expired
        if (token.isExpired()) {
            log.warn("Expired OTP used for email: {}", request.getEmail());
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    @Transactional
    public User register(RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "user")
                .accessLevel("limited")
                .status("active")
                .noOfSecUser(3) // Default value
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        return savedUser;
    }

    @Transactional
    public User createAdminUser() {
        log.info("Creating admin user");

        // Check if admin user already exists
        if (userRepository.findByEmail("manjunathnaik2731@gmail.com").isPresent()) {
            throw new RuntimeException("Admin user already exists");
        }

        // Create address details map
        Map<String, Object> addressDetails = new HashMap<>();
        addressDetails.put("houseNo", "101");
        addressDetails.put("street", "MG Road");
        addressDetails.put("area", "Central Bangalore");
        addressDetails.put("city", "Bangalore");
        addressDetails.put("state", "Karnataka");
        addressDetails.put("pincode", "560001");
        addressDetails.put("landmark", "Near Brigade Road");

        // Create admin user
        User adminUser = User.builder()
                .name("Manjunath Naik")
                .email("manjunathnaik2731@gmail.com")
                .phone("9876543210")
                .password(passwordEncoder.encode("password"))
                .role("admin")
                .accessLevel("full")
                .status("active")
                .noOfSecUser(0)
                .address("MG Road, Bangalore")
                .addressDetails(addressDetails)
                .build();

        User savedAdminUser = userRepository.save(adminUser);
        log.info("Admin user created successfully with ID: {}", savedAdminUser.getId());

        return savedAdminUser;
    }

    private Integer generateOTP() {
        Random random = new Random();
        return 100000 + random.nextInt(900000); // Generates 6-digit number
    }
}