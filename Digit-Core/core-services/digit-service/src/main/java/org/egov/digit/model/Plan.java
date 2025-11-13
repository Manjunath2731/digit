package org.egov.digit.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "plans",
    uniqueConstraints = @UniqueConstraint(columnNames = {"plan", "profile", "period"}),
    indexes = {
        @Index(name = "idx_plan_profile", columnList = "profile"),
        @Index(name = "idx_plan_period", columnList = "period")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Plan name is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String plan;

    @NotBlank(message = "Profile is required")
    @Pattern(regexp = "^(Saviour|Ni-Sensu|Smart Jar)$", message = "Profile must be one of: Saviour, Ni-Sensu, Smart Jar")
    @Size(max = 50)
    @Column(nullable = false)
    private String profile;

    @NotBlank(message = "Period is required")
    @Pattern(regexp = "^(Monthly|Quarterly|Half Yearly|Yearly)$", message = "Period must be one of: Monthly, Quarterly, Half Yearly, Yearly")
    @Size(max = 50)
    @Column(nullable = false)
    private String period;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount must be >= 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "plan", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Subscription> subscriptions;
}
