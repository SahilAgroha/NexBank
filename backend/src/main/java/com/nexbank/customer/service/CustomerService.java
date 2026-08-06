package com.nexbank.customer.service;

import com.nexbank.auth.entity.User;
import com.nexbank.auth.repository.UserRepository;
import com.nexbank.common.exception.ResourceNotFoundException;
import com.nexbank.customer.dto.*;
import com.nexbank.customer.entity.Address;
import com.nexbank.customer.entity.Customer;
import com.nexbank.customer.entity.Nominee;
import com.nexbank.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerProfileDto getMyProfile() {
        Customer customer = getAuthenticatedCustomer();
        return toDto(customer);
    }

    @Transactional
    public CustomerProfileDto updateProfile(UpdateProfileRequest request) {
        Customer customer = getAuthenticatedCustomer();
        User user = customer.getUser();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        userRepository.save(user);

        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setPanNumber(request.getPanNumber());
        customer.setAadharNumber(request.getAadharNumber());
        customer.setOccupation(request.getOccupation());

        customerRepository.save(customer);
        return toDto(customer);
    }

    @Transactional
    public CustomerProfileDto updateAddress(AddressDto dto) {
        Customer customer = getAuthenticatedCustomer();
        Address addr = Address.builder()
                .line1(dto.getLine1()).line2(dto.getLine2())
                .city(dto.getCity()).state(dto.getState())
                .pincode(dto.getPincode()).country(dto.getCountry())
                .build();
        customer.setAddress(addr);
        customerRepository.save(customer);
        return toDto(customer);
    }

    @Transactional
    public CustomerProfileDto updateNominee(NomineeDto dto) {
        Customer customer = getAuthenticatedCustomer();
        Nominee nominee = Nominee.builder()
                .name(dto.getName()).relation(dto.getRelation())
                .dateOfBirth(dto.getDateOfBirth()).phone(dto.getPhone())
                .build();
        customer.setNominee(nominee);
        customerRepository.save(customer);
        return toDto(customer);
    }

    public Customer getAuthenticatedCustomer() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
        return customerRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Customer c = Customer.builder().user(user).build();
                    return customerRepository.save(c);
                });
    }

    public Customer getCustomerByUserId(String userId) {
        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", userId));
    }

    private CustomerProfileDto toDto(Customer c) {
        User u = c.getUser();
        return CustomerProfileDto.builder()
                .id(c.getId())
                .userId(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .dateOfBirth(c.getDateOfBirth())
                .gender(c.getGender())
                .panNumber(c.getPanNumber())
                .aadharNumber(c.getAadharNumber())
                .occupation(c.getOccupation())
                .kycStatus(c.getKycStatus())
                .address(c.getAddress() != null ? mapAddress(c.getAddress()) : null)
                .nominee(c.getNominee() != null ? mapNominee(c.getNominee()) : null)
                .build();
    }

    private AddressDto mapAddress(Address a) {
        AddressDto dto = new AddressDto();
        dto.setLine1(a.getLine1()); dto.setLine2(a.getLine2());
        dto.setCity(a.getCity()); dto.setState(a.getState());
        dto.setPincode(a.getPincode()); dto.setCountry(a.getCountry());
        return dto;
    }

    private NomineeDto mapNominee(Nominee n) {
        NomineeDto dto = new NomineeDto();
        dto.setName(n.getName()); dto.setRelation(n.getRelation());
        dto.setDateOfBirth(n.getDateOfBirth()); dto.setPhone(n.getPhone());
        return dto;
    }
}
