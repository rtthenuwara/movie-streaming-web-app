<?php
session_start();
require "connection.php";

$email = $_POST['email'];
$password = $_POST['password'];

if (empty($email) || empty($password)) {
    die("Email and password are required.");
}

$user_rs = Database::search("SELECT * FROM `user` WHERE `email`='{$email}'");
if ($user_rs->num_rows == 1) {
    $user_data = $user_rs->fetch_assoc();

    if ($user_data['user_status_id'] == 2) {
        // echo("Your account is not verified yet. Please check your email for the verification code.");
        die("not_verified");
    }
    if ($user_data['user_status_id'] == 3) {
        die("Your account has been blocked. Please contact support.");
    }

    if (password_verify($password, $user_data['password'])) {
        $_SESSION['user'] = $user_data;

        // ⭐ NEW: Remember Me Token සැකසීම (දවස් 30ක් සදහා)
        $token = bin2hex(random_bytes(32)); // Secure random token
        $expiry = date('Y-m-d H:i:s', time() + (86400 * 30)); // දවස් 30කින් කල් ඉකුත් වේ

        // 1. Database එකට Save කිරීම
        Database::iud("INSERT INTO `user_tokens` (`user_id`, `token`, `expiry`) VALUES ('".$user_data['id']."', '".$token."', '".$expiry."')");

        // 2. User ගේ Browser/App එකේ Cookie එකක් ලෙස Save කිරීම
        setcookie("remember_token", $token, time() + (86400 * 30), "/");

        // Redirect URL එකක් තිබේදැයි පරීක්ෂා කිරීම
        $redirect_to = '/'; // Default එක Home page එක

        if (isset($_SESSION['redirect_url'])) {
            $redirect_to = $_SESSION['redirect_url'];
            unset($_SESSION['redirect_url']); // පාවිච්චි කළාට පස්සේ මකලා දානවා

            // ⭐ Community Setup එකට යන්න ඕන නම්
            if ($redirect_to === 'setup_community') {
                // එයාට දැනටමත් Community Profile එකක් තියෙනවද බලනවා
                $check_comm = Database::search("SELECT id FROM community_users WHERE user_id = '" . $user_data['id'] . "'");

                if ($check_comm->num_rows > 0) {
                    $redirect_to = 'community.php'; // Profile තියෙනවා නම් කෙලින්ම Community එකට
                } else {
                    $redirect_to = 'community_setup.php'; // Profile නෑ, Setup එකට යන්න
                }
            } 
            // else කොටස අවශ්‍ය නෑ, මොකද $redirect_to එකේ දැනටමත් හරි URL එක තියෙනවා
        }

        // success එකයි URL එකයි දෙකම යවනවා (pipe '|' ලකුණෙන් වෙන් කරලා)
        echo 'success|' . $redirect_to;
    } else {
        echo "Invalid email or password.";
    }
} else {
    echo "Invalid email or password.";
}

?>