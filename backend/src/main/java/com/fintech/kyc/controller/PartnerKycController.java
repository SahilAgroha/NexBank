package com.fintech.kyc.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.kyc.entity.KycDocument;
import com.fintech.kyc.entity.KycStatus;
import com.fintech.kyc.repository.KycDocumentRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.kyc.dto.KycRequestDto;
import com.fintech.notification.entity.Notification;
import com.fintech.notification.repository.NotificationRepository;
import com.fintech.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/partner/customer-kyc")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PARTNER')")
public class PartnerKycController {

    private final KycDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingKycUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long partnerId = userDetails.getUser().getId();
        List<User> pendingUsers = userRepository.findByParentPartnerId(partnerId).stream()
                .filter(u -> u.getKycStatus() == KycStatus.PENDING)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Pending customer KYC fetched", pendingUsers));
    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<User>>> getApprovedKycUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long partnerId = userDetails.getUser().getId();
        List<User> approvedUsers = userRepository.findByParentPartnerId(partnerId).stream()
                .filter(u -> u.getKycStatus() == KycStatus.APPROVED)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Approved customer KYC fetched", approvedUsers));
    }

    @GetMapping("/unverified")
    public ResponseEntity<ApiResponse<List<User>>> getUnverifiedKycUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long partnerId = userDetails.getUser().getId();
        List<User> unverifiedUsers = userRepository.findByParentPartnerId(partnerId).stream()
                .filter(u -> u.getKycStatus() != KycStatus.PENDING)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Eligible customers for KYC request fetched", unverifiedUsers));
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<String>> requestKyc(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody KycRequestDto requestDto) {
        Long partnerId = userDetails.getUser().getId();
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!Objects.equals(user.getParentPartnerId(), partnerId)) {
            throw new RuntimeException("Unauthorized: Not your customer");
        }
        
        String fullMessage = "Please complete your KYC verification by " + requestDto.getDueDate() + " to avoid account restrictions.";
        if (requestDto.getMessage() != null && !requestDto.getMessage().trim().isEmpty()) {
            fullMessage += "\n\nPartner Note: " + requestDto.getMessage();
        }

        Notification notification = Notification.builder()
                .user(user)
                .title("KYC Request Required")
                .message(fullMessage)
                .build();
                
        notificationRepository.save(notification);
        
        return ResponseEntity.ok(ApiResponse.success("KYC Request sent to user via Notification", null));
    }
    
    @GetMapping("/documents/{userId}")
    public ResponseEntity<ApiResponse<List<KycDocument>>> getUserDocuments(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long userId) {
        Long partnerId = userDetails.getUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!Objects.equals(user.getParentPartnerId(), partnerId)) {
            throw new RuntimeException("Unauthorized: Not your customer");
        }
        
        List<KycDocument> documents = kycDocumentRepository.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("User documents fetched", documents));
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<ApiResponse<String>> approveKyc(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long userId) {
        Long partnerId = userDetails.getUser().getId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!Objects.equals(user.getParentPartnerId(), partnerId)) {
            throw new RuntimeException("Unauthorized: Not your customer");
        }
        
        user.setKycStatus(KycStatus.APPROVED);
        userRepository.save(user);
        
        List<KycDocument> documents = kycDocumentRepository.findByUserId(userId);
        for(KycDocument doc : documents) {
            if(doc.getStatus() == KycStatus.PENDING) {
                doc.setStatus(KycStatus.APPROVED);
                kycDocumentRepository.save(doc);
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("KYC Approved successfully", null));
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<ApiResponse<String>> rejectKyc(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId, 
            @RequestParam(required = false, defaultValue = "Documents do not meet criteria") String reason) {
            
        Long partnerId = userDetails.getUser().getId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!Objects.equals(user.getParentPartnerId(), partnerId)) {
            throw new RuntimeException("Unauthorized: Not your customer");
        }
        
        user.setKycStatus(KycStatus.REJECTED);
        userRepository.save(user);
        
        List<KycDocument> documents = kycDocumentRepository.findByUserId(userId);
        for(KycDocument doc : documents) {
            if(doc.getStatus() == KycStatus.PENDING) {
                doc.setStatus(KycStatus.REJECTED);
                doc.setRejectionReason(reason);
                kycDocumentRepository.save(doc);
            }
        }
        
        Notification notification = Notification.builder()
                .user(user)
                .title("KYC Rejected")
                .message("Your KYC documents were rejected. Reason: " + reason)
                .build();
        notificationRepository.save(notification);
        
        return ResponseEntity.ok(ApiResponse.success("KYC Rejected", null));
    }

    @PostMapping("/suspend/{userId}")
    public ResponseEntity<ApiResponse<String>> suspendKyc(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId, 
            @RequestParam(required = false, defaultValue = "Your KYC has been suspended and requires re-verification.") String reason) {
            
        Long partnerId = userDetails.getUser().getId();
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!Objects.equals(user.getParentPartnerId(), partnerId)) {
            throw new RuntimeException("Unauthorized: Not your customer");
        }
        
        user.setKycStatus(KycStatus.UNVERIFIED);
        userRepository.save(user);
        
        Notification notification = Notification.builder()
                .user(user)
                .title("KYC Suspended")
                .message(reason)
                .build();
        notificationRepository.save(notification);
        
        return ResponseEntity.ok(ApiResponse.success("KYC Suspended", null));
    }
}
