<?php
session_start();
require "connection.php";

// User login වී නොමැති නම් login පිටුවට
if (!isset($_SESSION['user'])) {
    header("Location: login");
    exit();
}

$user = $_SESSION['user'];
$user_id = $user['id'];

// 1. Fetch Latest Active Subscription (වත්මන් පැකේජය)
// අපි 'ORDER BY end_date DESC' භාවිතා කරන්නේ අලුත්ම එක ගැනීමටයි.
$current_subs_query = "SELECT s.*, sp.name AS package_name 
                      FROM `subsciption` s
                      JOIN `subscription_package` sp ON s.subscription_package_id = sp.id
                      WHERE s.user_id = {$user_id} AND s.end_date >= CURDATE()
                      ORDER BY s.end_date DESC LIMIT 1";
$current_subs_rs = Database::search($current_subs_query);
$has_active_sub = ($current_subs_rs && $current_subs_rs->num_rows > 0);
$current_sub_data = $has_active_sub ? $current_subs_rs->fetch_assoc() : null;


// 2. Fetch All Subscription History (සියලුම පැකේජ ඉතිහාසය)
$sub_history_query = "SELECT s.*, sp.name AS package_name 
                      FROM `subsciption` s
                      JOIN `subscription_package` sp ON s.subscription_package_id = sp.id
                      WHERE s.user_id = {$user_id} 
                      ORDER BY s.start_date DESC";
$sub_history_rs = Database::search($sub_history_query);


// 3. Fetch Payment History (ගෙවීම් ඉතිහාසය)
$payment_history_rs = Database::search("SELECT * FROM `payment_history` WHERE `user_id` = {$user_id} ORDER BY `payment_date` DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - PlexZone</title>
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .receipt-thumbnail {
            width: 50px;
            height: 50px;
            object-fit: cover;
            cursor: pointer;
            border-radius: 4px;
            border: 1px solid #444;
            transition: transform 0.2s ease-in-out;
        }
        .receipt-thumbnail:hover { transform: scale(1.1); border-color: var(--color-neon-blue); }

        /* Image Preview Modal */
        .image-preview-modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            justify-content: center;
            align-items: center;
        }
        .image-preview-content {
            max-width: 80%;
            max-height: 80vh;
            border: 2px solid var(--color-neon-blue);
            border-radius: 8px;
            animation: zoom 0.3s;
        }
        .image-preview-close {
            position: absolute;
            top: 20px;
            right: 30px;
            color: #fff;
            font-size: 40px;
            cursor: pointer;
            transition: 0.3s;
        }
        .image-preview-close:hover { color: var(--color-neon-blue); }

        @keyframes zoom {
            from {transform: scale(0.1)} 
            to {transform: scale(1)}
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body style="overflow-x: hidden;">

    <?php include "header.php"; ?>

    <main class="profile-page" style="overflow-x: hidden;">
        <div class="page-container">
            <div class="profile-container">

                <aside class="profile-sidebar">
                    <div class="user-card">
                        <i class="fas fa-user-circle" style="font-size: 80px; color: var(--color-silver); margin-bottom: 15px;"></i>
                        <h2><?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></h2>
                        <p><?php echo htmlspecialchars($user['email']); ?></p>
                    </div>

                    <div class="form-section">
                        <h3>Change Password</h3>
                        <form id="change-password-form" onsubmit="changePassword(event)">
                            <div class="input-group">
                                <input type="password" id="current-password" name="current_password" placeholder="Current Password" required>
                            </div>
                            <div class="input-group">
                                <input type="password" id="new-password" name="new_password" placeholder="New Password" required>
                            </div>
                            <button type="submit" class="cta-button" style="width: 100%;">Update Password</button>
                        </form>
                    </div>
                </aside>

                <section class="profile-content">
                    <div class="content-box">
                        <h2>Subscription & Billing</h2>
                        
                        <div class="tabs">
                            <button class="tab-link active" onclick="openTab(event, 'status')">Status</button>
                            <button class="tab-link" onclick="openTab(event, 'sub-history')">Subscriptions</button>
                            <button class="tab-link" onclick="openTab(event, 'pay-history')">Payments</button>
                        </div>

                        <div id="status" class="tab-content active" style="display: block;">
                            <?php 
                            // 1. Plan Features Logic (පැකේජය අනුව ලැබෙන පහසුකම් තීරණය කිරීම)
                            $features_list = [];
                            
                            if ($has_active_sub) {
                                // --- Active Paid Plan ---
                                $pkg_id = $current_sub_data['subscription_package_id'];
                                
                                if ($pkg_id == 2) { // Premium FHD (ID: 2)
                                    $plan_color = "var(--color-neon-blue)";
                                    $features_list = [
                                        ['icon' => 'fas fa-check-circle', 'text' => 'Unlimited Movies & TV Series', 'color' => '#fff'],
                                        ['icon' => 'fas fa-video', 'text' => '1080p Full HD + 720p', 'color' => 'var(--color-neon-blue)'],
                                        ['icon' => 'fas fa-ban', 'text' => 'No Advertisements', 'color' => '#00e676'],
                                        ['icon' => 'fas fa-download', 'text' => 'Fast Downloads', 'color' => '#fff'],
                                        ['icon' => 'fas fa-mobile-alt', 'text' => 'Watch on 2 Devices', 'color' => '#fff']
                                    ];
                                } else { // Basic HD (ID: 1)
                                    $plan_color = "#fff"; 
                                    $features_list = [
                                        ['icon' => 'fas fa-check-circle', 'text' => 'Unlimited Movies Only', 'color' => '#fff'],
                                        ['icon' => 'fas fa-video', 'text' => '720p HD Quality', 'color' => '#fff'],
                                        ['icon' => 'fas fa-ban', 'text' => 'No Advertisements', 'color' => '#00e676'],
                                        ['icon' => 'fas fa-download', 'text' => 'Standard Downloads', 'color' => '#fff'],
                                        ['icon' => 'fas fa-times', 'text' => 'No TV Series Access', 'color' => '#777'] // සීමාව පෙන්වීම
                                    ];
                                }
                            ?>
                                <div class="status-card" style="border-left: 4px solid <?php echo $plan_color; ?>; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 8px;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                                        <div>
                                            <h3 style="color: <?php echo $plan_color; ?>; font-size: 1.8rem; margin-bottom: 5px;">
                                                <?php echo htmlspecialchars($current_sub_data['package_name']); ?>
                                            </h3>
                                            <p style="font-size: 1rem; margin-bottom: 20px; color: #aaa;">
                                                Expires on: <?php echo date("F j, Y", strtotime($current_sub_data['end_date'])); ?>
                                            </p>
                                        </div>
                                        <span style="background: #00e676; color: #000; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem;">Active</span>
                                    </div>

                                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-top: 10px;">
                                        <h4 style="margin-bottom: 15px; color: #ccc; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Your Plan Features:</h4>
                                        <ul style="list-style: none; padding: 0;">
                                        <?php foreach ($features_list as $feat) : ?>
                                            <li style="margin-bottom: 10px; font-size: 1rem; display: flex; align-items: center; gap: 10px; color: <?php echo $feat['color']; ?>;">
                                                <i class="<?php echo $feat['icon']; ?>" style="width: 20px; text-align: center;"></i> 
                                                <?php echo $feat['text']; ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
            
                                <div style="margin-top: 20px; text-align: right;">
                                    <?php if ($pkg_id == 1) : // If Basic, show upgrade button ?>
                                        <a href="pricing" class="cta-button" style="padding: 10px 20px; font-size: 0.9rem;">Upgrade to FHD</a>
                                    <?php else : ?>
                                        <a href="pricing" style="color: var(--color-neon-blue); text-decoration: none; font-size: 0.9rem;">Extend Plan <i class="fas fa-arrow-right"></i></a>
                                    <?php endif; ?>
                                </div>
                            </div>
        
                                    <?php } // End of if ($has_active_sub) ?>

                            <?php if (!$has_active_sub) : 
                                // --- Free Plan ---
                                // Free Plan Features Definition
                                $features_list = [
                                    ['icon' => 'fas fa-check', 'text' => 'Unlimited Movies', 'color' => '#ccc'],
                                    ['icon' => 'fas fa-video', 'text' => '720p HD Quality', 'color' => '#ccc'],
                                    ['icon' => 'fas fa-ad', 'text' => 'Ads are Enabled', 'color' => '#ef5350'], // Red for negative
                                    ['icon' => 'fas fa-lock', 'text' => 'TV Series Locked', 'color' => '#ef5350'],
                                    ['icon' => 'fas fa-lock', 'text' => '1080p Quality Locked', 'color' => '#ef5350']
                                ];
                            ?>
                                <div class="status-card" style="border-left: 4px solid #777; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 8px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h3 style="color: #ccc; font-size: 1.8rem; margin-bottom: 5px;">Free Plan</h3>
                                        <span style="background: #555; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem;">Active Forever</span>
                                    </div>
                                    <p style="font-size: 1rem; margin-bottom: 20px; color: #777;">Limited Access</p>
                                    
                                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-top: 10px;">
                                        <h4 style="margin-bottom: 15px; color: #ccc; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Current Features:</h4>
                                        <ul style="list-style: none; padding: 0;">
                                            <?php foreach ($features_list as $feat) : ?>
                                                <li style="margin-bottom: 10px; font-size: 1rem; display: flex; align-items: center; gap: 10px; color: <?php echo $feat['color']; ?>;">
                                                    <i class="<?php echo $feat['icon']; ?>" style="width: 20px; text-align: center;"></i> 
                                                    <?php echo $feat['text']; ?>
                                                </li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </div>
                                    
                                    <a href="pricing" class="cta-button glow-button" style="display:block; text-align:center; margin-top: 25px;">
                                        <i class="fas fa-crown"></i> Upgrade to Remove Ads & Limits
                                    </a>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- TAB 2: SUBSCRIPTION HISTORY -->
                        <div id="sub-history" class="tab-content" style="display: none;">
                            <h3>Your Plan History</h3>
                            <div class="history-table">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead style="background: #222;">
                                        <tr>
                                            <th>Plan Name</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php 
                                        if ($sub_history_rs && $sub_history_rs->num_rows > 0) :
                                            while ($sub = $sub_history_rs->fetch_assoc()) : 
                                                $is_active = (strtotime($sub['end_date']) >= strtotime(date('Y-m-d')));
                                        ?>
                                            <tr style="border-bottom: 1px solid #333;">
                                                <!-- ⭐ data-label එකතු කළා ⭐ -->
                                                <td data-label="Plan Name"><?php echo htmlspecialchars($sub['package_name']); ?></td>
                                                <td data-label="Start Date" style="color: #aaa;"><?php echo date("Y-m-d", strtotime($sub['start_date'])); ?></td>
                                                <td data-label="End Date" style="color: #aaa;"><?php echo date("Y-m-d", strtotime($sub['end_date'])); ?></td>
                                                <td data-label="Status">
                                                    <?php if($is_active): ?>
                                                        <span style="color: #00e676; font-weight:bold;">Active</span>
                                                    <?php else: ?>
                                                        <span style="color: #ef5350;">Expired</span>
                                                    <?php endif; ?>
                                                </td>
                                            </tr>
                                        <?php 
                                            endwhile; 
                                        else:
                                        ?>
                                            <tr><td colspan="4" style="text-align: center; padding: 20px;">No subscription history found.</td></tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- TAB 3: PAYMENT HISTORY -->
                        <div id="pay-history" class="tab-content" style="display: none;">
                            <h3>Payment History</h3>
                            <div class="history-table">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead style="background: #222;">
                                        <tr>
                                            <th>Date</th>
                                            <th>Amount (LKR)</th>
                                            <th>Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php 
                                        if ($payment_history_rs && $payment_history_rs->num_rows > 0) :
                                            while ($pay = $payment_history_rs->fetch_assoc()) : 
                                                $receipt_image_path_pattern = "uploads/users/" . $user_id . "/payments/" . $pay['id'] . ".*";
                                                $receipt_files = glob($receipt_image_path_pattern);
                                                $receipt_url = (!empty($receipt_files)) ? $receipt_files[0] : null;
                                        ?>
                                            <tr style="border-bottom: 1px solid #333;">
                                                <!-- ⭐ data-label එකතු කළා ⭐ -->
                                                <td data-label="Date"><?php echo date("Y-m-d", strtotime($pay['payment_date'])); ?></td>
                                                <td data-label="Amount" style="font-weight: bold;">Rs. <?php echo htmlspecialchars($pay['amount']); ?></td>
                                                <td data-label="Receipt">
                                                    <?php if ($receipt_url) : ?>
                                                        <img src="<?php echo htmlspecialchars($receipt_url); ?>" 
                                                             alt="Receipt" 
                                                             class="receipt-thumbnail"
                                                             onclick="openReceiptPreview('<?php echo htmlspecialchars($receipt_url); ?>')">
                                                    <?php else : ?>
                                                        <span style="color: #777; font-size: 0.9rem;">No Image</span>
                                                    <?php endif; ?>
                                                </td>
                                            </tr>
                                        <?php 
                                            endwhile;
                                        else:
                                        ?>
                                            <tr><td colspan="3" style="text-align: center; padding: 20px;">No payment history found.</td></tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    </main>

    <?php include "footer.php"; ?>
    
    <div id="imagePreviewModal" class="image-preview-modal" onclick="closeReceiptPreview()">
        <span class="image-preview-close">&times;</span>
        <img class="image-preview-content" id="imgPreview">
    </div>

    <div id="custom-modal-overlay">
        <div id="custom-modal-box">
            <h2 id="modal-title"></h2>
            <p id="modal-message"></p>
            <button id="modal-close-btn">OK</button>
        </div>
    </div>

    <script src="js/main.js"></script>
    <script src="js/index.js"></script>
    <script>
        // --- TAB SWITCHING SCRIPT ---
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            
            // Hide all tab contents
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            
            // Deactivate all tab links
            tablinks = document.getElementsByClassName("tab-link");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            
            // Show current tab and activate button
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }

        // --- RECEIPT PREVIEW SCRIPT ---
        function openReceiptPreview(src) {
            var modal = document.getElementById("imagePreviewModal");
            var modalImg = document.getElementById("imgPreview");
            modal.style.display = "flex";
            modalImg.src = src;
        }

        function closeReceiptPreview() {
            document.getElementById("imagePreviewModal").style.display = "none";
        }

        // // --- DISABLE RIGHT CLICK ---
        // document.addEventListener('contextmenu', e => e.preventDefault());
        // document.addEventListener('keydown', e => {
        //     if (e.key === 'F12') e.preventDefault();
        //     if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) e.preventDefault();
        //     if (e.ctrlKey && e.key.toUpperCase() === 'U') e.preventDefault();
        // });
    </script>
</body>
</html>