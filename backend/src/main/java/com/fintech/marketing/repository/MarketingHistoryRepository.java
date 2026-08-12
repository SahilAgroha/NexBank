package com.fintech.marketing.repository;

import com.fintech.marketing.entity.MarketingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketingHistoryRepository extends JpaRepository<MarketingHistory, Long> {
    List<MarketingHistory> findByTypeOrderBySentAtDesc(MarketingHistory.MarketingType type);
}
