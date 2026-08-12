package com.fintech.settings.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String settingKey;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String settingValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettingCategory category;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum SettingCategory {
        BRAND, EMAIL, SMS, WHATSAPP, COMPANY, COMPLIANCE
    }
}
