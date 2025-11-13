package org.egov.digit.repository;

import org.egov.digit.model.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    List<UserDevice> findByUserId(Long userId);

    Optional<UserDevice> findByUserIdAndDeviceId(Long userId, String deviceId);

    boolean existsByUserIdAndDeviceId(Long userId, String deviceId);

    long countByUserId(Long userId);

    @Query("SELECT ud FROM UserDevice ud WHERE ud.user.id = :userId AND ud.id = :deviceId")
    Optional<UserDevice> findByUserIdAndId(Long userId, Long deviceId);
}
