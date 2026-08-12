package com.fintech.marketing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketing_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketingType type;

    @Column(nullable = true)
    private String subject; // Used for email only

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false)
    private int recipientCount;

    @Column(nullable = false)
    private String status; // SUCCESS, FAILED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime sentAt;

    public enum MarketingType {
        SMS,
        WHATSAPP,
        EMAIL
    }
}
