package com.nexbank.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh-secret}")
    private String refreshSecret;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    // ─── Access Token ────────────────────────────────────────

    public String generateAccessToken(UserDetails userDetails) {
        return generateAccessToken(new HashMap<>(), userDetails);
    }

    public String generateAccessToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails.getUsername(), jwtExpirationMs, getSigningKey());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject, getSigningKey());
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token, getSigningKey());
    }

    // ─── Refresh Token ───────────────────────────────────────

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails.getUsername(), refreshExpirationMs, getRefreshSigningKey());
    }

    public String extractRefreshUsername(String token) {
        return extractClaim(token, Claims::getSubject, getRefreshSigningKey());
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        final String username = extractRefreshUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token, getRefreshSigningKey());
    }

    // ─── Internal ────────────────────────────────────────────

    private String buildToken(Map<String, Object> claims, String subject,
                              long expiration, SecretKey key) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver, SecretKey key) {
        final Claims claims = extractAllClaims(token, key);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token, SecretKey key) {
        return extractClaim(token, Claims::getExpiration, key).before(new Date());
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey getRefreshSigningKey() {
        return Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
    }
}
