package com.Blog.Platform.User.Utils;

public class EmailTemplateUtil {

    public static String welcomeEmail(String username) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Blog Platform</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); min-height: 100vh; padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    🎉 Welcome to Blog Platform!
                                </h1>
                            </td>
                        </tr>

                        <!-- Main content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 18px; color: #333; line-height: 1.6;">
                                    Hello <strong style="color: #667eea;">%s</strong> 👋,
                                </p>

                                <p style="margin: 0 0 30px; font-size: 16px; color: #666; line-height: 1.6;">
                                    Thank you for creating your account with us. We're thrilled to have you join our community of passionate writers and readers!
                                </p>

                                <!-- Features box -->
                                <div style="background: linear-gradient(135deg, #f5f7fa 0%%, #c3cfe2 100%%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                                    <h2 style="margin: 0 0 20px; color: #333; font-size: 20px; font-weight: 600;">
                                        ✨ What you can do now:
                                    </h2>
                                    <ul style="margin: 0; padding: 0; list-style: none;">
                                        <li style="margin: 12px 0; padding-left: 30px; position: relative; color: #555; font-size: 15px; line-height: 1.5;">
                                            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">✍️</span>
                                            Write and publish engaging blogs
                                        </li>
                                        <li style="margin: 12px 0; padding-left: 30px; position: relative; color: #555; font-size: 15px; line-height: 1.5;">
                                            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">🤖</span>
                                            Enhance your content using AI
                                        </li>
                                        <li style="margin: 12px 0; padding-left: 30px; position: relative; color: #555; font-size: 15px; line-height: 1.5;">
                                            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">🔍</span>
                                            Discover blogs from other creators
                                        </li>
                                        <li style="margin: 12px 0; padding-left: 30px; position: relative; color: #555; font-size: 15px; line-height: 1.5;">
                                            <span style="position: absolute; left: 0; color: #667eea; font-weight: bold;">💬</span>
                                            Engage with the community
                                        </li>
                                    </ul>
                                </div>

                                <!-- CTA Button -->
                                <div style="text-align: center; margin: 35px 0;">
                                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                                        Start Writing 🚀
                                    </a>
                                </div>

                                <p style="margin: 30px 0 0; font-size: 15px; color: #888; line-height: 1.6; text-align: center;">
                                    Happy Blogging! ✨
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                    Best regards,<br>
                                    <strong style="color: #667eea;">Blog Platform Team</strong>
                                </p>
                                <p style="margin: 15px 0 0; color: #999; font-size: 12px;">
                                    © 2026 Blog Platform. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(username);
    }

    public static String otpEmail(String username, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); min-height: 100vh; padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 30px; text-align: center;">
                                <div style="background: white; width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                    <span style="font-size: 40px;">🔐</span>
                                </div>
                                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    Verify Your Email
                                </h1>
                            </td>
                        </tr>

                        <!-- Main content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 18px; color: #333; line-height: 1.6;">
                                    Hello <strong style="color: #667eea;">%s</strong> 👋,
                                </p>

                                <p style="margin: 0 0 30px; font-size: 16px; color: #666; line-height: 1.6;">
                                    Thank you for registering on <strong>Blog Platform</strong>. To complete your registration, please use the One-Time Password (OTP) below:
                                </p>

                                <!-- OTP Box -->
                                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
                                    <p style="margin: 0 0 15px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                        Your OTP Code
                                    </p>
                                    <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block; min-width: 200px;">
                                        <p style="margin: 0; font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            %s
                                        </p>
                                    </div>
                                </div>

                                <!-- Info box -->
                                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                    <p style="margin: 0 0 10px; color: #856404; font-size: 14px; font-weight: 600;">
                                        ⏱️ Important Information:
                                    </p>
                                    <ul style="margin: 0; padding: 0 0 0 20px; color: #856404; font-size: 14px; line-height: 1.6;">
                                        <li style="margin: 5px 0;">This OTP is valid for <strong>10 minutes</strong></li>
                                        <li style="margin: 5px 0;">Do not share this code with anyone</li>
                                        <li style="margin: 5px 0;">If you didn't request this, please ignore this email</li>
                                    </ul>
                                </div>

                                <!-- Security notice -->
                                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
                                    <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                                        🛡️ <strong>Security Tip:</strong> Blog Platform will never ask you for your password or OTP via email or phone. Keep your credentials safe!
                                    </p>
                                </div>

                                <p style="margin: 30px 0 0; font-size: 15px; color: #888; line-height: 1.6; text-align: center;">
                                    Welcome aboard! 🚀
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                    Best regards,<br>
                                    <strong style="color: #667eea;">Blog Platform Team</strong>
                                </p>
                                <p style="margin: 15px 0 0; color: #999; font-size: 12px;">
                                    © 2026 Blog Platform. All rights reserved.
                                </p>
                                <p style="margin: 10px 0 0; color: #999; font-size: 11px;">
                                    This is an automated message, please do not reply to this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(username, otp);
    }
}
