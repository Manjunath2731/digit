package org.egov.digit.repository;

import org.egov.digit.model.ServiceEngineer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceEngineerRepository extends JpaRepository<ServiceEngineer, Long> {

    List<ServiceEngineer> findByPincode(String pincode);

    Optional<ServiceEngineer> findByEmail(String email);

    boolean existsByEmail(String email);
}
