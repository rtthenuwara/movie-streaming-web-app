<?php
session_start();
require "connection.php";

// Get slug from URL
$slug = $_GET['slug'] ?? null;
if (!$slug) {
    header("Location: index");
    exit();
}
// Convert slug back to collection name
$collection_name = ucwords(str_replace('-', ' ', $slug));
$collection_name_sanitized = Database::sanitize($collection_name);

// Fetch movies for this collection
$query = "SELECT m.*, mc.movie_number 
          FROM `movies` m
          JOIN `movie_collection` mc ON m.id = mc.movies_id
          WHERE mc.collection_name = '{$collection_name_sanitized}'
          ORDER BY mc.movie_number ASC";
$movies_rs = Database::search($query);

// User ID (for favorite status)
$user_id = $_SESSION['user']['id'] ?? 0;
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($collection_name); ?> - PlexZone</title>
    <base href="http://localhost/plexzone/">
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon.ico">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="css/all_movies.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <script>
        /**
         * නමක් (Title) URL-friendly Slug එකක් බවට පත් කරයි (JS version).
         * @param {string} text
         * @returns {string}
         */
        function slugify(text) {
            if (!text) return '';
            return text
                .toString()
                .toLowerCase()
                .normalize('NFD') // විශේෂ අක්ෂර handle කිරීමට
                .trim()
                .replace(/\s+/g, '-') // spaces -> -
                .replace(/[^\w-]+/g, '') // අකුරු, ඉලක්කම්, - හැර සියල්ල ඉවත් කිරීම
                .replace(/--+/g, '-'); // -- -> -
        }

        /**
         * Builds HTML for a single Movie card.
         * (Moved from index.js)
         * @param {Object} movie
         * @returns {string} HTML for the movie card.
         */
        function createMovieCardHTML(movie) {
            if (!movie || !movie.id || !movie.title) {
                console.error("Invalid movie data for card:", movie);
                return "";
            }
            let displayTitle = movie.title.replace('(Not Original)', '').trim();

            const isFavorited = movie.is_favorited === true || movie.is_favorited === 'true';
            const detailUrl = `movie/${movie.slug}`;

            return `
        <div class="movie-card" onclick="window.location.href='${detailUrl}'">
            <div class="card-image-container">
                <img src="${movie.poster_url || 'assets/images/placeholder.png'}" alt="${displayTitle} Poster" loading="lazy"> 
                <div class="card-overlay">
                    <div class="favorite-icon-wrapper ${isFavorited ? 'is-favorited' : ''}" 
                         onclick="typeof toggleFavorite === 'function' ? toggleFavorite(event, ${movie.id}, '${movie.type || 'movie'}', this) : console.error('toggleFavorite not found')"> 
                        <i class="fas fa-star ${isFavorited ? 'favorited' : ''}"></i>
                    </div>
                    <i class="fas fa-play watch-icon"></i>
                    <h3 class="card-title-overlay">${displayTitle}</h3> <span class="card-year-overlay">${movie.release_year || ''}</span>
                </div>
            </div>
            <p class="movie-title">${displayTitle}</p> </div>
    `;
        }
    </script>
</head>

<body>
    <?php include "header.php"; ?>

    <main class="all-movies-page">
        <div class="page-container">
            <h1><?php echo htmlspecialchars($collection_name); ?></h1>
            <p style="text-align: center; margin-top: -1.5rem; margin-bottom: 2rem; color: var(--color-silver);">Movies in this collection, sorted in order.</p>

            <div id="collection-grid" class="movie-grid">
                <?php if ($movies_rs->num_rows > 0): ?>
                    <?php while ($movie = $movies_rs->fetch_assoc()):
                        // --- Get Poster ---
                        $poster_path = "assets/images/placeholder.png";
                        $poster_files = glob("uploads/movies/" . $movie['id'] . "/poster.*");
                        if (!empty($poster_files)) {
                            $poster_path = $poster_files[0];
                        }

                        // --- Check Favorite ---
                        $is_favorited = false;
                        if ($user_id != 0) {
                            $fav_check_rs = Database::search("SELECT id FROM `favorite_list` WHERE `user_id` = {$user_id} AND `movies_id` = {$movie['id']}");
                            if ($fav_check_rs->num_rows > 0) $is_favorited = true;
                        }

                        $clean_title = trim(str_replace('(Not Original)', '', $movie['title']));

                        // --- Prepare data for JS function ---
                        $movie_data_js = json_encode([
                            'id' => $movie['id'],
                            'title' => $clean_title,
                            'slug' => $movie['slug'],
                            'poster_url' => $poster_path,
                            'release_year' => $movie['release_year'],
                            'type' => 'movie',
                            'is_favorited' => $is_favorited
                        ]);
                    ?>
                        <script>
                            // Pass data to createMovieCardHTML (which is in main.js)
                            var movieData = <?php echo $movie_data_js; ?>;
                            document.write(createMovieCardHTML(movieData));
                        </script>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p class="no-movies">No movies found for this collection.</p>
                <?php endif; ?>
            </div>

        </div>
    </main>

    <div id="custom-modal-overlay">
        <div id="custom-modal-box">
            <h2 id="modal-title"></h2>
            <p id="modal-message"></p>
            <button id="modal-close-btn">OK</button>
        </div>
    </div>

    <?php include "footer.php"; ?>
    <script src="js/main.js"></script>
    <script src="js/index.js"></script>
</body>

</html>