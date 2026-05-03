<?php 

session_start();
require "connection.php"; ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Movies - PlexZone</title>
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="css/all_movies.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    
    <script src="js/index.js" defer></script>
    <script src="js/all_movies.js" defer></script>
</head>

<body>
    <?php include "header.php"; 
    ?>

    <main class="all-movies-page">
        <div class="page-container">
            <h1>Browse All Movies</h1>

            <div class="filter-container">
                <input type="search" id="all-movies-search" placeholder="Search by title...">

                <div class="actor-filter-wrapper">
                    <input type="search" id="filter-actor" placeholder="Search by actor..." autocomplete="off">
                    <input type="hidden" id="filter-actor-id" value="0"> 
                    <div id="actor-suggestions"></div>
                    <button id="actor-clear-btn" style="display: none;">&times;</button>
                </div>

                <select id="filter-category">
                    <option value="0">All Categories</option>
                    <?php
                    $category_rs = Database::search("SELECT * FROM `category` ORDER BY `name` ASC");
                    while ($cat = $category_rs->fetch_assoc()) {
                        echo '<option value="' . htmlspecialchars($cat['id']) . '">' . htmlspecialchars($cat['name']) . '</option>';
                    }
                    ?>
                </select>

                <select id="filter-language">
                    <option value="0">All Languages</option>
                    <?php
                    $lang_rs = Database::search("SELECT * FROM `language` ORDER BY `name` ASC");
                    while ($lang = $lang_rs->fetch_assoc()) {
                        echo '<option value="' . htmlspecialchars($lang['id']) . '">' . htmlspecialchars($lang['name']) . '</option>';
                    }
                    ?>
                </select>

                <select id="filter-year">
                    <option value="0">All Years</option>
                    <?php
                    $current_year = date("Y");
                    for ($year = $current_year; $year >= 1950; $year--) {
                        echo '<option value="' . $year . '">' . $year . '</option>';
                    }
                    ?>
                </select>
            </div>

            <div id="all-movies-grid" class="movie-grid">
                <p class="loading-text">Loading movies, please wait...</p>
            </div>

            <div id="all-movies-pagination" class="pagination-container"></div>
        </div>
    </main>

    <div id="custom-modal-overlay">
        <div id="custom-modal-box">
            <h2 id="modal-title"></h2>
            <p id="modal-message"></p>
            <button id="modal-close-btn">OK</button>
        </div>
    </div>

    <?php include "footer.php"; 
    ?>

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