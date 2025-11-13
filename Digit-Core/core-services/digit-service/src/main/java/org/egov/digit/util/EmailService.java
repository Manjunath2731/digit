package org.egov.digit.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from.name:NimbleVision Support}")
    private String fromName;

    @Value("${spring.mail.from.email:noreply@nimblevision.com}")
    private String fromEmail;

    /**
     * Send welcome email to new user with credentials
     */
    public void sendWelcomeEmail(String toEmail, String userName, String password, String deviceId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(String.format("%s <%s>", fromName, fromEmail));
            helper.setTo(toEmail);
            helper.setSubject("Welcome to NimbleVision - Your Account Details");

            String htmlContent = buildWelcomeEmailHtml(userName, toEmail, password, deviceId);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send welcome email: " + e.getMessage());
        }
    }

    /**
     * Build HTML content for welcome email
     */
    private String buildWelcomeEmailHtml(String userName, String email, String password, String deviceId) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }
                    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
                    .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to NimbleVision</h1>
                    </div>
                    <div class="content">
                        <h2>Hello %s,</h2>
                        <p>Your account has been successfully created! Below are your login credentials:</p>

                        <div class="credentials">
                            <h3>Account Information</h3>
                            <p><strong>Email:</strong> %s</p>
                            <p><strong>Password:</strong> %s</p>
                            <p><strong>Device ID:</strong> %s</p>
                        </div>

                        <div class="warning">
                            <p><strong>⚠️ Security Notice:</strong></p>
                            <p>Please change your password after your first login for security purposes.</p>
                            <p>Do not share your credentials with anyone.</p>
                        </div>

                        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

                        <p>Best regards,<br>The NimbleVision Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 NimbleVision. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """, userName, email, password, deviceId);
    }

    /**
     * Send generic email
     */
    public void sendEmail(String toEmail, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(String.format("%s <%s>", fromName, fromEmail));
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
