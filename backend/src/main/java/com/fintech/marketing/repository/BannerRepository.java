package com.fintech.marketing.repository;

import com.fintech.marketing.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActiveTrue();
    List<Banner> findByActiveTrueAndPlacement(Banner.BannerPlacement placement);
}
