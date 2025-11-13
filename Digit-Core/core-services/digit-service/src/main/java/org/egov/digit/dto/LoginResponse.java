package org.egov.digit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Boolean success;
    private String message;
    private String token;
    private UserResponse user;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private String accessLevel;
        private String status;
        private Integer noOfSecUser;
        private String address;
        private Map<String, Object> addressDetails;
        private LocalDateTime lastLoginDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}