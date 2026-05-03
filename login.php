<?php
session_start();
require "connection.php";

// ⭐ Redirect Link එකක් ආවොත්, ඒක Session එකේ තියාගන්නවා
if (isset($_GET['redirect'])) {
    $_SESSION['redirect_url'] = $_GET['redirect'];
}
?>

<!DOCTYPE html>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login / Register - PlexZone</title>
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body class="form-page-bg">

    <div class="background-poster-grid" id="bg-grid"></div>
    <div class="form-page-overlay"></div>

    <div class="form-container">
        <form id="login-form" class="auth-form active" onsubmit="login(); return false;">
            <h2>Login</h2>
            <div class="input-group">
                <input type="email" id="login-email" autocomplete="off">
                <label for="login-email">Email</label>
            </div>
            <div class="input-group">
                <input type="password" id="login-password" autocomplete="current-password">
                <i class="fas fa-eye toggle-password" onclick="togglePasswordVisibility(this)"></i>
                <label for="login-password">Password</label>
            </div>

            <a href="#" class="forgot-password-link" onclick="showForgotPasswordModal(event)">Forgot Password?</a>
            <button type="submit" class="cta-button">Login</button>
            <p class="form-switcher">Don't have an account? <a href="#" id="show-register">Register</a></p>
        </form>

        <form id="register-form" class="auth-form" onsubmit="register(); return false;">
            <h2>Register</h2>
            <div class="input-group">
                <input type="text" id="fname" name="first_name" autocomplete="off">
                <label for="fname">First Name</label>
            </div>
            <div class="input-group">
                <input type="text" id="lname" name="last_name" autocomplete="off">
                <label for="lname">Last Name</label>
            </div>
            <div class="input-group">
                <input type="email" id="reg-email" name="email" autocomplete="off">
                <label for="reg-email">Email</label>
            </div>
            <div class="input-group">
                <input type="password" id="reg-password" name="password" autocomplete="new-password">
                <i class="fas fa-eye toggle-password" onclick="togglePasswordVisibility(this)"></i>
                <label for="reg-password">Password</label>
            </div>

            <div id="password-strength-indicator">
                <p id="length" class="strength-criterion">At least 8 characters</p>
                <p id="lowercase" class="strength-criterion">A lowercase letter</p>
                <p id="uppercase" class="strength-criterion">An uppercase letter</p>
                <p id="number" class="strength-criterion">A number</p>
                <p id="symbol" class="strength-criterion">A special symbol</p>
            </div>

            <button type="submit" class="cta-button">Register</button>
            <p class="form-switcher">Already have an account? <a href="#" id="show-login">Login</a></p>
        </form>
    </div>

    <div id="custom-modal-overlay">
        <div id="custom-modal-box">
            <h2 id="modal-title"></h2>
            <p id="modal-message"></p>
            <button id="modal-close-btn">OK</button>
        </div>
    </div>

    <div id="forgot-password-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <span class="close-btn" style="cursor: pointer;" onclick="closeAllModals()">&times;</span>
            <h2 class="title">Forgot Password</h2>
            <p style="text-align:center; margin-bottom: 2rem;">Enter your email address and we'll send you a verification code to reset your password.</p>
            <form id="forgot-password-form" onsubmit="sendResetCode(event)">
                <div class="input-group">
                    <input type="email" id="forgot-email" autocomplete="off">
                    <label for="forgot-email">Your Email Address</label>
                </div>
                <button type="submit" class="cta-button">Send Verification Code</button>
            </form>
        </div>
    </div>

    <div id="reset-password-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <span class="close-btn" style="cursor: pointer;" onclick="closeAllModals()">&times;</span>
            <h2 style="margin-bottom: 20px;">Reset Your Password</h2>
            <form id="reset-password-form" onsubmit="resetPassword(event)">
                <input type="hidden" id="reset-email" name="email">

                <div class="input-group">
                    <input type="text" id="reset-code" name="code" autocomplete="off">
                    <label for="reset-code">Verification Code</label>
                </div>
                <div class="input-group">
                    <input type="password" id="reset-new-password" name="new_password" autocomplete="new-password">
                    <i class="fas fa-eye toggle-password" onclick="togglePasswordVisibility(this)"></i>
                    <label for="reset-new-password">New Password</label>
                </div>
                <div class="input-group">
                    <input type="password" id="reset-confirm-password" name="confirm_password"  autocomplete="new-password">
                    <i class="fas fa-eye toggle-password" onclick="togglePasswordVisibility(this)"></i>
                    <label for="reset-confirm-password">Confirm New Password</label>
                </div>

                <button type="submit" class="cta-button">Reset Password</button>
            </form>
        </div>
    </div>

    <script src="js/main.js"></script>

    <script>
        // Disable Right Click
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Disable Common DevTools shortcuts
        document.addEventListener('keydown', e => {
            // F12
            if (e.key === 'F12') e.preventDefault();
            // Ctrl+Shift+I / J / C / U
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) e.preventDefault();
            if (e.ctrlKey && e.key.toUpperCase() === 'U') e.preventDefault();
        });
    </script>
</body>



</html>