<?php
// A simple function to load variables from a .env-like file.
// In a real production environment, you would typically use a robust library
// like 'vlucas/phpdotenv' via Composer, and configure your web server
// to prevent direct access to the .env file (e.g., placing it outside the web root).
function loadEnvVariables($filePath) {
    $variables = [];
    if (!file_exists($filePath)) {
        // Log an error or handle missing .env file appropriately
        error_log("Warning: .env file not found at $filePath. Using default values.");
        return $variables;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments and empty lines
        if (strpos(trim($line), '#') === 0 || trim($line) === '') {
            continue;
        }

        // Parse key=value pairs
        list($key, $value) = explode('=', $line, 2);
        // Remove quotes if present around the value
        $value = trim($value, " \t\n\r\0\x0B\"'");
        $variables[trim($key)] = $value;
    }
    return $variables;
}

// Load environment variables from the .env file.
// Given the provided file structure, .env is in the same directory as this script.
$env = loadEnvVariables(__DIR__ . '/.env');

// Assign loaded variables to be used in send-message.php
// Use null coalescing operator (??) for graceful fallback if key is missing in .env
$smtp_host = $env['SMTP_HOST'] ?? 'localhost';
$smtp_port = (int)($env['SMTP_PORT'] ?? 587);
$smtp_username = $env['SMTP_USERNAME'] ?? '';
$smtp_password = $env['SMTP_PASSWORD'] ?? '';
$smtp_secure = $env['SMTP_SECURE'] ?? 'tls';
$to_email = $env['TO_EMAIL'] ?? 'default@example.com';
$to_name = $env['TO_NAME'] ?? 'Default Recipient';
?>