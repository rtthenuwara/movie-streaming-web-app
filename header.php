<?php
// Session එක පටන් ගැනීම (දැනටමත් නැත්නම්)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once "connection.php";

// ==================================================================
// 🛑 1. APP MAINTENANCE MODE (TOP PRIORITY)
// ==================================================================
// App එකෙන් එන අයව User Agent එක හරහා හඳුනාගැනීම
$is_app_browser = (isset($_SERVER['HTTP_USER_AGENT']) && strpos($_SERVER['HTTP_USER_AGENT'], 'PlexZoneApp') !== false);

// App එකෙන් ආවා නම් විතරක් Maintenance Page එක පෙන්වා නවතින්න
if ($is_app_browser) {
?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance - PlexZone</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            body {
                background-color: #000;
                color: #fff;
                font-family: 'Poppins', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
                padding: 20px;
            }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #00c8ff; margin-bottom: 10px; }
            p { color: #aaa; line-height: 1.6; max-width: 400px; margin-bottom: 30px; }
            .btn {
                padding: 12px 30px; background: #00c853; color: #fff;
                text-decoration: none; border-radius: 50px; font-weight: bold;
                box-shadow: 0 4px 15px rgba(0, 200, 83, 0.4);
            }
        </style>
    </head>
    <body>
        <div class="icon">🛠️</div>
        <h1>App Under Maintenance</h1>
        <p>We are currently updating our mobile application to fix technical issues.</p>
        <p style="font-size: 0.9rem;">You can still watch movies via our website <b>plexzone.lk</b> using Google Chrome.</p>
        
        <a href="https://plexzone.lk" class="btn">Go to Website</a>
    </body>
    </html>
<?php
    exit(); // 🛑 මෙතනින් නවතිනවා. App එකට මින් පහල තියෙන කිසිම Code එකක් (JS/CSS) යවන්නේ නෑ.
}
// ==================================================================


// 2. WEB USER LOGIC (NORMAL SITE LOAD)
// App එකෙන් එන අය උඩින්ම Filter වුන නිසා, මෙතනින් පහළට එන්නේ Web Users ලා විතරයි.

$isLoggedIn = false;
$user = null;
$user_id = 0;
$user_plan = 'guest';

if (isset($_SESSION['user'])) {
    $isLoggedIn = true;
    $user = $_SESSION['user'];
    $user_id = $user['id'];
}

// --- GLOBAL ACCESS CONTROL & AD LOGIC ---
$access_level = 'guest';
$show_ads = true;

if ($isLoggedIn) {
    $active_subs_query = "SELECT sp.id AS package_id 
                          FROM `subsciption` s 
                          JOIN `subscription_package` sp ON s.subscription_package_id = sp.id 
                          WHERE s.user_id = {$user_id} AND s.end_date >= CURDATE()";
    $active_subs_rs = Database::search($active_subs_query);

    $has_premium = false;
    $has_basic = false;

    if ($active_subs_rs && $active_subs_rs->num_rows > 0) {
        while ($sub = $active_subs_rs->fetch_assoc()) {
            if ($sub['package_id'] == 2) {
                $has_premium = true;
                break;
            }
            if ($sub['package_id'] == 1) {
                $has_basic = true;
            }
        }
    }

    if ($has_premium) {
        $user_plan = 'premium';
        $access_level = 'premium';
        $show_ads = false;
    } elseif ($has_basic) {
        $user_plan = 'basic';
        $access_level = 'basic';
        $show_ads = false;
    } else {
        $user_plan = 'free';
        $access_level = 'free';
        $show_ads = true;
    }
} else {
    $user_plan = 'guest';
    $access_level = 'guest';
    $show_ads = true;
}

// ⭐ DOWNLOAD COUNT LOGIC
$rs_dl = Database::search("SELECT count_value FROM app_analytics WHERE metric_name = 'installs'");
$real_count = 0;
if ($rs_dl->num_rows > 0) {
    $data_dl = $rs_dl->fetch_assoc();
    $real_count = (int)$data_dl['count_value'];
}

$start_boost = 0;
$total_downloads = $real_count + $start_boost;

function formatDownloads($num)
{
    if ($num >= 1000000) return round($num / 1000000, 1) . 'M+';
    if ($num >= 1000) return round($num / 1000, 1) . 'K+';
    return $num . '+';
}

$display_count = formatDownloads($total_downloads);
?>

<?php if (!$show_ads) { ?>
    <div id="app-user-is-premium" style="display:none;">true</div>
<?php } ?>

<?php if ($show_ads) { ?>
    <script>
        (function() {
            // Web Users Only - Ad Script
            const AD_URL = "system_log.php";
            const AD_INTERVAL_MINUTES = 0.5; 
            const STORAGE_KEY = "plex_last_ad_time";

            document.addEventListener('mousedown', function(e) {
                if (window.ReactNativeWebView) return; // Extra Safety for App

                if (e.target.closest('a, button, .movie-card, .play-btn, img, div')) {
                    const lastPop = localStorage.getItem(STORAGE_KEY);
                    const now = Date.now();
                    const intervalMs = AD_INTERVAL_MINUTES * 60 * 1000;

                    if (!lastPop || (now - lastPop > intervalMs)) {
                        localStorage.setItem(STORAGE_KEY, now);
                        const w = screen.width;
                        const h = screen.height;
                        const win = window.open(AD_URL, '_blank', `width=${w},height=${h},menubar=no,toolbar=no,location=no,status=no`);
                        if (win) {
                            try { win.blur(); window.focus(); } catch (e) {}
                        }
                    }
                }
            }, { capture: true });
        })();
    </script>
<?php } ?>

<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
<script>
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.BackButton.show();

        tg.BackButton.onClick(function() {
            if (window.history.length > 1 && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
                window.history.back();
            } else {
                tg.close();
            }
        });

        if (window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            tg.BackButton.hide();
        }
    }
</script>

<script>
    window.userLoggedIn = <?php echo $isLoggedIn ? 'true' : 'false'; ?>;
    window.showAds = <?php echo $show_ads ? 'true' : 'false'; ?>;
    window.userPlan = "<?php echo $user_plan; ?>";
</script>

<style>
    /* App Download Banner Design */
    .app-promo-banner {
        background: linear-gradient(90deg, #1a1a1a, #000);
        border-bottom: 1px solid var(--color-neon-blue);
        color: white;
        text-align: center;
        padding: 10px 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        position: relative;
        z-index: 99999;
    }

    .app-promo-text {
        font-size: 0.95rem;
        color: #ddd;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .download-stat-badge {
        background: rgba(0, 200, 83, 0.2);
        color: #00c853;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        border: 1px solid rgba(0, 200, 83, 0.3);
    }

    .app-download-btn {
        background: var(--color-neon-blue);
        color: black;
        padding: 6px 15px;
        border-radius: 20px;
        text-decoration: none;
        font-weight: bold;
        font-size: 0.85rem;
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .app-download-btn:hover {
        transform: scale(1.05);
        color: black;
    }

    /* SUPPORT BUTTON & MODAL STYLES */
    .support-btn {
        background: rgba(255, 20, 147, 0.15);
        color: #ff1493;
        border: 1px solid #ff1493;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-right: 15px;
        text-decoration: none;
    }

    .support-btn:hover {
        background: #ff1493;
        color: white;
        box-shadow: 0 0 15px rgba(255, 20, 147, 0.6);
        transform: scale(1.05);
    }

    /* Support Modal Specifics */
    .support-options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-top: 20px;
    }

    .support-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #333;
        border-radius: 10px;
        padding: 15px;
        text-align: center;
        cursor: pointer;
        transition: 0.3s;
        position: relative;
        overflow: hidden;
    }

    .support-card:hover {
        border-color: var(--color-neon-blue);
        background: rgba(0, 200, 255, 0.05);
        transform: translateY(-2px);
    }

    .support-icon {
        font-size: 2rem;
        margin-bottom: 10px;
        color: var(--color-neon-blue);
    }

    .bank-details-box {
        display: none;
        background: #111;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
        text-align: left;
        border: 1px dashed #555;
        font-size: 0.9rem;
        color: #ccc;
    }

    .bank-details-box p {
        margin: 5px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .copy-btn {
        background: #333;
        border: 1px solid #555;
        color: #fff;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 0.75rem;
        cursor: pointer;
        margin-left: 10px;
        transition: 0.2s;
    }

    .copy-btn:hover {
        background: #444;
        color: var(--color-neon-blue);
        border-color: var(--color-neon-blue);
    }

    /* ⭐ TOAST NOTIFICATION STYLES ⭐ */
    .toast-notification {
        visibility: hidden;
        min-width: 250px;
        background-color: #333;
        color: #fff;
        text-align: center;
        border-radius: 50px;
        padding: 12px;
        position: fixed;
        z-index: 10001;
        left: 50%;
        bottom: 30px;
        transform: translateX(-50%);
        font-size: 0.9rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        border: 1px solid #444;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        opacity: 0;
        transition: opacity 0.3s, bottom 0.3s;
    }

    .toast-notification.show {
        visibility: visible;
        opacity: 1;
        bottom: 50px;
    }

    .toast-icon {
        color: #00c853;
        font-size: 1.1rem;
    }

    /* Custom Close Button for Modal */
    .custom-close-icon {
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 1.2rem;
        color: #777;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.1);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.3s;
    }

    .custom-close-icon:hover {
        background: #cc0000;
        color: white;
        transform: rotate(90deg);
    }

    /* MOBILE HEADER STYLES UPDATE */
    .mobile-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        gap: 10px;
        /* Logo එක සහ Button එක අතර ඉඩ */
    }

    /* Support Button (Mobile Only) */
    .mobile-support-btn {
        display: none;
        /* Desktop වල පේන්නේ නෑ */
        margin-left: 18%;
        gap: 6px;
        background: rgba(255, 20, 147, 0.15);
        /* ලා රෝස පසුබිම */
        border: 1px solid #ff1493;
        padding: 6px 12px;
        border-radius: 20px;
        color: #ff1493;
        font-weight: bold;
        font-size: 0.8rem;
        cursor: pointer;
        text-decoration: none;
        animation: heartPulse 2s infinite;
        /* ගැහෙන Animation එක */
    }

    .mobile-support-btn i {
        font-size: 1rem;
    }

    @keyframes heartPulse {
        0% {
            box-shadow: 0 0 0 0 rgba(255, 20, 147, 0.4);
        }

        70% {
            box-shadow: 0 0 0 10px rgba(255, 20, 147, 0);
        }

        100% {
            box-shadow: 0 0 0 0 rgba(255, 20, 147, 0);
        }
    }

    /* Mobile Responsive Logic */
    @media (max-width: 768px) {
        .mobile-support-btn {
            display: flex;
            /* Mobile වල පෙන්වනවා */
        }

        .logo {
            flex-grow: 1;
            text-align: center;
            /* Button එක ආවම Logo එක මැදට ගන්න පොඩි ගානක් දකුණට යවනවා */
            margin-right: -40px;
            padding-left: 40px;
        }
    }

    /* Mobile Responsive Logic */
    @media (max-width: 768px) {
        .mobile-support-icon {
            display: block;
            /* Mobile වල පෙන්වනවා */
        }

        /* Logo එක මැදට ගන්න පොඩි fix එකක් */
        .logo {
            flex-grow: 1;
            text-align: center;
            margin-left: -20px;
            /* Icon එක නිසා මැද පැනපු එක හදන්න */
        }
    }

    @media (max-width: 600px) {
        .support-options-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Mobile Responsive for Banner */
    @media (max-width: 768px) {
        .app-promo-banner {
            flex-direction: column;
            gap: 8px;
            padding: 12px;
        }

        .app-promo-text {
            font-size: 0.85rem;
            flex-direction: column;
            gap: 5px;
        }
    }

    body.in-app-view .app-only-visible {
        display: none !important;
    }
</style>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        if (window.ReactNativeWebView) {
            document.body.classList.add('in-app-view');
        }
    });
</script>

<?php if (!$is_app_browser): ?>
    <div class="app-promo-banner app-only-visible">
        <div class="app-promo-text">
            <span><i class="fab fa-android" style="color: #00c853;"></i> Experience the best streaming!</span>

            <span class="download-stat-badge">
                <i class="fas fa-download"></i> <?php echo $display_count; ?> Downloads
            </span>
        </div>
        <a href="app/Plexzone.lk.apk" class="app-download-btn">
            <i class="fas fa-download"></i> Install App
        </a>
    </div>
<?php endif; ?>

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<header class="main-header">
    <nav class="main-nav">

        <div class="mobile-header-row">
            <button class="menu-toggle" id="mobile-menu-button">
                <i class="fas fa-bars"></i>
            </button>

            <div onclick="window.location='/'" class="logo" style="cursor: pointer;">PLEXZONE</div>

            <!-- <div class="mobile-support-btn" onclick="openSupportModal()">
                <i class="fas fa-heart"></i>
                <span>Support</span>
            </div> -->
        </div>

        <div class="mobile-search-row">
            <div class="search-bar">
                <input type="text" id="main-search-input" placeholder="Search movies..." autocomplete="off">
                <div id="search-results-container"></div>
            </div>
        </div>

        <div class="desktop-nav">
            <!-- <div class="support-btn" onclick="openSupportModal()">
                <i class="fas fa-heart"></i> Support Us
            </div> -->

            <?php if (isset($user)) { ?>
                <div class="plan-badge" style="margin-right: 15px; padding: 5px 10px; border-radius: 5px; font-size: 0.8rem; background: <?php echo ($user_plan == 'free') ? '#555' : 'var(--color-neon-blue)'; ?>; color: <?php echo ($user_plan == 'free') ? '#fff' : '#000'; ?>; font-weight: bold;">
                    <?php echo strtoupper($user_plan . ' PLAN'); ?>
                </div>
            <?php } ?>

            <div class="profile-icon" id="desktop-profile-icon" <?php if (!isset($user)) { ?> onclick="window.location='login'" <?php } ?>>
                <i class="fas fa-user-circle"></i>
                <span><?php echo isset($user) ? htmlspecialchars($user['first_name']) : 'Sign In'; ?></span>
            </div>

            <div class="profile-menu" id="profile-menu">
                <?php if (isset($user)) { ?>
                    <a href="profile"><i class="fas fa-user-edit"></i> My Profile</a>
                    <a href="favorites"><i class="fas fa-star"></i> My Favorites</a>
                    <?php if ($user_plan != 'free') { ?>
                        <a href="#" onclick="openRequestModal(true)"><i class="fas fa-film"></i> Requests</a>
                    <?php } else { ?>
                        <a href="#" onclick="showModal('Upgrade Required', 'Requests are available for Basic & Premium users only.', false)"><i class="fas fa-lock"></i> Requests</a>
                    <?php } ?>
                    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
                <?php } ?>
            </div>
        </div>

        <div class="mobile-profile-dropdown" id="mobile-profile-dropdown">
            <?php if (isset($user)) { ?>
                <div class="profile-header">
                    <i class="fas fa-user-circle"></i>
                    <span><?php echo htmlspecialchars($user['first_name']); ?> (<?php echo ucfirst($user_plan); ?>)</span>
                </div>
                <div class="profile-links">
                    <a href="profile"><i class="fas fa-user-edit"></i> My Profile</a>
                    <a href="favorites"><i class="fas fa-star"></i> My Favorites</a>
                    <?php if ($user_plan != 'free') { ?>
                        <a href="#" onclick="openRequestModal(true)"><i class="fas fa-film"></i> Requests</a>
                    <?php } else { ?>
                        <a href="#" onclick="showModal('Upgrade Required', 'Requests are available for Basic & Premium users only.', false)"><i class="fas fa-lock"></i> Requests</a>
                    <?php } ?>
                    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            <?php } else { ?>
                <div class="profile-header" onclick="window.location='login'" style="cursor: pointer;">
                    <i class="fas fa-user-circle"></i>
                    <span>Sign In</span>
                </div>
            <?php } ?>
        </div>
    </nav>

    <div id="support-modal-overlay" style="display: none; position: fixed; top: 70px; left: 0; width: 100%; height: calc(100% - 70px); background: rgba(0,0,0,0.85); z-index: 200000; justify-content: center; align-items: flex-start; padding-top: 50px;">
        <div style="background: #1a1a1a; width: 90%; max-width: 500px; border-radius: 15px; padding: 30px; border: 1px solid #333; position: relative; box-shadow: 0 0 30px rgba(0,0,0,0.9);">

            <div class="custom-close-icon" onclick="closeSupportModal()">
                <i class="fas fa-times"></i>
            </div>

            <h2 style="color: #fff; text-align: center; margin-bottom: 10px;"><i class="fas fa-heart" style="color: #ff1493;"></i> Support Plexzone</h2>
            <p style="color: #aaa; text-align: center; font-size: 0.9rem; margin-bottom: 20px;">
                We have significant monthly costs to keep the servers running. Your small donation helps us stay alive! ❤️
            </p>

            <div class="support-options-grid">
                <div class="support-card" onclick="openBMCPopup()">
                    <div class="support-icon"><i class="fas fa-coffee"></i></div>
                    <h4 style="color: #fff; margin-bottom: 5px;">Buy Me a Coffee</h4>
                    <p style="color: #777; font-size: 0.8rem;">Pay via Card</p>
                </div>

                <div class="support-card" onclick="toggleBankDetails()">
                    <div class="support-icon"><i class="fas fa-university"></i></div>
                    <h4 style="color: #fff; margin-bottom: 5px;">Bank Transfer</h4>
                </div>
            </div>

            <div id="bank-details-box" class="bank-details-box">
                <h4 style="color: var(--color-neon-blue); margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">Bank Details</h4>

                <p>
                    <span><strong>Bank:</strong> Bank of Ceylon</span>
                </p>
                <p>
                    <span><strong>A/C No:</strong> 8817207</span>
                    <button class="copy-btn" onclick="copyToClipboard('8817207')"><i class="fas fa-copy"></i> Copy</button>
                </p>
                <p><span><strong>Name:</strong> R.T. Thenuwara</span></p>
            </div>

        </div>
    </div>

    <div id="toast-box" class="toast-notification">
        <i class="fas fa-check-circle toast-icon"></i>
        <span id="toast-message">Copied to clipboard!</span>
    </div>

    <script>
        function openSupportModal() {
            document.getElementById('support-modal-overlay').style.display = 'flex';
        }

        function closeSupportModal() {
            document.getElementById('support-modal-overlay').style.display = 'none';
            document.getElementById('bank-details-box').style.display = 'none'; // Reset view
        }

        function toggleBankDetails() {
            const box = document.getElementById('bank-details-box');
            if (box.style.display === 'block') {
                box.style.display = 'none';
            } else {
                box.style.display = 'block';
            }
        }

        // ⭐ NEW: Open BMC in a Popup Window (Payment Gateway Feel) ⭐
        function openBMCPopup() {
            // Screen center එක ගන්න
            const width = 500;
            const height = 700;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;

            // Popup window එකක් විදියට open කරනවා
            window.open(
                'https://www.buymeacoffee.com/plexzone.lk',
                'BMC_Window',
                `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
            );
        }

        // ⭐ NEW: Copy Function with Toast ⭐
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast("Account number copied!");
            });
        }

        // ⭐ NEW: Toast Function ⭐
        function showToast(message) {
            const toast = document.getElementById("toast-box");
            document.getElementById("toast-message").innerText = message;

            toast.className = "toast-notification show";

            setTimeout(function() {
                toast.className = toast.className.replace("show", "");
            }, 3000); // 3 seconds පෙනී සිටී
        }

        // Close when clicking outside
        document.getElementById('support-modal-overlay').addEventListener('click', function(e) {
            if (e.target === this) closeSupportModal();
        });
    </script>
</header>

<div id="request-modal-overlay">
    <div id="request-modal-box">
        <h2 id="request-modal-title">Request a Movie</h2>
        <p id="request-modal-message">Found something missing?</p>
        <form id="request-form" onsubmit="submitRequest(event)">
            <div class="input-group">
                <input type="text" id="request-name" name="name" required>
                <label for="request-name">Movie Name</label>
            </div>
            <button type="submit" id="request-submit-btn" class="cta-button">Submit Request</button>
            <button type="button" id="request-close-btn" class="cta-button" onclick="closeRequestModal()" style="background: #555; border-color: #777; margin-top: 10px;">Cancel</button>
        </form>
    </div>
</div>

<div id="ad-timer-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; align-items:center; justify-content:center;">
    <div style="background:#1a1a1a; padding:30px; border-radius:15px; border:1px solid #333; text-align:center; max-width:400px; width:90%; box-shadow:0 0 20px rgba(0,200,255,0.2);">

        <div id="ad-modal-icon" style="font-size:50px; margin-bottom:15px;">⏳</div>

        <h2 id="ad-modal-title" style="color:#fff; margin-bottom:10px; font-family:sans-serif;">Verifying Ad...</h2>

        <p id="ad-modal-message" style="color:#ccc; font-size:16px; line-height:1.5; margin-bottom:20px;">
            Please wait on the ad page for <br>
            <span id="ad-timer-count" style="color:#00c8ff; font-weight:bold; font-size:24px;">8</span> seconds.
        </p>

        <div style="width:100%; height:6px; background:#333; border-radius:3px; overflow:hidden; margin-bottom:20px;">
            <div id="ad-progress-bar" style="width:0%; height:100%; background:#00c8ff; transition:width 1s linear;"></div>
        </div>

        <button id="ad-modal-btn" onclick="closeAdTimerModal()" style="display:none; padding:10px 25px; background:#444; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">
            Close
        </button>
    </div>
</div>