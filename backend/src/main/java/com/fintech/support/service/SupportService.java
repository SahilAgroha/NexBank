package com.fintech.support.service;

import com.fintech.notification.service.NotificationService;
import com.fintech.support.entity.SupportMessage;
import com.fintech.support.entity.SupportTicket;
import com.fintech.support.entity.TicketPriority;
import com.fintech.support.entity.TicketStatus;
import com.fintech.support.repository.SupportMessageRepository;
import com.fintech.support.repository.SupportTicketRepository;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public SupportTicket createTicket(Long userId, String subject, String description, String category, TicketPriority priority) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(subject)
                .description(description)
                .category(category)
                .priority(priority)
                .status(TicketStatus.OPEN)
                .build();

        return ticketRepository.save(ticket);
    }

    public List<SupportTicket> getUserTickets(Long userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public SupportTicket getTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<SupportMessage> getTicketMessages(Long ticketId) {
        return messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    @Transactional
    public SupportMessage addMessage(Long ticketId, Long senderId, String messageContent) {
        SupportTicket ticket = getTicket(ticketId);
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportMessage message = SupportMessage.builder()
                .ticket(ticket)
                .sender(sender)
                .message(messageContent)
                .build();

        SupportMessage savedMessage = messageRepository.save(message);

        // If a user replies, we could notify admins (omitted for brevity)
        // If an admin replies, notify the ticket owner
        if (sender.getRole() == com.fintech.user.entity.Role.ADMIN || sender.getRole() == com.fintech.user.entity.Role.SUPER_ADMIN) {
            notificationService.createNotification(
                    ticket.getUser().getId(),
                    "New Reply to Ticket #" + ticket.getId(),
                    "An admin has replied to your support ticket: " + ticket.getSubject()
            );
            
            if (ticket.getStatus() == TicketStatus.OPEN) {
                ticket.setStatus(TicketStatus.IN_PROGRESS);
                ticketRepository.save(ticket);
            }
        }

        return savedMessage;
    }

    @Transactional
    public SupportTicket updateTicketStatus(Long ticketId, TicketStatus status) {
        SupportTicket ticket = getTicket(ticketId);
        ticket.setStatus(status);
        SupportTicket updatedTicket = ticketRepository.save(ticket);
        
        notificationService.createNotification(
                ticket.getUser().getId(),
                "Ticket Status Updated",
                "Your support ticket #" + ticket.getId() + " status is now " + status
        );

        return updatedTicket;
    }
}
