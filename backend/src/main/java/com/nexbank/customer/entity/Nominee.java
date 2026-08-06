package com.nexbank.customer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Nominee {

    @Column(name = "nominee_name", length = 100)
    private String name;

    @Column(name = "nominee_relation", length = 50)
    private String relation;

    @Column(name = "nominee_dob")
    private String dateOfBirth;

    @Column(name = "nominee_phone", length = 15)
    private String phone;
}
