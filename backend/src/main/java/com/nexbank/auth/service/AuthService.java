package com.nexbank.auth.service;

import com.nexbank.auth.dto.*;
import com.nexbank.auth.entity.RefreshToken;
import com.nexbank.auth.entity.User;
import com.nexbank.auth.repository.UserRepository;
import com.nexbank.common.enums.Role;
import com.nexbank.common.exception.BadRequestException;
import com.nexbank.common.exception.ConflictException;
import com.nexbank.common.exception.UnauthorizedException;
import com.nexbank.common.util.OtpUtil;
import com.nexbank.config.JwtService;
import com.nexbank.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    @Value("${otp.expiry-minutes}")
    private int otpExpiryMinutes;

    private static final String OTP_PREFIX_EMAIL_VERIFY = "otp:email:";
    private static final String OTP_PREFIX_FORGOT_PWD  = "otp:forgot:";

    // ─── Register ────────────────────────────────────────────

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("EMAIL_EXISTS", "Email is already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("PHONE_EXISTS", "Phone number is already registered");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(Role.CUSTOMER)
                .enabled(false)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        // Send email OTP
        String otp = OtpUtil.generate6();
        redisTemplate.opsForValue().set(
                OTP_PREFIX_EMAIL_VERIFY + user.getEmail(),
                otp,
                Duration.ofMinutes(otpExpiryMinutes)
        );
        emailService.sendOtpEmail(user.getEmail(), user.getFirstName(), otp, "Email Verification");
        log.info("User registered: {}", user.getEmail());
    }

    // ─── Verify Email OTP ────────────────────────────────────

    @Transactional
    public void verifyEmailOtp(OtpVerifyRequest request) {
        String key = OTP_PREFIX_EMAIL_VERIFY + request.getEmail().toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new BadRequestException("OTP_EXPIRED", "OTP has expired. Please request a new one.");
        }
        if (!storedOtp.equals(request.getOtp())) {
            throw new BadRequestException("INVALID_OTP", "Invalid OTP");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);
        redisTemplate.delete(key);

        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        log.info("Email verified for: {}", user.getEmail());
    }

    // ─── Resend OTP ──────────────────────────────────────────

    public void resendEmailOtp(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        String otp = OtpUtil.generate6();
        redisTemplate.opsForValue().set(
                OTP_PREFIX_EMAIL_VERIFY + email.toLowerCase(),
                otp,
                Duration.ofMinutes(otpExpiryMinutes)
        );
        emailService.sendOtpEmail(email, user.getFirstName(), otp, "Email Verification");
    }

    // ─── Login ───────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.isEmailVerified()) {
            throw new BadRequestException("EMAIL_NOT_VERIFIED", "Please verify your email first");
        }

        return buildAuthResponse(user);
    }

    // ─── Refresh Token ───────────────────────────────────────

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenService.findByToken(request.getRefreshToken());

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        User user = storedToken.getUser();
        storedToken.setRevoked(true); // rotate token
        refreshTokenService.save(storedToken);

        return buildAuthResponse(user);
    }

    // ─── Forgot Password ─────────────────────────────────────

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(user -> {
            String otp = OtpUtil.generate6();
            redisTemplate.opsForValue().set(
                    OTP_PREFIX_FORGOT_PWD + user.getEmail(),
                    otp,
                    Duration.ofMinutes(otpExpiryMinutes)
            );
            emailService.sendOtpEmail(user.getEmail(), user.getFirstName(), otp, "Password Reset");
        });
        // Always return success to prevent user enumeration
    }

    // ─── Reset Password ──────────────────────────────────────

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String key = OTP_PREFIX_FORGOT_PWD + request.getEmail().toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new BadRequestException("OTP_EXPIRED", "OTP has expired");
        }
        if (!storedOtp.equals(request.getOtp())) {
            throw new BadRequestException("INVALID_OTP", "Invalid OTP");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenService.revokeAllUserTokens(user.getId());
        redisTemplate.delete(key);

        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFirstName());
    }

    // ─── Logout ──────────────────────────────────────────────

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.findByToken(refreshToken).setRevoked(true);
    }

    // ─── Helper ──────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshTokenStr = jwtService.generateRefreshToken(userDetails);

        RefreshToken refreshToken = refreshTokenService.createToken(user, refreshTokenStr);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(900L)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}
