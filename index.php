<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require "connection.php"; // Database connection එක අවශ්‍යයි
$show_ads = true;
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlexZone - Home</title>
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/index.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    <!-- AD SCRIPT (Only for Free/Guest) -->
    <?php if ($show_ads): ?>

        <script src="https://pl28174315.effectivegatecpm.com/15/74/8c/15748c6204cc5042ec3d62b696b95e89.js"></script>

    <?php endif; ?>
</head>

<body>

    <?php include "header.php"; ?>

    <div class="news-ticker-container">
        <div class="ticker-label">
            <i class="fas fa-bolt"></i>&nbsp; <span>LATEST</span>
        </div>
        
        <div class="ticker-text-wrap">
            <div class="ticker-move">
                <?php
                // 1. අලුත්ම Movies 5ක් ගන්න
                $ticker_movies = Database::search("SELECT title, slug, release_year FROM movies WHERE movie_status_id != 3 ORDER BY id DESC LIMIT 5");
                
                // 2. ⭐ FIXED: අලුත්ම Episodes 5ක් ගන්න (Status Check එකත් එක්ක) ⭐
                $ticker_eps = Database::search("SELECT e.name, t.title AS series_title, t.slug AS series_slug 
                                                FROM episodes e 
                                                INNER JOIN tv_series t ON e.tv_series_id = t.id 
                                                WHERE t.movie_status_id != 3 
                                                ORDER BY e.id DESC LIMIT 5");

                // Movies පෙන්වීම (Clean Title)
                while ($tm = $ticker_movies->fetch_assoc()) {
                    $clean_title = trim(str_replace('(Not Original)', '', $tm['title'])); // ⭐ නම සුද්ද කිරීම
                    $year = $tm['release_year'];
                    echo '<div class="ticker-item">';
                    echo '<span class="ticker-tag tag-movie">MOVIE</span>';
                    echo '<a href="movie/' . $tm['slug'] . '">New Arrival: <b>' . $clean_title . ' (' . $year . ')</b></a>';
                    echo '</div>';
                    echo '<i class="fas fa-circle" style="font-size: 5px; color: #555;"></i>'; 
                }

                // Episodes පෙන්වීම
                // while ($te = $ticker_eps->fetch_assoc()) {
                //     echo '<div class="ticker-item">';
                //     echo '<span class="ticker-tag tag-episode">EPISODE</span>';
                //     // Series Name - Episode Name විදිහට පෙන්වන්න
                //     echo '<a href="series/' . $te['series_slug'] . '">Just Added: <b>' . $te['series_title'] . ' - ' . $te['name'] . '</b></a>';
                //     echo '</div>';
                //     echo '<i class="fas fa-circle" style="font-size: 5px; color: #555;"></i>'; 
                // }
                ?>
                
                <div class="ticker-item" style="color: var(--color-neon-blue);">
                    Welcome to PlexZone! Watch & Download Unlimited Movies.
                </div>
            </div>
        </div>
    </div>
    

    <div id="adblock-warning">
        <div class="adblock-message-box">
            <div class="adblock-icon">⚠️</div>
            <h2>Adblocker Detected!</h2>
            <p>Our website relies on ads to keep running.</p>
            <p>Please disable your <strong>AdBlocker</strong> or <strong>Browser Shield</strong> to watch movies.</p>
            <button onclick="window.location.reload(true);" class="refresh-btn">I have disabled it. Refresh Page</button>
        </div>
    </div>

    <main>

        <?php if (isset($show_ads) && $show_ads): ?>
            <div class="advertise-here-wrapper">
                <div class="advertise-inner">
                    <div class="ad-text-content">
                        <div class="ad-icon-box">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div class="ad-details">
                            <span class="ad-title">Advertise on PlexZone</span>
                            <span class="ad-subtitle">Do you want to add your advertisement here?</span>
                        </div>
                    </div>
                    <!-- Contact Link (ඔබේ WhatsApp හෝ Contact page එකට link කරන්න) -->
                    <a href="https://wa.me/94705613151" target="_blank" class="ad-contact-btn">
                        Contact Us <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>

            <style>
                /* Wrapper to center and constrain width */
                .advertise-here-wrapper {
                    width: 100%;
                    max-width: 1000px;
                    margin: 30px auto;
                    padding: 0 15px;
                    box-sizing: border-box;
                }

                /* Main Banner Card */
                .advertise-inner {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
                    border: 2px dashed #444;
                    /* Dashed border for 'Slot' feel */
                    border-radius: 12px;
                    padding: 20px 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                /* Hover Effect - Neon Glow */
                .advertise-inner:hover {
                    border-color: var(--color-neon-blue, #00c8ff);
                    background: rgba(0, 200, 255, 0.03);
                    box-shadow: 0 0 20px rgba(0, 200, 255, 0.1);
                }

                /* Left Side: Icon + Text */
                .ad-text-content {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .ad-icon-box {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: #777;
                    transition: color 0.3s;
                }

                .advertise-inner:hover .ad-icon-box {
                    color: var(--color-neon-blue, #00c8ff);
                    background: rgba(0, 200, 255, 0.1);
                }

                .ad-details {
                    display: flex;
                    flex-direction: column;
                }

                .ad-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 4px;
                }

                .ad-subtitle {
                    font-size: 0.9rem;
                    color: #aaa;
                }

                /* Right Side: Button */
                .ad-contact-btn {
                    background-color: var(--color-neon-blue, #00c8ff);
                    color: #000;
                    padding: 10px 25px;
                    border-radius: 30px;
                    font-weight: 600;
                    text-decoration: none;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    white-space: nowrap;
                }

                .ad-contact-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 200, 255, 0.3);
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .advertise-inner {
                        flex-direction: column;
                        text-align: center;
                        gap: 20px;
                        padding: 25px;
                    }

                    .ad-text-content {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .ad-contact-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
        <?php endif; ?>
        <section class="hero-section">
            <div class="hero-slideshow-container">
                <div class="hero-slide active" style="background-image: url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2070');"></div>
                <div class="hero-slide" style="background-image: url('https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&q=80&w=1935');"></div>
            </div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1>Unlimited movies, TV shows, and more</h1>
                <p>Watch anywhere. Cancel anytime.</p>
                <?php if ($access_level == 'guest'): ?>
                    <button class="cta-button glow-button" onclick="window.location.href='login'">Get Started</button>
                <?php elseif ($access_level == 'free'): ?>
                    <button class="cta-button glow-button" onclick="window.location.href='pricing'">Go Premium</button>
                <?php else: ?>
                    <button class="cta-button glow-button" onclick="window.location.href='all_movies'">Browse Content</button>
                <?php endif; ?>
            </div>
        </section>

        <!-- ⭐ 728x90 ADVERTISEMENT (Between Hero & Trending) ⭐ -->
        <?php if (isset($show_ads) && $show_ads): ?>
            <!-- Class 'responsive-ad-wrapper' එකතු කරන ලදී -->
            <div class="responsive-ad-wrapper">
                <script type="text/javascript">
                    atOptions = {
                        'key': 'de151e0362629b9af2eb5d9e710a93fc',
                        'format': 'iframe',
                        'height': 90,
                        'width': 728,
                        'params': {}
                    };
                </script>
                <script type="text/javascript" src="//www.highperformanceformat.com/de151e0362629b9af2eb5d9e710a93fc/invoke.js"></script>
            </div>
        <?php endif; ?>

        <section class="movie-section trending-section" id="trending-section">
            <h2>Trending Now</h2>
            <div class="carousel-container">
                <button class="nav-button prev-btn trending-prev"><i class="fas fa-chevron-left"></i></button>
                <div class="movie-carousel trending-carousel">
                </div>
                <button class="nav-button next-btn trending-next"><i class="fas fa-chevron-right"></i></button>
            </div>
        </section>

        <section class="movie-section latest-section">
            <h2>Latest Movies</h2>
            <div class="movie-grid latest-grid">
            </div>
            <div class="show-all-container">
                <button class="show-all-btn">Show All Movies</button>
            </div>
        </section>

        <section class="movie-section collections-section">
            <h2>Film Collections</h2>
            <div class="movie-grid collections-grid">
            </div>
            <div class="show-all-container">
                <button class="show-all-btn" onclick="window.location.href='collections'">Show All Collections</button>
            </div>
        </section>

        <section class="movie-section latest-section">
            <h2>Latest TV Series</h2>
            <div class="movie-grid latest-series-grid">
            </div>
            <div class="show-all-container">
                <button class="show-all-btn" id="show-all-tv-btn">Show All TV Series</button>
            </div>
        </section>

    </main>

    <?php include 'footer.php'; ?>

    <div id="custom-modal-overlay">
        <div id="custom-modal-box">
            <h2 id="modal-title"></h2>
            <p id="modal-message"></p>
            <button id="modal-close-btn">OK</button>
        </div>
    </div>


    <?php if ($show_ads): ?>

        <script src="ads.js"></script>

        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const modal = document.getElementById("adblock-warning");
                const body = document.body;

                // Function to show the warning
                function showAdBlockWarning() {
                    if (body.classList.contains("adblock-active")) return; // Already showing

                    console.log("AdBlock Detected!");
                    modal.style.display = "flex";
                    body.classList.add("adblock-active");
                }

                // --- Method 1: Remote Script Check (Best for uBlock Origin) ---
                // අපි Google Ads script එකක් ඉල්ලනවා. AdBlocker එක මේක අනිවාර්යයෙන්ම කපනවා.
                let remoteScript = document.createElement('script');
                remoteScript.src = "//pl28174265.effectivegatecpm.com/7be838007ef5c5532ab9702e1b847354/invoke.js";
                remoteScript.async = true;

                // Block වුනොත් (Error එකක් ආවොත්)
                remoteScript.onerror = function() {
                    showAdBlockWarning();
                };

                // Load වුනොත් (ඒ කියන්නේ AdBlocker නෑ)
                remoteScript.onload = function() {
                    console.log("No AdBlock detected via Remote Script");
                };

                // මේක Head එකට දාන්න එපා, නිකන්ම try කරන්න
                // (සමහර විට network error එකක් console එකේ පෙන්නයි, ඒක සාමාන්‍යයි)
                document.body.appendChild(remoteScript);


                // --- Method 2: Local Variable Check ---
                if (typeof canRunAds === 'undefined') {
                    showAdBlockWarning();
                }

                // --- Method 3: CSS Bait (Backup) ---
                setTimeout(function() {
                    const bait = document.createElement('div');
                    bait.className = 'ad-banner adsbox pub_300x250 doubleclick ad-placement';
                    bait.style.cssText = 'width: 1px !important; height: 1px !important; position: fixed !important; left: -10000px !important; top: 0 !important;';
                    document.body.appendChild(bait);

                    if (window.getComputedStyle(bait).display === 'none' || bait.offsetHeight === 0) {
                        showAdBlockWarning();
                    }
                    document.body.removeChild(bait);
                }, 500);
            });
        </script>
    <?php endif; ?>

    <script>
        // Disable Right Click
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Disable Common DevTools shortcuts
        document.addEventListener('keydown', e => {
            if (e.key === 'F12') e.preventDefault();
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) e.preventDefault();
            if (e.ctrlKey && e.key.toUpperCase() === 'U') e.preventDefault();
        });
    </script>
    <script src="js/main.js"></script>
    <script src="js/index.js"></script>


</body>

</html>