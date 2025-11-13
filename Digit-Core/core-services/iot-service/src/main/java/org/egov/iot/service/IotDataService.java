package org.egov.iot.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.iot.model.IotData;
import org.egov.iot.repository.IotDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class IotDataService {

    @Autowired
    private IotDataRepository dataRepository;

    @Transactional
    public IotData saveIotData(IotData iotData) {
        log.debug("Saving IoT data for device: {}", iotData.getDeviceId());
        return dataRepository.save(iotData);
    }

    @Transactional
    public List<IotData> saveBulkIotData(List<IotData> iotDataList) {
        log.info("Saving bulk IoT data: {} records", iotDataList.size());
        return dataRepository.saveAll(iotDataList);
    }

    public List<IotData> getDataByDeviceId(String deviceId) {
        log.debug("Fetching data for device: {}", deviceId);
        return dataRepository.findByDeviceId(deviceId);
    }

    public Page<IotData> getDataByDeviceIdPaginated(String deviceId, int page, int size) {
        log.debug("Fetching paginated data for device: {}", deviceId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return dataRepository.findByDeviceId(deviceId, pageable);
    }

    public List<IotData> getDataByDeviceIdAndTimeRange(
            String deviceId, 
            LocalDateTime startTime, 
            LocalDateTime endTime) {
        log.debug("Fetching data for device: {} between {} and {}", deviceId, startTime, endTime);
        return dataRepository.findByDeviceIdAndTimestampBetween(deviceId, startTime, endTime);
    }

    public List<IotData> getLatestDataByDeviceId(String deviceId, int limit) {
        log.debug("Fetching latest {} records for device: {}", limit, deviceId);
        Pageable pageable = PageRequest.of(0, limit);
        return dataRepository.findLatestByDeviceId(deviceId, pageable);
    }

    public List<IotData> getDataByTenantId(String tenantId) {
        log.debug("Fetching data for tenant: {}", tenantId);
        return dataRepository.findByTenantId(tenantId);
    }

    public Page<IotData> getDataByTenantIdPaginated(String tenantId, int page, int size) {
        log.debug("Fetching paginated data for tenant: {}", tenantId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return dataRepository.findByTenantId(tenantId, pageable);
    }

    public List<IotData> getDataByType(String dataType) {
        log.debug("Fetching data by type: {}", dataType);
        return dataRepository.findByDataType(dataType);
    }

    public long getDataCountSince(String deviceId, LocalDateTime since) {
        log.debug("Counting data for device: {} since {}", deviceId, since);
        return dataRepository.countByDeviceIdSince(deviceId, since);
    }

    @Transactional
    public void deleteOldData(LocalDateTime before) {
        log.info("Deleting IoT data older than: {}", before);
        // Implementation for cleanup - can be scheduled
        // This is a placeholder for data retention policy
    }
}
