package com.fintech.kyc.dto;

import lombok.Data;

@Data
public class KycRequestDto {
    private Long userId;
    private String dueDate;
    private String message;
}
