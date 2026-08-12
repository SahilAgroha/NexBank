package com.fintech.product.service;

import com.fintech.product.dto.CreateProductRequest;
import com.fintech.product.dto.ServiceProductDTO;
import com.fintech.product.entity.ServiceProduct;
import com.fintech.product.repository.ServiceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ServiceProductRepository productRepository;

    @Transactional
    public ServiceProductDTO createProduct(CreateProductRequest request) {
        ServiceProduct product = ServiceProduct.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .isActive(request.isActive())
                .build();
        
        return mapToDTO(productRepository.save(product));
    }

    @Transactional
    public ServiceProductDTO updateProduct(Long id, CreateProductRequest request) {
        ServiceProduct product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setActive(request.isActive());
        
        return mapToDTO(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        ServiceProduct product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }

    @Transactional
    public ServiceProductDTO toggleActivation(Long id) {
        ServiceProduct product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(!product.isActive());
        return mapToDTO(productRepository.save(product));
    }

    public Page<ServiceProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::mapToDTO);
    }

    public Page<ServiceProductDTO> getActiveProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable).map(this::mapToDTO);
    }

    private ServiceProductDTO mapToDTO(ServiceProduct product) {
        return ServiceProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .isActive(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
