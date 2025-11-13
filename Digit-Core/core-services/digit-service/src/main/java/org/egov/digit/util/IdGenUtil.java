package org.egov.digit.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Utility class for ID generation using egov-idgen service
 * Generates human-readable, sequential IDs for various entities
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IdGenUtil {

    private final RestTemplate restTemplate;

    @Value("${egov.idgen.host}")
    private String idGenHost;

    /**
     * Generate user ID
     * Format: USER-2024-000001
     *
     * @param tenantId The tenant ID (e.g., "pb.amritsar")
     * @return Generated user ID
     */
    public String generateUserId(String tenantId) {
        return generateId(tenantId, "user.id", "USER-[fy:yyyy]-[SEQ_USER_ID]", 1).get(0);
    }

    /**
     * Generate device ID
     * Format: DEV-2024-000001
     *
     * @param tenantId The tenant ID
     * @return Generated device ID
     */
    public String generateDeviceId(String tenantId) {
        return generateId(tenantId, "device.id", "DEV-[fy:yyyy]-[SEQ_DEVICE_ID]", 1).get(0);
    }

    /**
     * Generate subscription ID
     * Format: SUB-2024-000001
     *
     * @param tenantId The tenant ID
     * @return Generated subscription ID
     */
    public String generateSubscriptionId(String tenantId) {
        return generateId(tenantId, "subscription.id", "SUB-[fy:yyyy]-[SEQ_SUB_ID]", 1).get(0);
    }

    /**
     * Generate complaint ID
     * Format: COMP-2024-000001
     *
     * @param tenantId The tenant ID
     * @return Generated complaint ID
     */
    public String generateComplaintId(String tenantId) {
        return generateId(tenantId, "complaint.id", "COMP-[fy:yyyy]-[SEQ_COMPLAINT_ID]", 1).get(0);
    }

    /**
     * Generate tank ID
     * Format: TANK-2024-000001
     *
     * @param tenantId The tenant ID
     * @return Generated tank ID
     */
    public String generateTankId(String tenantId) {
        return generateId(tenantId, "tank.id", "TANK-[fy:yyyy]-[SEQ_TANK_ID]", 1).get(0);
    }

    /**
     * Generate multiple IDs at once
     *
     * @param tenantId The tenant ID
     * @param idName The ID name
     * @param format The format string
     * @param count Number of IDs to generate
     * @return List of generated IDs
     */
    private List<String> generateId(String tenantId, String idName, String format, int count) {
        try {
            String url = idGenHost + "/egov-idgen/id/_generate";

            Map<String, Object> request = new HashMap<>();
            request.put("RequestInfo", createRequestInfo());

            Map<String, Object> idRequest = new HashMap<>();
            idRequest.put("tenantId", tenantId);
            idRequest.put("idName", idName);
            idRequest.put("format", format);
            idRequest.put("count", count);

            request.put("idRequests", List.of(idRequest));

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            if (response != null && response.containsKey("idResponses")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> idResponses = (List<Map<String, Object>>) response.get("idResponses");

                if (idResponses != null && !idResponses.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    List<String> ids = (List<String>) idResponses.get(0).get("id");
                    log.debug("Generated {} IDs successfully", ids.size());
                    return ids;
                }
            }

            throw new RuntimeException("Failed to generate ID from egov-idgen - empty response");

        } catch (Exception e) {
            log.error("Error generating ID from egov-idgen: {}", e.getMessage());
            // Fallback to UUID-based ID
            String fallbackId = idName.toUpperCase().replace(".", "-") + "-" +
                    UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            log.warn("Using fallback ID: {}", fallbackId);
            return List.of(fallbackId);
        }
    }

    /**
     * Create RequestInfo object for API calls
     *
     * @return RequestInfo map
     */
    private Map<String, Object> createRequestInfo() {
        Map<String, Object> requestInfo = new HashMap<>();
        requestInfo.put("apiId", "digit-service");
        requestInfo.put("ver", "1.0");
        requestInfo.put("ts", System.currentTimeMillis());
        requestInfo.put("action", "create");
        return requestInfo;
    }
}
