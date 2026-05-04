package com.Blog.Platform.User.Service;

import com.Blog.Platform.User.Model.EmailDetails;

public interface EmailService {

    void sendEmail(String to, String subject, String body);

    void sendDigestEmail(String toEmail, java.util.List<com.Blog.Platform.User.DTO.PostTeaser> teasers);

}
