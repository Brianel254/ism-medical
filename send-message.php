<?php
header('Content-Type: application/json');

// Include the PHP environment loader to get sensitive details
// The php_env_loader.php will correctly locate the .env file.
require_once __DIR__ . '/php_env_loader.php';

// Note: For a truly secure and robust email sending solution in a production environment,
// it is highly recommended to use a dedicated SMTP library like PHPMailer.
// The commented-out PHPMailer section below shows how it could be used if PHPMailer
// and its dependencies were available (e.g., via Composer).
// The current implementation uses PHP's built-in mail() function, which relies on
// the server's mail configuration and may not be suitable for all hosting environments
// or for achieving high deliverability.

// SMTP Configuration - Update these with your SMTP details
// These are now loaded from the .env file via php_env_loader.php
// $smtp_host = 'your-smtp-host.com'; // e.g., smtp.gmail.com
// $smtp_port = 587; // or 465 for SSL
// $smtp_username = 'your-email@domain.com';
// $smtp_password = 'your-app-password';
// $smtp_secure = 'tls'; // or 'ssl'

// Recipient email
// $to_email = 'info@brytec.co.ke'; // Now loaded from .env
// $to_name = 'Brytec Digital Marketing'; // Now loaded from .env

try {
    // Validate input
    if (!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['subject']) || !isset($_POST['message'])) {
        throw new Exception('All fields are required');
    }
    
    $name = htmlspecialchars($_POST['name']);
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);
    
    if (!$email) {
        throw new Exception('Invalid email address');
    }
    
    // Create email content
    $email_subject = "Contact Form: " . $subject;
    $email_body = "
    <html>
    <body style='font-family: Arial, sans-serif;'>
        <h2>New Contact Form Submission</h2>
        <table style='border-collapse: collapse; width: 100%;'>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;'>Name:</td>
                <td style='padding: 10px; border: 1px solid #ddd;'>$name</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;'>Email:</td>
                <td style='padding: 10px; border: 1px solid #ddd;'>$email</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;'>Subject:</td>
                <td style='padding: 10px; border: 1px solid #ddd;'>$subject</td>
            </tr>
            <tr>
                <td style='padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;'>Message:</td>
                <td style='padding: 10px; border: 1px solid #ddd;'>$message</td>
            </tr>
        </table>
        <p style='margin-top: 20px; color: #666;'>
            This message was sent from the IMS Medical contact form on " . date('Y-m-d H:i:s') . "
        </p>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $name . ' <' . $email . '>',
        'Reply-To: ' . $email,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Send email using PHP's mail function (simple approach)
    // For production, consider using PHPMailer or similar library for SMTP
    if (mail($to_email, $email_subject, $email_body, implode("\r\n", $headers))) {
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    } else {
        // Capture last error for better debugging
        $error = error_get_last();
        $mail_error_message = isset($error['message']) ? $error['message'] : 'Unknown mail() error.';
        throw new Exception("Failed to send email. Server mail function reported: {$mail_error_message}");
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Alternative SMTP implementation using PHPMailer (commented out)
/*
// Make sure PHPMailer is installed via Composer: composer require phpmailer/phpmailer
// require_once 'vendor/autoload.php';

// use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\SMTP;
// use PHPMailer\PHPMailer\Exception;

// $mail = new PHPMailer(true);

// try {
//     // Server settings
//     $mail->isSMTP();
//     $mail->Host       = $smtp_host;
//     $mail->SMTPAuth   = true;
//     $mail->Username   = $smtp_username;
//     $mail->Password   = $smtp_password;
//     $mail->SMTPSecure = $smtp_secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
//     $mail->Port       = $smtp_port;

//     // Recipients
//     $mail->setFrom($email, $name);
//     $mail->addAddress($to_email, $to_name);
//     $mail->addReplyTo($email, $name);

//     // Content
//     $mail->isHTML(true);
//     $mail->Subject = $email_subject;
//     $mail->Body    = $email_body;
//     $mail->CharSet = 'UTF-8';

//     $mail->send();
//     echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
// } catch (Exception $e) {
//     http_response_code(500);
//     echo json_encode(['success' => false, 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}. Please check your SMTP configuration."]);
// }
*/
?>