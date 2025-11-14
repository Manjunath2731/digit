package org.egov.digit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String accessLevel;
    private String status;
    private Integer noofsecuser;
    private String address;
    private Map<String, Object> addressdetails;
    private LocalDateTime lastLoginDate;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    private List<DeviceResponse> devices;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceResponse {
        @JsonProperty("device_id")
        private String deviceId;
        
        private String saviour;
        
        @JsonProperty("device_sim_no")
        private String deviceSimNo;
        
        @JsonProperty("house_type")
        private String houseType;
        
        @JsonProperty("sensor_type")
        private String sensorType;
        
        @JsonProperty("last_login_device")
        private String lastLoginDevice;
        
        private String os;
        private String browser;
        
        @JsonProperty("is_primary")
        private Boolean isPrimary;
        
        @JsonProperty("device_status")
        private String deviceStatus;
    }
}