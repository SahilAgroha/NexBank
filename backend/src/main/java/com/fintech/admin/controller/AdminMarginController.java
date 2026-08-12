package com.fintech.admin.controller;

import com.fintech.admin.dto.UpdateGlobalMarginRequest;
import com.fintech.admin.service.AdminMarginService;
import com.fintech.product.entity.GlobalServiceMargin;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/margins")
@RequiredArgsConstructor
public class AdminMarginController {

    private final AdminMarginService marginService;

    @GetMapping
    public ResponseEntity<List<GlobalServiceMargin>> getAllGlobalMargins() {
        return ResponseEntity.ok(marginService.getAllGlobalMargins());
    }

    @PutMapping
    public ResponseEntity<GlobalServiceMargin> updateGlobalMargin(@RequestBody UpdateGlobalMarginRequest request) {
        return ResponseEntity.ok(marginService.updateGlobalMargin(request));
    }
}
