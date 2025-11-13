package org.egov.digit.repository;

import org.egov.digit.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserId(Long userId);

    List<Complaint> findByStatus(String status);

    @Query("SELECT c FROM Complaint c WHERE c.user.id = :userId AND c.id = :id")
    Optional<Complaint> findByUserIdAndId(Long userId, Long id);
}
