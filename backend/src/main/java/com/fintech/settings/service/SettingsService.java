package com.fintech.settings.service;

import com.fintech.settings.entity.SystemSetting;
import com.fintech.settings.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SystemSettingRepository systemSettingRepository;

    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    public List<SystemSetting> getSettingsByCategory(SystemSetting.SettingCategory category) {
        return systemSettingRepository.findByCategory(category);
    }

    public String getSettingValue(String key, String defaultValue) {
        return systemSettingRepository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional
    public SystemSetting updateSetting(String key, String value, SystemSetting.SettingCategory category) {
        Optional<SystemSetting> existing = systemSettingRepository.findBySettingKey(key);
        SystemSetting setting;
        if (existing.isPresent()) {
            setting = existing.get();
            setting.setSettingValue(value);
            setting.setCategory(category);
        } else {
            setting = SystemSetting.builder()
                    .settingKey(key)
                    .settingValue(value)
                    .category(category)
                    .build();
        }
        return systemSettingRepository.save(setting);
    }
    
    @Transactional
    public void updateMultipleSettings(List<SystemSetting> settings) {
        for (SystemSetting s : settings) {
            updateSetting(s.getSettingKey(), s.getSettingValue(), s.getCategory());
        }
    }
}
