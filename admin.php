<?php
// Prevent browser caching of this page
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0"); // HTTP 1.1.
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

session_start(); // Session එක පටන් ගන්න

// Check if the admin_user session variable is set
if (!isset($_SESSION['admin_user'])) {
    // Not logged in, redirect to login page
    header("Location: admin_login");
    exit(); // Stop further execution
}

// If logged in, continue loading the rest of the page
require "connection.php";



?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PlexZone Admin Dashboard</title>
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/admin-style.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <h3>PlexZone Admin</h3>
            </div>
            <ul class="sidebar-nav">
                <li class="nav-item active" data-page="dashboard-page"><a href="#"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                <li class="nav-item" data-page="movies-page"><a href="#"><i class="fas fa-film"></i> Manage Movies</a></li>
                <li class="nav-item" data-page="tv-series-page"><a href="#"><i class="fas fa-tv"></i> Manage TV Series</a></li>
                <li class="nav-item" data-page="actors-page"><a href="#"><i class="fas fa-user-friends"></i> Manage Actors</a></li>
                <li class="nav-item" data-page="users-page"><a href="#"><i class="fas fa-users"></i> Manage Users</a></li>
                <li class="nav-item" data-page="messages-requests-page"><a href="#"><i class="fas fa-envelope-open-text"></i> Feedback</a></li>
                <li class="nav-item" onclick="window.location.href='admin_logout.php'"><a href="#"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
        </aside>

        <button id="sidebar-toggle-btn" class="sidebar-toggle-btn">
            <i class="fas fa-bars"></i>
        </button>
        <main class="admin-content">
            <section id="dashboard-page" class="admin-page active">
                <h1>Dashboard Overview</h1>
                <div class="stats-cards">
                    <div class="stat-card">
                        <i class="fas fa-video"></i>
                        <div>
                            <h2 id="total-movies-count">--</h2>
                            <p>Total Active Movies</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-tv"></i>
                        <div>
                            <h2 id="total-series-count">--</h2>
                            <p>Total Active Series</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-user-plus"></i>
                        <div>
                            <h2 id="total-users-count">--</h2>
                            <p>Total Verified Users</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-user-check"></i>
                        <div>
                            <h2 id="active-subscribers-count">--</h2>
                            <p>Active Subscribers</p>
                        </div>
                    </div>
                    <div class="stat-card clickable" id="monthly-revenue-card" onclick="openRevenueModal()">
                        <i class="fas fa-rupee-sign"></i>
                        <div>
                            <h2 id="current-month-revenue">LKR --.--</h2>
                            <p>Current Month Revenue</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-calendar-day"></i>
                        <div>
                            <h2 id="today-revenue">LKR --.--</h2>
                            <p>Today's Revenue</p>
                        </div>
                    </div>
                </div>
                <div class="charts-container">
                    <div class="chart-box">
                        <h3>Monthly Overview (Last 6 Months)</h3>
                        <canvas id="overviewChart"></canvas>
                    </div>
                </div>
                <div class="dashboard-section top-favorites-section">
                    <h2><i class="fas fa-star"></i> Most Favorited Items</h2>
                    <div id="top-favorites-list" class="top-items-grid">
                        <p class="loading-placeholder">Loading top favorites...</p>
                    </div>
                </div>
            </section>

            <section id="movies-page" class="admin-page">
                <div class="page-header">
                    <h1>Manage Movies</h1>
                    <div class="header-actions">
                        <input type="search" id="movie-search-input" placeholder="Search by movie title...">
                        <button id="add-movie-btn" class="cta-button"><i class="fas fa-plus"></i> Add New Movie</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Poster</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Year</th>
                                <th>Added Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div id="pagination-container"></div>
            </section>

            <section id="tv-series-page" class="admin-page">
                <div class="page-header">
                    <h1>Manage TV Series</h1>
                    <div class="header-actions">
                        <input type="search" id="tv-series-search-input" placeholder="Search by TV series title...">
                        <button id="add-tv-series-btn" class="cta-button"><i class="fas fa-plus"></i> Add New TV Series</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Poster</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Year</th>
                                <th>Added Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="6" style="text-align: center;">No TV series found. Backend not connected.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div id="tv-series-pagination-container" class="pagination-container">
                </div>

                <div id="add-tv-series-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-btn">&times;</span>
                        <h2>Add New TV Series</h2>

                        <form id="add-tv-series-form">
                            <div class="input-group">
                                <label for="tv_title">1. Title</label>
                                <input type="text" id="tv_title" name="tv_title" placeholder="Enter TV series title">
                            </div>

                            <div class="input-group">
                                <label for="tv_description">2. Description</label>
                                <textarea id="tv_description" name="tv_description" rows="4" placeholder="Enter a brief description of the series"></textarea>
                            </div>

                            <div class="input-group">
                                <?php
                                $category_rs = Database::search("SELECT * FROM `category`");
                                $c_num_rows = $category_rs->num_rows;
                                ?>
                                <label for="tv_category">3. Category / Genre</label>
                                <select id="tv_category" name="tv_category">
                                    <option value="" disabled selected>Select a category</option>
                                    <?php
                                    for ($x = 0; $x < $c_num_rows; $x++) {
                                        $category_data = $category_rs->fetch_assoc();
                                    ?>
                                        <option value="<?php echo $category_data["id"]; ?>"><?php echo $category_data["name"]; ?></option>
                                    <?php
                                    }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <?php
                                $language_rs = Database::search("SELECT * FROM `language`");
                                $l_num_rows = $language_rs->num_rows;
                                ?>
                                <label for="tv_language">4. Language</label>
                                <select id="tv_language" name="tv_language">
                                    <option value="" disabled selected>Select a language</option>
                                    <?php
                                    for ($x = 0; $x < $l_num_rows; $x++) {
                                        $language_data = $language_rs->fetch_assoc();
                                    ?>
                                        <option value="<?php echo $language_data["id"]; ?>"><?php echo $language_data["name"]; ?></option>
                                    <?php
                                    }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <label for="tv_year">5. Release Year</label>
                                <select id="tv_year" name="tv_year"></select>
                            </div>

                            <div class="input-group">
                                <label for="tv_rating">6. IMDB Rating</label>
                                <input type="number" id="tv_rating" name="tv_rating" step="0.1" min="0" max="10" placeholder="e.g., 8.5">
                            </div>

                            <div class="input-group">
                                <?php
                                $sub_pro_rs = Database::search("SELECT * FROM `subtitle_provider`");
                                $sub_num_rows = $sub_pro_rs->num_rows;
                                ?>
                                <label for="tv_subtitle_provider">7. Subtitle Provider (Optional)</label>
                                <select id="tv_subtitle_provider" name="tv_subtitle_provider">
                                    <option value="" selected>N/A (No Provider)</option> <?php
                                                                                            for ($x = 0; $x < $sub_num_rows; $x++) {
                                                                                                $sub_data = $sub_pro_rs->fetch_assoc();
                                                                                            ?>
                                        <option value="<?php echo $sub_data["id"]; ?>"><?php echo $sub_data["name"]; ?></option>
                                    <?php
                                                                                            }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <?php
                                $status_rs = Database::search("SELECT * FROM `movie_status`");
                                $status_num_rows = $status_rs->num_rows;
                                ?>
                                <label for="tv_status">8. Series Status (e.g., Trending)</label>
                                <select id="tv_status" name="tv_status">
                                    <option value="" disabled selected>Select a status</option>
                                    <?php
                                    for ($x = 0; $x < $status_num_rows; $x++) {
                                        $status_data = $status_rs->fetch_assoc();
                                    ?>
                                        <option value="<?php echo $status_data["id"]; ?>"><?php echo $status_data["name"]; ?></option>
                                    <?php
                                    }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <label for="tv_poster_image">9. Add Image (Poster)</label>
                                <input type="file" id="tv_poster_image" name="tv_poster_image" accept="image/*">
                            </div>
                            <div class="input-group">
                                <label for="tv_cover_image">10. Add Image (Cover)</label>
                                <input type="file" id="tv_cover_image" name="tv_cover_image" accept="image/*">
                            </div>

                            <div class="season-management-section">
                                <label>11. Manage Seasons & Episodes</label>

                                <div id="season-list-container">
                                </div>

                                <button type="button" id="add-season-btn" class="cta-button small-btn">
                                    <i class="fas fa-plus"></i> Add Season
                                </button>
                            </div>

                            <template id="season-card-template">
                                <div class="season-card">
                                    <div class="season-header">
                                        <button type="button" class="toggle-season-btn" title="Minimize/Maximize">
                                            <i class="fas fa-chevron-up"></i>
                                        </button>
                                        <select name="season_id[]" class="season-select" required>
                                            <option value="" disabled selected>Select a Season</option>
                                            <?php
                                            // Load all available seasons from DB
                                            $season_rs = Database::search("SELECT * FROM `season` ORDER BY `id` ASC");
                                            $s_num_rows = $season_rs->num_rows;
                                            for ($x = 0; $x < $s_num_rows; $x++) {
                                                $season_data = $season_rs->fetch_assoc();
                                                echo '<option value="' . $season_data["id"] . '">' . $season_data["name"] . '</option>';
                                            }
                                            ?>
                                        </select>
                                        <button type="button" class="remove-season-btn" title="Remove this season">&times;</button>
                                    </div>
                                    <div class="episode-list-wrapper">
                                    </div>
                                    <button type="button" class="cta-button small-btn add-episode-btn-inner">
                                        <i class="fas fa-plus"></i> Add Episode to this Season
                                    </button>
                                </div>
                            </template>

                            <div class="actor-selection-section">
                                <label>12. Select 5 Actors (Required)</label>
                                <div class="actor-search-wrapper">
                                    <input type="text" class="actor-search-input" placeholder="Search actor name..." autocomplete="off">
                                    <div class="actor-search-results"></div>
                                </div>
                                <div class="selected-actors-list"></div>
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <small class="actor-count-message">Selected: 0 / 5</small>
                            </div>

                            <button type="button" class="cta-button" onclick="addTvSeries()">Save TV Series</button>
                        </form>
                    </div>
                </div>

                <div id="edit-tv-series-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-btn">&times;</span>
                        <h2>Edit TV Series</h2>

                        <form id="edit-tv-series-form">
                            <input type="hidden" id="edit_tv_series_id" name="tv_series_id">

                            <div class="input-group">
                                <label for="edit_tv_title">1. Title</label>
                                <input type="text" id="edit_tv_title" name="tv_title" placeholder="Enter TV series title">
                            </div>

                            <div class="input-group">
                                <label for="edit_tv_description">2. Description</label>
                                <textarea id="edit_tv_description" name="tv_description" rows="4" placeholder="Enter a brief description"></textarea>
                            </div>

                            <div class="input-group">
                                <?php $category_rs->data_seek(0); // Reset result set 
                                ?>
                                <label for="edit_tv_category">3. Category / Genre</label>
                                <select id="edit_tv_category" name="tv_category">
                                    <?php
                                    while ($category_data = $category_rs->fetch_assoc()) {
                                        echo '<option value="' . $category_data["id"] . '">' . $category_data["name"] . '</option>';
                                    }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <?php $language_rs->data_seek(0); // Reset result set 
                                ?>
                                <label for="edit_tv_language">4. Language</label>
                                <select id="edit_tv_language" name="tv_language">
                                    <?php
                                    while ($language_data = $language_rs->fetch_assoc()) {
                                        echo '<option value="' . $language_data["id"] . '">' . $language_data["name"] . '</option>';
                                    }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <label for="edit_tv_year">5. Release Year</label>
                                <select id="edit_tv_year" name="tv_year"></select>
                            </div>

                            <div class="input-group">
                                <label for="edit_tv_rating">6. IMDB Rating</label>
                                <input type="number" id="edit_tv_rating" name="tv_rating" step="0.1" min="0" max="10" placeholder="e.g., 8.5">
                            </div>

                            <div class="input-group">
                                <?php $sub_pro_rs->data_seek(0); // Reset result set 
                                ?>
                                <label for="edit_tv_subtitle_provider">7. Subtitle Provider (Optional)</label>
                                <select id="edit_tv_subtitle_provider" name="tv_subtitle_provider">
                                    <option value="" selected>N/A (No Provider)</option>
                                    <?php
                                    while ($sub_data = $sub_pro_rs->fetch_assoc()) {
                                        echo '<option value="' . $sub_data["id"] . '">' . $sub_data["name"] . '</option>';
                                    }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <?php $status_rs->data_seek(0); // Reset result set 
                                ?>
                                <label for="edit_tv_status">8. Series Status</label>
                                <select id="edit_tv_status" name="tv_status">
                                    <?php
                                    while ($status_data = $status_rs->fetch_assoc()) {
                                        echo '<option value="' . $status_data["id"] . '">' . $status_data["name"] . '</option>';
                                    }
                                    ?>
                                </select>
                            </div>

                            <div class="input-group">
                                <label>9. Poster Image</label>
                                <div class="image-preview-container">
                                    <img id="edit_tv_poster_preview" src="" alt="Poster Preview">
                                </div>
                                <input type="file" id="edit_tv_poster_image" name="tv_poster_image" accept="image/*">
                                <small>Upload a new file to replace the current poster.</small>
                            </div>
                            <div class="input-group">
                                <label>10. Cover Image</label>
                                <div class="image-preview-container">
                                    <img id="edit_tv_cover_preview" src="" alt="Cover Preview">
                                </div>
                                <input type="file" id="edit_tv_cover_image" name="tv_cover_image" accept="image/*">
                                <small>Upload a new file to replace the current cover.</small>
                            </div>

                            <div class="season-management-section">
                                <label>11. Manage Seasons & Episodes</label>
                                <div id="edit-season-list-container">
                                </div>
                                <button type="button" id="edit-add-season-btn" class="cta-button small-btn">
                                    <i class="fas fa-plus"></i> Add Season
                                </button>
                            </div>

                            <div class="actor-selection-section">
                                <label>12. Select 5 Actors (Required)</label>
                                <div class="actor-search-wrapper">
                                    <input type="text" class="actor-search-input" placeholder="Search actor name..." autocomplete="off">
                                    <div class="actor-search-results"></div>
                                </div>
                                <div class="selected-actors-list"></div>
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <input type="hidden" name="actor_ids[]" value="">
                                <small class="actor-count-message">Selected: 0 / 5</small>
                            </div>

                            <button type="button" class="cta-button" onclick="updateTvSeries()">Save Changes</button>
                        </form>
                    </div>
                </div>
            </section>

            <section id="actors-page" class="admin-page">
                <div class="page-header">
                    <h1>Manage Actors</h1>
                    <div class="header-actions">
                        <input type="search" id="actor-search-input" placeholder="Search by actor name...">
                        <button id="add-actor-btn" class="cta-button"><i class="fas fa-plus"></i> Add New Actor</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table id="actors-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div id="actors-pagination-container" class="pagination-container">
                </div>
            </section>

            <section id="users-page" class="admin-page">
                <div class="page-header">
                    <h1>Manage Users</h1>
                    <div class="header-actions">
                        <input type="search" id="user-search-input" placeholder="Search by user email...">
                        <button id="add-payment-btn" class="cta-button" onclick="openAddPaymentModal()"><i class="fas fa-money-check-alt"></i> Add Payment</button>
                    </div>
                </div>
                <div class="data-table-container">
                    <table id="users-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th style="width: 20px;">Email</th>
                                <th>Account Status</th> <!-- Verified/Blocked -->
                                <th>Current Plan</th> <!-- Free/Premium/Basic -->
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div id="users-pagination-container" class="pagination-container">
                </div>
            </section>

            <section id="messages-requests-page" class="admin-page">
                <div class="page-header">
                    <h1>Messages & Requests</h1>
                    <div class="header-actions">
                        <button id="toggle-completed-btn" class="cta-button small-btn" onclick="toggleCompletedView()">
                            <i class="fas fa-history"></i> Show Completed
                        </button>
                    </div>
                </div>

                <h2><i class="fas fa-envelope"></i> Messages (Pending & Read)</h2>
                <div class="data-table-container messages-requests-table">
                    <table id="messages-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User Email</th>
                                <th>Message</th>
                                <th>Current Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>

                <h2 style="margin-top: 2rem;"><i class="fas fa-film"></i> Movie/Series Requests (Pending)</h2>
                <div class="data-table-container messages-requests-table">
                    <table id="requests-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User Email</th>
                                <th>Request Name</th>
                                <th>Year (Optional)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>

            </section>

            <div id="add-payment-modal" class="modal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeAddPaymentModal()">&times;</span>
                    <h2>Add New Payment & Subscription</h2>

                    <form id="add-payment-form">
                        <div class="input-group user-search-container">
                            <label for="payment_user_email">1. User (Type to search Email)</label>
                            <input type="email" id="payment_user_email" name="user_email" placeholder="Start typing user's email..." autocomplete="off" required>
                            <input type="hidden" id="payment_user_id" name="user_id" required>
                            <div id="user-search-results" class="user-search-results-list">
                            </div>
                        </div>

                        <div class="input-group">
                            <label for="payment_amount">2. Amount (LKR)</label>
                            <input type="number" id="payment_amount" name="amount" placeholder="e.g., 200" required>
                        </div>

                        <div class="input-group">
                            <label for="payment_date">3. Payment Date</label>
                            <input type="date" id="payment_date" name="payment_date" required>
                        </div>

                        <div class="input-group">
                            <label for="payment_ref">4. Reference Number (Optional)</label>
                            <input type="text" id="payment_ref" name="transaction_ref" placeholder="Enter bank reference or transaction ID">
                        </div>

                        <div class="input-group">
                            <?php
                            // Get subscription packages from DB
                            $pkg_rs = Database::search("SELECT * FROM `subscription_package` ORDER BY `id` ASC");
                            $pkg_num = $pkg_rs->num_rows;
                            ?>
                            <label for="payment_package_id">5. Subscription Package</label>
                            <select id="payment_package_id" name="subscription_package_id" required>
                                <option value="" disabled selected>Select a package</option>
                                <?php
                                for ($x = 0; $x < $pkg_num; $x++) {
                                    $pkg_data = $pkg_rs->fetch_assoc();
                                    echo '<option value="' . $pkg_data["id"] . '">' . $pkg_data["name"] . '</option>';
                                }
                                ?>
                            </select>
                        </div>

                        <div class="input-group">
                            <label for="payment_slip">6. Payment Slip (Image)</label>
                            <input type="file" id="payment_slip" name="payment_slip" accept="image/*" required>
                        </div>

                        <div class="input-group">
                            <label for="sub_start_date">7. Subscription Start Date</label>
                            <input type="date" id="sub_start_date" name="start_date" required>
                        </div>

                        <div class="input-group">
                            <label for="sub_end_date">8. Subscription End Date (Auto-calculated)</label>
                            <input type="date" id="sub_end_date" name="end_date" readonly>
                        </div>

                        <button type="button" class="cta-button" onclick="submitPayment()">Save Payment</button>
                    </form>
                </div>
            </div>

            <div id="user-history-modal" class="modal">
                <div class="modal-content">
                    <span class="close-btn" onclick="document.getElementById('user-history-modal').style.display='none'">&times;</span>
                    <h2>
                        User History: <span id="history_user_name"></span>
                        <span id="history_created_date" style="float: right; font-size: 0.9rem; color: #c0c0c0; font-weight: 400; margin-top: 5px;"></span>
                    </h2>

                    <h3>Subscription History</h3>
                    <div id="subscription-history-content" class="history-table-wrapper">
                    </div>

                    <h3>Payment History</h3>
                    <div id="payment-history-content" class="history-table-wrapper">
                    </div>

                </div>
            </div>

            <div id="slip-preview-modal" class="preview-modal">
                <span id="close-preview-btn" class="close-preview-btn">&times;</span>
                <img id="preview-image" src="" alt="Payment Slip Preview">
            </div>
        </main>
    </div>

    <div id="add-movie-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Add New Movie</h2>

            <form id="add-movie-form">
                <div class="input-group">
                    <label for="movie_title">1. Title</label>
                    <input type="text" id="movie_title" name="movie_title" placeholder="Enter movie title">
                </div>
                <div class="input-group">
                    <label for="movie_description">2. Description</label>
                    <textarea id="movie_description" name="movie_description" rows="4" placeholder="Enter a brief description of the movie"></textarea>
                </div>

                <div class="input-group">
                    <?php
                    $category_rs = Database::search("SELECT * FROM `category`");
                    $c_num_rows = $category_rs->num_rows;
                    ?>
                    <label for="movie_category">3. Category / Genre</label>
                    <select id="movie_category" name="movie_category">
                        <option value="" disabled selected>Select a category</option>
                        <?php
                        for ($x = 0; $x < $c_num_rows; $x++) {
                            $category_data = $category_rs->fetch_assoc();
                        ?>
                            <option value="<?php echo $category_data["id"]; ?>"><?php echo $category_data["name"]; ?></option>
                        <?php
                        }
                        ?>
                    </select>
                </div>

                <div class="input-group">
                    <?php
                    $language_rs = Database::search("SELECT * FROM `language`");
                    $l_num_rows = $language_rs->num_rows;
                    ?>
                    <label for="movie_language">4. Language</label>
                    <select id="movie_language" name="movie_language">
                        <option value="" disabled selected>Select a language</option>
                        <?php
                        for ($x = 0; $x < $l_num_rows; $x++) {
                            $language_data = $language_rs->fetch_assoc();
                        ?>
                            <option value="<?php echo $language_data["id"]; ?>"><?php echo $language_data["name"]; ?></option>
                        <?php
                        }
                        ?>
                    </select>
                </div>

                <div class="input-group">
                    <label for="movie_year">5. Release Year</label>
                    <select id="movie_year" name="movie_year"></select>
                </div>

                <div class="input-group">
                    <label for="movie_rating">6. IMDB Rating</label>
                    <input type="number" id="movie_rating" name="movie_rating" step="0.1" min="0" max="10" placeholder="e.g., 8.5">
                </div>

                <div class="input-group">
                    <label for="poster_image">7. Add Image (Poster)</label>
                    <input type="file" id="poster_image" name="poster_image" accept="image/*">
                </div>
                <div class="input-group">
                    <label for="cover_image">8. Add Image (Cover)</label>
                    <input type="file" id="cover_image" name="cover_image" accept="image/*">
                </div>

                <div class="input-group">
                    <?php
                    $sub_pro_rs = Database::search("SELECT * FROM `subtitle_provider`");
                    $sub_num_rows = $sub_pro_rs->num_rows;
                    ?>
                    <label for="subtitle_provider">9. Subtitle Provider (Optional)</label>
                    <select id="subtitle_provider" name="subtitle_provider">
                        <option value="" selected>N/A (No Provider)</option> <?php
                                                                                for ($x = 0; $x < $sub_num_rows; $x++) {
                                                                                    $sub_data = $sub_pro_rs->fetch_assoc();
                                                                                ?>
                            <option value="<?php echo $sub_data["id"]; ?>"><?php echo $sub_data["name"]; ?></option>
                        <?php
                                                                                }
                        ?>
                    </select>
                </div>
                <div class="input-group">
                    <label for="movie_trailer_link">10. Enter Movie Trailer Link (Optional)</label>
                    <input type="url" id="movie_trailer_link" name="movie_trailer_link" placeholder="Enter the YouTube/Vimeo trailer URL">
                </div>
                <div class="input-group">
                    <label for="720p_movie_link">11. Enter 720p Movie Link (Required)</label>
                    <input type="url" id="720p_movie_link" name="720p_movie_link" required placeholder="Enter the 720p direct movie URL">
                </div>
                <div class="input-group">
                    <label for="1080p_movie_link">12. Enter 1080p Movie Link (Required)</label>
                    <input type="url" id="1080p_movie_link" name="1080p_movie_link" required placeholder="Enter the 1080p direct movie URL">
                </div>
                <div class="input-group">
                    <label for="tg_file_id_720p">Telegram File ID (720p)</label>
                    <input type="text" id="tg_file_id_720p" name="tg_file_id_720p" placeholder="Example: BQACAgUAAxkBAA...">
                </div>
                <div class="input-group">
                    <label for="tg_file_id_1080p">Telegram File ID (1080p)</label>
                    <input type="text" id="tg_file_id_1080p" name="tg_file_id_1080p" placeholder="Example: BQACAgUAAxkBAA...">
                </div>
                <div class="actor-selection-section">
                    <label>13. Select 5 Actors (Required)</label>
                    <div class="actor-search-wrapper">
                        <input type="text" class="actor-search-input" placeholder="Search actor name..." autocomplete="off">
                        <div class="actor-search-results">
                        </div>
                    </div>
                    <div class="selected-actors-list">
                    </div>
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <small class="actor-count-message">Selected: 0 / 5</small>
                </div>

                <div class="subtitle-upload-section">
                    <label>14. Upload Subtitles (Optional, .srt only)</label>
                    <div class="subtitle-inputs-grid">
                        <div class="input-group">
                            <label for="subtitle_si">Sinhala (.srt)</label>
                            <input type="file" id="subtitle_si" name="subtitle_si" accept=".srt">
                        </div>
                        <div class="input-group">
                            <label for="subtitle_en">English (.srt)</label>
                            <input type="file" id="subtitle_en" name="subtitle_en" accept=".srt">
                        </div>
                        <div class="input-group">
                            <label for="subtitle_ta">Tamil (.srt)</label>
                            <input type="file" id="subtitle_ta" name="subtitle_ta" accept=".srt">
                        </div>
                    </div>
                </div>

                <div class="subtitle-upload-section"> <label>15. Movie Collection (Optional)</label>
                    <div class="subtitle-inputs-grid">
                        <div class="input-group">
                            <label for="collection_name">Collection Name</label>

                            <input type="text" id="collection_name" name="collection_name" placeholder="e.g., Fast & Furious" class="collection-search-input" autocomplete="off">

                            <div class="collection-search-results actor-search-results"></div>
                        </div>
                        <div class="input-group">
                            <label for="movie_number">Movie Number</label>
                            <input type="number" id="movie_number" name="movie_number" min="1" placeholder="e.g., 1">
                        </div>
                    </div>
                    <small>If this movie is part of a series, add the name and number. **Both fields are required if one is filled.**</small>
                </div>

                <button type="button" class="cta-button" onclick="addMovie()">Save Movie</button>
            </form>
        </div>
    </div>

    <div id="edit-movie-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn" onclick="document.getElementById('edit-movie-modal').style.display='none'">&times;</span>
            <h2>Edit Movie Details</h2>

            <form id="edit-movie-form">
                <input type="hidden" id="edit_movie_id" name="movie_id">

                <div class="input-group">
                    <label for="edit_movie_title">1. Title</label>
                    <input type="text" id="edit_movie_title" name="movie_title" placeholder="Enter movie title">
                </div>
                <div class="input-group">
                    <label for="edit_movie_description">2. Description</label>
                    <textarea id="edit_movie_description" name="movie_description" rows="4" placeholder="Enter a brief description"></textarea>
                </div>
                <div class="input-group">
                    <?php
                    $category_rs = Database::search("SELECT * FROM `category`");
                    $c_num_rows = $category_rs->num_rows;
                    ?>
                    <label for="edit_movie_category">3. Category / Genre</label>
                    <select id="edit_movie_category" name="movie_category">
                        <option value="" disabled selected>Select a category</option>
                        <?php
                        for ($x = 0; $x < $c_num_rows; $x++) {
                            $category_data = $category_rs->fetch_assoc();
                        ?>
                            <option value="<?php echo $category_data["id"]; ?>"><?php echo $category_data["name"]; ?></option>
                        <?php
                        }
                        ?>
                    </select>
                </div>
                <div class="input-group">
                    <?php
                    $language_rs = Database::search("SELECT * FROM `language`");
                    $l_num_rows = $language_rs->num_rows;
                    ?>
                    <label for="edit_movie_language">4. Language</label>
                    <select id="edit_movie_language" name="movie_language">
                        <option value="" disabled selected>Select a language</option>
                        <?php
                        for ($x = 0; $x < $l_num_rows; $x++) {
                            $language_data = $language_rs->fetch_assoc();
                        ?>
                            <option value="<?php echo $language_data["id"]; ?>"><?php echo $language_data["name"]; ?></option>
                        <?php
                        }
                        ?>
                    </select>
                </div>
                <div class="input-group">
                    <label for="edit_movie_year">5. Release Year</label>
                    <select id="edit_movie_year" name="movie_year"></select>
                </div>
                <div class="input-group">
                    <label for="edit_movie_rating">6. IMDB Rating</label>
                    <input type="number" id="edit_movie_rating" name="movie_rating" step="0.1" min="0" max="10" placeholder="e.g., 8.5">
                </div>
                <div class="input-group">
                    <label>7. Poster Image</label>
                    <div class="image-preview-container">
                        <img id="edit_poster_preview" src="" alt="Poster Preview">
                    </div>
                    <input type="file" id="edit_poster_image" name="poster_image" accept="image/*">
                    <small>Upload a new file to replace the current poster.</small>
                </div>

                <div class="input-group">
                    <label>8. Cover Image</label>
                    <div class="image-preview-container">
                        <img id="edit_cover_preview" src="" alt="Cover Preview">
                    </div>
                    <input type="file" id="edit_cover_image" name="cover_image" accept="image/*">
                    <small>Upload a new file to replace the current cover image.</small>
                </div>
                <div class="input-group">
                    <?php
                    $sub_pro_rs = Database::search("SELECT * FROM `subtitle_provider`");
                    $sub_num_rows = $sub_pro_rs->num_rows;
                    ?>
                    <label for="edit_subtitle_provider">9. Subtitle Provider</label>
                    <select id="edit_subtitle_provider" name="subtitle_provider">
                        <option value="" disabled selected>Select a provider</option>
                        <?php
                        for ($x = 0; $x < $sub_num_rows; $x++) {
                            $sub_data = $sub_pro_rs->fetch_assoc();
                        ?>
                            <option value="<?php echo $sub_data["id"]; ?>"><?php echo $sub_data["name"]; ?></option>
                        <?php
                        }
                        ?>
                    </select>
                </div>
                <div class="input-group">
                    <label for="edit_movie_trailer_link">10. Enter Movie Trailer Link (Optional)</label>
                    <input type="url" id="edit_movie_trailer_link" name="movie_trailer_link" placeholder="Enter the YouTube/Vimeo trailer URL">
                </div>
                <div class="input-group">
                    <label for="edit_720p_movie_link">11. Enter 720p Movie Link (Required)</label>
                    <input type="url" id="edit_720p_movie_link" name="720p_movie_link" required placeholder="Enter the 720p direct movie URL">
                </div>
                <div class="input-group">
                    <label for="edit_1080p_movie_link">12. Enter 1080p Movie Link (Required)</label>
                    <input type="url" id="edit_1080p_movie_link" name="1080p_movie_link" required placeholder="Enter the 1080p direct movie URL">
                </div>
                <div class="input-group">
                    <label for="edit_tg_file_id_720p">Telegram File ID (720p)</label>
                    <input type="text" id="edit_tg_file_id_720p" name="tg_file_id_720p" placeholder="Paste ID here">
                </div>
                <div class="input-group">
                    <label for="edit_tg_file_id_1080p">Telegram File ID (1080p)</label>
                    <input type="text" id="edit_tg_file_id_1080p" name="tg_file_id_1080p" placeholder="Paste ID here">
                </div>
                <div class="input-group">
                    <?php
                    $status_rs = Database::search("SELECT * FROM `movie_status`");
                    $status_num_rows = $status_rs->num_rows;
                    ?>
                    <label for="edit_movie_status">13. Movie Status</label>
                    <select id="edit_movie_status" name="movie_status">
                        <option value="" disabled selected>Select a status</option>
                        <?php
                        for ($x = 0; $x < $status_num_rows; $x++) {
                            $status_data = $status_rs->fetch_assoc();
                        ?>
                            <option value="<?php echo $status_data["id"]; ?>"><?php echo $status_data["name"]; ?></option>
                        <?php
                        }
                        ?>
                    </select>
                </div>

                <div class="actor-selection-section">
                    <label>14. Select 5 Actors (Required)</label>
                    <div class="actor-search-wrapper">
                        <input type="text" class="actor-search-input" placeholder="Search actor name..." autocomplete="off">
                        <div class="actor-search-results">
                        </div>
                    </div>
                    <div class="selected-actors-list">
                    </div>
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <input type="hidden" name="actor_ids[]" value="">
                    <small class="actor-count-message">Selected: 0 / 5</small>
                </div>

                <div class="subtitle-upload-section">
                    <label>15. Upload/Replace/Delete Subtitles (Optional, .srt only)</label>
                    <div class="subtitle-inputs-grid">
                        <div class="input-group">
                            <label for="edit_subtitle_si">Sinhala (.srt)</label>
                            <input type="file" id="edit_subtitle_si" name="subtitle_si" accept=".srt">
                            <div class="subtitle-status">
                                <small id="current_sub_si">Current: None</small>
                                <label class="delete-sub-label" id="delete_sub_label_si" style="display: none;">
                                    <input type="checkbox" name="delete_subtitle_si" value="1"> Delete Current
                                </label>
                            </div>
                        </div>
                        <div class="input-group">
                            <label for="edit_subtitle_en">English (.srt)</label>
                            <input type="file" id="edit_subtitle_en" name="subtitle_en" accept=".srt">
                            <div class="subtitle-status">
                                <small id="current_sub_en">Current: None</small>
                                <label class="delete-sub-label" id="delete_sub_label_en" style="display: none;">
                                    <input type="checkbox" name="delete_subtitle_en" value="1"> Delete Current
                                </label>
                            </div>
                        </div>
                        <div class="input-group">
                            <label for="edit_subtitle_ta">Tamil (.srt)</label>
                            <input type="file" id="edit_subtitle_ta" name="subtitle_ta" accept=".srt">
                            <div class="subtitle-status">
                                <small id="current_sub_ta">Current: None</small>
                                <label class="delete-sub-label" id="delete_sub_label_ta" style="display: none;">
                                    <input type="checkbox" name="delete_subtitle_ta" value="1"> Delete Current
                                </label>
                            </div>
                        </div>
                    </div>
                    <small>Uploading a new file will replace the existing subtitle. Check "Delete" to remove it without uploading a new one.</small>
                </div>

                <div class="subtitle-upload-section"> <label>16. Movie Collection (Optional)</label>
                    <div class="subtitle-inputs-grid">
                        <div class="input-group">
                            <label for="edit_collection_name">Collection Name</label>

                            <input type="text" id="edit_collection_name" name="collection_name" placeholder="e.g., Fast & Furious" class="collection-search-input" autocomplete="off">

                            <div class="collection-search-results actor-search-results"></div>
                        </div>
                        <div class="input-group">
                            <label for="edit_movie_number">Movie Number</label>
                            <input type="number" id="edit_movie_number" name="movie_number" min="1" placeholder="e.g., 1">
                        </div>
                    </div>
                    <small>To remove from a collection, clear both fields. **Both fields are required if one is filled.**</small>
                </div>

                <button type="button" class="cta-button" onclick="updateMovie()">Save Changes</button>
            </form>
        </div>
    </div>

    <div id="revenue-lookup-modal" class="modal">
        <div class="modal-content small-modal"> <span class="close-btn" onclick="closeRevenueModal()">&times;</span>
            <h2>Monthly Revenue Lookup</h2>

            <form id="revenue-lookup-form">
                <div class="input-group">
                    <label for="revenue_year">Select Year:</label>
                    <select id="revenue_year" name="year" required>
                    </select>
                </div>
                <div class="input-group">
                    <label for="revenue_month">Select Month:</label>
                    <select id="revenue_month" name="month" required>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>
                <button type="button" class="cta-button" onclick="lookupRevenue()">Lookup Revenue</button>
            </form>

            <div id="revenue-lookup-result" style="margin-top: 2rem; text-align: center; display: none;">
                <h3 id="revenue-result-title"></h3>
                <p id="revenue-result-amount" style="font-size: 1.8rem; color: var(--color-neon-blue); font-weight: 600;"></p>
                <p id="revenue-result-message" style="color: var(--color-silver); font-size: 0.9rem;"></p>
            </div>
        </div>
    </div>

    <div id="add-actor-modal" class="modal">
        <div class="modal-content small-modal">
            <span class="close-btn" onclick="closeAndResetModal('add-actor-modal', 'add-actor-form')">&times;</span>
            <h2>Add New Actor</h2>
            <form id="add-actor-form">
                <div class="input-group">
                    <label for="actor_name">Actor Name</label>
                    <input type="text" id="actor_name" name="actor_name" required placeholder="Enter actor's full name">
                </div>
                <div class="input-group">
                    <label for="actor_image">Actor Image</label>
                    <input type="file" id="actor_image" name="actor_image" accept="image/*" required>
                    <small>Image is required.</small>
                </div>
                <button type="button" class="cta-button" onclick="addActor()">Save Actor</button>
            </form>
        </div>
    </div>

    <div id="edit-actor-modal" class="modal">
        <div class="modal-content small-modal">
            <span class="close-btn" onclick="closeAndResetModal('edit-actor-modal', 'edit-actor-form')">&times;</span>
            <h2>Edit Actor</h2>
            <form id="edit-actor-form">
                <input type="hidden" id="edit_actor_id" name="actor_id">
                <div class="input-group">
                    <label for="edit_actor_name">Actor Name</label>
                    <input type="text" id="edit_actor_name" name="actor_name" required placeholder="Enter actor's full name">
                </div>
                <div class="input-group">
                    <label>Current Image</label>
                    <div class="image-preview-container" style="justify-content: flex-start;"> <img id="edit_actor_image_preview" src="" alt="Actor Preview" style="max-height: 100px;">
                    </div>
                    <label for="edit_actor_image" style="margin-top: 1rem;">Upload New Image (Optional)</label>
                    <input type="file" id="edit_actor_image" name="actor_image" accept="image/*">
                    <small>Upload a new file only if you want to replace the current image.</small>
                </div>
                <button type="button" class="cta-button" onclick="updateActor()">Save Changes</button>
            </form>
        </div>
    </div>

    <div id="custom-modal-overlay">
        <div id="custom-modal-box">
            <h2 id="modal-title"></h2>
            <p id="modal-message"></p>
            <button id="modal-close-btn">OK</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/admin.js"></script>
</body>

</html>