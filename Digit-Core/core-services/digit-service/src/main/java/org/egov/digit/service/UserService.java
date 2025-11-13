package org.egov.digit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.egov.digit.dto.CreateUserRequest;
import org.egov.digit.dto.UpdateUserDeviceRequest;
import org.egov.digit.dto.UpdateUserStatusRequest;
import org.egov.digit.model.User;
import org.egov.digit.model.UserDevice;
import org.egov.digit.repository.UserDeviceRepository;
import org.egov.digit.repository.UserRepository;
import org.egov.digit.util.PasswordGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserDeviceRepository userDeviceRepository;
    private final PasswordEncoder passwordEncoder;

    // Get all users created by the logged-in user (admin or user)
    public List<User> getAllUsers(String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        if ("admin".equals(requester.getRole())) {
            // Admin can see all users with their device info
            return userRepository.findAll().stream()
                    .filter(user -> !"admin".equals(user.getRole()))
                    .toList();
        } else {
            // Regular users can only see secondary users they created
            // For simplicity, we'll return all secondary users
            // In a real implementation, you might want to track which user created which secondary user
            return userRepository.findAll().stream()
                    .filter(user -> "secondary_user".equals(user.getRole()))
                    .toList();
        }
    }

    // Create new user (admin creates regular users, both can create secondary users)
    @Transactional
    public User createUser(String creatorEmail, CreateUserRequest request) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Generate random password
        String randomPassword = PasswordGenerator.generateSimplePassword(10);
        String hashedPassword = passwordEncoder.encode(randomPassword);

        // Determine user role based on creator
        String userRole = "admin".equals(creator.getRole()) ? "user" : "secondary_user";

        // Create user in users table
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(hashedPassword)
                .role(userRole)
                .accessLevel("limited")
                .status("active")
                .noOfSecUser(request.getNoOfSecUsers() != null ? request.getNoOfSecUsers() : 0)
                .address(request.getAddress())
                .addressDetails(request.getAddressDetails())
                .build();

        User savedUser = userRepository.save(user);

        // Create device record in user_device table
        UserDevice device = UserDevice.builder()
                .user(savedUser)
                .deviceId(request.getDevice())
                .saviour(request.getSaviour())
                .deviceSimNo(request.getDeviceSimNo())
                .houseType(request.getHouseType())
                .sensorType(request.getSensorType())
                .isPrimary(true)
                .status("active")
                .build();

        userDeviceRepository.save(device);

        log.info("User created successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    // Update user status
    @Transactional
    public User updateUserStatus(String requesterEmail, Long userId, UpdateUserStatusRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Authorization check
        if (!"admin".equals(requester.getRole()) && !requester.getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own status");
        }

        user.setStatus(request.getStatus());
        User updatedUser = userRepository.save(user);

        log.info("User status updated successfully for user ID: {}", userId);
        return updatedUser;
    }

    // Delete user
    @Transactional
    public void deleteUser(String requesterEmail, Long userId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Authorization check
        if (!"admin".equals(requester.getRole()) && !requester.getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own account");
        }

        userRepository.deleteById(userId);
        log.info("User deleted successfully with ID: {}", userId);
    }

    // Get user by ID
    public User getUserById(String requesterEmail, Long userId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User user = userRepository.findByIdWithDevices(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Authorization check
        if (!"admin".equals(requester.getRole()) && !requester.getId().equals(user.getId())) {
            throw new RuntimeException("You can only view your own account");
        }

        return user;
    }

    // Add new device to existing user
    @Transactional
    public UserDevice addDevice(String requesterEmail, Long userId, UpdateUserDeviceRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Authorization check
        if (!"admin".equals(requester.getRole()) && !requester.getId().equals(user.getId())) {
            throw new RuntimeException("You can only add devices to your own account");
        }

        // If isPrimary is true, set all other devices to non-primary
        if (request.getIsPrimary() != null && request.getIsPrimary()) {
            List<UserDevice> devices = userDeviceRepository.findByUserId(userId);
            devices.forEach(device -> {
                device.setIsPrimary(false);
                userDeviceRepository.save(device);
            });
        }

        // Add new device
        UserDevice device = UserDevice.builder()
                .user(user)
                .deviceId(request.getDeviceSimNo()) // Using deviceSimNo as device ID for now
                .saviour(request.getSaviour())
                .deviceSimNo(request.getDeviceSimNo())
                .houseType(request.getHouseType())
                .sensorType(request.getSensorType())
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .build();

        UserDevice savedDevice = userDeviceRepository.save(device);
        log.info("Device added successfully with ID: {} for user ID: {}", savedDevice.getId(), userId);
        return savedDevice;
    }

    // Get all devices for a user
    public List<UserDevice> getUserDevices(String requesterEmail, Long userId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Authorization check
        if (!"admin".equals(requester.getRole()) && !requester.getId().equals(user.getId())) {
            throw new RuntimeException("You can only view your own devices");
        }

        return userDeviceRepository.findByUserId(userId);
    }

    // Update device information
    @Transactional
    public UserDevice updateDevice(String requesterEmail, Long userId, Long deviceId, UpdateUserDeviceRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Authorization check
        if (!"admin".equals(requester.getRole()) && !requester.getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own devices");
        }

        Optional<UserDevice> deviceOpt = userDeviceRepository.findByUserIdAndId(userId, deviceId);
        if (deviceOpt.isEmpty()) {
            throw new RuntimeException("Device not found for this user");
        }

        UserDevice device = deviceOpt.get();

        // If isPrimary is being set to true, set all other devices to non-primary
        if (request.getIsPrimary() != null && request.getIsPrimary()) {
            List<UserDevice> devices = userDeviceRepository.findByUserId(userId);
            devices.forEach(d -> {
                if (!d.getId().equals(deviceId)) {
                    d.setIsPrimary(false);
                    userDeviceRepository.save(d);
                }
            });
        }

        // Update device fields
        if (request.getSaviour() != null) device.setSaviour(request.getSaviour());
        if (request.getDeviceSimNo() != null) device.setDeviceSimNo(request.getDeviceSimNo());
        if (request.getHouseType() != null) device.setHouseType(request.getHouseType());
        if (request.getSensorType() != null) device.setSensorType(request.getSensorType());
        if (request.getIsPrimary() != null) device.setIsPrimary(request.getIsPrimary());
        if (request.getStatus() != null) device.setStatus(request.getStatus());

        UserDevice updatedDevice = userDeviceRepository.save(device);
        log.info("Device updated successfully with ID: {}", deviceId);
        return updatedDevice;
    }

    // Delete device from user
    @Transactional
    public void deleteDevice(String requesterEmail, Long userId, Long deviceId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Authorization check
        if (!"admin".equals(requester.getRole()) && !requester.getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own devices");
        }

        // Check if this is the only device
        long deviceCount = userDeviceRepository.countByUserId(userId);
        if (deviceCount <= 1) {
            throw new RuntimeException("Cannot delete the last device. User must have at least one device.");
        }

        Optional<UserDevice> deviceOpt = userDeviceRepository.findByUserIdAndId(userId, deviceId);
        if (deviceOpt.isEmpty()) {
            throw new RuntimeException("Device not found for this user");
        }

        userDeviceRepository.deleteById(deviceId);
        log.info("Device deleted successfully with ID: {} for user ID: {}", deviceId, userId);
    }
}