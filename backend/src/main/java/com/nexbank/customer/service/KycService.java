package com.nexbank.customer.service;

import com.cloudinary.Cloudinary;
import com.nexbank.common.enums.KycStatus;
import com.nexbank.customer.entity.Customer;
import com.nexbank.customer.entity.KycDocument;
import com.nexbank.customer.repository.KycDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KycService {

    private final KycDocumentRepository kycDocumentRepository;
    private final CustomerService customerService;
    private final Cloudinary cloudinary;

    @Transactional
    public KycDocument uploadDocument(String documentType, MultipartFile file) throws IOException {
        Customer customer = customerService.getAuthenticatedCustomer();

        // Upload to Cloudinary
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                Map.of(
                    "folder", "nexbank/kyc/" + customer.getId(),
                    "public_id", documentType + "_" + System.currentTimeMillis(),
                    "resource_type", "image",
                    "transformation", "q_auto,f_auto"
                )
        );

        String publicId = (String) uploadResult.get("public_id");
        String url = (String) uploadResult.get("secure_url");

        KycDocument doc = KycDocument.builder()
                .customer(customer)
                .documentType(documentType)
                .cloudinaryPublicId(publicId)
                .cloudinaryUrl(url)
                .status(KycStatus.SUBMITTED)
                .build();

        doc = kycDocumentRepository.save(doc);

        // Update customer KYC status
        customer.setKycStatus(KycStatus.SUBMITTED);
        log.info("KYC document uploaded for customer {}: {}", customer.getId(), documentType);
        return doc;
    }

    public List<KycDocument> getMyDocuments() {
        Customer customer = customerService.getAuthenticatedCustomer();
        return kycDocumentRepository.findByCustomerId(customer.getId());
    }
}
