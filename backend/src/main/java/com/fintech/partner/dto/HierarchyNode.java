package com.fintech.partner.dto;

import com.fintech.user.entity.PartnerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HierarchyNode {
    private Long id;
    private String fullName;
    private String email;
    private PartnerType partnerType;
    private List<HierarchyNode> downline;
}
