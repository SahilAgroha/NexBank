package com.fintech.security;

import com.fintech.security.entity.IdempotencyKey;
import com.fintech.security.repository.IdempotencyKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String idempotencyKeyHeader = request.getHeader("Idempotency-Key");

        if (idempotencyKeyHeader != null && !idempotencyKeyHeader.isEmpty()) {
            if ("POST".equalsIgnoreCase(request.getMethod()) || "PUT".equalsIgnoreCase(request.getMethod())) {
                
                Optional<IdempotencyKey> existingKey = idempotencyKeyRepository.findById(idempotencyKeyHeader);
                
                if (existingKey.isPresent()) {
                    response.setStatus(HttpStatus.CONFLICT.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Request already processed with this Idempotency-Key\"}");
                    return;
                }

                // If not present, save it to mark it as seen
                IdempotencyKey key = IdempotencyKey.builder()
                        .key(idempotencyKeyHeader)
                        .createdAt(LocalDateTime.now())
                        .build();
                idempotencyKeyRepository.save(key);
            }
        }

        filterChain.doFilter(request, response);
    }
}
