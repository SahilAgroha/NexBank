package com.fintech.admin.dto;

import lombok.Data;

@Data
public class UpdateUserServiceRequest {
    private Long serviceId;
    private boolean isAuthorized;
}
