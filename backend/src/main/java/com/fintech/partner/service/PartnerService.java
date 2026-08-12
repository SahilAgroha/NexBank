package com.fintech.partner.service;

import com.fintech.partner.dto.CustomerInfo;
import com.fintech.partner.dto.HierarchyNode;
import com.fintech.partner.dto.PartnerDashboardResponse;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartnerService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    public PartnerDashboardResponse getDashboardStats(Long partnerId) {
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        Wallet wallet = walletRepository.findByUserId(partner.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        long totalDownline = userRepository.countByParentPartnerId(partnerId);

        // In a real application, totalCommission would be an aggregate from transactions table where type=COMMISSION and receiver=partnerId
        // For simplicity, returning 0.00 right now.
        return PartnerDashboardResponse.builder()
                .currentWalletBalance(wallet.getBalance())
                .totalCustomers(totalDownline)
                .totalDownlinePartners(totalDownline)
                .totalCommission(BigDecimal.ZERO)
                .build();
    }

    public List<CustomerInfo> getCustomers(Long partnerId) {
        List<User> customers = userRepository.findByParentPartnerId(partnerId);
        return customers.stream().map(u -> CustomerInfo.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .registeredAt(u.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    public HierarchyNode getHierarchy(Long partnerId) {
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        return buildHierarchyNode(partner);
    }

    private HierarchyNode buildHierarchyNode(User user) {
        List<User> downlineUsers = userRepository.findByParentPartnerId(user.getId());
        List<HierarchyNode> downlineNodes = downlineUsers.stream()
                .map(this::buildHierarchyNode)
                .collect(Collectors.toList());

        return HierarchyNode.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .partnerType(user.getPartnerType())
                .downline(downlineNodes)
                .build();
    }
}
