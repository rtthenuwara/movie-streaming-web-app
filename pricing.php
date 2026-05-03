<?php

require_once "connection.php"; // Database connection එක import කිරීම

// Session එක ආරම්භ කිරීම (header එකට අවශ්‍යයි - header.php එකෙන් handle වෙනවා ඇති)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$current_plan = 'free';

// Global Variables for Access Control
$user_plan = 'guest'; // guest, free, basic, premium
$show_ads = true;     // Default: Show ads
$can_watch_series = false;
$can_download_1080p = false;

if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    $user_id = $user['id'];

    // Check for Active Subscription
    $paid_sub_rs = Database::search("SELECT * FROM `subsciption` WHERE `user_id` = {$user_id} AND `end_date` >= CURDATE() ORDER BY `end_date` DESC LIMIT 1");

    if ($paid_sub_rs->num_rows > 0) {
        // Active Subscription Found
        $sub_data = $paid_sub_rs->fetch_assoc();
        $package_id = $sub_data['subscription_package_id'];

        if ($package_id == 1) {
            $user_plan = 'basic';
            $show_ads = false; // Basic: No Ads
            $can_watch_series = false; // Basic: Movies Only
            $can_download_1080p = false;
        } elseif ($package_id == 2) {
            $user_plan = 'premium';
            $show_ads = false; // Premium: No Ads
            $can_watch_series = true; // Premium: Movies + Series
            $can_download_1080p = true;
        }
    } else {
        // No Active Subscription = Free Plan
        $user_plan = 'free';
        $show_ads = true; // Free: Show Ads
        $can_watch_series = false; // Free: Movies Only
        $can_download_1080p = false;
    }
}

$isLoggedIn = isset($_SESSION['user']);


?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Plans - PlexZone</title>
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/style.css?v=1.7">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <style>
        @media (max-width: 992px) {
            body.form-page-bg {
                height: auto;
                min-height: 100vh;
                display: block;
                padding-top: 100px;
                padding-bottom: 50px;
                overflow-y: auto;
            }

            .pricing-container {
                min-height: auto;
                padding-top: 0;
                padding-bottom: 0;
                width: 100%;
            }
        }

        @media (max-width: 576px) {
            body.form-page-bg {
                padding-top: 120px;
                padding-bottom: 30px;
            }

            .pricing-cards-container {
                display: flex !important;
                flex-direction: column !important;
            }

            .pricing-card-reloaded.free-tier {
                order: -999 !important;
            }
        }

        @media (max-width: 768px) {
            .pricing-cards-container {
                display: flex !important;
                flex-direction: column !important;
            }

            .pricing-card-reloaded.free-tier {
                order: -999 !important;
            }
        }

        .pricing-cards-container { flex-wrap: wrap; gap: 20px; }
        .pricing-card-reloaded { flex: 1; min-width: 300px; }
        .current-plan-btn { background: #555; cursor: default; border: 1px solid #777; }
        .current-plan-btn:hover { background: #555;
            color: #00e676; transform: none; box-shadow: none; }
    </style>
</head>

<body class="centered-page-bg">

    <div class="background-poster-grid" id="bg-grid"></div>
    <div class="form-page-overlay"></div>

    <main class="pricing-container">
        <h1 class="pricing-main-title">Choose Your Plan</h1>

        <div class="pricing-cards-container">

            <!-- 1. FREE PLAN (Default) -->
            <div class="pricing-card-reloaded free-tier">
                <h2 class="card-title">Free Plan</h2>
                <p class="price-reloaded">Rs. 0 <span>/ Forever</span></p>
                <p class="card-subtitle">Basic access with ads.</p>

                <ul class="features-list">
                    <li><i class="fas fa-check-circle" style="color:#aaa;"></i> Access Movies & TV Series</li>
                    <li><i class="fas fa-check-circle" style="color:#aaa;"></i> 720p HD Quality</li>
                    <li><i class="fas fa-check-circle" style="color:#aaa;"></i> Download only Movies(720p)</li>
                    <!-- Negative Features -->
                    <li style="color: #ef5350;"><i class="fas fa-times-circle" style="color: #ef5350;"></i> Ads Included</li>
                </ul>
                
                <?php if ($isLoggedIn): ?>
                    <button class="cta-button current-plan-btn" disabled style="background: #333; border-color: #555; cursor: default; opacity: 0.7;">Active by Default</button>
                <?php else: ?>
                    <a href="login" class="cta-button glow-button" style="background: #444; border-color: #666;">Register Free</a>
                <?php endif; ?>
            </div>

            <!-- 2. BASIC PLAN (Rs. 200) -->
            <div class="pricing-card-reloaded">
                <h2 class="card-title">Basic HD</h2>
                <p class="price-reloaded">Rs. 200 <span>/ Month</span></p>
                <p class="card-subtitle">Ad-free movie experience.</p>

                <ul class="features-list">
                    <li><i class="fas fa-check-circle"></i> Access Movies & TV Series</li>
                    <li><i class="fas fa-check-circle"></i> 720p HD Quality</li>
                    <li><i class="fas fa-check-circle"></i> Download Movies & Series (720p)</li>
                    <!-- Positive Feature -->
                    <li><i class="fas fa-check-circle" style="color: #00e676;"></i> <strong>No Ads</strong></li>
                </ul>
            </div>

            <!-- 3. PREMIUM PLAN (Rs. 400 - Best Value) -->
            <div class="pricing-card-reloaded premium">
                <div class="popular-badge">BEST VALUE</div>
                <h2 class="card-title">Premium FHD</h2>
                <p class="price-reloaded">Rs. 400 <span>/ Month</span></p>
                <p class="card-subtitle">Ultimate entertainment.</p>

                <ul class="features-list">
                    <!-- All Positive Features -->
                    <li><i class="fas fa-check-circle"></i> <strong>Access Movies & TV Series</strong></li>
                    <li><i class="fas fa-check-circle"></i> <strong>1080p FHD</strong> + 720p</li>
                    <li><i class="fas fa-check-circle"></i> Download (1080p/720p)</li>
                    <li><i class="fas fa-check-circle" style="color: #00e676;"></i> <strong>No Ads</strong></li>
                    <li><i class="fas fa-check-circle"></i> Watch on 2 devices</li>
                </ul>
            </div>

        </div>

        <div class="instructions-wrapper">
            <div class="instructions-reloaded">
                <h3>How to Upgrade</h3>
                <div class="steps-container">
                    <div class="step"><i class="fas fa-university"></i><span>Transfer Rs. 200 or Rs. 400 to the bank account below.</span></div>
                    <div class="step"><i class="fab fa-whatsapp"></i><span>Send the receipt to us via WhatsApp.</span></div>
                    <div class="step"><i class="fas fa-bolt"></i><span>We will activate your plan instantly!</span></div>
                </div>
            </div>

            <div class="bank-details-section">
                <h3>Bank Details</h3>
                <div class="detail-row"><i class="fas fa-university"></i><div><span>Bank Name</span><strong>Bank of Ceylon</strong></div></div>
                <div class="detail-row"><i class="fas fa-user"></i><div><span>Account Name</span><strong>R.T. Thenuwara</strong></div></div>
                <div class="detail-row"><i class="fas fa-hashtag"></i><div><span>Account Number</span><strong>8817207</strong></div></div>
            </div>
        </div>

        <?php
        $whatsapp_number = "0705613151";
        $message = "Hi, I made a payment for PlexZone [Plan Name]. Here is the receipt.";
        $whatsapp_url = "https://wa.me/" . $whatsapp_number . "?text=" . urlencode($message);
        ?>
        <a href="<?php echo $whatsapp_url; ?>" target="_blank" class="cta-button whatsapp-btn">
            <i class="fab fa-whatsapp"></i> Send Receipt via WhatsApp
        </a>
    </main>

    <script src="js/main.js"></script>
    <script>
        // Setup background grid if setupLoginPage function exists
        if (typeof setupLoginPage === 'function') {
            setupLoginPage();
        }
    </script>

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