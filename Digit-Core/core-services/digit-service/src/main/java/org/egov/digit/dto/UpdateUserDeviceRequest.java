package org.egov.digit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDeviceRequest {
    
    private String saviour;
    private String deviceSimNo;
    private String houseType;
    private String sensorType;
    private Boolean isPrimary;
    private String status;
}