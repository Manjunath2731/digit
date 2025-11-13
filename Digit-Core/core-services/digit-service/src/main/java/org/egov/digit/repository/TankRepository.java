package org.egov.digit.repository;

import org.egov.digit.model.Tank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TankRepository extends JpaRepository<Tank, Long> {

    List<Tank> findByUserId(Long userId);

    Optional<Tank> findByDeviceId(String deviceId);

    @Query("SELECT t FROM Tank t WHERE t.user.id = :userId AND t.id = :id")
    Optional<Tank> findByUserIdAndId(Long userId, Long id);

    boolean existsByDeviceIdAndUserId(String deviceId, Long userId);

    @Query("SELECT COALESCE(MAX(t.saviourId), 0) FROM Tank t WHERE t.user.id = :userId")
    Integer findMaxSaviourIdByUserId(Long userId);
}
