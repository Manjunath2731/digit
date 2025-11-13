package org.egov.digit.repository;

import org.egov.digit.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {

    @Query("SELECT c FROM City c WHERE LOWER(c.state) = LOWER(:state)")
    List<City> findByStateIgnoreCase(String state);

    @Query("SELECT c FROM City c WHERE LOWER(c.name) = LOWER(:name) AND LOWER(c.state) = LOWER(:state)")
    Optional<City> findByNameAndStateIgnoreCase(String name, String state);

    boolean existsByNameAndState(String name, String state);
}
