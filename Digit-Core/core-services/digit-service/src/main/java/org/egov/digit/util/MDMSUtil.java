package org.egov.digit.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Utility class for Master Data Management System (MDMS) operations
 * Provides access to centralized configuration data like roles, access levels, etc.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MDMSUtil {

    private final RestTemplate restTemplate;

    @Value("${egov.mdms.host}")
    private String mdmsHost;

    /**
     * Get user roles from MDMS
     *
     * @param tenantId The tenant ID
     * @return List of role configurations
     */
    public List<Map<String, Object>> getUserRoles(String tenantId) {
        return fetchMasterData(tenantId, "ACCESSCONTROL-ROLES", "roles");
    }

    /**
     * Get access levels from MDMS
     *
     * @param tenantId The tenant ID
     * @return List of access level configurations
     */
    public List<Map<String, Object>> getAccessLevels(String tenantId) {
        return fetchMasterData(tenantId, "digit-service", "AccessLevels");
    }

    /**
     * Validate if a role exists in MDMS
     *
     * @param role The role code to validate
     * @param tenantId The tenant ID
     * @return true if role is valid, false otherwise
     */
    public boolean isValidRole(String role, String tenantId) {
        try {
            List<Map<String, Object>> roles = getUserRoles(tenantId);

            if (roles.isEmpty()) {
                // If MDMS is unavailable, use default validation
                return isDefaultRole(role);
            }

            return roles.stream()
                    .anyMatch(r -> role.equalsIgnoreCase((String) r.get("code")));
        } catch (Exception e) {
            log.error("Error validating role: {}", e.getMessage());
            return isDefaultRole(role);
        }
    }

    /**
     * Validate if an access level exists
     *
     * @param accessLevel The access level to validate
     * @param tenantId The tenant ID
     * @return true if access level is valid, false otherwise
     */
    public boolean isValidAccessLevel(String accessLevel, String tenantId) {
        try {
            List<Map<String, Object>> accessLevels = getAccessLevels(tenantId);

            if (accessLevels.isEmpty()) {
                // If MDMS is unavailable, use default validation
                return isDefaultAccessLevel(accessLevel);
            }

            return accessLevels.stream()
                    .anyMatch(al -> accessLevel.equalsIgnoreCase((String) al.get("code")));
        } catch (Exception e) {
            log.error("Error validating access level: {}", e.getMessage());
            return isDefaultAccessLevel(accessLevel);
        }
    }

    /**
     * Fetch master data from MDMS service
     *
     * @param tenantId The tenant ID
     * @param moduleName The module name
     * @param masterName The master data name
     * @return List of master data objects
     */
    private List<Map<String, Object>> fetchMasterData(String tenantId, String moduleName, String masterName) {
        try {
            String url = mdmsHost + "/egov-mdms-service/v1/_search";

            Map<String, Object> request = new HashMap<>();
            request.put("RequestInfo", createRequestInfo());

            Map<String, Object> mdmsCriteria = new HashMap<>();
            mdmsCriteria.put("tenantId", tenantId);
            mdmsCriteria.put("moduleDetails", List.of(
                    Map.of(
                            "moduleName", moduleName,
                            "masterDetails", List.of(Map.of("name", masterName))
                    )
            ));

            request.put("MdmsCriteria", mdmsCriteria);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            if (response != null && response.containsKey("MdmsRes")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> mdmsRes = (Map<String, Object>) response.get("MdmsRes");

                @SuppressWarnings("unchecked")
                Map<String, Object> module = (Map<String, Object>) mdmsRes.get(moduleName);

                if (module != null && module.containsKey(masterName)) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> masterData = (List<Map<String, Object>>) module.get(masterName);
                    log.debug("Fetched {} records for {}.{}", masterData.size(), moduleName, masterName);
                    return masterData;
                }
            }

            log.warn("No master data found for {}.{}", moduleName, masterName);
            return getDefaultData(masterName);

        } catch (Exception e) {
            log.error("Error fetching master data from MDMS: {}", e.getMessage());
            return getDefaultData(masterName);
        }
    }

    /**
     * Get default data when MDMS is unavailable
     *
     * @param masterName The master data name
     * @return Default data list
     */
    private List<Map<String, Object>> getDefaultData(String masterName) {
        if ("roles".equalsIgnoreCase(masterName)) {
            return getDefaultRoles();
        } else if ("AccessLevels".equalsIgnoreCase(masterName)) {
            return getDefaultAccessLevels();
        }
        return Collections.emptyList();
    }

    /**
     * Get default roles when MDMS is unavailable
     *
     * @return List of default roles
     */
    private List<Map<String, Object>> getDefaultRoles() {
        return List.of(
                Map.of("code", "admin", "name", "Administrator", "description", "System Administrator"),
                Map.of("code", "user", "name", "Regular User", "description", "Regular User"),
                Map.of("code", "secondary_user", "name", "Secondary User", "description", "Secondary User")
        );
    }

    /**
     * Get default access levels when MDMS is unavailable
     *
     * @return List of default access levels
     */
    private List<Map<String, Object>> getDefaultAccessLevels() {
        return List.of(
                Map.of("code", "full", "name", "Full Access", "description", "Complete access to all features"),
                Map.of("code", "limited", "name", "Limited Access", "description", "Limited access to features"),
                Map.of("code", "view_only", "name", "View Only", "description", "Read-only access")
        );
    }

    /**
     * Check if role is in default list
     *
     * @param role The role to check
     * @return true if it's a default role
     */
    private boolean isDefaultRole(String role) {
        return "admin".equalsIgnoreCase(role) ||
                "user".equalsIgnoreCase(role) ||
                "secondary_user".equalsIgnoreCase(role);
    }

    /**
     * Check if access level is in default list
     *
     * @param accessLevel The access level to check
     * @return true if it's a default access level
     */
    private boolean isDefaultAccessLevel(String accessLevel) {
        return "full".equalsIgnoreCase(accessLevel) ||
                "limited".equalsIgnoreCase(accessLevel) ||
                "view_only".equalsIgnoreCase(accessLevel);
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
        return requestInfo;
    }
}
