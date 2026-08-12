package com.fintech.auth.service;

import com.fintech.auth.dto.*;
import com.fintech.auth.entity.RefreshToken;
import com.fintech.auth.entity.VerificationToken;
import com.fintech.auth.repository.VerificationTokenRepository;
import com.fintech.email.service.EmailService;
import com.fintech.security.CustomUserDetails;
import com.fintech.security.JwtUtils;
import com.fintech.user.entity.PartnerType;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final WalletService walletService;
    private final RefreshTokenService refreshTokenService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    @Transactional
    public void register(RegisterRequest request, com.fintech.user.entity.Role expectedRole) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user != null) {
            if (user.isActive()) {
                throw new RuntimeException("Email is already in use");
            } else {
                // User is unverified. Delete old verification tokens so we can generate a new one.
                verificationTokenRepository.deleteByUserAndPurpose(user, "SIGNUP");
            }
        }

        if (user == null) {
            user = userRepository.findByPhone(request.getPhone()).orElse(null);
            if (user != null) {
                if (user.isActive()) {
                    throw new RuntimeException("Phone number is already in use");
                } else {
                    verificationTokenRepository.deleteByUserAndPurpose(user, "SIGNUP");
                }
            }
        }

        PartnerType pt = null;
        if (request.getPartnerType() != null && !request.getPartnerType().isEmpty()) {
            pt = PartnerType.valueOf(request.getPartnerType());
        }

        if (user == null) {
            user = new User();
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(expectedRole); // Strictly override with expectedRole
        user.setPartnerType(pt);
        
        // Handle referral code
        if (request.getPartnerCode() != null && !request.getPartnerCode().isEmpty()) {
            User partner = userRepository.findByPartnerCode(request.getPartnerCode())
                .orElseThrow(() -> new RuntimeException("Invalid Partner Referral Code"));
            user.setParentPartnerId(partner.getId());
        }
        
        user.setActive(false);
        
        if (expectedRole == com.fintech.user.entity.Role.PARTNER) {
            String randomStr = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            user.setPartnerCode("PRT-" + randomStr);
        }

        user = userRepository.save(user);

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        VerificationToken token = VerificationToken.builder()
                .user(user)
                .otpCode(otp)
                .purpose("SIGNUP")
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();
                
        verificationTokenRepository.save(token);
        
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Transactional
    public AuthResponse verifySignupOtp(VerifyOtpRequest request, com.fintech.user.entity.Role expectedRole) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != expectedRole) {
            throw new RuntimeException("Unauthorized access to this portal");
        }

        VerificationToken token = verificationTokenRepository
                .findByOtpCodeAndUserAndPurpose(request.getOtpCode(), user, "SIGNUP")
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Activate User
        user.setActive(true);
        userRepository.save(user);
        
        // Clean up token
        verificationTokenRepository.delete(token);

        // Create initial wallet
        walletService.createWalletForUser(user);

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtUtils.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, com.fintech.user.entity.Role expectedRole) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Enforce role isolation
        if (expectedRole == com.fintech.user.entity.Role.ADMIN) {
            if (user.getRole() != com.fintech.user.entity.Role.ADMIN && user.getRole() != com.fintech.user.entity.Role.SUPER_ADMIN) {
                throw new RuntimeException("Unauthorized access to Admin portal");
            }
        } else if (user.getRole() != expectedRole) {
            throw new RuntimeException("Unauthorized access to this portal");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is not verified. Please verify your email.");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtUtils.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    CustomUserDetails userDetails = new CustomUserDetails(user);
                    String token = jwtUtils.generateToken(userDetails);
                    return TokenRefreshResponse.builder()
                            .accessToken(token)
                            .refreshToken(request.getRefreshToken())
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
    
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }
}
