package com.fintech.marketing.controller;

import com.fintech.marketing.entity.Banner;
import com.fintech.marketing.entity.News;
import com.fintech.marketing.service.MarketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing")
@RequiredArgsConstructor
public class MarketingController {

    private final MarketingService marketingService;

    // Public endpoints
    @GetMapping("/banners/active")
    public ResponseEntity<List<Banner>> getActiveBanners(@RequestParam(required = false) String placement) {
        return ResponseEntity.ok(marketingService.getActiveBanners(placement));
    }

    @GetMapping("/news/published")
    public ResponseEntity<List<News>> getPublishedNews() {
        return ResponseEntity.ok(marketingService.getPublishedNews());
    }

    // Admin endpoints
    @GetMapping("/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(marketingService.getAllBanners());
    }

    @PostMapping(value = "/admin/banners", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Banner> createBanner(
            @RequestParam("title") String title,
            @RequestParam(value = "targetUrl", required = false) String targetUrl,
            @RequestParam("active") boolean active,
            @RequestParam("placement") Banner.BannerPlacement placement,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image
    ) {
        Banner banner = Banner.builder()
                .title(title)
                .targetUrl(targetUrl)
                .active(active)
                .placement(placement)
                .build();
        return ResponseEntity.ok(marketingService.createBanner(banner, image));
    }

    @PutMapping(value = "/admin/banners/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Banner> updateBanner(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "targetUrl", required = false) String targetUrl,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam("active") boolean active,
            @RequestParam("placement") Banner.BannerPlacement placement,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image
    ) {
        Banner banner = Banner.builder()
                .title(title)
                .targetUrl(targetUrl)
                .imageUrl(imageUrl)
                .active(active)
                .placement(placement)
                .build();
        return ResponseEntity.ok(marketingService.updateBanner(id, banner, image));
    }

    @DeleteMapping("/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        marketingService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/news")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<News>> getAllNews() {
        return ResponseEntity.ok(marketingService.getAllNews());
    }

    @PostMapping("/admin/news")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<News> createNews(@RequestBody News news) {
        return ResponseEntity.ok(marketingService.createNews(news));
    }

    @PutMapping("/admin/news/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<News> updateNews(@PathVariable Long id, @RequestBody News news) {
        return ResponseEntity.ok(marketingService.updateNews(id, news));
    }

    @DeleteMapping("/admin/news/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        marketingService.deleteNews(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/send-sms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendSms(@RequestBody com.fintech.marketing.dto.NotificationMessageRequest request) {
        marketingService.sendSms(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/send-whatsapp")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendWhatsApp(@RequestBody com.fintech.marketing.dto.NotificationMessageRequest request) {
        marketingService.sendWhatsApp(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/send-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendEmail(@RequestBody com.fintech.marketing.dto.NotificationMessageRequest request) {
        marketingService.sendEmail(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.fintech.marketing.entity.MarketingHistory>> getHistory(
            @RequestParam("type") com.fintech.marketing.entity.MarketingHistory.MarketingType type) {
        return ResponseEntity.ok(marketingService.getMarketingHistory(type));
    }
}
