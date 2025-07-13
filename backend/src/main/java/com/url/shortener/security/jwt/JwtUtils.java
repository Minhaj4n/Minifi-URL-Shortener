package com.url.shortener.security.jwt;

import com.url.shortener.service.UserDetailsImpl;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;


/**
 * Utility class for JWT (JSON Web Token) operations including:
 * - Token generation
 * - Token validation
 * - Claim extraction
 *
 * Integrates with Spring Security via UserDetails.
 * Uses HMAC-SHA algorithm for signing with a secret key.
 */

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret; // Base64-encoded secret key

    @Value("${jwt.expiration}")
    private int jwtExpirationMs; // Token validity in milliseconds


    /**
     * Extracts JWT from Authorization header (format: "Bearer <token>").
     *
     * @param request HTTP request containing the header
     * @return Raw JWT token or null if invalid/missing
     */
    public String getJwtFromHeader(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }
        return null;
    }


    /**
     * Generates a signed JWT token for authenticated users.
     *
     * @param userDetails Spring Security user details
     * @return Compact JWT string containing:
     *         - Subject (username)
     *         - Roles (comma-separated)
     *         - Issued-at timestamp
     *         - Expiration timestamp
     */
    public String generateToken(UserDetailsImpl userDetails){
        String username = userDetails.getUsername();
        String roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.joining(","));
        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date((new Date().getTime() + jwtExpirationMs)))
                .signWith(key())
                .compact();
    }

    /**
     * Extracts username (subject) from a valid JWT.
     *
     * @param token Compact JWT string
     * @return Username from token subject
     * @throws JwtException if token is invalid
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) key())
                .build().parseSignedClaims(token)
                .getPayload().getSubject();
    }

    /**
     * Creates HMAC-SHA key from base64-encoded secret.
     *
     * @return Cryptographic signing key
     */
    private Key key(){
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    /**
     * Validates JWT signature and expiration.
     *
     * @param authToken Raw JWT string
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Invalid JWT: " + e.getMessage());
            return false;
        }
    }
}