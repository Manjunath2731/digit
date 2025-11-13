package org.egov.digit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @Size(max = 255)
    private String email;
    
    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    @Size(max = 10)
    private String phone;
    
    @NotBlank(message = "Device ID is required")
    private String device;
    
    private String saviour;
    private String deviceSimNo;
    private String houseType;
    private String sensorType;
    
    private Integer noOfSecUsers;
    
    private String address;
    private Map<String, Object> addressDetails;
}