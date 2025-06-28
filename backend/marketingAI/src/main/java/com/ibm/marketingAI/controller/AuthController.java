package com.ibm.marketingAI.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.ibm.marketingAI.dto.LoginReq;
import com.ibm.marketingAI.dto.RegisterReq;
import com.ibm.marketingAI.model.AppUser;
import com.ibm.marketingAI.repo.UserRepository;
import com.ibm.marketingAI.security.JwtUtil;
import com.ibm.marketingAI.service.AuthService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        log.info("inside login auth controller");
        try {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        log.info("got auth name " + auth.getName());

        String token = jwtUtil.generateToken(auth.getName());

        log.info("got token " + token);
        return ResponseEntity.ok(authService.createAuthReponse(req.getEmail(), token));
    } catch (Exception e) {
        log.error("Authentication failed: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterReq request) {
        AppUser newUser = new AppUser();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole("USER"); // default role
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());

        userRepository.save(newUser);
        return ResponseEntity.ok("User registered");
    }


    
}

