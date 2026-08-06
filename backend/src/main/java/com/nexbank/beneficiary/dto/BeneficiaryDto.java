package com.nexbank.beneficiary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BeneficiaryDto {
    private String id;
    private String name;
    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private boolean verified;
}
