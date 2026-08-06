package com.nexbank.customer.dto;

import com.nexbank.common.enums.KycStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CustomerProfileDto {
    private String id;
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String panNumber;
    private String aadharNumber;
    private String occupation;
    private KycStatus kycStatus;
    private AddressDto address;
    private NomineeDto nominee;
}
