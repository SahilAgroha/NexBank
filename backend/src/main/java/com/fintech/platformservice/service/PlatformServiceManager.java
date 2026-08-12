package com.fintech.platformservice.service;

import com.fintech.common.exception.CustomException;
import com.fintech.platformservice.dto.PlatformServiceDto;
import com.fintech.platformservice.dto.ServiceNodeDto;
import com.fintech.platformservice.entity.PlatformService;
import com.fintech.platformservice.entity.ServiceNode;
import com.fintech.platformservice.repository.PlatformServiceRepository;
import com.fintech.platformservice.repository.ServiceNodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformServiceManager {

    private final PlatformServiceRepository platformServiceRepository;
    private final ServiceNodeRepository serviceNodeRepository;

    public List<PlatformServiceDto> getAllServices() {
        return platformServiceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlatformServiceDto createService(PlatformServiceDto request) {
        PlatformService service = PlatformService.builder()
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .isActive(true)
                .build();
        return mapToDto(platformServiceRepository.save(service));
    }

    @Transactional
    public void toggleServiceStatus(Long id, boolean active) {
        PlatformService service = platformServiceRepository.findById(id)
                .orElseThrow(() -> new CustomException("Service not found"));
        service.setActive(active);
        platformServiceRepository.save(service);
    }

    public List<ServiceNodeDto> getAllServiceNodes() {
        return serviceNodeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceNodeDto createServiceNode(ServiceNodeDto request) {
        PlatformService service = platformServiceRepository.findById(request.getPlatformServiceId())
                .orElseThrow(() -> new CustomException("Parent service not found"));
        
        ServiceNode node = ServiceNode.builder()
                .platformService(service)
                .name(request.getName())
                .operatorCode(request.getOperatorCode())
                .isActive(true)
                .build();
                
        return mapToDto(serviceNodeRepository.save(node));
    }

    @Transactional
    public void toggleServiceNodeStatus(Long id, boolean active) {
        ServiceNode node = serviceNodeRepository.findById(id)
                .orElseThrow(() -> new CustomException("Service node not found"));
        node.setActive(active);
        serviceNodeRepository.save(node);
    }

    private PlatformServiceDto mapToDto(PlatformService entity) {
        return PlatformServiceDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .icon(entity.getIcon())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private ServiceNodeDto mapToDto(ServiceNode entity) {
        return ServiceNodeDto.builder()
                .id(entity.getId())
                .platformServiceId(entity.getPlatformService().getId())
                .platformServiceName(entity.getPlatformService().getName())
                .name(entity.getName())
                .operatorCode(entity.getOperatorCode())
                .isActive(entity.isActive())
                .build();
    }
}
