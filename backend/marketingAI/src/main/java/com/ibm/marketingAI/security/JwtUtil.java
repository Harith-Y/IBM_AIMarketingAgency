package com.ibm.marketingAI.security;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;

import io.jsonwebtoken.security.Keys;


import java.security.Key;
import java.util.Base64;

@Component
public class JwtUtil {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }

    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 hours

    // ✅ Generate token with expiration
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getSigningKey())
                .compact();
    }

    // ✅ Extract user ID from token
    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ Extract expiration date
    public Date extractExpiration(String token) {
        return getClaims(token).getExpiration();
    }

    // ✅ Validate token
    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return !isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ✅ Helpers
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }
}
