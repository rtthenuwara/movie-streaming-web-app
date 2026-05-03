// ==================================================================
// ==                 ALL SERIES PAGE LOGIC                        ==
// ==================================================================

document.addEventListener('DOMContentLoaded', function () {
    // 'all-movies-grid' වෙනුවට 'all-series-grid' එක ඇත්දැයි බැලීම
    const allSeriesGrid = document.getElementById('all-series-grid');
    if (allSeriesGrid) {

        // 'loadAllMovies' වෙනුවට 'loadAllSeries' call කිරීම
        loadAllSeries();

        // අලුත් ID වලට event listeners යෙදීම
        document.getElementById('all-series-search').addEventListener('input', () => loadAllSeries(1));
        document.getElementById('series-filter-category').addEventListener('change', () => loadAllSeries(1));
        document.getElementById('series-filter-language').addEventListener('change', () => loadAllSeries(1));
        document.getElementById('series-filter-year').addEventListener('change', () => loadAllSeries(1));
    }
});

/**
 * Fetches and displays series based on current filter settings and page number.
 */
function loadAllSeries(page = 1) { // 'loadAllMovies' -> 'loadAllSeries'
    const grid = document.getElementById('all-series-grid'); // ID වෙනස් කිරීම
    if (!grid) return;

    // අලුත් ID වලින් filter values ලබා ගැනීම
    const searchQuery = document.getElementById('all-series-search').value;
    const categoryId = document.getElementById('series-filter-category').value;
    const languageId = document.getElementById('series-filter-language').value;
    const year = document.getElementById('series-filter-year').value;

    grid.innerHTML = '<p class="loading-text">Loading TV series...</p>';

    const params = new URLSearchParams({
        page: page,
        search: searchQuery,
        category: categoryId,
        language: languageId,
        year: year
    });

    // 'get_all_movies.php' වෙනුවට 'get_all_series.php' වෙත fetch කිරීම
    fetch(`get_all_series.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            grid.innerHTML = ''; 

            // 'data.movies' වෙනුවට 'data.series' පරීක්ෂා කිරීම
            if (data.series && data.series.length > 0) {
                // 'data.movies.forEach' -> 'data.series.forEach'
                data.series.forEach(series => {
                    // ⭐️ CRUCIAL: 'createMovieCardHTML' වෙනුවට 'createSeriesCardHTML' call කිරීම
                    const seriesCardHTML = createSeriesCardHTML(series); 
                    grid.insertAdjacentHTML('beforeend', seriesCardHTML);
                });
            } else {
                grid.innerHTML = '<p class="no-movies">No TV series found matching your criteria.</p>';
            }

            // 'renderAllMoviesPagination' -> 'renderAllSeriesPagination'
            renderAllSeriesPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading TV series:', error);
            grid.innerHTML = '<p class="error-message">Failed to load TV series. Please try again later.</p>';
        });
}

/**
 * Renders the pagination buttons for the All Series page.
 */
function renderAllSeriesPagination(paginationData) { // Function නම වෙනස් කිරීම
    const { currentPage, totalPages } = paginationData;
    const paginationContainer = document.getElementById('all-series-pagination'); // ID වෙනස් කිරීම
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
        // 'loadAllMovies' -> 'loadAllSeries'
        button.setAttribute('onclick', `loadAllSeries(${pageNumber})`); 
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

