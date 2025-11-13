package org.egov.digit.repository;

import org.egov.digit.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserId(Long userId);

    List<Subscription> findByDeviceId(String deviceId);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.id = :id")
    Optional<Subscription> findByUserIdAndId(Long userId, Long id);
}
