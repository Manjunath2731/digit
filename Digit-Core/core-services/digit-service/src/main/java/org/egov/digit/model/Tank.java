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

@Entity
@Table(name = "tanks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"device_id", "user_id"}),
    indexes = {
        @Index(name = "idx_tank_user_id", columnList = "user_id"),
        @Index(name = "idx_tank_device_id", columnList = "device_id"),
        @Index(name = "idx_tank_saviour_id", columnList = "saviour_id")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @NotNull(message = "User is required")
    private User user;

    @NotBlank(message = "Device ID is required")
    @Size(max = 255)
    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @NotBlank(message = "Saviour name is required")
    @Size(max = 100)
    @Column(name = "saviour_name", nullable = false)
    private String saviourName;

    @NotNull(message = "Saviour ID is required")
    @Column(name = "saviour_id", nullable = false)
    private Integer saviourId;

    @NotNull(message = "Saviour capacity is required")
    @DecimalMin(value = "0.01", message = "Saviour capacity must be > 0")
    @Column(name = "saviour_capacity", nullable = false, precision = 10, scale = 2)
    private BigDecimal saviourCapacity;

    @NotNull(message = "Upper threshold is required")
    @DecimalMin(value = "0.01", message = "Upper threshold must be > 0")
    @Column(name = "upper_threshold", nullable = false, precision = 10, scale = 2)
    private BigDecimal upperThreshold;

    @NotNull(message = "Lower threshold is required")
    @DecimalMin(value = "0.01", message = "Lower threshold must be > 0")
    @Column(name = "lower_threshold", nullable = false, precision = 10, scale = 2)
    private BigDecimal lowerThreshold;

    @NotNull(message = "Saviour height is required")
    @DecimalMin(value = "0.01", message = "Saviour height must be > 0")
    @Column(name = "saviour_height", nullable = false, precision = 10, scale = 2)
    private BigDecimal saviourHeight;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
