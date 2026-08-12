package com.fintech.platformservice.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.platformservice.dto.PlatformServiceDto;
import com.fintech.platformservice.dto.ServiceNodeDto;
import com.fintech.platformservice.service.PlatformServiceManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminServiceController {

    private final PlatformServiceManager platformServiceManager;

    // Services endpoints
    
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<PlatformServiceDto>>> getServices() {
        return ResponseEntity.ok(ApiResponse.success("Services retrieved", platformServiceManager.getAllServices()));
    }

    @PostMapping("/services")
    public ResponseEntity<ApiResponse<PlatformServiceDto>> createService(@RequestBody PlatformServiceDto request) {
        return ResponseEntity.ok(ApiResponse.success("Service created", platformServiceManager.createService(request)));
    }

    @PutMapping("/services/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleServiceStatus(@PathVariable Long id, @RequestParam boolean active) {
        platformServiceManager.toggleServiceStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    // Service Nodes endpoints

    @GetMapping("/service-nodes")
    public ResponseEntity<ApiResponse<List<ServiceNodeDto>>> getServiceNodes() {
        return ResponseEntity.ok(ApiResponse.success("Service nodes retrieved", platformServiceManager.getAllServiceNodes()));
    }

    @PostMapping("/service-nodes")
    public ResponseEntity<ApiResponse<ServiceNodeDto>> createServiceNode(@RequestBody ServiceNodeDto request) {
        return ResponseEntity.ok(ApiResponse.success("Service node created", platformServiceManager.createServiceNode(request)));
    }

    @PutMapping("/service-nodes/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleServiceNodeStatus(@PathVariable Long id, @RequestParam boolean active) {
        platformServiceManager.toggleServiceNodeStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }
}
