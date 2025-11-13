package org.egov.digit.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal {
    private Long id;
    private String email;
    private String role;
    private String accessLevel;

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(role);
    }

    public boolean isPrimaryUser() {
        return "admin".equalsIgnoreCase(role) || "user".equalsIgnoreCase(role);
    }
}
