package org.egov.digit.service;

import lombok.RequiredArgsConstructor;
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
import org.egov.digit.util.EncryptionUtil;
import org.egov.digit.util.IdGenUtil;
import org.egov.digit.util.MDMSUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EncryptionUtil encryptionUtil;
    private final IdGenUtil idGenUtil;
    private final MDMSUtil mdmsUtil;

    @Value("${default.tenant.id}")
    private String defaultTenantId;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        System.out.println("Login attempt for email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Try enc-service verification first, fallback to BCrypt
        boolean passwordValid = false;

        // Check if password is signed (new format with SIG_ prefix)
        if (user.getPassword() != null && user.getPassword().startsWith("SIG_")) {
            // Remove SIG_ prefix and verify with enc-service
            String signature = user.getPassword().substring(4);
            passwordValid = encryptionUtil.verifyPassword(request.getPassword(), signature);
            System.out.println("Password verification using enc-service: " + passwordValid);
        } else {
            // Old BCrypt password - use BCrypt verification
            passwordValid = passwordEncoder.matches(request.getPassword(), user.getPassword());
            System.out.println("Password verification using BCrypt: " + passwordValid);
        }

        if (!passwordValid) {
            System.out.println("Invalid password for email: " + request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        if (!"active".equals(user.getStatus())) {
            System.out.println("Inactive user login attempt: " + request.getEmail());
            throw new RuntimeException("User account is inactive");
        }

        // Update last login date
        user.setLastLoginDate(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        System.out.println("Login successful for user: " + user.getEmail());

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
        System.out.println("Forgot password request for email: " + request.getEmail());

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
        System.out.println("Password reset OTP for " + request.getEmail() + ": " + otp);
        
        // In a real application, send email here
        // emailService.sendPasswordResetOTP(user.getEmail(), otp);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        System.out.println("Reset password request for email: " + request.getEmail());

        // Find the reset token
        PasswordResetToken token = passwordResetTokenRepository
                .findByEmailAndOtpAndUsedFalse(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        // Check if token is expired
        if (token.isExpired()) {
            System.out.println("Expired OTP used for email: " + request.getEmail());
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Sign new password using enc-service
        String signedPassword = encryptionUtil.signPassword(request.getNewPassword());

        // If enc-service fails, fallback to BCrypt
        String passwordToStore;
        if (signedPassword != null) {
            passwordToStore = "SIG_" + signedPassword;
            System.out.println("New password signed using enc-service");
        } else {
            passwordToStore = passwordEncoder.encode(request.getNewPassword());
            System.out.println("New password encrypted using BCrypt (fallback)");
        }

        // Update password
        user.setPassword(passwordToStore);
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        System.out.println("Password reset successful for user: " + user.getEmail());
    }

    @Transactional
    public User register(RegisterRequest request) {
        System.out.println("Registration request for email: " + request.getEmail());

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Validate role using MDMS
        String role = request.getRole() != null ? request.getRole() : "user";
        if (!mdmsUtil.isValidRole(role, defaultTenantId)) {
            System.out.println("Invalid role: " + role);
            throw new RuntimeException("Invalid role: " + role + ". Allowed roles: admin, user, secondary_user");
        }

        // Generate user code using egov-idgen
        String userCode = idGenUtil.generateUserId(defaultTenantId);
        System.out.println("Generated user code: " + userCode);

        // Sign password using enc-service
        String signedPassword = encryptionUtil.signPassword(request.getPassword());

        // If enc-service fails, fallback to BCrypt
        String passwordToStore;
        if (signedPassword != null) {
            passwordToStore = "SIG_" + signedPassword; // Prefix to identify signed passwords
            System.out.println("Password signed using enc-service");
        } else {
            passwordToStore = passwordEncoder.encode(request.getPassword());
            System.out.println("Password encrypted using BCrypt (fallback)");
        }

        // Create new user
        User user = User.builder()
                .userCode(userCode)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordToStore)
                .role(role)
                .accessLevel("limited")
                .status("active")
                .noOfSecUser(3) // Default value
                .build();

        User savedUser = userRepository.save(user);
        System.out.println("User registered successfully with ID: " + savedUser.getId() + " and code: " + savedUser.getUserCode());

        return savedUser;
    }

    @Transactional
    public User createAdminUser() {
        System.out.println("Creating admin user");

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
        System.out.println("Admin user created successfully with ID: " + savedAdminUser.getId());

        return savedAdminUser;
    }

    private Integer generateOTP() {
        Random random = new Random();
        return 100000 + random.nextInt(900000); // Generates 6-digit number
    }
}