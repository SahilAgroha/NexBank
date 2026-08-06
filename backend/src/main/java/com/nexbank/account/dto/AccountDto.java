package com.nexbank.account.dto;

import com.nexbank.common.enums.AccountStatus;
import com.nexbank.common.enums.AccountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class AccountDto {
    private String id;
    private String accountNumber;
    private AccountType accountType;
    private AccountStatus status;
    private BigDecimal balance;
    private String ifscCode;
    private String branch;
    private Instant createdAt;
}
