package com.fintech.admin.dto;

import com.fintech.user.entity.PartnerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HierarchyNodeDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String partnerCode;
    private PartnerType partnerType;
    private boolean isActive;
    
    @Builder.Default
    private List<HierarchyNodeDto> children = new ArrayList<>();
}
