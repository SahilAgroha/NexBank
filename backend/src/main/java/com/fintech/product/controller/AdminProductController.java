package com.fintech.product.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.product.dto.CreateProductRequest;
import com.fintech.product.dto.ServiceProductDTO;
import com.fintech.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ServiceProductDTO>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<ServiceProductDTO> products = productService.getAllProducts(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success("Products fetched successfully", products));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceProductDTO>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ServiceProductDTO product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceProductDTO>> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody CreateProductRequest request) {
        ServiceProductDTO product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle-activation")
    public ResponseEntity<ApiResponse<ServiceProductDTO>> toggleActivation(@PathVariable Long id) {
        ServiceProductDTO product = productService.toggleActivation(id);
        return ResponseEntity.ok(ApiResponse.success("Product activation toggled", product));
    }
}
