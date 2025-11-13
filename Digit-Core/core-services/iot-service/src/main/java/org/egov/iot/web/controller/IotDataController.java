package org.egov.iot.web.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.egov.iot.model.IotData;
import org.egov.iot.service.IotDataService;
import org.egov.iot.service.MqttPublishService;
import org.egov.iot.web.model.DataRequest;
import org.egov.iot.web.model.DataResponse;
import org.egov.iot.web.model.ResponseInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/iot/v1/data")
@Slf4j
public class IotDataController {

    @Autowired
    private IotDataService dataService;

    @Autowired
    private MqttPublishService mqttPublishService;

    @PostMapping("/_create")
    public ResponseEntity<DataResponse> createIotData(@Valid @RequestBody DataRequest request) {
        log.info("Received IoT data creation request for device: {}", 
                request.getData().getDeviceId());
        
        IotData data = dataService.saveIotData(request.getData());
        
        DataResponse response = DataResponse.builder()
                .responseInfo(ResponseInfo.success())
                .data(data)
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/_bulkCreate")
    public ResponseEntity<DataResponse> createBulkIotData(@Valid @RequestBody DataRequest request) {
        log.info("Received bulk IoT data creation request: {} records", 
                request.getDataList().size());
        
        List<IotData> dataList = dataService.saveBulkIotData(request.getDataList());
        
        DataResponse response = DataResponse.builder()
                .responseInfo(ResponseInfo.success())
                .dataList(dataList)
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/_search")
    public ResponseEntity<DataResponse> searchIotData(
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String dataType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Searching IoT data with deviceId: {}, tenantId: {}, dataType: {}", 
                deviceId, tenantId, dataType);
        
        List<IotData> dataList;
        
        if (deviceId != null && startTime != null && endTime != null) {
            dataList = dataService.getDataByDeviceIdAndTimeRange(deviceId, startTime, endTime);
        } else if (deviceId != null) {
            Page<IotData> dataPage = dataService.getDataByDeviceIdPaginated(deviceId, page, size);
            dataList = dataPage.getContent();
        } else if (tenantId != null) {
            Page<IotData> dataPage = dataService.getDataByTenantIdPaginated(tenantId, page, size);
            dataList = dataPage.getContent();
        } else if (dataType != null) {
            dataList = dataService.getDataByType(dataType);
        } else {
            throw new IllegalArgumentException("At least one search parameter is required");
        }
        
        DataResponse response = DataResponse.builder()
                .responseInfo(ResponseInfo.success())
                .dataList(dataList)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{deviceId}/_latest")
    public ResponseEntity<DataResponse> getLatestData(
            @PathVariable String deviceId,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Fetching latest {} records for device: {}", limit, deviceId);
        
        List<IotData> dataList = dataService.getLatestDataByDeviceId(deviceId, limit);
        
        DataResponse response = DataResponse.builder()
                .responseInfo(ResponseInfo.success())
                .dataList(dataList)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{deviceId}/_publish")
    public ResponseEntity<DataResponse> publishToDevice(
            @PathVariable String deviceId,
            @RequestBody String payload) {
        
        log.info("Publishing data to device: {}", deviceId);
        
        String topic = String.format("iot/devices/%s/data", deviceId);
        mqttPublishService.publishMessage(topic, payload);
        
        DataResponse response = DataResponse.builder()
                .responseInfo(ResponseInfo.success())
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{deviceId}/_command")
    public ResponseEntity<DataResponse> sendCommand(
            @PathVariable String deviceId,
            @RequestBody String command) {
        
        log.info("Sending command to device: {}", deviceId);
        
        mqttPublishService.publishCommandToDevice(deviceId, command);
        
        DataResponse response = DataResponse.builder()
                .responseInfo(ResponseInfo.success())
                .build();
        
        return ResponseEntity.ok(response);
    }
}
