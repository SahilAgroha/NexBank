package com.fintech.marketing.dto;

import lombok.Data;

import java.util.List;

@Data
public class NotificationMessageRequest {
    private List<Long> userIds;
    private String subject; // Optional, mostly for emails
    private String message;
}
