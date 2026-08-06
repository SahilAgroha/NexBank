package com.nexbank.audit.entity;

import com.nexbank.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_actor", columnList = "actor"),
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLog extends BaseEntity {

    @Column(name = "actor", nullable = false, length = 255)
    private String actor; // email of the acting user

    @Column(name = "actor_role", length = 20)
    private String actorRole;

    @Column(name = "action", nullable = false, length = 100)
    private String action; // e.g. "FREEZE_ACCOUNT", "RESET_PASSWORD"

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 36)
    private String entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_state", columnDefinition = "jsonb")
    private String beforeState;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_state", columnDefinition = "jsonb")
    private String afterState;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "details", length = 1000)
    private String details;
}
