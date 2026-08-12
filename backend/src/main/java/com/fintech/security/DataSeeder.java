package com.fintech.security;

import com.fintech.user.entity.Role;
import com.fintech.user.entity.User;
import com.fintech.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Seed or update default Admin user
        User admin = userRepository.findByEmail("admin@fintech.com").orElse(new User());
        
        if (admin.getId() == null) {
            admin.setFullName("System Administrator");
            admin.setEmail("admin@fintech.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setPhone("0000000000");
        }
        
        // Force the role to ADMIN and ensure they are active
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        
        userRepository.save(admin);
        
        System.out.println("=========================================");
        System.out.println("Default Admin Account Initialized:");
        System.out.println("Email: admin@fintech.com");
        System.out.println("=========================================");
    }
}
