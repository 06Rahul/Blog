package com.Blog.Platform.User.Utils;

import org.springframework.security.crypto.bcrypt.BCrypt;

public class OtpHasUtil {
    public static String hash(String otp) {
        return BCrypt.hashpw(otp, BCrypt.gensalt());
    }

    public static boolean matches(String raw, String hash) {
        return BCrypt.checkpw(raw, hash);
    }
}
