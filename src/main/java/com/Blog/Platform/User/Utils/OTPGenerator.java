package com.Blog.Platform.User.Utils;

import java.security.SecureRandom;

public class OTPGenerator {

    public static String generateOtp() {
        return String.valueOf(
                100000 + new SecureRandom().nextInt(900000)
        );
    }

}
