package org.egov.digit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

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
        @JsonProperty("access_level")
        private String accessLevel;
        private String status;
        @JsonProperty("noofsecuser")
        private Integer noOfSecUser;
        private String address;
        @JsonProperty("addressdetails")
        private Map<String, Object> addressDetails;
        @JsonProperty("last_login_date")
        private LocalDateTime lastLoginDate;
        @JsonProperty("created_at")
        private LocalDateTime createdAt;
        @JsonProperty("updated_at")
        private LocalDateTime updatedAt;
    }
}