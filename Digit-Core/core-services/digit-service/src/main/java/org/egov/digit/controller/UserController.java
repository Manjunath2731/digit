package org.egov.digit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.egov.digit.dto.*;
import org.egov.digit.model.User;
import org.egov.digit.model.UserDevice;
import org.egov.digit.security.JwtUtil;
import org.egov.digit.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // Get all users created by the logged-in user (admin or user)
    @GetMapping
    public ResponseEntity<UserListResponse> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            List<User> users = userService.getAllUsers(email);
            
            List<UserResponse> userResponses = users.stream().map(user -> {
                List<UserResponse.DeviceResponse> deviceResponses = user.getDevices().stream()
                    .map(device -> UserResponse.DeviceResponse.builder()
                        .deviceId(device.getDeviceId())
                        .saviour(device.getSaviour())
                        .deviceSimNo(device.getDeviceSimNo())
                        .houseType(device.getHouseType())
                        .sensorType(device.getSensorType())
                        .lastLoginDevice(device.getLastLoginDevice())
                        .os(device.getOs())
                        .browser(device.getBrowser())
                        .isPrimary(device.getIsPrimary())
                        .deviceStatus(device.getStatus())
                        .build())
                    .collect(Collectors.toList());
                
                return UserResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .role(user.getRole())
                    .accessLevel(user.getAccessLevel())
                    .status(user.getStatus())
                    .noofsecuser(user.getNoOfSecUser())
                    .address(user.getAddress())
                    .addressdetails(user.getAddressDetails())
                    .lastLoginDate(user.getLastLoginDate())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .devices(deviceResponses)
                    .build();
            }).collect(Collectors.toList());
            
            UserListResponse response = UserListResponse.builder()
                .success(true)
                .count(userResponses.size())
                .data(userResponses)
                .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            UserListResponse response = UserListResponse.builder()
                .success(false)
                .count(0)
                .data(List.of())
                .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Create new user (admin creates regular users, both can create secondary users)
    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateUserRequest request) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            User user = userService.createUser(email, request);
            ApiResponse<User> response = ApiResponse.<User>builder()
                    .success(true)
                    .message("User created successfully")
                    .data(user)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<User> response = ApiResponse.<User>builder()
                    .success(false)
                    .message("Failed to create user: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Update user status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            User user = userService.updateUserStatus(email, id, request);
            ApiResponse<User> response = ApiResponse.<User>builder()
                    .success(true)
                    .message("User status updated successfully")
                    .data(user)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<User> response = ApiResponse.<User>builder()
                    .success(false)
                    .message("Failed to update user status: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            userService.deleteUser(email, id);
            ApiResponse<String> response = ApiResponse.<String>builder()
                    .success(true)
                    .message("User deleted successfully")
                    .data("User deleted successfully")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                    .success(false)
                    .message("Failed to delete user: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            User user = userService.getUserById(email, id);
            ApiResponse<User> response = ApiResponse.<User>builder()
                    .success(true)
                    .message("User fetched successfully")
                    .data(user)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<User> response = ApiResponse.<User>builder()
                    .success(false)
                    .message("Failed to fetch user: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Add new device to existing user
    @PostMapping("/{id}/devices")
    public ResponseEntity<ApiResponse<UserDevice>> addDevice(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserDeviceRequest request) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            UserDevice device = userService.addDevice(email, id, request);
            ApiResponse<UserDevice> response = ApiResponse.<UserDevice>builder()
                    .success(true)
                    .message("Device added successfully")
                    .data(device)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<UserDevice> response = ApiResponse.<UserDevice>builder()
                    .success(false)
                    .message("Failed to add device: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get all devices for a user
    @GetMapping("/{id}/devices")
    public ResponseEntity<ApiResponse<List<UserDevice>>> getUserDevices(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            List<UserDevice> devices = userService.getUserDevices(email, id);
            ApiResponse<List<UserDevice>> response = ApiResponse.<List<UserDevice>>builder()
                    .success(true)
                    .message("Devices fetched successfully")
                    .data(devices)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<UserDevice>> response = ApiResponse.<List<UserDevice>>builder()
                    .success(false)
                    .message("Failed to fetch devices: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Update device information
    @PatchMapping("/{userId}/devices/{deviceId}")
    public ResponseEntity<ApiResponse<UserDevice>> updateDevice(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId,
            @PathVariable Long deviceId,
            @Valid @RequestBody UpdateUserDeviceRequest request) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            UserDevice device = userService.updateDevice(email, userId, deviceId, request);
            ApiResponse<UserDevice> response = ApiResponse.<UserDevice>builder()
                    .success(true)
                    .message("Device updated successfully")
                    .data(device)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<UserDevice> response = ApiResponse.<UserDevice>builder()
                    .success(false)
                    .message("Failed to update device: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }

    // Delete device from user
    @DeleteMapping("/{userId}/devices/{deviceId}")
    public ResponseEntity<ApiResponse<String>> deleteDevice(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId,
            @PathVariable Long deviceId) {
        try {
            String email = jwtUtil.extractEmail(token.substring(7)); // Remove "Bearer " prefix
            userService.deleteDevice(email, userId, deviceId);
            ApiResponse<String> response = ApiResponse.<String>builder()
                    .success(true)
                    .message("Device deleted successfully")
                    .data("Device deleted successfully")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                    .success(false)
                    .message("Failed to delete device: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(response);
        }
    }
}