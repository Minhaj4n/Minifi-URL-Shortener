package com.url.shortener.security;

import com.url.shortener.security.jwt.JwtAuthenticationFilter;
import com.url.shortener.service.UserDetailsServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Main Spring Security configuration class.
 * - Sets up authentication using JWT and DAO-based login.
 * - Defines authorization rules for HTTP endpoints.
 * - Integrates filters and providers into Spring Security flow.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class WebSecurityConfig {


    private final UserDetailsServiceImpl userDetailsService;

    /**
     * Registers the custom JWT Authentication Filter.
     * Intercepts requests and validates JWT tokens before reaching the controller.
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    /**
     * Password encoder bean using BCrypt for hashing user passwords securely.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationManager bean responsible for processing authentication requests.
     * Delegates authentication logic to the DaoAuthenticationProvider.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Authentication provider bean that uses:
     * - Custom UserDetailsService (loads user data)
     * - BCrypt password encoder (matches credentials)
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Configures the SecurityFilterChain:
     * - Disables CSRF
     * - Allows unauthenticated access to specific endpoints
     * - Protects internal API routes
     * - Adds JWT filter before default authentication filter
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS pre-flight requests
                        .requestMatchers("/api/auth/**").permitAll()           // Public auth APIs
                        .requestMatchers("/api/urls/**").authenticated()       // Protected APIs
                        .requestMatchers("/{shortUrl}").permitAll()            // Public short URL redirection
                        .anyRequest().authenticated()                          // All others require login
                );

        http.authenticationProvider(authenticationProvider()); // Set up login authentication
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class); // Add JWT filter

        return http.build(); // Return final security chain
    }
}
