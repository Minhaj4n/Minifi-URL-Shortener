package com.url.shortener.repository;

import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing URL mappings (short URL to long URL associations).
 * Provides methods to query and manage shortened URL entries.
 */
@Repository
public interface UrlMappingRepository extends JpaRepository<UrlMapping, Long> {

    /**
     * Finds a URL mapping by its short URL identifier.
     * @param shortUrl The shortened URL string to search for
     * @return The matching UrlMapping entity or null if not found
     */
    UrlMapping findByShortUrl(String shortUrl);

    /**
     * Finds all URL mappings created by a specific user.
     * @param user The user whose URL mappings should be retrieved
     * @return List of UrlMapping entities created by the specified user
     */
    List<UrlMapping> findByUser(User user);
}