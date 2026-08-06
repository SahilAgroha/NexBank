package com.nexbank.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @Past private LocalDate dateOfBirth;
    private String gender;
    @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]", message = "Invalid PAN format")
    private String panNumber;
    @Pattern(regexp = "\\d{12}", message = "Aadhar must be 12 digits")
    private String aadharNumber;
    private String occupation;
}
