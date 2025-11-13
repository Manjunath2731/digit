package org.egov.iot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MqttPublishService {

    @Autowired
    private MessageChannel mqttOutboundChannel;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${mqtt.default.topic}")
    private String defaultTopic;

    public void publishMessage(String topic, String payload) {
        try {
            log.info("Publishing message to topic: {}", topic);
            
            Message<String> message = MessageBuilder
                    .withPayload(payload)
                    .setHeader(MqttHeaders.TOPIC, topic)
                    .build();
            
            mqttOutboundChannel.send(message);
            
            log.debug("Message published successfully to topic: {}", topic);
        } catch (Exception e) {
            log.error("Error publishing message to topic: {}", topic, e);
            throw new RuntimeException("Failed to publish MQTT message", e);
        }
    }

    public void publishMessage(String payload) {
        publishMessage(defaultTopic, payload);
    }

    public void publishObjectAsJson(String topic, Object object) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(object);
            publishMessage(topic, jsonPayload);
        } catch (Exception e) {
            log.error("Error converting object to JSON", e);
            throw new RuntimeException("Failed to convert object to JSON", e);
        }
    }

    public void publishCommandToDevice(String deviceId, String command) {
        String topic = String.format("iot/devices/%s/commands", deviceId);
        publishMessage(topic, command);
    }
}
