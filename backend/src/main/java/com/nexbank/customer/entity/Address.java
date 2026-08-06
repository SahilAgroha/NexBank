package com.nexbank.customer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Address {

    @Column(name = "address_line1", length = 255)
    private String line1;

    @Column(name = "address_line2", length = 255)
    private String line2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "country", length = 100)
    private String country;
}
