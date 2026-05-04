package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.Model.EmailDetails;

public interface EmailService {

    void sendEmail(String to, String subject, String body);

}
