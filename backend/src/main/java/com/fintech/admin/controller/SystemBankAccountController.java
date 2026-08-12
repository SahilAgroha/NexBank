package com.fintech.admin.controller;

import com.fintech.admin.entity.SystemBankAccount;
import com.fintech.admin.service.SystemBankAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bank-accounts")
@RequiredArgsConstructor
public class SystemBankAccountController {

    private final SystemBankAccountService service;

    @GetMapping
    public ResponseEntity<List<SystemBankAccount>> getAllAccounts() {
        return ResponseEntity.ok(service.getAllAccounts());
    }

    @PostMapping
    public ResponseEntity<SystemBankAccount> createAccount(@RequestBody SystemBankAccount account) {
        return ResponseEntity.ok(service.createAccount(account));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<SystemBankAccount> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        service.deleteAccount(id);
        return ResponseEntity.ok().build();
    }
}
