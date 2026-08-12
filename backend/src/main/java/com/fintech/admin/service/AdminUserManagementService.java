package com.fintech.admin.service;

import com.fintech.admin.dto.*;
import com.fintech.product.entity.ServiceProduct;
import com.fintech.product.entity.UserCommission;
import com.fintech.product.entity.UserServiceAuthorization;
import com.fintech.product.repository.ServiceProductRepository;
import com.fintech.product.repository.UserCommissionRepository;
import com.fintech.product.repository.UserServiceAuthorizationRepository;
import com.fintech.user.entity.User;
import com.fintech.user.entity.UserProfile;
import com.fintech.user.repository.UserProfileRepository;
import com.fintech.user.repository.UserRepository;
import com.fintech.wallet.entity.Wallet;
import com.fintech.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserManagementService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final WalletRepository walletRepository;
    private final ServiceProductRepository serviceProductRepository;
    private final UserServiceAuthorizationRepository userServiceAuthorizationRepository;
    private final UserCommissionRepository userCommissionRepository;

    @Transactional(readOnly = true)
    public AdminUserDetailsResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AdminUserDetailsResponse response = new AdminUserDetailsResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setPartnerType(user.getPartnerType() != null ? user.getPartnerType().name() : null);
        response.setPartnerCode(user.getPartnerCode());
        response.setActive(user.isActive());
        response.setKycStatus(user.getKycStatus().name());

        // Profile
        userProfileRepository.findByUserId(userId).ifPresent(profile -> {
            AdminUserDetailsResponse.ProfileInfo pInfo = new AdminUserDetailsResponse.ProfileInfo();
            pInfo.setAadhaarNumber(profile.getAadhaarNumber());
            pInfo.setPanNumber(profile.getPanNumber());
            pInfo.setCity(profile.getCity());
            pInfo.setState(profile.getState());
            pInfo.setPincode(profile.getPincode());
            pInfo.setCompleteAddress(profile.getCompleteAddress());
            response.setProfile(pInfo);
        });

        // Finance
        walletRepository.findByUserId(userId).ifPresent(wallet -> {
            AdminUserDetailsResponse.FinanceInfo fInfo = new AdminUserDetailsResponse.FinanceInfo();
            fInfo.setWalletBalance(wallet.getBalance());
            fInfo.setVirtualAccount(wallet.getVirtualAccount());
            fInfo.setVirtualIfsc(wallet.getVirtualIfsc());
            fInfo.setCappingAmount(wallet.getCappingAmount());
            response.setFinance(fInfo);
        });

        // All active services
        List<ServiceProduct> allServices = serviceProductRepository.findByIsActiveTrue();
        
        // Authorizations
        List<UserServiceAuthorization> auths = userServiceAuthorizationRepository.findByUserId(userId);
        List<AdminUserDetailsResponse.ServiceMatrixInfo> sInfoList = allServices.stream().map(service -> {
            AdminUserDetailsResponse.ServiceMatrixInfo sm = new AdminUserDetailsResponse.ServiceMatrixInfo();
            sm.setServiceId(service.getId());
            sm.setServiceName(service.getName());
            boolean isAuth = auths.stream()
                .anyMatch(a -> a.getServiceProduct().getId().equals(service.getId()) && a.isAuthorized());
            sm.setAuthorized(isAuth);
            return sm;
        }).collect(Collectors.toList());
        response.setServices(sInfoList);

        // Commissions
        List<UserCommission> commissions = userCommissionRepository.findByUserId(userId);
        List<AdminUserDetailsResponse.CommissionInfo> cInfoList = allServices.stream().map(service -> {
            AdminUserDetailsResponse.CommissionInfo cInfo = new AdminUserDetailsResponse.CommissionInfo();
            cInfo.setServiceId(service.getId());
            cInfo.setServiceName(service.getName());
            
            UserCommission existing = commissions.stream()
                .filter(c -> c.getServiceProduct().getId().equals(service.getId()))
                .findFirst()
                .orElse(null);
                
            if (existing != null) {
                cInfo.setYieldType(existing.getYieldType().name());
                cInfo.setYieldValue(existing.getYieldValue());
                cInfo.setActive(existing.isActive());
            } else {
                cInfo.setYieldType("PERCENTAGE");
                cInfo.setYieldValue(java.math.BigDecimal.ZERO);
                cInfo.setActive(false);
            }
            return cInfo;
        }).collect(Collectors.toList());
        response.setCommissions(cInfoList);

        return response;
    }

    @Transactional
    public void updateUserProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());
                
        profile.setAadhaarNumber(request.getAadhaarNumber());
        profile.setPanNumber(request.getPanNumber());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setPincode(request.getPincode());
        profile.setCompleteAddress(request.getCompleteAddress());
        
        userProfileRepository.save(profile);
    }

    @Transactional
    public void updateUserFinance(Long userId, UpdateUserFinanceRequest request) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user"));
                
        wallet.setVirtualAccount(request.getVirtualAccount());
        wallet.setVirtualIfsc(request.getVirtualIfsc());
        wallet.setCappingAmount(request.getCappingAmount());
        
        walletRepository.save(wallet);
    }

    @Transactional
    public void updateUserServiceAuthorization(Long userId, UpdateUserServiceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        ServiceProduct service = serviceProductRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));
                
        UserServiceAuthorization auth = userServiceAuthorizationRepository
                .findByUserIdAndServiceProductId(userId, request.getServiceId())
                .orElse(UserServiceAuthorization.builder().user(user).serviceProduct(service).build());
                
        auth.setAuthorized(request.isAuthorized());
        userServiceAuthorizationRepository.save(auth);
    }

    @Transactional
    public void updateUserCommission(Long userId, UpdateUserCommissionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        ServiceProduct service = serviceProductRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));
                
        UserCommission commission = userCommissionRepository
                .findByUserIdAndServiceProductId(userId, request.getServiceId())
                .orElse(UserCommission.builder().user(user).serviceProduct(service).build());
                
        commission.setYieldType(UserCommission.YieldType.valueOf(request.getYieldType()));
        commission.setYieldValue(request.getYieldValue());
        commission.setActive(request.isActive());
        
        userCommissionRepository.save(commission);
    }
}
