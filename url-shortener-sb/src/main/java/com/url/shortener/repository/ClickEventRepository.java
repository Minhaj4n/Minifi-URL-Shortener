package com.url.shortener.repository;

import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for managing click event data.
 * Provides methods to query click analytics for shortened URLs.
 */
@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {

    /**
     * Finds all click events for a specific URL mapping within a date range
     * @param mapping The URL mapping to track clicks for
     * @param startDate Start of the date range (inclusive)
     * @param endDate End of the date range (inclusive)
     * @return List of click events matching the criteria
     */
    List<ClickEvent> findByUrlMappingAndClickDateBetween(UrlMapping mapping,
                                                         LocalDateTime startDate,
                                                         LocalDateTime endDate);

    /**
     * Finds all click events for multiple URL mappings within a date range
     * @param urlMappings List of URL mappings to track
     * @param startDate Start of the date range (inclusive)
     * @param endDate End of the date range (inclusive)
     * @return List of click events matching the criteria
     */
    List<ClickEvent> findByUrlMappingInAndClickDateBetween(List<UrlMapping> urlMappings,
                                                           LocalDateTime startDate,
                                                           LocalDateTime endDate);
}