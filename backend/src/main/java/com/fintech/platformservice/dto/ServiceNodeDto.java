package com.fintech.platformservice.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceNodeDto {
    private Long id;
    private Long platformServiceId;
    private String platformServiceName;
    private String name;
    private String operatorCode;
    private Boolean isActive;
}
