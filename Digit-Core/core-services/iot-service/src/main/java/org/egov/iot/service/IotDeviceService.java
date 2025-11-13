package org.egov.iot.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.iot.model.IotDevice;
import org.egov.iot.repository.IotDeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class IotDeviceService {

    @Autowired
    private IotDeviceRepository deviceRepository;

    @Transactional
    public IotDevice registerDevice(IotDevice device) {
        log.info("Registering new IoT device: {}", device.getDeviceId());
        
        if (deviceRepository.existsByDeviceId(device.getDeviceId())) {
            throw new IllegalArgumentException("Device with ID " + device.getDeviceId() + " already exists");
        }
        
        return deviceRepository.save(device);
    }

    @Transactional
    public IotDevice updateDevice(String deviceId, IotDevice updatedDevice) {
        log.info("Updating IoT device: {}", deviceId);
        
        IotDevice existingDevice = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
        
        // Update fields
        if (updatedDevice.getDeviceName() != null) {
            existingDevice.setDeviceName(updatedDevice.getDeviceName());
        }
        if (updatedDevice.getDeviceType() != null) {
            existingDevice.setDeviceType(updatedDevice.getDeviceType());
        }
        if (updatedDevice.getLocation() != null) {
            existingDevice.setLocation(updatedDevice.getLocation());
        }
        if (updatedDevice.getStatus() != null) {
            existingDevice.setStatus(updatedDevice.getStatus());
        }
        if (updatedDevice.getMetadata() != null) {
            existingDevice.setMetadata(updatedDevice.getMetadata());
        }
        if (updatedDevice.getUpdatedBy() != null) {
            existingDevice.setUpdatedBy(updatedDevice.getUpdatedBy());
        }
        
        return deviceRepository.save(existingDevice);
    }

    public Optional<IotDevice> getDeviceById(String deviceId) {
        log.debug("Fetching device by ID: {}", deviceId);
        return deviceRepository.findByDeviceId(deviceId);
    }

    public List<IotDevice> getAllDevices() {
        log.debug("Fetching all devices");
        return deviceRepository.findAll();
    }

    public List<IotDevice> getDevicesByTenantId(String tenantId) {
        log.debug("Fetching devices for tenant: {}", tenantId);
        return deviceRepository.findByTenantId(tenantId);
    }

    public List<IotDevice> getDevicesByType(String deviceType) {
        log.debug("Fetching devices by type: {}", deviceType);
        return deviceRepository.findByDeviceType(deviceType);
    }

    public List<IotDevice> getDevicesByStatus(String status) {
        log.debug("Fetching devices by status: {}", status);
        return deviceRepository.findByStatus(status);
    }

    @Transactional
    public void deleteDevice(String deviceId) {
        log.info("Deleting device: {}", deviceId);
        
        IotDevice device = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
        
        deviceRepository.delete(device);
    }

    @Transactional
    public IotDevice updateDeviceStatus(String deviceId, String status) {
        log.info("Updating device status: {} to {}", deviceId, status);
        
        IotDevice device = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
        
        device.setStatus(status);
        return deviceRepository.save(device);
    }
}
