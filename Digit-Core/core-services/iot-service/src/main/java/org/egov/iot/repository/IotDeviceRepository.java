package org.egov.iot.repository;

import org.egov.iot.model.IotDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IotDeviceRepository extends JpaRepository<IotDevice, Long> {
    
    Optional<IotDevice> findByDeviceId(String deviceId);
    
    List<IotDevice> findByTenantId(String tenantId);
    
    List<IotDevice> findByDeviceType(String deviceType);
    
    List<IotDevice> findByStatus(String status);
    
    List<IotDevice> findByTenantIdAndStatus(String tenantId, String status);
    
    boolean existsByDeviceId(String deviceId);
}
