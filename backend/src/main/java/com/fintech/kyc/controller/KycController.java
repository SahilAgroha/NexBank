package com.fintech.kyc.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.kyc.dto.KycResponse;
import com.fintech.kyc.entity.KycDocument;
import com.fintech.kyc.entity.KycStatus;
import com.fintech.kyc.repository.KycDocumentRepository;
import com.fintech.kyc.service.CloudinaryService;
import com.fintech.security.CustomUserDetails;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final CloudinaryService cloudinaryService;
    private final KycDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<KycDocument>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "partnerCode", required = false) String partnerCode,
            @AuthenticationPrincipal CustomUserDetails userDetails) throws IOException {
            
        User user = userDetails.getUser();
        
        // Upload to Cloudinary
        String documentUrl = cloudinaryService.uploadFile(file);
        
        // Save Document Record
        KycDocument document = KycDocument.builder()
                .user(user)
                .documentType(documentType)
                .documentUrl(documentUrl)
                .status(KycStatus.PENDING)
                .build();
                
        kycDocumentRepository.save(document);
        
        // Update User Status
        user.setKycStatus(KycStatus.PENDING);
        
        if (partnerCode != null && !partnerCode.trim().isEmpty()) {
            userRepository.findByPartnerCode(partnerCode).ifPresent(partner -> {
                user.setParentPartnerId(partner.getId());
            });
        }
        
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", document));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<KycResponse>> getKycStatus(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<KycDocument> documents = kycDocumentRepository.findByUserId(user.getId());
        
        KycResponse response = KycResponse.builder()
                .status(user.getKycStatus())
                .documents(documents)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("KYC Status fetched", response));
    }
}
