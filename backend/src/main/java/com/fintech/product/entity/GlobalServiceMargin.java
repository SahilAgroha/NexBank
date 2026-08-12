package com.fintech.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "global_service_margins")
@Data
public class GlobalServiceMargin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "service_product_id", nullable = false, unique = true)
    private ServiceProduct serviceProduct;

    @Column(nullable = false)
    private String marginType = "PERCENTAGE"; // PERCENTAGE, FLAT, SURCHARGE

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal amount = BigDecimal.ZERO;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
