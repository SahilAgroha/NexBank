package com.fintech.user.controller;

import com.fintech.common.response.ApiResponse;
import com.fintech.security.CustomUserDetails;
import com.fintech.user.dto.UpdateProfileRequest;
import com.fintech.user.dto.UpdatePasswordRequest;
import com.fintech.user.entity.User;
import com.fintech.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userService.getUserProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(userDetails.getUser().getId(), request.getFullName(), request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UpdatePasswordRequest request) {
        userService.changePassword(userDetails.getUser().getId(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/link-partner")
    public ResponseEntity<ApiResponse<User>> linkPartner(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("partnerCode") String partnerCode) {
        try {
            User user = userService.linkPartner(userDetails.getUser().getId(), partnerCode);
            return ResponseEntity.ok(ApiResponse.success("Partner linked successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
