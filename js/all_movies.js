// ==================================================================
// ==                 ALL MOVIES PAGE LOGIC (UPDATED)              ==
// ==================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Check if we are on the All Movies page
    const allMoviesGrid = document.getElementById('all-movies-grid');
    if (allMoviesGrid) {

        // Initial load of movies
        loadAllMovies();

        // Add event listeners to all filter controls
        document.getElementById('all-movies-search').addEventListener('input', () => loadAllMovies(1));
        document.getElementById('filter-category').addEventListener('change', () => loadAllMovies(1));
        document.getElementById('filter-language').addEventListener('change', () => loadAllMovies(1));
        document.getElementById('filter-year').addEventListener('change', () => loadAllMovies(1));
        
        // ⭐️ NEW: Actor filter event listeners ⭐️
        document.getElementById('filter-actor').addEventListener('input', handleActorSearch);
        document.getElementById('actor-clear-btn').addEventListener('click', clearActorFilter);
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            const suggestionsBox = document.getElementById('actor-suggestions');
            const actorInput = document.getElementById('filter-actor');
            if (suggestionsBox && actorInput && !actorInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                hideActorSuggestions();
            }
        });
    }
});

/**
 * Fetches and displays movies based on current filter settings and page number.
 * (UPDATED to include actor filter)
 */
function loadAllMovies(page = 1) {
    const grid = document.getElementById('all-movies-grid');
    if (!grid) return;

    const searchQuery = document.getElementById('all-movies-search').value;
    const categoryId = document.getElementById('filter-category').value;
    const languageId = document.getElementById('filter-language').value;
    const year = document.getElementById('filter-year').value;
    const actorId = document.getElementById('filter-actor-id').value;

    grid.innerHTML = '<p class="loading-text">Loading movies...</p>';

    const params = new URLSearchParams({
        page: page,
        search: searchQuery,
        category: categoryId,
        language: languageId,
        year: year,
        actor: actorId
    });

    fetch(`get_all_movies.php?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            grid.innerHTML = '';

            if (data.movies && data.movies.length > 0) {
                data.movies.forEach(movie => {
                    if (typeof createMovieCardHTML === 'function') {
                        const movieCardHTML = createMovieCardHTML(movie); 
                        grid.insertAdjacentHTML('beforeend', movieCardHTML);
                    } else {
                        console.error("createMovieCardHTML function is missing. Please check main.js");
                    }
                });
            } else {
                grid.innerHTML = '<p class="no-movies">No movies found matching your criteria.</p>';
            }

            renderAllMoviesPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading movies:', error);
            grid.innerHTML = `<p class="error-message">Failed to load movies: ${error.message}</p>`;
        });
}

/**
 * Renders the pagination buttons for the All Movies page.
 */
function renderAllMoviesPagination(paginationData) {
    const { currentPage, totalPages } = paginationData;
    const paginationContainer = document.getElementById('all-movies-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    const createButton = (pageNumber) => {
        const button = document.createElement('button');
        button.textContent = pageNumber;
        button.className = 'pagination-btn';
        if (pageNumber === currentPage) {
            button.classList.add('active');
        }
        button.setAttribute('onclick', `loadAllMovies(${pageNumber})`);
        return button;
    };

    if (currentPage > 1) {
        const prevBtn = createButton(currentPage - 1);
        prevBtn.textContent = '« Prev';
        paginationContainer.appendChild(prevBtn);
    }
    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.appendChild(createButton(i));
    }
    if (currentPage < totalPages) {
        const nextBtn = createButton(currentPage + 1);
        nextBtn.textContent = 'Next »';
        paginationContainer.appendChild(nextBtn);
    }
}

// ==================================================================
// ==           NEW ACTOR FILTER JAVASCRIPT FUNCTIONS            ==
// ==================================================================
let actorSearchTimeout;

/**
 * Handles typing in the actor search box (with debouncing).
 */
function handleActorSearch(event) {
    const query = event.target.value.trim();
    const suggestionsBox = document.getElementById('actor-suggestions');

    // Clear previous timeout
    clearTimeout(actorSearchTimeout);

    if (query.length < 2) {
        hideActorSuggestions();
        return;
    }

    // Set a new timeout (debouncing)
    actorSearchTimeout = setTimeout(() => {
        fetch(`get_actors_autocomplete.php?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(actors => {
                renderActorSuggestions(actors);
            })
            .catch(error => console.error('Error fetching actors:', error));
    }, 300); // 300ms delay
}

/**
 * Renders the fetched actor suggestions in the dropdown.
 */
function renderActorSuggestions(actors) {
    const suggestionsBox = document.getElementById('actor-suggestions');
    if (!suggestionsBox) return;

    suggestionsBox.innerHTML = '';
    if (actors.length > 0) {
        actors.forEach(actor => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            
            // ⭐️ FIX: Add img tag and span for name ⭐️
            suggestionItem.innerHTML = `
                <img src="${actor.image_url}" alt="${actor.name}" class="suggestion-actor-image">
                <span class="suggestion-actor-name">${actor.name}</span>
            `;
            
            suggestionItem.setAttribute('data-id', actor.id);
            suggestionItem.addEventListener('click', () => selectActor(actor.id, actor.name));
            suggestionsBox.appendChild(suggestionItem);
        });
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
}

/**
 * Handles selecting an actor from the suggestion list.
 */
function selectActor(id, name) {
    document.getElementById('filter-actor').value = name;
    document.getElementById('filter-actor-id').value = id;
    document.getElementById('actor-clear-btn').style.display = 'inline-block';
    hideActorSuggestions();
    loadAllMovies(1); // Reload movies with the new actor filter
}

/**
 * Hides the actor suggestion box.
 */
function hideActorSuggestions() {
    const suggestionsBox = document.getElementById('actor-suggestions');
    if (suggestionsBox) {
        suggestionsBox.style.display = 'none';
    }
}

/**
 * Clears the actor filter and reloads the movies.
 */
function clearActorFilter() {
    document.getElementById('filter-actor').value = '';
    document.getElementById('filter-actor-id').value = 0;
    document.getElementById('actor-clear-btn').style.display = 'none';
    hideActorSuggestions();
    loadAllMovies(1); // Reload movies without the actor filter
}