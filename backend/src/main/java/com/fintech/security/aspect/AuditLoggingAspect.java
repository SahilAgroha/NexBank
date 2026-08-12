package com.fintech.security.aspect;

import com.fintech.security.annotation.LogAudit;
import com.fintech.settings.service.AuditService;
import com.fintech.user.entity.User;
import com.fintech.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditLoggingAspect {

    private final AuditService auditService;
    private final UserService userService;

    @AfterReturning(pointcut = "@annotation(com.fintech.security.annotation.LogAudit)", returning = "result")
    public void logAuditActivity(JoinPoint joinPoint, Object result) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        LogAudit logAudit = method.getAnnotation(LogAudit.class);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return;
        }

        String username = authentication.getName();
        User user = userService.findByEmail(username);

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String ipAddress = request.getRemoteAddr();

        String details = "Executed method: " + method.getName();

        auditService.logAction(
                user.getId(),
                user.getFullName(),
                logAudit.action(),
                logAudit.entityName(),
                null,
                details,
                ipAddress
        );
    }
}
