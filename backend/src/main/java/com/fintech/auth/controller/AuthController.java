package com.fintech.auth.controller;

import com.fintech.auth.dto.*;
import com.fintech.auth.service.AuthService;
import com.fintech.common.response.ApiResponse;
import com.fintech.security.CustomUserDetails;
import com.fintech.user.entity.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ==========================================
    // USER PORTAL ENDPOINTS
    // ==========================================
    @PostMapping("/user/register")
    public ResponseEntity<ApiResponse<Void>> userRegister(@Valid @RequestBody RegisterRequest request) {
        authService.register(request, Role.USER);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully. Please check your email.", null));
    }

    @PostMapping("/user/verify-signup")
    public ResponseEntity<ApiResponse<AuthResponse>> userVerifySignupOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifySignupOtp(request, Role.USER);
        return ResponseEntity.ok(ApiResponse.success("Account verified successfully", response));
    }

    @PostMapping("/user/login")
    public ResponseEntity<ApiResponse<AuthResponse>> userLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request, Role.USER);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ==========================================
    // PARTNER PORTAL ENDPOINTS
    // ==========================================

    @PostMapping("/partner/login")
    public ResponseEntity<ApiResponse<AuthResponse>> partnerLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request, Role.PARTNER);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ==========================================
    // ADMIN PORTAL ENDPOINTS
    // ==========================================
    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request, Role.ADMIN);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ==========================================
    // UNIVERSAL ENDPOINTS (Token Based)
    // ==========================================
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.logout(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
