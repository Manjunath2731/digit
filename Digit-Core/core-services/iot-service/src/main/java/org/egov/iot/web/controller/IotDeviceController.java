package org.egov.iot.web.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.egov.iot.model.IotDevice;
import org.egov.iot.service.IotDeviceService;
import org.egov.iot.web.model.DeviceRequest;
import org.egov.iot.web.model.DeviceResponse;
import org.egov.iot.web.model.ResponseInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/iot/v1/devices")
@Slf4j
public class IotDeviceController {

    @Autowired
    private IotDeviceService deviceService;

    @PostMapping("/_register")
    public ResponseEntity<DeviceResponse> registerDevice(@Valid @RequestBody DeviceRequest request) {
        log.info("Received device registration request for device: {}", 
                request.getDevice().getDeviceId());
        
        IotDevice device = deviceService.registerDevice(request.getDevice());
        
        DeviceResponse response = DeviceResponse.builder()
                .responseInfo(ResponseInfo.success())
                .device(device)
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/_update")
    public ResponseEntity<DeviceResponse> updateDevice(@Valid @RequestBody DeviceRequest request) {
        log.info("Received device update request for device: {}", 
                request.getDevice().getDeviceId());
        
        IotDevice device = deviceService.updateDevice(
                request.getDevice().getDeviceId(), 
                request.getDevice()
        );
        
        DeviceResponse response = DeviceResponse.builder()
                .responseInfo(ResponseInfo.success())
                .device(device)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{deviceId}")
    public ResponseEntity<DeviceResponse> getDevice(@PathVariable String deviceId) {
        log.info("Fetching device: {}", deviceId);
        
        IotDevice device = deviceService.getDeviceById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
        
        DeviceResponse response = DeviceResponse.builder()
                .responseInfo(ResponseInfo.success())
                .device(device)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/_search")
    public ResponseEntity<DeviceResponse> searchDevices(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String status) {
        
        log.info("Searching devices with tenantId: {}, type: {}, status: {}", 
                tenantId, deviceType, status);
        
        List<IotDevice> devices;
        
        if (tenantId != null) {
            devices = deviceService.getDevicesByTenantId(tenantId);
        } else if (deviceType != null) {
            devices = deviceService.getDevicesByType(deviceType);
        } else if (status != null) {
            devices = deviceService.getDevicesByStatus(status);
        } else {
            devices = deviceService.getAllDevices();
        }
        
        DeviceResponse response = DeviceResponse.builder()
                .responseInfo(ResponseInfo.success())
                .devices(devices)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{deviceId}/_updateStatus")
    public ResponseEntity<DeviceResponse> updateDeviceStatus(
            @PathVariable String deviceId,
            @RequestParam String status) {
        
        log.info("Updating device status: {} to {}", deviceId, status);
        
        IotDevice device = deviceService.updateDeviceStatus(deviceId, status);
        
        DeviceResponse response = DeviceResponse.builder()
                .responseInfo(ResponseInfo.success())
                .device(device)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<DeviceResponse> deleteDevice(@PathVariable String deviceId) {
        log.info("Deleting device: {}", deviceId);
        
        deviceService.deleteDevice(deviceId);
        
        DeviceResponse response = DeviceResponse.builder()
                .responseInfo(ResponseInfo.success())
                .build();
        
        return ResponseEntity.ok(response);
    }
}
