package com.fintech.marketing.service;

import com.fintech.marketing.entity.Banner;
import com.fintech.marketing.entity.News;
import com.fintech.marketing.repository.BannerRepository;
import com.fintech.marketing.repository.NewsRepository;
import com.fintech.kyc.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import com.fintech.marketing.dto.NotificationMessageRequest;
import com.fintech.marketing.entity.MarketingHistory;
import com.fintech.marketing.repository.MarketingHistoryRepository;
import com.fintech.user.repository.UserRepository;
import com.fintech.user.entity.User;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketingService {

    private final BannerRepository bannerRepository;
    private final NewsRepository newsRepository;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private final JavaMailSender javaMailSender;
    private final MarketingHistoryRepository marketingHistoryRepository;

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public List<Banner> getActiveBanners(String placementStr) {
        if (placementStr != null && !placementStr.isEmpty()) {
            try {
                Banner.BannerPlacement placement = Banner.BannerPlacement.valueOf(placementStr.toUpperCase());
                return bannerRepository.findByActiveTrueAndPlacement(placement);
            } catch (IllegalArgumentException e) {
                return bannerRepository.findByActiveTrue();
            }
        }
        return bannerRepository.findByActiveTrue();
    }

    @Transactional
    public Banner createBanner(Banner banner, org.springframework.web.multipart.MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadBannerImage(image);
                banner.setImageUrl(imageUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(Long id, Banner updatedBanner, org.springframework.web.multipart.MultipartFile image) {
        Banner banner = bannerRepository.findById(id).orElseThrow(() -> new RuntimeException("Banner not found"));
        banner.setTitle(updatedBanner.getTitle());
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadBannerImage(image);
                banner.setImageUrl(imageUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        } else if (updatedBanner.getImageUrl() != null && !updatedBanner.getImageUrl().isEmpty()) {
            // Keep old image url if new image isn't uploaded, but allow updating to another url if needed
            banner.setImageUrl(updatedBanner.getImageUrl());
        }
        banner.setTargetUrl(updatedBanner.getTargetUrl());
        banner.setActive(updatedBanner.isActive());
        banner.setPlacement(updatedBanner.getPlacement());
        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    public List<News> getAllNews() {
        return newsRepository.findAll();
    }

    public List<News> getPublishedNews() {
        return newsRepository.findByPublishedTrueOrderByCreatedAtDesc();
    }

    @Transactional
    public News createNews(News news) {
        return newsRepository.save(news);
    }

    @Transactional
    public News updateNews(Long id, News updatedNews) {
        News news = newsRepository.findById(id).orElseThrow(() -> new RuntimeException("News not found"));
        news.setTitle(updatedNews.getTitle());
        news.setContent(updatedNews.getContent());
        news.setPublished(updatedNews.isPublished());
        return newsRepository.save(news);
    }

    @Transactional
    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }

    public void sendSms(NotificationMessageRequest request) {
        log.info("🚀 [MOCK] Sending SMS to users {}: {}", request.getUserIds(), request.getMessage());
        // TODO: Integrate actual MSG91 or Twilio SMS client here using properties from application.yaml
        
        saveHistory(MarketingHistory.MarketingType.SMS, null, request.getMessage(), request.getUserIds().size(), "SUCCESS");
    }

    public void sendWhatsApp(NotificationMessageRequest request) {
        log.info("🟢 [MOCK] Sending WhatsApp message to users {}: {}", request.getUserIds(), request.getMessage());
        // TODO: Integrate actual WhatsApp Business API client here
        
        saveHistory(MarketingHistory.MarketingType.WHATSAPP, null, request.getMessage(), request.getUserIds().size(), "SUCCESS");
    }

    public void sendEmail(NotificationMessageRequest request) {
        log.info("📧 Sending actual Email (Subject: '{}') to {} users", request.getSubject(), request.getUserIds().size());
        
        List<User> users = userRepository.findAllById(request.getUserIds());
        
        for (User user : users) {
            try {
                if (user.getEmail() == null || user.getEmail().isEmpty()) {
                    continue;
                }
                
                MimeMessage mimeMessage = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                
                String htmlMsg = request.getMessage().replace("{{name}}", user.getFullName());
                
                helper.setText(htmlMsg, true); // true indicates HTML
                helper.setTo(user.getEmail());
                helper.setSubject(request.getSubject() != null ? request.getSubject() : "Notification");
                
                javaMailSender.send(mimeMessage);
                log.info("Sent email successfully to: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send email to {}", user.getEmail(), e);
            }
        }
        
        saveHistory(MarketingHistory.MarketingType.EMAIL, request.getSubject(), request.getMessage(), users.size(), "SUCCESS");
    }
    
    public List<MarketingHistory> getMarketingHistory(MarketingHistory.MarketingType type) {
        return marketingHistoryRepository.findByTypeOrderBySentAtDesc(type);
    }
    
    private void saveHistory(MarketingHistory.MarketingType type, String subject, String message, int count, String status) {
        MarketingHistory history = MarketingHistory.builder()
                .type(type)
                .subject(subject)
                .message(message)
                .recipientCount(count)
                .status(status)
                .build();
        marketingHistoryRepository.save(history);
    }
}
