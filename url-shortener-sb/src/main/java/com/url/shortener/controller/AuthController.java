package com.url.shortener.controller;

import com.url.shortener.dtos.LoginRequest;
import com.url.shortener.dtos.RegisterRequest;
import com.url.shortener.models.User;
import com.url.shortener.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController handles user authentication and registration endpoints.
 * Base path: /api/auth
 * - /public/login    : Handles login requests
 * - /public/register : Handles user registration
 */
@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {


    private final UserService userService;

    /**
     * Login endpoint - authenticates a user with username and password
     * @param loginRequest A DTO containing username and password.
     * @return JWT token or error response.
     */
    @PostMapping("/public/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.authenticateUser(loginRequest));
    }

    /**
     * Register endpoint - registers a new user in the system.
     * @param registerRequest A DTO with username, email, and password.
     * @return A success message upon successful registration.
     */
    @PostMapping("/public/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setEmail(registerRequest.getEmail());
        user.setRole("ROLE_USER"); // Default role assignment

        userService.registerUser(user);

        return ResponseEntity.ok("User registered successfully");
    }
}
