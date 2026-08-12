package com.fintech.admin.service;

import com.fintech.admin.dto.UpdateGlobalMarginRequest;
import com.fintech.product.entity.GlobalServiceMargin;
import com.fintech.product.entity.ServiceProduct;
import com.fintech.product.repository.GlobalServiceMarginRepository;
import com.fintech.product.repository.ServiceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMarginService {

    private final GlobalServiceMarginRepository marginRepository;
    private final ServiceProductRepository serviceProductRepository;

    public List<GlobalServiceMargin> getAllGlobalMargins() {
        return marginRepository.findAll();
    }

    public GlobalServiceMargin updateGlobalMargin(UpdateGlobalMarginRequest request) {
        ServiceProduct serviceProduct = serviceProductRepository.findById(request.getServiceProductId())
                .orElseThrow(() -> new RuntimeException("Service Product not found"));

        GlobalServiceMargin margin = marginRepository.findByServiceProductId(request.getServiceProductId())
                .orElse(new GlobalServiceMargin());

        margin.setServiceProduct(serviceProduct);
        margin.setMarginType(request.getMarginType());
        margin.setAmount(request.getAmount());

        return marginRepository.save(margin);
    }
}
