package com.fintech.kyc.dto;

import com.fintech.kyc.entity.KycDocument;
import com.fintech.kyc.entity.KycStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class KycResponse {
    private KycStatus status;
    private List<KycDocument> documents;
}
