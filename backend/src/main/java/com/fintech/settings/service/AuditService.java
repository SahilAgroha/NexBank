package com.fintech.settings.service;

import com.fintech.settings.entity.AuditLog;
import com.fintech.settings.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(Long adminId, String adminName, String action, String entityName, Long entityId, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .adminId(adminId)
                .adminName(adminName)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
