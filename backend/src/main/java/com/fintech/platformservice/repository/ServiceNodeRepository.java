package com.fintech.platformservice.repository;

import com.fintech.platformservice.entity.ServiceNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceNodeRepository extends JpaRepository<ServiceNode, Long> {
    List<ServiceNode> findByPlatformServiceId(Long platformServiceId);
}
