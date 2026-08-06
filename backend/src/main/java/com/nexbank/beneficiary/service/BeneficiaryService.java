package com.nexbank.beneficiary.service;

import com.nexbank.beneficiary.dto.AddBeneficiaryRequest;
import com.nexbank.beneficiary.dto.BeneficiaryDto;
import com.nexbank.beneficiary.entity.Beneficiary;
import com.nexbank.beneficiary.repository.BeneficiaryRepository;
import com.nexbank.common.exception.BadRequestException;
import com.nexbank.common.exception.ForbiddenException;
import com.nexbank.common.exception.ResourceNotFoundException;
import com.nexbank.common.util.OtpUtil;
import com.nexbank.customer.entity.Customer;
import com.nexbank.customer.service.CustomerService;
import com.nexbank.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerService customerService;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    @Value("${otp.expiry-minutes}")
    private int otpExpiryMinutes;

    private static final String OTP_PREFIX = "otp:beneficiary:";

    @Transactional
    public BeneficiaryDto addBeneficiary(AddBeneficiaryRequest request) {
        Customer customer = customerService.getAuthenticatedCustomer();

        if (beneficiaryRepository.existsByCustomerIdAndAccountNumber(
                customer.getId(), request.getAccountNumber())) {
            throw new BadRequestException("Beneficiary with this account number already exists");
        }

        Beneficiary beneficiary = Beneficiary.builder()
                .customer(customer)
                .name(request.getName())
                .accountNumber(request.getAccountNumber())
                .ifscCode(request.getIfscCode())
                .bankName(request.getBankName())
                .verified(false)
                .build();
        beneficiary = beneficiaryRepository.save(beneficiary);

        // Send OTP for verification
        String otp = OtpUtil.generate6();
        redisTemplate.opsForValue().set(OTP_PREFIX + beneficiary.getId(), otp, Duration.ofMinutes(otpExpiryMinutes));
        emailService.sendOtpEmail(customer.getUser().getEmail(), customer.getUser().getFirstName(), otp, "Beneficiary Verification");

        return toDto(beneficiary);
    }

    @Transactional
    public BeneficiaryDto verifyBeneficiary(String beneficiaryId, String otp) {
        Customer customer = customerService.getAuthenticatedCustomer();
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndCustomerId(beneficiaryId, customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary", beneficiaryId));

        String storedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + beneficiaryId);
        if (storedOtp == null) throw new BadRequestException("OTP_EXPIRED", "OTP has expired");
        if (!storedOtp.equals(otp)) throw new BadRequestException("INVALID_OTP", "Invalid OTP");

        beneficiary.setVerified(true);
        beneficiaryRepository.save(beneficiary);
        redisTemplate.delete(OTP_PREFIX + beneficiaryId);
        return toDto(beneficiary);
    }

    public List<BeneficiaryDto> getMyBeneficiaries() {
        Customer customer = customerService.getAuthenticatedCustomer();
        return beneficiaryRepository.findByCustomerId(customer.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBeneficiary(String beneficiaryId) {
        Customer customer = customerService.getAuthenticatedCustomer();
        Beneficiary b = beneficiaryRepository.findByIdAndCustomerId(beneficiaryId, customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary", beneficiaryId));
        beneficiaryRepository.delete(b);
    }

    private BeneficiaryDto toDto(Beneficiary b) {
        return BeneficiaryDto.builder()
                .id(b.getId())
                .name(b.getName())
                .accountNumber(b.getAccountNumber())
                .ifscCode(b.getIfscCode())
                .bankName(b.getBankName())
                .verified(b.isVerified())
                .build();
    }
}
