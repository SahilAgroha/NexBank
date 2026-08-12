package com.fintech.admin.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AdminUserDetailsResponse {
    
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String partnerType;
    private String partnerCode;
    private boolean isActive;
    private String kycStatus;
    
    private ProfileInfo profile;
    private FinanceInfo finance;
    private List<ServiceMatrixInfo> services;
    private List<CommissionInfo> commissions;

    @Data
    public static class ProfileInfo {
        private String aadhaarNumber;
        private String panNumber;
        private String city;
        private String state;
        private String pincode;
        private String completeAddress;
    }

    @Data
    public static class FinanceInfo {
        private BigDecimal walletBalance;
        private String virtualAccount;
        private String virtualIfsc;
        private BigDecimal cappingAmount;
    }

    @Data
    public static class ServiceMatrixInfo {
        private Long serviceId;
        private String serviceName;
        private boolean isAuthorized;
    }

    @Data
    public static class CommissionInfo {
        private Long serviceId;
        private String serviceName;
        private String yieldType; // PERCENTAGE, FLAT
        private BigDecimal yieldValue;
        private boolean isActive;
    }
}
