package com.nexbank.account.dto;

import com.nexbank.common.enums.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAccountRequest {
    @NotNull(message = "Account type is required")
    private AccountType accountType;
}
