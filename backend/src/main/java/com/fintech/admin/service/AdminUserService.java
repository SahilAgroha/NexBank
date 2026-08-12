package com.fintech.admin.service;

import com.fintech.admin.dto.CreatePartnerRequest;
import com.fintech.common.exception.CustomException;
import com.fintech.user.entity.Role;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.fintech.admin.dto.HierarchyNodeDto;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;

    public Page<User> getUsersByRole(Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

    @Transactional
    public void toggleUserStatus(Long userId, boolean status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));
        user.setActive(status);
        userRepository.save(user);
    }

    @Transactional
    public void createPartner(CreatePartnerRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new CustomException("Email is already in use");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new CustomException("Phone is already in use");
        }

        String randomStr = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        User partner = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PARTNER)
                .partnerType(request.getPartnerType())
                .isActive(true) // Admin created them, they are active
                .partnerCode("PRT-" + randomStr)
                .build();
                
        userRepository.save(partner);
        
        // Create initial wallet
        walletService.createWalletForUser(partner);
    }

    public List<HierarchyNodeDto> getPartnerHierarchyTree() {
        List<User> partners = userRepository.findByRole(Role.PARTNER);
        
        Map<Long, HierarchyNodeDto> nodeMap = partners.stream().collect(Collectors.toMap(
                User::getId,
                u -> HierarchyNodeDto.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .partnerCode(u.getPartnerCode())
                        .partnerType(u.getPartnerType())
                        .isActive(u.isActive())
                        .children(new ArrayList<>())
                        .build()
        ));

        List<HierarchyNodeDto> rootNodes = new ArrayList<>();

        for (User p : partners) {
            HierarchyNodeDto node = nodeMap.get(p.getId());
            if (p.getParentPartnerId() == null) {
                rootNodes.add(node);
            } else {
                HierarchyNodeDto parent = nodeMap.get(p.getParentPartnerId());
                if (parent != null) {
                    parent.getChildren().add(node);
                } else {
                    rootNodes.add(node); // Fallback if parent is missing
                }
            }
        }
        
        return rootNodes;
    }
}
