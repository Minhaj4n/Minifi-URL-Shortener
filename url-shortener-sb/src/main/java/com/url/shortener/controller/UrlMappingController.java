package com.url.shortener.controller;

import com.url.shortener.dtos.ClickEventDTO;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.models.User;
import com.url.shortener.service.UrlMappingService;
import com.url.shortener.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/urls")
@AllArgsConstructor
public class UrlMappingController {

    private final UrlMappingService urlMappingService;
    private final UserService userService;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * Create a shortened URL for a given original URL.
     * Accessible only to authenticated users with the USER role.
     * @param request    a map containing the original URL as "originalUrl"
     * @param principal  the currently authenticated user's info
     * @return the shortened URL details as a DTO
     */
    @PostMapping("/shorten")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UrlMappingDTO> createShortUrl(@RequestBody Map<String, String> request,
                                                        Principal principal) {
        String originalUrl = request.get("originalUrl");
        User user = userService.findByUsername(principal.getName());
        UrlMappingDTO shortenedUrl = urlMappingService.createShortUrl(originalUrl, user);
        return ResponseEntity.ok(shortenedUrl);
    }

    /**
     * Get all shortened URLs created by the currently authenticated user.
     * @param principal the currently authenticated user's info
     * @return list of UrlMappingDTOs belonging to the user
     */
    @GetMapping("/myurls")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UrlMappingDTO>> getUserUrls(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        List<UrlMappingDTO> userUrls = urlMappingService.getUrlsByUser(user);
        return ResponseEntity.ok(userUrls);
    }

    /**
     * Get analytics (click count per day) for a specific short URL between two datetime ranges.
     * @param shortUrl   the short URL to track
     * @param startDate  ISO datetime string (e.g. 2024-01-01T00:00:00)
     * @param endDate    ISO datetime string (e.g. 2024-01-31T23:59:59)
     * @return list of click statistics grouped by day
     */
    @GetMapping("/analytics/{shortUrl}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ClickEventDTO>> getUrlAnalytics(@PathVariable String shortUrl,
                                                               @RequestParam("startDate") String startDate,
                                                               @RequestParam("endDate") String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate, DATE_TIME_FORMATTER);
        LocalDateTime end = LocalDateTime.parse(endDate, DATE_TIME_FORMATTER);
        List<ClickEventDTO> analytics = urlMappingService.getClickEventsByDate(shortUrl, start, end);
        return ResponseEntity.ok(analytics);
    }

    /**
     * Get total click counts per date for all URLs owned by the current user
     * between two given dates.
     * @param principal  the currently authenticated user
     * @param startDate  ISO date string (e.g. 2024-01-01)
     * @param endDate    ISO date string (e.g. 2024-01-31)
     * @return map of date → click count
     */
    @GetMapping("/totalClicks")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<LocalDate, Long>> getTotalClicksByDate(Principal principal,
                                                                     @RequestParam("startDate") String startDate,
                                                                     @RequestParam("endDate") String endDate) {
        User user = userService.findByUsername(principal.getName());
        LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
        LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
        Map<LocalDate, Long> totalClicks = urlMappingService.getTotalClicksByUserAndDate(user, start, end);
        return ResponseEntity.ok(totalClicks);
    }
}
