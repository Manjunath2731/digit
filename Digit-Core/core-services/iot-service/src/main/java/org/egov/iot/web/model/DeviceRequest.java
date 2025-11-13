package org.egov.iot.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.iot.model.IotDevice;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceRequest {

    @JsonProperty("RequestInfo")
    private RequestInfo requestInfo;

    @JsonProperty("Device")
    @NotNull(message = "Device is required")
    @Valid
    private IotDevice device;
}
