package org.egov.iot.repository;

import org.egov.iot.model.IotData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IotDataRepository extends JpaRepository<IotData, Long> {
    
    List<IotData> findByDeviceId(String deviceId);
    
    Page<IotData> findByDeviceId(String deviceId, Pageable pageable);
    
    List<IotData> findByDeviceIdAndTimestampBetween(
        String deviceId, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    );
    
    List<IotData> findByTenantId(String tenantId);
    
    Page<IotData> findByTenantId(String tenantId, Pageable pageable);
    
    List<IotData> findByDataType(String dataType);
    
    @Query("SELECT d FROM IotData d WHERE d.deviceId = :deviceId ORDER BY d.timestamp DESC")
    List<IotData> findLatestByDeviceId(@Param("deviceId") String deviceId, Pageable pageable);
    
    @Query("SELECT COUNT(d) FROM IotData d WHERE d.deviceId = :deviceId AND d.timestamp >= :since")
    long countByDeviceIdSince(@Param("deviceId") String deviceId, @Param("since") LocalDateTime since);
}
