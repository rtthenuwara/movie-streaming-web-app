// ==================================================================
// ==                 INDEX PAGE SPECIFIC JAVASCRIPT               ==
// ==        (Cleaned: Single DOMContentLoaded, No Duplicates)     ==
// ==================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Load sections only if their containers exist ---
    if (document.querySelector('.trending-carousel')) {
        loadTrendingMovies();
    }
    if (document.querySelector('.latest-grid')) {
        loadLatestMovies();
    }
    if (document.querySelector('.collections-grid')) {
        loadFilmCollections();
    }
    if (document.querySelector('.latest-series-grid')) {
        loadLatestTvSeries(); // Make sure this is called
    }

    // --- Event listeners specific to index.php ---

    // Event listeners for Trending Now carousel arrows
    const trendingPrevBtn = document.querySelector('.trending-prev');
    const trendingNextBtn = document.querySelector('.trending-next');
    const trendingCarousel = document.querySelector('.trending-carousel');
    if (trendingPrevBtn && trendingNextBtn && trendingCarousel) {
        trendingPrevBtn.addEventListener('click', () => {
            trendingCarousel.scrollBy({ left: -trendingCarousel.clientWidth, behavior: 'smooth' });
        });
        trendingNextBtn.addEventListener('click', () => {
            trendingCarousel.scrollBy({ left: trendingCarousel.clientWidth, behavior: 'smooth' });
        });
    } else if (trendingCarousel) {
        console.warn("Trending carousel arrows not found."); // Add warning if arrows are missing
    }

    // Event listener for "Show All Movies" button
    const showAllMoviesBtn = document.querySelector('.latest-section .show-all-btn:not(#show-all-tv-btn)');
    if (showAllMoviesBtn) {
        showAllMoviesBtn.addEventListener('click', () => {
            window.location.href = 'movies'; // Using clean URL
        });
    }

    // Event listener for "Show All TV Series" button
    const showAllTvBtn = document.querySelector('#show-all-tv-btn');
    if (showAllTvBtn) {
        showAllTvBtn.addEventListener('click', () => {
            window.location.href = 'series'; // Using clean URL
        });
    }

    // Initialize Live Search functionality
    setupLiveSearch();

    // Initialize Hero Slideshow if present
    setupHeroSlideshow();

}); // End of SINGLE DOMContentLoaded listener

// ===========================================================
// ==          LOAD SECTIONS FUNCTIONS                      ==
// ===========================================================

async function loadTrendingMovies() {
    try {
        const response = await fetch('get_trending_movies.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const items = await response.json();

        const carousel = document.querySelector('.trending-carousel');
        if (!carousel) return;
        carousel.innerHTML = '';

        if (items && items.length > 0) {
            items.forEach(item => {
                let cardHTML = '';
                if (item.type === 'series') {
                    cardHTML = createSeriesCardHTML(item);
                } else { // 'movie'
                    cardHTML = createMovieCardHTML(item);
                }
                if (cardHTML) carousel.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            carousel.innerHTML = '<p class="no-movies">No trending items found.</p>';
        }
    } catch (error) {
        console.error('Error loading trending items:', error);
        const carousel = document.querySelector('.trending-carousel');
        if (carousel) carousel.innerHTML = '<p class="error-message">Failed to load trending items.</p>';
    }
}

async function loadLatestMovies() {
    try {
        const response = await fetch('get_latest_movies.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const movies = await response.json();

        const movieGrid = document.querySelector('.latest-grid');
        if (!movieGrid) return;
        movieGrid.innerHTML = '';

        if (movies && movies.length > 0) {
            movies.forEach(movie => {
                const cardHTML = createMovieCardHTML(movie);
                if (cardHTML) movieGrid.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            movieGrid.innerHTML = '<p class="no-movies">No latest movies found.</p>';
        }
    } catch (error) {
        console.error('Error loading latest movies:', error);
        const movieGrid = document.querySelector('.latest-grid');
        if (movieGrid) movieGrid.innerHTML = '<p class="error-message">Failed to load latest movies.</p>';
    }
}

async function loadFilmCollections() {
    try {
        const response = await fetch('get_collections.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const collections = await response.json();

        const grid = document.querySelector('.collections-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (collections && collections.length > 0) {
            collections.forEach(collection => {
                // main.js එකේ තියෙන අලුත් function එක call කිරීම
                const cardHTML = createCollectionCardHTML(collection);
                if (cardHTML) grid.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            grid.innerHTML = '<p class="no-movies">No collections found.</p>';
        }
    } catch (error) {
        console.error('Error loading film collections:', error);
        const grid = document.querySelector('.collections-grid');
        if (grid) grid.innerHTML = '<p class="error-message">Failed to load collections.</p>';
    }
}

async function loadLatestTvSeries() {
    try {
        const response = await fetch('get_latest_tv_series.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const seriesList = await response.json();

        const seriesGrid = document.querySelector('.latest-series-grid');
        if (!seriesGrid) return;
        seriesGrid.innerHTML = '';

        if (seriesList && seriesList.length > 0) {
            seriesList.forEach(series => {
                const cardHTML = createSeriesCardHTML(series);
                if (cardHTML) seriesGrid.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            seriesGrid.innerHTML = '<p class="no-movies">No TV series found.</p>';
        }
    } catch (error) {
        console.error('Error loading latest TV series:', error);
        const seriesGrid = document.querySelector('.latest-series-grid');
        if (seriesGrid) seriesGrid.innerHTML = '<p class="error-message">Failed to load latest TV series.</p>';
    }
}

// ==================================================================
// ==                 UI & TEMPLATE FUNCTIONS                      ==
// ==================================================================

/**
 * Builds HTML for a single Movie card.
 * Relies on global slugify() and toggleFavorite() from main.js
 * @param {Object} movie
 * @returns {string} HTML for the movie card.
 */
function createMovieCardHTML(movie) {
    if (!movie || !movie.id || !movie.title) return "";
    
    // ⭐ 1. Title එක Clean කරන කොටස (මෙතනින් නම සුද්ද වෙනවා)
    let displayTitle = movie.title.replace('(Not Original)', '').trim();

    const isFavorited = movie.is_favorited === true || movie.is_favorited === 'true';
    const detailUrl = `movie/${movie.slug}`;

    return `
        <div class="movie-card" onclick="window.location.href='${detailUrl}'">
            <div class="card-image-container">
                <span class="media-type-badge movie">Movie</span>
                
                <img src="${movie.poster_url || 'assets/images/placeholder.png'}" alt="${displayTitle} Poster" loading="lazy"> 
                
                <div class="card-overlay">
                    <div class="favorite-icon-wrapper ${isFavorited ? 'is-favorited' : ''}" 
                         onclick="typeof toggleFavorite === 'function' ? toggleFavorite(event, ${movie.id}, '${movie.type || 'movie'}', this) : console.error('toggleFavorite not found')"> 
                        <i class="fas fa-star ${isFavorited ? 'favorited' : ''}"></i>
                    </div>
                    <i class="fas fa-play watch-icon"></i>
                    
                    <h3 class="card-title-overlay">${displayTitle}</h3>
                    
                    <span class="card-year-overlay">${movie.release_year || ''}</span>
                </div>
            </div>
            
            <p class="movie-title">${displayTitle}</p>
        </div>
    `;
}

/**
 * Builds HTML for a single TV Series card.
 * Relies on global slugify() and toggleFavorite() from main.js
 * @param {Object} series
 * @returns {string} HTML for the series card.
 */
function createSeriesCardHTML(series) {
    if (!series || !series.id || !series.title) return "";
    
    const isFavorited = series.is_favorited === true || series.is_favorited === 'true';
    const detailUrl = `series/${series.slug}`;

    return `
        <div class="movie-card" onclick="window.location.href='${detailUrl}'">
            <div class="card-image-container">
                <span class="media-type-badge series">TV Series</span>

                <img src="${series.poster_url || 'assets/images/placeholder.png'}" alt="${series.title} Poster" loading="lazy">
                <div class="card-overlay">
                     <div class="favorite-icon-wrapper ${isFavorited ? 'is-favorited' : ''}"
                         onclick="typeof toggleFavorite === 'function' ? toggleFavorite(event, ${series.id}, '${series.type || 'series'}', this) : console.error('toggleFavorite not found')">
                        <i class="fas fa-star ${isFavorited ? 'favorited' : ''}"></i>
                    </div>
                    <i class="fas fa-play watch-icon"></i>
                    <h3 class="card-title-overlay">${series.title}</h3>
                    <span class="card-year-overlay">${series.release_year || ''}</span>
                </div>
            </div>
            <p class="movie-title">${series.title}</p>
        </div>
    `;
}

// ==================================================================
// ==     UNIVERSAL PROFILE DROPDOWN (MOBILE + DESKTOP FIXED)     ==
// ==================================================================

document.addEventListener("DOMContentLoaded", () => {
    const desktopProfileIcon = document.querySelector(".desktop-nav .profile-icon");
    const desktopProfileMenu = document.getElementById("profile-menu");

    const mobileToggleBtn = document.getElementById("mobile-menu-button");
    const mobileDropdown = document.getElementById("mobile-profile-dropdown");

    // === DESKTOP DROPDOWN ===
    if (desktopProfileIcon && desktopProfileMenu) {
        desktopProfileIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            desktopProfileMenu.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (
                desktopProfileMenu.classList.contains("show") &&
                !desktopProfileIcon.contains(e.target) &&
                !desktopProfileMenu.contains(e.target)
            ) {
                desktopProfileMenu.classList.remove("show");
            }
        });
    }

    // === MOBILE DROPDOWN ===
    if (mobileToggleBtn && mobileDropdown) {
        mobileToggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            mobileDropdown.classList.toggle("open");
            mobileToggleBtn.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            if (
                mobileDropdown.classList.contains("open") &&
                !mobileToggleBtn.contains(e.target) &&
                !mobileDropdown.contains(e.target)
            ) {
                mobileDropdown.classList.remove("open");
                mobileToggleBtn.classList.remove("active");
            }
        });
    }
});





// ==================================================================
// ==           FAVORITE TOGGLE FUNCTION                         ==
// ==================================================================
// ... (toggleFavorite function) ...

// ==================================================================
// ==           FAVORITE TOGGLE FUNCTION (MOVED HERE)            ==
// ==================================================================

/**
 * Toggles a movie's or series's favorite status via AJAX.
 * Calls showModal() for feedback.
 * @param {Event} event - The click event.
 * @param {number} id - The ID of the movie or series.
 * @param {string} type - Must be 'movie' or 'series'.
 * @param {HTMLElement} wrapperElement - The '.favorite-icon-wrapper' element clicked.
 */
function toggleFavorite(event, id, type, wrapperElement) {
    event.stopPropagation(); // Prevent card click when clicking the icon

    // Ensure type is valid before proceeding
    if (type !== 'movie' && type !== 'series') {
        console.error("Invalid type passed to toggleFavorite:", type);
        showModal('Error', 'An internal error occurred (invalid type).', false);
        return;
    }

    const icon = wrapperElement.querySelector('i.fa-star');
    if (!icon) return; // Exit if icon not found

    const formData = new FormData();
    formData.append('id', id);
    formData.append('type', type);

    // --- Optimistic UI Update ---
    const wasFavorited = icon.classList.contains('favorited');
    icon.classList.toggle('favorited', !wasFavorited);
    wrapperElement.classList.toggle('is-favorited', !wasFavorited);
    // --- End Optimistic Update ---

    fetch('toggle_favorite.php', { method: 'POST', body: formData })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (!data || !data.status) {
                throw new Error("Invalid JSON response from server.");
            }

            if (data.status === 'error') {
                showModal('Error', data.message, false);
                // Revert UI on error
                icon.classList.toggle('favorited', wasFavorited);
                wrapperElement.classList.toggle('is-favorited', wasFavorited);
            }
            else if (data.status === 'removed') {
                // If on favorites page, reload (or remove card dynamically)
                if (window.location.pathname.includes('favorites')) {
                    // Option 1: Reload (Simpler)
                    window.location.reload();
                    // Option 2: Find and remove the parent card (More complex UI update)
                    // wrapperElement.closest('.movie-card')?.remove(); 
                }
            }
            // 'favorited' status needs no special action due to optimistic update

        })
        .catch((error) => {
            console.error("Toggle Favorite Error:", error);
            showModal('Error', 'Network error or invalid server response. Could not update favorite status.', false);
            // Revert UI changes on error
            icon.classList.toggle('favorited', wasFavorited);
            wrapperElement.classList.toggle('is-favorited', wasFavorited);
        });
}

// ==================================================================
// ==         MY FAVORITES PAGE LOGIC (RESTORED HERE)            ==
// ==================================================================

/**
 * Checks if the current page is the favorites page and loads initial favorites.
 * This listener runs *after* the main DOMContentLoaded listener.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Check if we are on the Favorites page by looking for the grid element
    if (document.getElementById('favorites-grid')) {
        loadFavorites(1); // Load the first page of favorites
    }
});


/**
 * Fetches and displays a specific page of favorite items (movies AND series).
 * Uses createMovieCardHTML and createSeriesCardHTML which should be available
 * either in this file or in main.js
 */
function loadFavorites(page = 1) {
    const grid = document.getElementById('favorites-grid');
    // Check again if grid exists before proceeding
    if (!grid) {
        console.error("Favorites grid not found on the page.");
        return;
    }

    grid.innerHTML = '<p class="loading-text">Loading your favorite movies...</p>';

    fetch(`get_favorites.php?page=${page}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            grid.innerHTML = ''; // Clear loading message

            if (data.movies && data.movies.length > 0) {
                data.movies.forEach(item => {
                    let cardHTML = '';

                    // Use the globally available card creation functions
                    if (item.type === 'movie' && typeof createMovieCardHTML === 'function') {
                        cardHTML = createMovieCardHTML(item);
                    } else if (item.type === 'series' && typeof createSeriesCardHTML === 'function') {
                        cardHTML = createSeriesCardHTML(item);
                    } else {
                        console.warn("Card creation function not found for type:", item.type);
                    }

                    if (cardHTML) {
                        grid.insertAdjacentHTML('beforeend', cardHTML);
                    }
                });
            } else {
                // Show "No Favorites" message
                grid.innerHTML = `
                    <div class="no-favorites-container">
                        <i class="fas fa-heart-broken"></i>
                        <h2>No Favorites Yet</h2>
                        <p>You haven't added any movies or series to your favorites. Start exploring and click the star icon on any card to save it here!</p>
                        <a href="movies" class="cta-button">Browse Movies</a>
                    </div>
                `;
            }

            // Render pagination buttons using the dedicated function
            renderFavoritesPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading favorites:', error);
            grid.innerHTML = '<p class="error-message">Failed to load your favorite movies. Please try again later.</p>';
        });
}

/**
 * Renders the pagination buttons for the Favorites page.
 */
function renderFavoritesPagination(paginationData) {
    const paginationContainer = document.getElementById('favorites-pagination');
    if (!paginationContainer) return; // Exit if container not found

    // Ensure paginationData exists and has necessary properties
    if (!paginationData || typeof paginationData.currentPage === 'undefined' || typeof paginationData.totalPages === 'undefined') {
        console.error("Invalid pagination data received:", paginationData);
        paginationContainer.innerHTML = ''; // Clear any previous buttons
        return;
    }

    const { currentPage, totalPages } = paginationData;
    paginationContainer.innerHTML = ''; // Clear previous buttons

    if (totalPages <= 1) return; // Don't show pagination if only one page

    // Previous Button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '« Prev';
        prevBtn.className = 'pagination-btn';
        prevBtn.setAttribute('onclick', `loadFavorites(${currentPage - 1})`);
        paginationContainer.appendChild(prevBtn);
    }

    // Page Number Buttons (Simplified loop)
    // For many pages, you'd add logic for "..." indicators
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-btn';
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.setAttribute('onclick', `loadFavorites(${i})`);
        paginationContainer.appendChild(button);
    }

    // Next Button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next »';
        nextBtn.className = 'pagination-btn';
        nextBtn.setAttribute('onclick', `loadFavorites(${currentPage + 1})`);
        paginationContainer.appendChild(nextBtn);
    }
}

// ==============================================
// ==         LIVE SEARCH FUNCTIONALITY        ==
// ==============================================

function setupLiveSearch() {
    const searchInput = document.getElementById('main-search-input');
    const resultsContainer = document.getElementById('search-results-container');
    let debounceTimeout;

    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimeout);

            if (query.length < 2) {
                resultsContainer.style.display = 'none';
                return;
            }

            debounceTimeout = setTimeout(() => {
                fetch(`live_search.php?query=${encodeURIComponent(query)}`)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        resultsContainer.innerHTML = '';
                        if (data && data.length > 0) {
                            data.forEach(item => {
                                // ⭐ 1. Title එක Clean කරන කොටස මෙතනට දැම්මා
                                let displayTitle = item.title.replace('(Not Original)', '').trim();

                                const itemLink = document.createElement('a');
                                let detailUrl = '';

                                if (item.slug) {
                                    detailUrl = (item.type === 'series')
                                        ? `series/${item.slug}`
                                        : `movie/${item.slug}`;
                                } else {
                                    detailUrl = (item.type === 'series')
                                        ? `series/${item.id}`
                                        : `movie/${item.id}`;
                                }

                                itemLink.href = "javascript:void(0)";
                                itemLink.classList.add('search-result-item');
                                
                                itemLink.onclick = function(e) {
                                    e.preventDefault();
                                    window.location.href = detailUrl;
                                };

                                // ⭐ 2. මෙතන displayTitle පාවිච්චි කරන්න (Image Alt එකටත් දැම්මා)
                                itemLink.innerHTML = `
                                    <img src="${item.poster || 'images/placeholder.png'}" alt="${displayTitle} Poster" loading="lazy">
                                    <div class="search-result-info">
                                        <span class="search-result-title">${displayTitle}</span>
                                        <span class="search-result-year">${item.year || ''}</span>
                                    </div>
                                `;
                                resultsContainer.appendChild(itemLink);
                            });
                            resultsContainer.style.display = 'block';
                        } else {
                            resultsContainer.innerHTML = '<div class="search-result-item" style="justify-content: center; cursor: default;">No results found.</div>';
                            resultsContainer.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching search results:', error);
                        resultsContainer.innerHTML = '<div class="search-result-item error-message" style="justify-content: center; cursor: default;">Could not load results.</div>';
                        resultsContainer.style.display = 'block';
                    });
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (resultsContainer && searchInput && !searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    } else {
        console.warn("Live search elements not found.");
    }
}

// ==================================================
// ==         HERO SECTION SLIDESHOW LOGIC         ==
// ==================================================
function setupHeroSlideshow() {
    const slidesContainer = document.querySelector('.hero-slideshow-container');
    if (!slidesContainer) return; // Exit if slideshow container not found

    const slides = slidesContainer.querySelectorAll('.hero-slide');
    let currentSlideIndex = 0;

    if (slides.length > 1) {
        // Make the first slide active initially ONLY if it's not already active
        if (!slides[0].classList.contains('active')) {
            slides[0].classList.add('active');
        }

        setInterval(() => {
            if (slides[currentSlideIndex]) { // Check if slide exists
                slides[currentSlideIndex].classList.remove('active');
            }

            currentSlideIndex = (currentSlideIndex + 1) % slides.length;

            if (slides[currentSlideIndex]) { // Check if next slide exists
                slides[currentSlideIndex].classList.add('active');
            }

        }, 5000);
    } else if (slides.length === 1 && !slides[0].classList.contains('active')) {
        // If there's only one slide, ensure it's active
        slides[0].classList.add('active');
    }
}

function handleGetStartedClick(isLoggedIn, hasAccess) {
    console.log("handleGetStartedClick called!"); // 1. Function එක call වෙනවද?
    console.log("isLoggedIn:", isLoggedIn, "hasAccess:", hasAccess); // 2. අගයන් හරිද?

    if (!isLoggedIn) {
        window.location.href = 'login';
    } else if (hasAccess) {
        const trendingSection = document.getElementById('trending-section');
        console.log("Trending section found:", trendingSection); // 3. Section එක හම්බවෙනවද?
        if (trendingSection) {
            trendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.error("Trending section element not found!"); // 4. Error එකක්ද?
        }
    } else {
        window.location.href = 'pricing';
    }
}

// ==================================================================
// ==       REUSABLE FUNCTIONS (MOVED/ADDED FOR COLLECTIONS)     ==
// ==================================================================

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


/**
 * Builds HTML for a single Collection card (NEW).
 * @param {Object} collection
 * @returns {string} HTML for the collection card.
 */
function createCollectionCardHTML(collection) {
    if (!collection || !collection.collection_name) {
        console.error("Invalid collection data for card:", collection);
        return "";
    }
    // Slug එකක් පාවිච්චි කරමු
    const detailUrl = `movie-collection/${slugify(collection.collection_name)}`;

    // .movie-card එකේ styles ම re-use කරමු
    return `
        <div class="movie-card" onclick="window.location.href='${detailUrl}'">
            <div class="card-image-container">
                <img src="${collection.poster_url || 'assets/images/placeholder.png'}" alt="${collection.collection_name} Poster" loading="lazy">
                <div class="card-overlay">
                    <i class="fas fa-play watch-icon"></i>
                    <h3 class="card-title-overlay">${collection.collection_name}</h3>
                    </div>
            </div>
            <p class="movie-title">${collection.collection_name}</p>
        </div>
    `;
}

// ===== FEATURES MODAL FUNCTIONS =====

// Get Started Button Click Handler
function handleGetStartedClick(isLoggedIn, hasSubscriptionOrTrial) {
    if (!isLoggedIn) {
        // Guest user - Show features modal
        openFeaturesModal();
    } else if (!hasSubscriptionOrTrial) {
        // Logged in but no subscription/trial - Redirect to pricing
        window.location.href = 'pricing';
    } else {
        // Has subscription/trial - Redirect to movies
        window.location.href = 'all_movies';
    }
}

// Open Features Modal
function openFeaturesModal() {
    const modal = document.getElementById('features-offer-modal');
    if (modal) {
        modal.style.display = 'flex'; // ✅ 'flex' කරන්න ඕනි
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

// Close Features Modal
function closeFeaturesModal() {
    const modal = document.getElementById('features-offer-modal');
    if (modal) {
        modal.style.display = 'none';
        // Re-enable body scroll
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('features-offer-modal');

    if (modal) {
        modal.addEventListener('click', function (e) {
            // Close if clicking on the overlay (not the modal box)
            if (e.target === modal) {
                closeFeaturesModal();
            }
        });
    }
});