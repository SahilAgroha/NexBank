package com.fintech.admin.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateUserProfileRequest {
    private String aadhaarNumber;
    private String panNumber;
    private String city;
    private String state;
    private String pincode;
    private String completeAddress;
}
