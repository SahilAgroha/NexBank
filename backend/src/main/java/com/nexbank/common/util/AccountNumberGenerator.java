package com.nexbank.common.util;

import java.security.SecureRandom;

public class AccountNumberGenerator {
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generate() {
        // Format: NEX + 12 digits
        long number = 100000000000L + (long)(RANDOM.nextDouble() * 900000000000L);
        return "NEX" + number;
    }
}
