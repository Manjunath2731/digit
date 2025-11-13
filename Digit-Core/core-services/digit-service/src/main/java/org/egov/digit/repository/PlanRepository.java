package org.egov.digit.repository;

import org.egov.digit.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {

    List<Plan> findByProfile(String profile);

    Optional<Plan> findByPlanAndProfileAndPeriod(String plan, String profile, String period);

    boolean existsByPlanAndProfileAndPeriod(String plan, String profile, String period);
}
