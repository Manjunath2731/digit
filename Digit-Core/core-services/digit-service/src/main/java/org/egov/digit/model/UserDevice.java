package org.egov.digit.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_device",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "device_id"}),
    indexes = {
        @Index(name = "idx_user_device_user_id", columnList = "user_id"),
        @Index(name = "idx_user_device_device_id", columnList = "device_id")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDevice {

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

    @Size(max = 50)
    private String saviour;

    @Size(max = 20)
    @Column(name = "device_sim_no")
    private String deviceSimNo;

    @Size(max = 50)
    @Column(name = "house_type")
    private String houseType;

    @Size(max = 50)
    @Column(name = "sensor_type")
    private String sensorType;

    @Size(max = 255)
    @Column(name = "last_login_device")
    private String lastLoginDevice;

    @Size(max = 100)
    private String os;

    @Size(max = 100)
    private String browser;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = true;

    @Size(max = 20)
    @Builder.Default
    private String status = "active";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
