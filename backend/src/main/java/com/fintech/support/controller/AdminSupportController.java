package com.fintech.support.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.security.CustomUserDetails;
import com.fintech.support.entity.SupportMessage;
import com.fintech.support.entity.SupportTicket;
import com.fintech.support.entity.TicketStatus;
import com.fintech.support.service.SupportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminSupportController {

    private final SupportService supportService;

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getAllTickets() {
        List<SupportTicket> tickets = supportService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success("All tickets retrieved", tickets));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<SupportController.TicketDetailResponse>> getTicketDetails(@PathVariable Long id) {
        SupportTicket ticket = supportService.getTicket(id);
        List<SupportMessage> messages = supportService.getTicketMessages(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket details retrieved", new SupportController.TicketDetailResponse(ticket, messages)));
    }

    @PostMapping("/tickets/{id}/messages")
    public ResponseEntity<ApiResponse<SupportMessage>> addMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody SupportController.AddMessageRequest request) {
        
        SupportMessage message = supportService.addMessage(
                id,
                userDetails.getUser().getId(),
                request.getMessage()
        );
        return ResponseEntity.ok(ApiResponse.success("Message added", message));
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<ApiResponse<SupportTicket>> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        SupportTicket updatedTicket = supportService.updateTicketStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", updatedTicket));
    }

    @Data
    public static class UpdateStatusRequest {
        private TicketStatus status;
    }
}
