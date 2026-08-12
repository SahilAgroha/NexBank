package com.fintech.support.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.security.CustomUserDetails;
import com.fintech.support.entity.SupportMessage;
import com.fintech.support.entity.SupportTicket;
import com.fintech.support.entity.TicketPriority;
import com.fintech.support.service.SupportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<SupportTicket>> createTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CreateTicketRequest request) {
        SupportTicket ticket = supportService.createTicket(
                userDetails.getUser().getId(),
                request.getSubject(),
                request.getDescription(),
                request.getCategory(),
                request.getPriority()
        );
        return ResponseEntity.ok(ApiResponse.success("Support ticket created", ticket));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getMyTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<SupportTicket> tickets = supportService.getUserTickets(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved", tickets));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketDetails(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        SupportTicket ticket = supportService.getTicket(id);
        
        // Verify ownership
        if (!ticket.getUser().getId().equals(userDetails.getUser().getId())) {
            throw new RuntimeException("Unauthorized to access this ticket");
        }

        List<SupportMessage> messages = supportService.getTicketMessages(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket details retrieved", new TicketDetailResponse(ticket, messages)));
    }

    @PostMapping("/tickets/{id}/messages")
    public ResponseEntity<ApiResponse<SupportMessage>> addMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody AddMessageRequest request) {
        
        SupportTicket ticket = supportService.getTicket(id);
        if (!ticket.getUser().getId().equals(userDetails.getUser().getId())) {
            throw new RuntimeException("Unauthorized to access this ticket");
        }

        SupportMessage message = supportService.addMessage(
                id,
                userDetails.getUser().getId(),
                request.getMessage()
        );
        return ResponseEntity.ok(ApiResponse.success("Message added", message));
    }

    @Data
    public static class CreateTicketRequest {
        private String subject;
        private String description;
        private String category;
        private TicketPriority priority;
    }

    @Data
    public static class AddMessageRequest {
        private String message;
    }

    @Data
    public static class TicketDetailResponse {
        private SupportTicket ticket;
        private List<SupportMessage> messages;

        public TicketDetailResponse(SupportTicket ticket, List<SupportMessage> messages) {
            this.ticket = ticket;
            this.messages = messages;
        }
    }
}
