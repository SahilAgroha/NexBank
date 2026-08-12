package com.fintech.admin.dto;

import com.fintech.user.entity.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private String partnerType;
    private Long parentPartnerId;
    private boolean isActive;
    private String kycStatus;
    private LocalDateTime createdAt;
}
