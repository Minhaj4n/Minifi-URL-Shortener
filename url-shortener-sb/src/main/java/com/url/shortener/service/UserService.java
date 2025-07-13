package com.url.shortener.service;

import com.url.shortener.dtos.LoginRequest;
import com.url.shortener.models.User;
import com.url.shortener.repository.UserRepository;
import com.url.shortener.security.jwt.JwtAuthenticationResponse;
import com.url.shortener.security.jwt.JwtUtils;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service class that handles business logic for user registration, authentication, and retrieval.
 */
@Service
@AllArgsConstructor
public class UserService {

    // Encodes and verifies user passwords using BCrypt
    private final PasswordEncoder passwordEncoder;

    // Repository to perform database operations for User entity
    private final UserRepository userRepository;

    // Spring Security authentication manager for validating credentials
    private final AuthenticationManager authenticationManager;

    // Utility for generating JWT tokens
    private final JwtUtils jwtUtils;

    /**
     * Registers a new user by encoding the password and saving to the database.
     *
     * @param user The user entity containing username, email, password, and role.
     * @return The saved user after registration.
     */
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Authenticates a user and generates a JWT token upon successful login.
     *
     * @param loginRequest Contains the username and password for login.
     * @return A response object containing the generated JWT token.
     */
    public JwtAuthenticationResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // Set the authentication context for the current thread
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Extract the authenticated user details
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Generate JWT token using user details
        String jwt = jwtUtils.generateToken(userDetails);

        return new JwtAuthenticationResponse(jwt);
    }

    /**
     * Retrieves a user entity from the database by username.
     *
     * @param name The username to search for.
     * @return The corresponding User object.
     * @throws UsernameNotFoundException if the user is not found.
     */
    public User findByUsername(String name) {
        return userRepository.findByUsername(name)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with username: " + name)
                );
    }
}
