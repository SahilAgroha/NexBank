package com.fintech.product.entity;

import com.fintech.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_commissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "service_product_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCommission {

    public enum YieldType {
        PERCENTAGE, FLAT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_product_id", nullable = false)
    private ServiceProduct serviceProduct;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private YieldType yieldType = YieldType.PERCENTAGE;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal yieldValue = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
