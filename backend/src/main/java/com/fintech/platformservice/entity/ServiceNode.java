package com.fintech.platformservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "platform_service_id", nullable = false)
    private PlatformService platformService;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String operatorCode; // e.g., AIRTEL, JIO

    @Column(nullable = false)
    private boolean isActive;
}
