package com.fintech.platformservice.repository;

import com.fintech.platformservice.entity.PlatformService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformServiceRepository extends JpaRepository<PlatformService, Long> {
}
