package com.Blog.Platform.User.ServiceImpl;

import com.Blog.Platform.User.Service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${spring.mail.username}")
    private String sender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            if (sender != null)
                helper.setFrom(sender);
            if (to != null)
                helper.setTo(to);
            if (subject != null)
                helper.setSubject(subject);
            if (body != null)
                helper.setText(body, true); // true = HTML content

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendDigestEmail(String toEmail, java.util.List<com.Blog.Platform.User.DTO.PostTeaser> teasers) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family: Arial, sans-serif; line-height: 1.6;'>");
        html.append("<h2>Your Weekly Blog Digest</h2>");
        html.append("<p>Here are the top posts curated for you this week:</p>");
        for (com.Blog.Platform.User.DTO.PostTeaser t : teasers) {
            html.append("<div style='margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;'>");
            html.append("<h3 style='margin-bottom: 5px;'><a href='https://blog.platform/posts/").append(t.post().getId()).append("'>").append(t.post().getTitle()).append("</a></h3>");
            html.append("<p style='margin: 0; color: #555;'><i>By ").append(t.post().getAuthor().getUsername()).append("</i></p>");
            html.append("<p style='margin-top: 10px; color: #333;'>").append(t.teaser()).append("</p>");
            html.append("</div>");
        }
        html.append("<p style='margin-top: 30px; font-size: 0.9em; color: #777;'>You can <a href='https://blog.platform/settings'>unsubscribe here</a> if you no longer wish to receive these emails.</small></p>");
        html.append("</body></html>");

        sendEmail(toEmail, "Your Weekly Blog Digest", html.toString());
    }
}
