package com.fintech.admin.dto;

import com.fintech.user.entity.MerchantBankAccount.ApprovalStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MerchantBankAccountResponse {
    private Long id;
    private Long merchantId;
    private String merchantName;
    private String institution;
    private String accountMetadata;
    private String ifscAndContact;
    private ApprovalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
