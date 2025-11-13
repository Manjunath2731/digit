package org.egov.digit.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Utility class for encryption/decryption operations using egov-enc-service
 * Provides password signing, verification, and data encryption capabilities
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EncryptionUtil {

    private final RestTemplate restTemplate;

    @Value("${egov.enc.host}")
    private String encServiceHost;

    @Value("${state.level.tenant.id}")
    private String stateLevelTenantId;

    /**
     * Sign a password using enc-service
     * This creates a secure hash that can be verified later
     *
     * @param password Plain text password
     * @return Signed password hash, or null if service is unavailable
     */
    public String signPassword(String password) {
        try {
            String url = encServiceHost + "/egov-enc-service/crypto/v1/_sign";

            Map<String, Object> request = new HashMap<>();
            request.put("signRequest", List.of(password));
            request.put("tenantId", stateLevelTenantId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("signatures")) {
                @SuppressWarnings("unchecked")
                List<String> signatures = (List<String>) response.get("signatures");

                if (signatures != null && !signatures.isEmpty()) {
                    log.debug("Password signed successfully");
                    return signatures.get(0);
                }
            }

            throw new RuntimeException("Failed to sign password - empty response");

        } catch (Exception e) {
            log.error("Error signing password with enc-service: {}", e.getMessage());
            log.warn("Falling back to BCrypt password encoding");
            return null; // Will use BCrypt fallback
        }
    }

    /**
     * Verify a password against its signature
     *
     * @param password Plain text password to verify
     * @param signature The signature to verify against
     * @return true if password matches signature, false otherwise
     */
    public boolean verifyPassword(String password, String signature) {
        try {
            String url = encServiceHost + "/egov-enc-service/crypto/v1/_verify";

            Map<String, Object> verifyRequest = new HashMap<>();
            verifyRequest.put("claim", password);
            verifyRequest.put("signature", signature);

            Map<String, Object> request = new HashMap<>();
            request.put("verifyRequest", List.of(verifyRequest));
            request.put("tenantId", stateLevelTenantId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("verified")) {
                @SuppressWarnings("unchecked")
                List<Boolean> verified = (List<Boolean>) response.get("verified");

                if (verified != null && !verified.isEmpty()) {
                    return Boolean.TRUE.equals(verified.get(0));
                }
            }

            return false;

        } catch (Exception e) {
            log.error("Error verifying password with enc-service: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Encrypt sensitive data (for future use - e.g., phone numbers, emails in GDPR scenarios)
     *
     * @param plainText The text to encrypt
     * @param type Encryption type: "Normal" (symmetric) or "Imp" (asymmetric)
     * @return Encrypted text, or original text if encryption fails
     */
    public String encrypt(String plainText, String type) {
        try {
            String url = encServiceHost + "/egov-enc-service/crypto/v1/_encrypt";

            Map<String, Object> request = new HashMap<>();
            request.put("encryptionRequest", List.of(plainText));
            request.put("tenantId", stateLevelTenantId);
            request.put("type", type); // "Normal" or "Imp"

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("encryptedValues")) {
                @SuppressWarnings("unchecked")
                List<String> encrypted = (List<String>) response.get("encryptedValues");

                if (encrypted != null && !encrypted.isEmpty()) {
                    return encrypted.get(0);
                }
            }

            throw new RuntimeException("Failed to encrypt data");

        } catch (Exception e) {
            log.error("Error encrypting data with enc-service: {}", e.getMessage());
            return plainText; // Return as-is if encryption fails
        }
    }

    /**
     * Decrypt sensitive data
     *
     * @param encryptedText The encrypted text to decrypt
     * @return Decrypted text, or original text if decryption fails
     */
    public String decrypt(String encryptedText) {
        try {
            String url = encServiceHost + "/egov-enc-service/crypto/v1/_decrypt";

            Map<String, Object> request = new HashMap<>();
            request.put("encryptedValues", List.of(encryptedText));
            request.put("tenantId", stateLevelTenantId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("decryptedValues")) {
                @SuppressWarnings("unchecked")
                List<String> decrypted = (List<String>) response.get("decryptedValues");

                if (decrypted != null && !decrypted.isEmpty()) {
                    return decrypted.get(0);
                }
            }

            throw new RuntimeException("Failed to decrypt data");

        } catch (Exception e) {
            log.error("Error decrypting data with enc-service: {}", e.getMessage());
            return encryptedText; // Return as-is if decryption fails
        }
    }
}
