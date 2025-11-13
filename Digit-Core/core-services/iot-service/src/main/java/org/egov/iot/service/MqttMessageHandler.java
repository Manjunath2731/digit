package org.egov.iot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.iot.model.IotData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class MqttMessageHandler {

    @Autowired
    private IotDataService iotDataService;

    @Autowired
    private ObjectMapper objectMapper;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<?> message) {
        try {
            String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
            String payload = message.getPayload().toString();
            
            log.info("Received MQTT message from topic: {}", topic);
            log.debug("Payload: {}", payload);

            // Extract device ID from topic (assuming format: iot/devices/{deviceId}/data)
            String deviceId = extractDeviceIdFromTopic(topic);
            
            if (deviceId == null) {
                log.warn("Could not extract device ID from topic: {}", topic);
                return;
            }

            // Create IotData entity
            IotData iotData = IotData.builder()
                    .deviceId(deviceId)
                    .dataType("TELEMETRY")
                    .payload(payload)
                    .timestamp(LocalDateTime.now())
                    .source("MQTT")
                    .build();

            // Save to database
            iotDataService.saveIotData(iotData);
            
            log.info("Successfully processed MQTT message for device: {}", deviceId);
            
        } catch (Exception e) {
            log.error("Error processing MQTT message", e);
        }
    }

    private String extractDeviceIdFromTopic(String topic) {
        if (topic == null || topic.isEmpty()) {
            return null;
        }
        
        // Expected format: iot/devices/{deviceId}/data or similar
        String[] parts = topic.split("/");
        
        if (parts.length >= 3 && "devices".equals(parts[1])) {
            return parts[2];
        }
        
        // Fallback: return the last part of the topic
        return parts[parts.length - 1];
    }
}
