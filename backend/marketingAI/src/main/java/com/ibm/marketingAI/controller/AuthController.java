package com.ibm.marketingAI.controller;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

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

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.ibm.marketingAI.dto.AuthResponse;
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


    private final String CLIENT_ID = "1087092754597-05j77ogikqgqtv82aak8dsiukgiga8pv.apps.googleusercontent.com";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        log.info("inside login auth controller");
        try {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        log.info("got auth name " + auth.getName());

        String token = jwtUtil.generateToken(auth.getName());
        Optional<AppUser> existingUser = userRepository.findByEmail(req.getEmail());
        if (!existingUser.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("User not registered");
        }
        AppUser user = existingUser.get();

        log.info("got token " + token);
        return ResponseEntity.ok(authService.createAuthReponse(req.getEmail(),user.getFirstName(),token));
    } catch (Exception e) {
        log.error("Authentication failed: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterReq request) {
        Optional<AppUser> existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("User with this email already exists");
        }

        AppUser newUser = new AppUser();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole("USER"); // default role
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        

        userRepository.save(newUser);
        return ResponseEntity.ok("User registered");
    }

    @SuppressWarnings("deprecation")
    @PostMapping("/google")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, String> body) throws Exception {
        String idTokenString = body.get("token");
        log.info(idTokenString);
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        log.info("going to idToken ");
        System.out.println(idToken);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            
            // Optionally save user to DB
            AppUser user = userRepository.findByEmail(email).orElseGet(() -> {
                // If not found, create new user
                AppUser newUser = new AppUser();
                newUser.setEmail(email);
                newUser.setFirstName(name);
                log.debug("going to save to userRepo by google");
                return userRepository.save(newUser);
            });

            // Generate JWT
            String accessToken = jwtUtil.generateToken(email);
            AuthResponse authResponse = new AuthResponse(user.getEmail(),user.getFirstName(),accessToken);
            return ResponseEntity.ok(authResponse);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }


    
}

