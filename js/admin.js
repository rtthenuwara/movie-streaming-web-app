// ==================================================================
// ==                 PLEXZONE ADMIN JAVASCRIPT                    ==
// ==================================================================

// --- Global variables for state tracking ---
let currentMovieListPage = 1;
let currentSearchQuery = '';
let currentUserListPage = 1;
let currentUserSearchQuery = '';
let currentTvSeriesListPage = 1;
let currentTvSeriesSearchQuery = '';
let seasonCounter = 0;
let currentMessagesFilter = 'active';
let overviewChartInstance = null;
let currentActorListPage = 1;
let currentActorSearchQuery = '';
let actorSearchDebounceTimeout;
let collectionSearchDebounceTimeout; // (FIX) Add this line

/**
 * Main function that runs after the HTML document is fully loaded.
 * It initializes all the event listeners and default actions.
 */
document.addEventListener('DOMContentLoaded', function () {


    // --- Sidebar Navigation Logic ---
    setupSidebarNavigation();
    setupSidebarToggle();

    // --- Setup for the ADMIN DASHBOARD ---
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        // Load data immediately if dashboard is the active page on load
        if (dashboardPage.classList.contains('active')) {
            loadDashboardData();
        }
        populateRevenueYearSelector(); // Populate year selector for the modal
    }

    // --- Modal Logic for "Add Movie" (Main Modal) ---
    setupAddMovieModal();


    // --- Populate Year Pickers for both Modals ---
    populateYearPicker('movie_year');
    populateYearPicker('edit_movie_year');
    populateYearPicker('tv_year');
    populateYearPicker('edit_tv_year');
    setupEditTvSeriesModalListeners();

    // --- Initial Load for Movies Page ---
    if (document.getElementById('movies-page')) {
        loadMovies(1); // Load page 1 by default

        // Add the movie search input event listener
        const movieSearchInput = document.getElementById('movie-search-input');
        movieSearchInput.addEventListener('input', function () {
            currentSearchQuery = this.value;
            loadMovies(1, currentSearchQuery);
        });
    }

    // --- Setup TV Series Modal Logic ---
    setupAddTvSeriesModal();

    // --- Setup Actor & Collection Search for Modals ---
    setupActorSelection('add-movie-modal');
    setupActorSelection('edit-movie-modal');
    setupActorSelection('add-tv-series-modal');
    setupActorSelection('edit-tv-series-modal');
    setupCollectionSearch('add-movie-modal');   // (FIX) Add this line
    setupCollectionSearch('edit-movie-modal');  // (FIX) Add this line


    // --- Initial Load for Users Page ---
    if (document.getElementById('users-page')) {
        loadUsers(1);

        const userSearchInput = document.getElementById('user-search-input');
        userSearchInput.addEventListener('input', function () {
            currentUserSearchQuery = this.value;
            loadUsers(1, currentUserSearchQuery);
        });
    }


    // --- Initial Load for TV Series Page ---
    if (document.getElementById('tv-series-page')) {
        loadTvSeries(1);

        const tvSeriesSearchInput = document.getElementById('tv-series-search-input');
        tvSeriesSearchInput.addEventListener('input', function () {
            currentTvSeriesSearchQuery = this.value;
            loadTvSeries(1, currentTvSeriesSearchQuery);
        });
    }

    // --- Initial Load for Messages & Requests Page ---
    if (document.getElementById('messages-requests-page')) {
        loadMessagesRequests();
    }

    // --- Initial Load for Actors Page ---
    if (document.getElementById('actors-page')) {
        loadActors(1);
        setupAddActorModalListeners();

        const actorSearchInput = document.getElementById('actor-search-input');
        actorSearchInput.addEventListener('input', function () {
            currentActorSearchQuery = this.value;
            loadActors(1, currentActorSearchQuery);
        });
    }

    // --- CONSOLIDATED Window Click Listener for ALL Modals ---
    window.addEventListener('click', function (event) {
        const addMovieModal = document.getElementById('add-movie-modal');
        const editMovieModal = document.getElementById('edit-movie-modal');
        const paymentModal = document.getElementById('add-payment-modal');
        const historyModal = document.getElementById('user-history-modal');
        const addTvSeriesModal = document.getElementById('add-tv-series-modal');
        const editTvSeriesModal = document.getElementById('edit-tv-series-modal');

        if (event.target == addMovieModal) {
            addMovieModal.style.display = 'none';
            document.getElementById('add-movie-form').reset();
            resetActorSelection('add-movie-modal');     // (FIX) Reset actors
            resetCollectionSearch('add-movie-modal'); // (FIX) Reset collection
        }
        if (event.target == editMovieModal) {
            editMovieModal.style.display = 'none';
        }
        if (event.target == paymentModal) {
            closeAddPaymentModal();
        }
        if (event.target == historyModal) {
            historyModal.style.display = 'none';
        }
        if (event.target == addTvSeriesModal) {
            addTvSeriesModal.style.display = 'none';
            resetTvSeriesForm();
        }
        if (event.target == editTvSeriesModal) {
            editTvSeriesModal.style.display = 'none';
        }
        const revenueModal = document.getElementById('revenue-lookup-modal');
        if (event.target == revenueModal) {
            closeRevenueModal();
        }
        const addActorModal = document.getElementById('add-actor-modal');
        if (event.target == addActorModal) {
            closeAndResetModal('add-actor-modal', 'add-actor-form');
        }
        const editActorModal = document.getElementById('edit-actor-modal');
        if (event.target == editActorModal) {
            closeAndResetModal('edit-actor-modal', 'edit-actor-form');
        }
    }); // End of window click listener

}); // This is the closing tag of DOMContentLoaded


// ==================================================================
// ==                      SETUP FUNCTIONS                         ==
// ==================================================================

function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const pages = document.querySelectorAll('.admin-page');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');

            if (pageId) {
                navItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                pages.forEach(page => {
                    page.classList.toggle('active', page.id === pageId);
                });
            }
        });
    });
}

function setupAddMovieModal() {
    const mainModal = document.getElementById('add-movie-modal');
    const addMovieBtn = document.getElementById('add-movie-btn');
    const closeMainModalBtn = mainModal.querySelector('.close-btn');

    if (addMovieBtn) {
        addMovieBtn.onclick = function () {
            mainModal.style.display = 'flex';
        }
    }
    if (closeMainModalBtn) {
        closeMainModalBtn.onclick = function () {
            mainModal.style.display = 'none';
            const form = document.getElementById('add-movie-form');
            if (form) form.reset();
            resetActorSelection('add-movie-modal');
            resetCollectionSearch('add-movie-modal'); // (FIX) Add this line
        }
    }
}

async function loadDashboardData() {
    try {
        const response = await fetch('get_dashboard_data.php');
        if (!response.ok) { throw new Error('Network response failed'); }
        const data = await response.json();

        if (data.status === 'success') {
            document.getElementById('total-movies-count').textContent = data.totalMovies || '0';
            document.getElementById('total-series-count').textContent = data.totalSeries || '0';
            document.getElementById('total-users-count').textContent = data.totalUsers || '0';
            document.getElementById('active-subscribers-count').textContent = data.activeSubscribers || '0';
            document.getElementById('current-month-revenue').textContent = `LKR ${data.currentMonthRevenue || '0.00'}`;
            document.getElementById('today-revenue').textContent = `LKR ${data.todayRevenue || '0.00'}`;
            initializeDashboardChart(data.chartData);
            loadTopFavorites();
        } else {
            console.error('Failed to load dashboard data:', data.message);
            showModal('Error', 'Could not load dashboard data.', false);
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showModal('Error', 'An error occurred while fetching dashboard data.', false);
    }
}

async function loadTopFavorites() {
    const listContainer = document.getElementById('top-favorites-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p class="loading-placeholder">Loading top favorites...</p>';

    try {
        const response = await fetch('get_top_favorites.php');
        if (!response.ok) { throw new Error(`HTTP Error: ${response.status}`); }
        const result = await response.json();

        listContainer.innerHTML = '';

        if (result.status === 'success' && result.data && result.data.length > 0) {
            result.data.forEach(item => {
                const itemHTML = `
                    <div class="favorite-item-card">
                        <img src="${item.poster_url}" alt="${item.title}">
                        <div class="favorite-item-info">
                            <h3>${item.title}</h3>
                            <p>${item.year} <span style="text-transform: capitalize;">(${item.type.replace('_', ' ')})</span></p>
                            <p class="fav-count"><i class="fas fa-star"></i> ${item.count} Favorites</p>
                        </div>
                    </div>
                `;
                listContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        } else if (result.status === 'success') {
            listContainer.innerHTML = '<p class="no-items-placeholder">No favorited items found yet.</p>';
        } else {
            throw new Error(result.message || 'Unknown error from server.');
        }

    } catch (error) {
        console.error('Error loading top favorites:', error);
        listContainer.innerHTML = '<p class="no-items-placeholder error-message">Failed to load top favorited items.</p>';
    }
}

function initializeDashboardChart(chartData) {
    const overviewChartCtx = document.getElementById('overviewChart');
    if (!overviewChartCtx) return;

    const data = chartData || { labels: [], revenueData: [], userData: [] };

    if (overviewChartInstance) {
        overviewChartInstance.destroy();
    }

    overviewChartInstance = new Chart(overviewChartCtx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Monthly Revenue (LKR)',
                    data: data.revenueData,
                    backgroundColor: 'rgba(0, 200, 255, 0.6)',
                    borderColor: 'rgba(0, 200, 255, 1)',
                    borderWidth: 1,
                    yAxisID: 'yRevenue',
                    order: 2
                },
                {
                    label: 'New Users',
                    data: data.userData,
                    type: 'line',
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'yUsers',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#c0c0c0' } },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    ticks: { color: '#c0c0c0' },
                    grid: { color: 'rgba(192, 192, 192, 0.1)' }
                },
                yRevenue: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        color: '#c0c0c0',
                        callback: function (value, index, values) {
                            return 'LKR ' + value.toFixed(0);
                        }
                    },
                    grid: { color: 'rgba(192, 192, 192, 0.2)' },
                    title: {
                        display: true,
                        text: 'Revenue (LKR)',
                        color: '#c0c0c0'
                    }
                },
                yUsers: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    ticks: { color: '#c0c0c0' },
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: 'New Users',
                        color: '#c0c0c0'
                    }
                }
            }
        }
    });
}

// ==================================================================
// ==         MONTHLY REVENUE LOOKUP MODAL FUNCTIONS             ==
// ==================================================================

function populateRevenueYearSelector() {
    const yearSelect = document.getElementById('revenue_year');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    const startYear = 2024;

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

function openRevenueModal() {
    const modal = document.getElementById('revenue-lookup-modal');
    if (modal) {
        document.getElementById('revenue-lookup-result').style.display = 'none';
        document.getElementById('revenue_month').value = new Date().getMonth() + 1;
        document.getElementById('revenue_year').value = new Date().getFullYear();
        modal.style.display = 'flex';
    }
}

function closeRevenueModal() {
    const modal = document.getElementById('revenue-lookup-modal');
    if (modal) modal.style.display = 'none';
}

function lookupRevenue() {
    const year = document.getElementById('revenue_year').value;
    const month = document.getElementById('revenue_month').value;
    const resultDiv = document.getElementById('revenue-lookup-result');
    const titleEl = document.getElementById('revenue-result-title');
    const amountEl = document.getElementById('revenue-result-amount');
    const messageEl = document.getElementById('revenue-result-message');

    if (!year || !month) {
        showModal('Error', 'Please select both year and month.', false);
        return;
    }

    resultDiv.style.display = 'block';
    titleEl.textContent = 'Loading...';
    amountEl.textContent = '';
    messageEl.textContent = '';

    fetch(`get_monthly_revenue.php?year=${year}&month=${month}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                titleEl.textContent = data.message || `Revenue for ${month}/${year}`;
                amountEl.textContent = `LKR ${data.revenue || '0.00'}`;
                messageEl.textContent = '';
            } else {
                titleEl.textContent = 'Error';
                amountEl.textContent = '--.--';
                messageEl.textContent = data.message || 'Could not fetch revenue data.';
            }
        })
        .catch(error => {
            console.error('Error looking up revenue:', error);
            titleEl.textContent = 'Error';
            amountEl.textContent = '--.--';
            messageEl.textContent = 'An unexpected error occurred.';
        });
}

// ==================================================================
// ==                 TV SERIES MODAL SETUP                    ==
// ==================================================================

function setupAddTvSeriesModal() {
    const modal = document.getElementById('add-tv-series-modal');
    if (!modal) return;

    const addSeriesBtn = document.getElementById('add-tv-series-btn');
    const closeBtn = modal.querySelector('.close-btn');
    const addSeasonBtn = document.getElementById('add-season-btn');
    const seasonListContainer = document.getElementById('season-list-container');

    if (addSeriesBtn) {
        addSeriesBtn.onclick = function () {
            modal.style.display = 'flex';
        }
    }

    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = 'none';
            resetTvSeriesForm();
        }
    }

    if (addSeasonBtn) {
        addSeasonBtn.onclick = function () {
            const template = document.getElementById('season-card-template');
            if (!template) {
                console.error('Season card template not found!');
                return;
            }
            const newSeasonCard = template.content.cloneNode(true);
            const seasonCardElement = newSeasonCard.querySelector('.season-card');

            attachSeasonToggle(seasonCardElement);

            seasonCardElement.id = `season-card-${seasonCounter}`;
            const addEpisodeBtnInner = newSeasonCard.querySelector('.add-episode-btn-inner');
            const currentSeasonIndex = seasonCounter;
            addEpisodeBtnInner.onclick = function () {
                addEpisodeToSeason(seasonCardElement, currentSeasonIndex);
            };

            seasonListContainer.appendChild(newSeasonCard);
            seasonCounter++;
        }
    }

    if (seasonListContainer) {
        seasonListContainer.onclick = function (e) {
            if (e.target.classList.contains('remove-episode-btn')) {
                e.target.closest('.episode-card').remove();
            }
            if (e.target.classList.contains('remove-season-btn')) {
                e.target.closest('.season-card').remove();
            }
        }
    }
}

function addEpisodeToSeason(seasonCardElement, seasonIndex) {
    const episodeListWrapper = seasonCardElement.querySelector('.episode-list-wrapper');
    if (!episodeListWrapper) {
        console.error('Episode list wrapper not found in season card.');
        return;
    }

    const episodeCard = document.createElement('div');
    episodeCard.className = 'episode-card';

    const seasonSelect = seasonCardElement.querySelector('.season-select');
    const selectedSeasonId = seasonSelect ? seasonSelect.value : '';

    if (!selectedSeasonId) {
        showModal('Error', 'Please select a season for the card before adding episodes.', false);
        return;
    }

    const hiddenInput = `<input type="hidden" name="episode_season_id[]" value="${selectedSeasonId}">`;
    let episodeCounter = episodeListWrapper.children.length + 1;
    let episodeFormIndex = episodeListWrapper.children.length;

    episodeCard.innerHTML = `
    <div class="episode-inputs-wrapper">
        ${hiddenInput}
        <select name="episode_name[]" required>
            <option value="" disabled selected>Select Episode No.</option>
            ${generateEpisodeOptions()}
        </select>
        <input type="text" name="episode_title[]" placeholder="Episode Title (e.g., The Pilot)" required>
        <input type="url" name="episode_link[]" placeholder="Episode Link" required>
    </div>

    <div class="subtitle-upload-section">
        <label style="font-size:0.8rem; margin-bottom:0.5rem;">Subtitles (Optional, .srt)</label>
        <div class="subtitle-inputs-grid">
             <div class="input-group">
                 <label for="ep_${seasonIndex}_${episodeCounter}_sub_si">Sinhala</label>
                 <input type="file" id="ep_${seasonIndex}_${episodeCounter}_sub_si" name="episode_subtitle_si[${episodeFormIndex}]" accept=".srt">
             </div>
             <div class="input-group">
                 <label for="ep_${seasonIndex}_${episodeCounter}_sub_en">English</label>
                 <input type="file" id="ep_${seasonIndex}_${episodeCounter}_sub_en" name="episode_subtitle_en[${episodeFormIndex}]" accept=".srt">
             </div>
             <div class="input-group">
                 <label for="ep_${seasonIndex}_${episodeCounter}_sub_ta">Tamil</label>
                 <input type="file" id="ep_${seasonIndex}_${episodeCounter}_sub_ta" name="episode_subtitle_ta[${episodeFormIndex}]" accept=".srt">
             </div>
         </div>
    </div>

    <button type="button" class="remove-episode-btn" title="Remove episode">&times;</button> 
`;

    episodeListWrapper.appendChild(episodeCard);
}

function resetTvSeriesForm() {
    const form = document.getElementById('add-tv-series-form');
    if (form) form.reset();

    const seasonListContainer = document.getElementById('season-list-container');
    if (seasonListContainer) seasonListContainer.innerHTML = '';

    seasonCounter = 0;
    resetActorSelection('add-tv-series-modal');
}

function addTvSeries() {
    const form = document.getElementById('add-tv-series-form');
    const selectedActorsCount = form.querySelectorAll('.selected-actor-tag').length;
    if (selectedActorsCount !== 5) {
        showModal('Validation Error!', 'Please select exactly 5 actors.', false);
        return;
    }
    const formData = new FormData(form);
    const submitButton = form.querySelector('button.cta-button');

    const seasonIDs = formData.getAll('season_id[]');
    if (seasonIDs.length === 0) {
        showModal('Error!', 'Please add at least one season before saving.', false);
        return;
    }

    const episodeNames = formData.getAll('episode_name[]');
    if (episodeNames.length === 0) {
        showModal('Error!', 'Please add at least one episode to a season.', false);
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    fetch('process_add_tv_series.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success!', data.message, true);
                document.getElementById('add-tv-series-modal').style.display = 'none';
                resetTvSeriesForm();
                loadTvSeries(1);
            } else {
                showModal('Error!', data.message, false);
            }
        })
        .catch(error => {
            console.error('Error adding TV Series:', error);
            showModal('Error!', 'An unexpected error occurred. Please check the console.', false);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Save TV Series';
        });
}

function setupEditTvSeriesModalListeners() {
    const modal = document.getElementById('edit-tv-series-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = 'none';
        }
    }

    const addSeasonBtn = document.getElementById('edit-add-season-btn');
    const seasonListContainer = document.getElementById('edit-season-list-container');

    if (addSeasonBtn) {
        addSeasonBtn.onclick = function () {
            addSeasonToEditModal(null, seasonCounter);
            seasonCounter++;
        }
    }

    if (seasonListContainer) {
        seasonListContainer.onclick = function (e) {
            if (e.target.classList.contains('remove-episode-btn')) {
                e.target.closest('.episode-card').remove();
            }
            if (e.target.classList.contains('remove-season-btn')) {
                e.target.closest('.season-card').remove();
            }
        }
    }
}

function addSeasonToEditModal(seasonId, index) {
    const seasonListContainer = document.getElementById('edit-season-list-container');
    const template = document.getElementById('season-card-template');
    if (!template) {
        console.error('season-card-template not found!');
        return;
    }

    const newSeasonCard = template.content.cloneNode(true);
    const seasonCardElement = newSeasonCard.querySelector('.season-card');
    seasonCardElement.id = `edit-season-card-${index}`;

    attachSeasonToggle(seasonCardElement);

    seasonCardElement.classList.add('collapsed');

    if (seasonId) {
        const select = newSeasonCard.querySelector('.season-select');
        select.value = seasonId;
    }

    const addEpisodeBtnInner = newSeasonCard.querySelector('.add-episode-btn-inner');
    addEpisodeBtnInner.onclick = function () {
        addEpisodeToEditSeason(seasonCardElement, null, index);
    };

    seasonListContainer.appendChild(newSeasonCard);
    return seasonCardElement;
}

function addEpisodeToEditSeason(seasonCardElement, episodeData, seasonIndex) {
    const episodeListWrapper = seasonCardElement.querySelector('.episode-list-wrapper');
    if (!episodeListWrapper) { console.error("Episode list wrapper not found."); return; }

    const episodeCard = document.createElement('div');
    episodeCard.className = 'episode-card';

    // Determine season ID
    const seasonSelect = seasonCardElement.querySelector('.season-select');
    const selectedSeasonId = seasonSelect ? seasonSelect.value : '';
    const seasonIdForInput = episodeData ? episodeData.season_id : selectedSeasonId;

    if (!seasonIdForInput) { showModal('Error', 'Cannot determine season ID.', false); return; }

    const hiddenInput = `<input type="hidden" name="episode_season_id[]" value="${seasonIdForInput}">`;

    // Define values
    const epName = episodeData ? episodeData.name : '';
    const epTitle = episodeData ? episodeData.title : '';
    const epLink = episodeData ? episodeData.link : '';

    // FIX: Removed episodeFormIndex dependency for file inputs to fix PHP array mapping issues.
    // Using [] ensures PHP receives files in the exact DOM order, matching the loop $i.

    episodeCard.innerHTML = `
        <div class="episode-inputs-wrapper">
            ${hiddenInput}
            <select name="episode_name[]" required>
                 <option value="" disabled>Select Episode No.</option>
                 ${generateEpisodeOptions()}
            </select>
            <input type="text" name="episode_title[]" value="${epTitle}" placeholder="Episode Title (e.g., The Pilot)" required>
            <input type="url" name="episode_link[]" value="${epLink}" placeholder="Episode Link" required>
        </div>
        
        <div class="subtitle-upload-section">
            <label style="font-size:0.8rem; margin-bottom:0.5rem;">Subtitles (Optional, .srt)</label>
             <div class="subtitle-inputs-grid">
                 <div class="input-group">
                     <label>Sinhala</label> 
                     <input type="file" name="episode_subtitle_si[]" accept=".srt">
                     <div class="subtitle-status">
                        <small class="current-ep-sub" data-lang="si">Current: None</small>
                        <label class="delete-sub-label" style="display: none;">
                            <input type="hidden" name="delete_episode_subtitle_si[]" value="0">
                            <input type="checkbox" onchange="this.previousElementSibling.value = this.checked ? '1' : '0'"> Delete
                        </label>
                     </div>
                 </div>

                 <div class="input-group">
                     <label>English</label>
                    <input type="file" name="episode_subtitle_en[]" accept=".srt">
                    <div class="subtitle-status">
                        <small class="current-ep-sub" data-lang="en">Current: None</small>
                        <label class="delete-sub-label" style="display: none;">
                            <input type="hidden" name="delete_episode_subtitle_en[]" value="0">
                            <input type="checkbox" onchange="this.previousElementSibling.value = this.checked ? '1' : '0'"> Delete
                        </label>
                    </div>
                </div>

                 <div class="input-group">
                     <label>Tamil</label>
                    <input type="file" name="episode_subtitle_ta[]" accept=".srt">
                    <div class="subtitle-status">
                        <small class="current-ep-sub" data-lang="ta">Current: None</small>
                        <label class="delete-sub-label" style="display: none;">
                            <input type="hidden" name="delete_episode_subtitle_ta[]" value="0">
                            <input type="checkbox" onchange="this.previousElementSibling.value = this.checked ? '1' : '0'"> Delete
                        </label>
                    </div>
                </div>
             </div>
         </div>
         
         <button type="button" class="remove-episode-btn" title="Remove episode">&times;</button>
    `;

    episodeListWrapper.appendChild(episodeCard);

    // --- Set Episode Name (Dropdown) ---
    const episodeNameSelect = episodeCard.querySelector('select[name="episode_name[]"]');
    if (episodeNameSelect && epName) {
        episodeNameSelect.value = epName;
        if (episodeNameSelect.value !== epName) episodeNameSelect.selectedIndex = 0;
    }

    // --- Populate Subtitle Status & Toggle Delete Checkbox ---
    const availableEpSubs = episodeData ? (episodeData.available_subtitles || []) : [];
    const subStatusDivs = episodeCard.querySelectorAll('.subtitle-status');

    subStatusDivs.forEach(div => {
        const small = div.querySelector('.current-ep-sub');
        const deleteLabel = div.querySelector('.delete-sub-label');
        // The checkbox is now the second child of the label (after the hidden input)
        const deleteCheckbox = deleteLabel ? deleteLabel.querySelector('input[type="checkbox"]') : null;
        const hiddenDeleteInput = deleteLabel ? deleteLabel.querySelector('input[type="hidden"]') : null;
        const lang = small ? small.dataset.lang : null;

        if (small && lang) {
            const hasSub = availableEpSubs.includes(lang);
            small.textContent = hasSub ? `Current: ${lang}.vtt` : 'Current: None';
            small.classList.toggle('has-subtitle', hasSub);

            // Show delete checkbox if subtitle exists
            if (deleteLabel) {
                deleteLabel.style.display = hasSub ? 'inline-flex' : 'none';
            }
            // Reset checkbox state
            if (deleteCheckbox) {
                deleteCheckbox.checked = false;
                if (hiddenDeleteInput) hiddenDeleteInput.value = '0';
            }
        }
    });
}

function generateEpisodeOptions(maxEpisodes = 50) {
    let optionsHTML = '';
    for (let i = 1; i <= maxEpisodes; i++) {
        const episodeNumber = String(i).padStart(2, '0');
        const optionValue = `Episode ${episodeNumber}`;
        optionsHTML += `<option value="${optionValue}">${optionValue}</option>`;
    }
    return optionsHTML;
}

function loadTvSeries(page = 1, searchQuery = '') {
    currentTvSeriesListPage = page;
    currentTvSeriesSearchQuery = searchQuery.trim();

    const tableBody = document.querySelector('#tv-series-page tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading TV series...</td></tr>';

    const fetchURL = `load_tv_series_process.php?page=${page}&search=${encodeURIComponent(currentTvSeriesSearchQuery)}`;

    fetch(fetchURL)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            if (data.series && data.series.length > 0) {
                data.series.forEach(series => {
                    const row = `
                        <tr>
                            <td><img src="${series.poster_url}" alt="${series.title} Poster" style="height: 50px; border-radius: 5px;"></td>
                            <td>${series.title}</td>
                            <td>${series.category_name}</td>
                            <td>${series.release_year}</td>
                            <td>${series.add_date}</td>
                            <td>
                                <button class="action-btn edit" onclick="editTvSeries(${series.id})" title="Edit"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete" onclick="deleteTvSeries(${series.id})" title="Delete"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No TV series found.</td></tr>';
            }
            renderTvSeriesPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading TV series:', error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load TV series. Please try again.</td></tr>';
        });
}

function renderTvSeriesPagination(paginationData) {
    if (!paginationData) return;
    const { currentPage, totalPages } = paginationData;
    const paginationContainer = document.getElementById('tv-series-pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-btn';
        if (i === currentPage) {
            button.classList.add('active');
        }

        const escapedSearchQuery = currentTvSeriesSearchQuery.replace(/'/g, "\\'");
        button.setAttribute('onclick', `loadTvSeries(${i}, '${escapedSearchQuery}')`);
        paginationContainer.appendChild(button);
    }
}

function editTvSeries(id) {
    const modal = document.getElementById('edit-tv-series-modal');
    const form = document.getElementById('edit-tv-series-form');
    const seasonListContainer = document.getElementById('edit-season-list-container');

    form.reset();
    seasonListContainer.innerHTML = '';
    modal.style.display = 'flex';
    seasonListContainer.innerHTML = '<p>Loading details...</p>';

    fetch(`get_tv_series_details.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                throw new Error(data.message);
            }

            const details = data.data.series_details;
            const seasons = data.data.seasons;
            const images = data.data.image_urls;

            document.getElementById('edit_tv_series_id').value = details.id;
            document.getElementById('edit_tv_title').value = details.title;
            document.getElementById('edit_tv_description').value = details.description;
            document.getElementById('edit_tv_category').value = details.category_id;
            document.getElementById('edit_tv_language').value = details.language_id;
            document.getElementById('edit_tv_year').value = details.release_year;
            document.getElementById('edit_tv_subtitle_provider').value = details.subtitle_provider_id;
            document.getElementById('edit_tv_status').value = details.movie_status_id;
            document.getElementById('edit_tv_rating').value = details.rating;

            document.getElementById('edit_tv_poster_preview').src = images.poster;
            document.getElementById('edit_tv_cover_preview').src = images.cover;

            seasonListContainer.innerHTML = '';
            seasonCounter = 0;

            if (seasons.length > 0) {
                seasons.forEach((season, index) => {
                    const seasonCard = addSeasonToEditModal(season.season_id, index);
                    season.episodes.forEach(episode => {
                        addEpisodeToEditSeason(seasonCard, episode, index);
                    });
                    seasonCounter++;
                });
            } else {
                seasonListContainer.innerHTML = '<p>No seasons or episodes found for this series. You can add new ones.</p>';
            }

            populateEditActors(data.data.actors || [], 'edit-tv-series-modal');
        })
        .catch(error => {
            console.error('Error fetching TV series details:', error);
            showModal('Error!', error.message, false);
            modal.style.display = 'none';
        });
}

function updateTvSeries() {
    const form = document.getElementById('edit-tv-series-form');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button.cta-button[onclick="updateTvSeries()"]');

    const selectedActorsCount = form.querySelectorAll('.selected-actor-tag').length;
    if (selectedActorsCount !== 5) {
        showModal('Validation Error!', 'Please select exactly 5 actors.', false);
        return;
    }

    const seasonIDs = formData.getAll('season_id[]');
    if (seasonIDs.length === 0) {
        showModal('Error!', 'Please add at least one season.', false);
        return;
    }
    const episodeNames = formData.getAll('episode_name[]');
    if (episodeNames.length === 0) {
        showModal('Error!', 'Please add at least one episode.', false);
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    fetch('process_update_tv_series.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success!', data.message, true);
                document.getElementById('edit-tv-series-modal').style.display = 'none';
                loadTvSeries(currentTvSeriesListPage, currentTvSeriesSearchQuery);
            } else {
                showModal('Error!', data.message, false);
            }
        })
        .catch(error => {
            console.error('Error updating TV Series:', error);
            showModal('Error!', 'An unexpected error occurred.', false);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Changes';
        });
}

function deleteTvSeries(id) {
    if (confirm(`Are you sure you want to permanently delete this TV series? This will also delete all its seasons, episodes, and images. This action cannot be undone.`)) {

        const formData = new FormData();
        formData.append('tv_series_id', id);

        fetch('process_delete_tv_series.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showModal('Success!', data.message || 'TV Series deleted successfully.', true);
                    loadTvSeries(currentTvSeriesListPage, currentTvSeriesSearchQuery);
                } else {
                    showModal('Deletion Failed!', data.message || 'An unknown error occurred.', false);
                }
            })
            .catch(error => {
                console.error('Error deleting TV series:', error);
                showModal('Error!', 'An unexpected error occurred during deletion. Please check the console.', false);
            });
    }
}


// ==================================================================
// ==           MESSAGES & REQUESTS MANAGEMENT FUNCTIONS         ==
// ==================================================================

function loadMessagesRequests(filter = currentMessagesFilter) {
    const messagesTableBody = document.querySelector('#messages-table tbody');
    const requestsTableBody = document.querySelector('#requests-table tbody');

    if (!messagesTableBody || !requestsTableBody) return;

    messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading messages...</td></tr>';
    requestsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading requests...</td></tr>';

    fetch(`load_messages_requests.php?filter=${filter}`)
        .then(response => response.json())
        .then(data => {
            currentMessagesFilter = data.current_filter || 'active';
            const toggleBtn = document.getElementById('toggle-completed-btn');
            if (toggleBtn) {
                if (currentMessagesFilter === 'completed') {
                    toggleBtn.innerHTML = '<i class="fas fa-check-circle"></i> Show Active';
                    document.querySelector('#messages-requests-page h2:nth-of-type(1)').innerHTML = '<i class="fas fa-envelope"></i> Messages (Completed)';
                    document.querySelector('#messages-requests-page h2:nth-of-type(2)').innerHTML = '<i class="fas fa-film"></i> Movie/Series Requests (Completed)';
                } else {
                    toggleBtn.innerHTML = '<i class="fas fa-history"></i> Show Completed';
                    document.querySelector('#messages-requests-page h2:nth-of-type(1)').innerHTML = '<i class="fas fa-envelope"></i> Messages (Pending & Read)';
                    document.querySelector('#messages-requests-page h2:nth-of-type(2)').innerHTML = '<i class="fas fa-film"></i> Movie/Series Requests (Pending)';
                }
            }

            messagesTableBody.innerHTML = '';
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    let actionButtons = '';
                    if (currentMessagesFilter === 'active') {
                        if (msg.message_status_id == 1) {
                            actionButtons = `
                                <button class="action-btn edit" onclick="changeMessageStatus(${msg.id}, 2)" title="Mark as Read"><i class="fas fa-envelope-open"></i></button>
                                <button class="action-btn delete" onclick="changeMessageStatus(${msg.id}, 3)" title="Mark as Completed"><i class="fas fa-check-circle"></i></button>
                            `;
                        } else if (msg.message_status_id == 2) {
                            actionButtons = `
                                <button class="action-btn delete" onclick="changeMessageStatus(${msg.id}, 3)" title="Mark as Completed"><i class="fas fa-check-circle"></i></button>
                            `;
                        }
                    } else {
                        actionButtons = '<i>(Completed)</i>';
                    }

                    let statusClass = 'inactive';
                    if (msg.message_status_id == 2) statusClass = 'trial-active';
                    if (msg.message_status_id == 3) statusClass = 'active';

                    const row = `
                        <tr>
                            <td>${msg.id}</td>
                            <td>${msg.email}</td>
                            <td>${msg.message}</td>
                            <td><span class="status ${statusClass}">${msg.status_name}</span></td> 
                            <td>${actionButtons}</td>
                        </tr>
                    `;
                    messagesTableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending or read messages found.</td></tr>';
            }

            requestsTableBody.innerHTML = '';
            if (data.requests && data.requests.length > 0) {
                data.requests.forEach(req => {
                    let actionButton = '';
                    let statusClass = 'inactive';
                    if (currentMessagesFilter === 'active') {
                        actionButton = `<button class="action-btn delete" onclick="changeRequestStatus(${req.id}, 2)" title="Mark as Completed"><i class="fas fa-check-circle"></i></button>`;
                    } else {
                        actionButton = '<i>(Completed)</i>';
                        statusClass = 'active';
                    }

                    const row = `
                        <tr>
                            <td>${req.id}</td>
                            <td>${req.user_email}</td>
                            <td>${req.request_name}</td>
                            <td>${req.year || 'N/A'}</td>
                            <td><span class="status ${statusClass}">${req.status_name}</span></td>
                            <td>${actionButton}</td>
                        </tr>
                    `;
                    requestsTableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                requestsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No pending requests found.</td></tr>';
            }

        })
        .catch(error => {
            console.error('Error loading messages/requests:', error);
            messagesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Failed to load messages.</td></tr>';
            requestsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load requests.</td></tr>';
        });
}

function changeMessageStatus(messageId, newStatusId) {
    let actionWord = newStatusId === 2 ? 'Read' : 'Completed';
    if (!confirm(`Are you sure you want to mark message #${messageId} as ${actionWord}?`)) {
        return;
    }

    const formData = new FormData();
    formData.append('message_id', messageId);
    formData.append('new_status_id', newStatusId);

    fetch('update_message_status.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success!', data.message, true);
                loadMessagesRequests();
            } else {
                showModal('Error!', data.message, false);
            }
        })
        .catch(error => {
            console.error('Error updating message status:', error);
            showModal('Error!', 'An unexpected error occurred.', false);
        });
}

function changeRequestStatus(requestId, newStatusId) {
    if (!confirm(`Are you sure you want to mark request #${requestId} as Completed?`)) {
        return;
    }

    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('new_status_id', newStatusId);

    fetch('update_request_status.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success!', data.message, true);
                loadMessagesRequests();
            } else {
                showModal('Error!', data.message, false);
            }
        })
        .catch(error => {
            console.error('Error updating request status:', error);
            showModal('Error!', 'An unexpected error occurred.', false);
        });
}

function toggleCompletedView() {
    const newFilter = (currentMessagesFilter === 'active') ? 'completed' : 'active';
    loadMessagesRequests(newFilter);
}

// ==================================================================
// ==                 ACTOR MANAGEMENT FUNCTIONS                 ==
// ==================================================================

function setupAddActorModalListeners() {
    const addActorBtn = document.getElementById('add-actor-btn');
    const modal = document.getElementById('add-actor-modal');

    if (addActorBtn && modal) {
        addActorBtn.onclick = () => { modal.style.display = 'flex'; };
    }
}

function closeAndResetModal(modalId, formId) {
    const modal = document.getElementById(modalId);
    const form = document.getElementById(formId);
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    if (modalId === 'edit-actor-modal') {
        document.getElementById('edit_actor_image_preview').src = '';
    }
    resetActorSelection(modalId);
}

function addActor() {
    const form = document.getElementById('add-actor-form');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button.cta-button');

    if (!formData.get('actor_name') || !formData.get('actor_image') || formData.get('actor_image').size === 0) {
        showModal('Error', 'Actor name and image are required.', false);
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    fetch('process_add_actor.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success', data.message, true);
                closeAndResetModal('add-actor-modal', 'add-actor-form');
                loadActors(1);
            } else {
                showModal('Error', data.message, false);
            }
        })
        .catch(err => {
            console.error("Add actor error:", err);
            showModal('Error', 'An unexpected network error occurred.', false);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Actor';
        });
}

function loadActors(page = 1, searchQuery = '') {
    currentActorListPage = page;
    currentActorSearchQuery = searchQuery.trim();

    const tableBody = document.querySelector('#actors-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading actors...</td></tr>';
    const fetchURL = `load_actors.php?page=${page}&search=${encodeURIComponent(currentActorSearchQuery)}`;

    fetch(fetchURL)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            if (data.actors && data.actors.length > 0) {
                data.actors.forEach(actor => {
                    const row = `
                        <tr>
                            <td>${actor.id}</td>
                            <td><img src="${actor.image_url}?t=${new Date().getTime()}" alt="${actor.name}"></td> 
                            <td>${actor.name}</td>
                            <td>
                                <button class="action-btn edit" onclick="editActor(${actor.id})" title="Edit"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete" onclick="deleteActor(${actor.id})" title="Delete"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No actors found.</td></tr>';
            }
            renderActorsPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading actors:', error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Failed to load actors.</td></tr>';
        });
}

function renderActorsPagination(paginationData) {
    if (!paginationData) return;
    const { currentPage, totalPages } = paginationData;
    const paginationContainer = document.getElementById('actors-pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-btn';
        if (i === currentPage) button.classList.add('active');
        const escapedQuery = currentActorSearchQuery.replace(/'/g, "\\'");
        button.setAttribute('onclick', `loadActors(${i}, '${escapedQuery}')`);
        paginationContainer.appendChild(button);
    }
}

function editActor(actorId) {
    const modal = document.getElementById('edit-actor-modal');
    const form = document.getElementById('edit-actor-form');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('edit_actor_image_preview').src = 'img/loading.gif';

    fetch(`get_actor_details.php?id=${actorId}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('edit_actor_id').value = data.data.id;
                document.getElementById('edit_actor_name').value = data.data.name;
                document.getElementById('edit_actor_image_preview').src = data.data.image_url + '?t=' + new Date().getTime();
                modal.style.display = 'flex';
            } else {
                showModal('Error', data.message, false);
            }
        })
        .catch(err => {
            console.error("Edit actor error:", err);
            showModal('Error', 'Could not fetch actor details.', false);
            document.getElementById('edit_actor_image_preview').src = '';
        });
}

function updateActor() {
    const form = document.getElementById('edit-actor-form');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button.cta-button');

    if (!formData.get('actor_name')) {
        showModal('Error', 'Actor name cannot be empty.', false);
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    fetch('process_update_actor.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success', data.message, true);
                closeAndResetModal('edit-actor-modal', 'edit-actor-form');
                loadActors(currentActorListPage, currentActorSearchQuery);
            } else {
                showModal('Error', data.message, false);
            }
        })
        .catch(err => {
            console.error("Update actor error:", err);
            showModal('Error', 'An unexpected network error occurred.', false);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Changes';
        });
}

function deleteActor(actorId) {
    if (confirm(`Are you sure you want to delete actor #${actorId}? This action might fail if the actor is linked to movies or series.`)) {
        const formData = new FormData();
        formData.append('actor_id', actorId);

        fetch('process_delete_actor.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    showModal('Success', data.message, true);
                    loadActors(1, '');
                } else {
                    showModal('Error', data.message, false);
                }
            })
            .catch(err => {
                console.error("Delete actor error:", err);
                showModal('Error', 'An unexpected network error occurred.', false);
            });
    }
}

// ==================================================================
// ==               MOVIE MANAGEMENT (ADD, EDIT, DELETE)           ==
// ==================================================================

function addMovie() {
    const addMovieForm = document.getElementById('add-movie-form');
    if (!addMovieForm) {
        return showModal('Error!', 'Movie form not found. Please refresh the page.', false);
    }
    const submitButton = addMovieForm.querySelector('button.cta-button');
    const selectedActorsCount = addMovieForm.querySelectorAll('.selected-actor-tag').length;
    if (selectedActorsCount !== 5) {
        showModal('Validation Error!', 'Please select exactly 5 actors.', false);
        return;
    }

    const formData = new FormData(addMovieForm);

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    fetch('process_add_movie.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json()) // (FIX) Expect JSON
        .then(data => {
            if (data.status === 'success') { // (FIX) Check data.status
                showModal('Success!', data.message || 'New movie has been added successfully.', true);
                addMovieForm.reset();
                document.getElementById('add-movie-modal').style.display = 'none';
                resetActorSelection('add-movie-modal');     // (FIX) Reset actors
                resetCollectionSearch('add-movie-modal'); // (FIX) Reset collection
                loadMovies(1);
            } else {
                showModal('Validation Error!', data.message || 'An unknown error occurred.', false); // (FIX) Use data.message
            }
        })
        .catch(error => {
            showModal('Error!', 'An unexpected error occurred. Please try again.', false);
            console.error('Fetch Error:', error);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Movie';
        });
}

function editMovie(movieId) {
    // (Get the function from the user's provided admin.js)
    fetch(`get_movie_details.php?id=${movieId}`)
        .then(response => {
            if (!response.ok) {
                // (Check for 'error' property in JSON response)
                throw new Error('Movie not found or server error.');
            }
            return response.json(); //
        })
        .then(data => {
            // (Check for 'error' property after parsing JSON)
            if (data.error) {
                throw new Error(data.error);
            }

            document.getElementById('edit_movie_id').value = data.id; //
            document.getElementById('edit_movie_title').value = data.title; //
            document.getElementById('edit_movie_description').value = data.description; //
            document.getElementById('edit_movie_category').value = data.category_id; //
            document.getElementById('edit_movie_language').value = data.language_id; //
            document.getElementById('edit_movie_year').value = data.release_year; //
            document.getElementById('edit_movie_rating').value = data.rating; //
            document.getElementById('edit_subtitle_provider').value = data.subtitle_provider_id; //
            document.getElementById('edit_720p_movie_link').value = data['720p_movie_link']; //
            document.getElementById('edit_1080p_movie_link').value = data['1080p_movie_link']; //
            document.getElementById('edit_movie_status').value = data.movie_status_id; //

            // === (START) NEW FIX ===
            // Populate the new trailer link field
            document.getElementById('edit_movie_trailer_link').value = data.movie_trailer_link || '';
            // === (END) NEW FIX ===

            document.getElementById('edit_collection_name').value = data.collection_name || ''; //
            document.getElementById('edit_movie_number').value = data.movie_number || ''; //

            document.getElementById('edit_poster_preview').src = data.poster_url; //
            document.getElementById('edit_cover_preview').src = data.cover_url; //
            document.getElementById('edit_poster_image').value = ''; //
            document.getElementById('edit_cover_image').value = ''; //

            // Populate Telegram IDs in Edit Modal
            document.getElementById('edit_tg_file_id_720p').value = data.telegram_file_id_720p || '';
            document.getElementById('edit_tg_file_id_1080p').value = data.telegram_file_id_1080p || '';

            populateEditActors(data.actors || [], 'edit-movie-modal'); //

            const availableSubs = data.subtitles || [];
            console.log("Movie Subtitles found:", availableSubs); // Debugging line

            ['si', 'en', 'ta'].forEach(lang => {
                const hasSub = availableSubs.includes(lang);
                const statusEl = document.getElementById(`current_sub_${lang}`);
                const deleteLabelEl = document.getElementById(`delete_sub_label_${lang}`);
                const deleteCheckbox = deleteLabelEl ? deleteLabelEl.querySelector('input') : null;

                // 1. Update Text Status
                if (statusEl) {
                    statusEl.textContent = hasSub ? `Current: ${lang}.vtt` : 'Current: None';
                    statusEl.classList.toggle('has-subtitle', hasSub);
                }

                // 2. Show/Hide Delete Checkbox (This was missing in your code)
                if (deleteLabelEl) {
                    deleteLabelEl.style.display = hasSub ? 'inline-flex' : 'none';
                }

                // 3. Reset Checkbox state
                if (deleteCheckbox) {
                    deleteCheckbox.checked = false;
                }
            });

            document.getElementById('edit-movie-modal').style.display = 'flex'; //
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            showModal('Error!', 'Could not fetch movie details: ' + error.message, false); //
        });
}

function updateMovie() {
    const editForm = document.getElementById('edit-movie-form');
    if (!editForm) return;

    const formData = new FormData(editForm);
    const submitButton = editForm.querySelector('button.cta-button');

    const selectedActorsCount = editForm.querySelectorAll('.selected-actor-tag').length;
    if (selectedActorsCount !== 5) {
        showModal('Validation Error!', 'Please select exactly 5 actors.', false);
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving Changes...';

    fetch('process_update_movie.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success!', data.message || 'Movie details updated successfully.', true);
                document.getElementById('edit-movie-modal').style.display = 'none';
                loadMovies(currentMovieListPage, currentSearchQuery);
            } else {
                showModal('Update Error!', data.message || 'An unknown error occurred.', false);
            }
        })
        .catch(error => {
            console.error('Error updating movie:', error);
            showModal('Error!', 'An unexpected error occurred. Could not process server response.', false);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Changes';
        });
}

function deleteMovie(movieId) {
    if (confirm(`Are you sure you want to permanently delete this movie? This action cannot be undone.`)) {
        const formData = new FormData();
        formData.append('movie_id', movieId);

        fetch('process_delete_movie.php', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    const movieTitle = data.movieTitle || `Movie ID ${movieId}`;
                    showModal('Success!', `'${movieTitle}' has been deleted.`, true);
                    loadMovies(currentMovieListPage, currentSearchQuery);
                } else {
                    showModal('Deletion Failed!', data.message || 'An unknown error occurred.', false); // (FIX) Use data.message
                }
            })
            .catch(error => {
                console.error('Error deleting movie:', error);
                showModal('Error!', 'An unexpected error occurred during deletion. Please check console.', false);
            });
    }
}


// ==================================================================
// ==         MOVIE LIST LOADING AND PAGINATION FUNCTIONS          ==
// ==================================================================

function loadMovies(page = 1, searchQuery = '') {
    currentMovieListPage = page;
    currentSearchQuery = searchQuery.trim();

    const tableBody = document.querySelector('#movies-page tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading movies...</td></tr>';
    const fetchURL = `load_movies_process.php?page=${page}&search=${encodeURIComponent(currentSearchQuery)}`;

    fetch(fetchURL)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            if (data.movies && data.movies.length > 0) {
                data.movies.forEach(movie => {
                    const row = `
                        <tr>
                            <td><img src="${movie.poster_url}" alt="${movie.title} Poster"></td>
                            <td>${movie.title}</td>
                            <td>${movie.category_name}</td>
                            <td>${movie.release_year}</td>
                            <td>${movie.add_date}</td> <td>
                                <button class="action-btn edit" onclick="editMovie(${movie.id})"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete" onclick="deleteMovie(${movie.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No movies found.</td></tr>';
            }
            renderPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading movies:', error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load movies. Please try again.</td></tr>';
        });
}

function renderPagination(paginationData) {
    if (!paginationData) return;
    const { currentPage, totalPages } = paginationData;
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-btn';
        if (i === currentPage) {
            button.classList.add('active');
        }
        const escapedSearchQuery = currentSearchQuery.replace(/'/g, "\\'");
        button.setAttribute('onclick', `loadMovies(${i}, '${escapedSearchQuery}')`);
        paginationContainer.appendChild(button);
    }
}


// ==================================================================
// ==          USER MANAGEMENT (LOAD, BLOCK, PAGINATE)             ==
// ==================================================================

function loadUsers(page = 1, searchQuery = '') {
    currentUserListPage = page;
    currentUserSearchQuery = searchQuery.trim();

    const tableBody = document.querySelector('#users-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading users...</td></tr>';
    const fetchURL = `load_users_process.php?page=${page}&search=${encodeURIComponent(currentUserSearchQuery)}`;

    fetch(fetchURL)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            if (data.users && data.users.length > 0) {
                data.users.forEach(user => {
                    let blockBtn = '';
                    if (user.status_name === 'Blocked') {
                        blockBtn = `<button class="action-btn edit" onclick="toggleUserBlock(${user.id}, false)" title="Unblock User"><i class="fas fa-check"></i></button>`;
                    } else {
                        blockBtn = `<button class="action-btn block" onclick="toggleUserBlock(${user.id}, true)" title="Block User"><i class="fas fa-ban"></i></button>`;
                    }

                    const row = `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="status ${user.status_class}">${user.status_name}</span></td>
                            <td><span class="status ${user.sub_status_class}">${user.sub_status}</span></td>
                            <td>
                                <button class="action-btn view" onclick="viewUserHistory(${user.id})" title="View History"><i class="fas fa-history"></i></button>
                                ${blockBtn}
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>';
            }
            renderUserPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading users:', error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load users. Please try again.</td></tr>';
        });
}

function renderUserPagination(paginationData) {
    if (!paginationData) return;
    const { currentPage, totalPages } = paginationData;
    const paginationContainer = document.getElementById('users-pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-btn';
        if (i === currentPage) {
            button.classList.add('active');
        }
        const escapedSearchQuery = currentUserSearchQuery.replace(/'/g, "\\'");
        button.setAttribute('onclick', `loadUsers(${i}, '${escapedSearchQuery}')`);
        paginationContainer.appendChild(button);
    }
}

function toggleUserBlock(userId, shouldBlock) {
    const action = shouldBlock ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    fetch('toggle_user_block_process.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, block: shouldBlock })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success!', data.message, true);
                loadUsers(currentUserListPage, currentUserSearchQuery);
            } else {
                showModal('Error!', data.message, false);
            }
        })
        .catch(error => {
            console.error('Error toggling user block:', error);
            showModal('Error!', 'An unexpected error occurred.', false);
        });
}


// ==================================================================
// ==                 UTILITY & HELPER FUNCTIONS                   ==
// ==================================================================

function populateYearPicker(elementId) {
    const yearPicker = document.getElementById(elementId);
    if (!yearPicker) return;
    if (yearPicker.options.length > 1) return;

    const currentYear = new Date().getFullYear();
    const startYear = 1950;

    const placeholder = document.createElement('option');
    placeholder.value = "";
    placeholder.textContent = "Select release year";
    placeholder.disabled = true;
    placeholder.selected = true;
    yearPicker.appendChild(placeholder);

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearPicker.appendChild(option);
    }
}

function showModal(title, message, isSuccess) {
    const modalOverlay = document.getElementById('custom-modal-overlay');
    const modalBox = document.getElementById('custom-modal-box');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalBox.className = isSuccess ? 'success' : 'error';

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
        modalBox.style.transform = 'scale(1)';
        modalBox.style.opacity = '1';
    }, 50);
}

function hideModal() {
    const modalOverlay = document.getElementById('custom-modal-overlay');
    const modalBox = document.getElementById('custom-modal-box');
    modalBox.style.transform = 'scale(0.9)';
    modalBox.style.opacity = '0';
    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 300);
}

document.getElementById('modal-close-btn').addEventListener('click', hideModal);
document.getElementById('custom-modal-overlay').addEventListener('click', function (e) {
    if (e.target === this) {
        hideModal();
    }
});

// ==================================================================
// ==         PAYMENT & SUBSCRIPTION MANAGEMENT FUNCTIONS          ==
// ==================================================================

function openAddPaymentModal() {
    document.getElementById('add-payment-modal').style.display = 'flex';

    const startDateInput = document.getElementById('sub_start_date');
    const endDateInput = document.getElementById('sub_end_date');

    startDateInput.onchange = function () {
        if (startDateInput.value) {
            const startDate = new Date(startDateInput.value);
            startDate.setDate(startDate.getDate() + 30);
            endDateInput.value = startDate.toISOString().split('T')[0];
        } else {
            endDateInput.value = '';
        }
    };

    const emailInput = document.getElementById('payment_user_email');
    const resultsContainer = document.getElementById('user-search-results');
    const hiddenUserIdInput = document.getElementById('payment_user_id');

    emailInput.oninput = function () {
        const query = emailInput.value.trim();
        hiddenUserIdInput.value = '';

        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        fetch(`search_users.php?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(users => {
                resultsContainer.innerHTML = '';
                if (users.length > 0) {
                    users.forEach(user => {
                        const item = document.createElement('div');
                        item.className = 'user-search-item';
                        item.innerHTML = `${user.email} <small>${user.name}</small>`;
                        item.onclick = function () {
                            emailInput.value = user.email;
                            hiddenUserIdInput.value = user.id;
                            resultsContainer.style.display = 'none';
                            resultsContainer.innerHTML = '';
                        };
                        resultsContainer.appendChild(item);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.innerHTML = '<div class="user-search-item">No users found.</div>';
                    resultsContainer.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('User search error:', error);
                resultsContainer.style.display = 'none';
            });
    };

    emailInput.onblur = function () {
        setTimeout(() => {
            resultsContainer.style.display = 'none';
        }, 200);
    };

    emailInput.onfocus = function () {
        if (emailInput.value.length > 1 && resultsContainer.children.length > 0) {
            resultsContainer.style.display = 'block';
        }
    };
}

function closeAddPaymentModal() {
    document.getElementById('add-payment-modal').style.display = 'none';
    document.getElementById('add-payment-form').reset();
    document.getElementById('payment_user_email').value = '';
    document.getElementById('payment_user_id').value = '';
    document.getElementById('user-search-results').innerHTML = '';
    document.getElementById('user-search-results').style.display = 'none';
    document.getElementById('sub_end_date').value = '';
}

function submitPayment() {
    const form = document.getElementById('add-payment-form');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button.cta-button');

    const userId = formData.get('user_id');

    if (!userId || !formData.get('amount') || !formData.get('payment_date') || !formData.get('start_date') || !formData.get('payment_slip').size > 0) {
        showModal('Error!', 'Please select a valid user and fill in all required fields (1, 2, 3, 5, 6).', false);
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    fetch('process_add_payment.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showModal('Success!', data.message, true);
                closeAddPaymentModal();
                loadUsers(currentUserListPage, currentUserSearchQuery);
            } else {
                showModal('Error!', data.message, false);
            }
        })
        .catch(error => {
            console.error('Payment submission error:', error);
            showModal('Error!', 'An unexpected error occurred. Please check the console.', false);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Save Payment';
        });
}

// ==================================================================
// ==                 USER HISTORY FUNCTIONS                   ==
// ==================================================================

function viewUserHistory(userId) {
    const modal = document.getElementById('user-history-modal');
    const userNameEl = document.getElementById('history_user_name');
    const createdDateEl = document.getElementById('history_created_date');
    const subContentEl = document.getElementById('subscription-history-content');
    const paymentContentEl = document.getElementById('payment-history-content');

    userNameEl.textContent = 'Loading...';
    createdDateEl.textContent = '';
    subContentEl.innerHTML = '<p class="no-history">Loading...</p>';
    paymentContentEl.innerHTML = '<p class="no-history">Loading...</p>';
    modal.style.display = 'flex';

    fetch(`get_user_history.php?id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            if (data.user) {
                userNameEl.textContent = `${data.user.first_name} ${data.user.last_name} (${data.user.email})`;
                const dateOnly = data.user.created_date.split(' ')[0];
                createdDateEl.textContent = `Account Created: ${dateOnly}`;
            } else {
                userNameEl.textContent = 'Unknown User';
                createdDateEl.textContent = '';
            }

            if (data.subscriptions && data.subscriptions.length > 0) {
                let subHtml = '<div class="history-table-wrapper"><table><thead><tr><th>Sub ID</th><th>Start Date</th><th>End Date</th><th>Payment ID</th></tr></thead><tbody>';
                data.subscriptions.forEach(sub => {
                    subHtml += `
                        <tr>
                            <td>${sub.id}</td>
                            <td>${sub.start_date}</td>
                            <td>${sub.end_date}</td>
                            <td>${sub.payment_id}</td>
                        </tr>
                    `;
                });
                subHtml += '</tbody></table></div>';
                subContentEl.innerHTML = subHtml;
            } else {
                subContentEl.innerHTML = '<p class="no-history">No subscription history found.</p>';
            }

            if (data.payments && data.payments.length > 0) {
                let paymentHtml = '<div class="history-table-wrapper"><table><thead><tr><th>Payment ID</th><th>Amount (LKR)</th><th>Payment Date</th><th>Ref #</th><th>Slip</th></tr></thead><tbody>';
                data.payments.forEach(pay => {
                    let slipLink = 'N/A';
                    if (pay.slip_url) {
                        const safeUrl = pay.slip_url.replace(/'/g, "\\'");
                        slipLink = `<span class="slip-link" onclick="showPaymentSlipPreview('${safeUrl}')">View Slip</span>`;
                    }
                    paymentHtml += `
                        <tr>
                            <td>${pay.id}</td>
                            <td>${pay.amount}</td>
                            <td>${pay.payment_date}</td>
                            <td>${pay.transaction_ref || 'N/A'}</td>
                            <td>${slipLink}</td>
                        </tr>
                    `;
                });
                paymentHtml += '</tbody></table></div>';
                paymentContentEl.innerHTML = paymentHtml;
            } else {
                paymentContentEl.innerHTML = '<p class="no-history">No payment history found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching user history:', error);
            userNameEl.textContent = 'Error';
            subContentEl.innerHTML = '<p class="no-history">Could not load history.</p>';
            paymentContentEl.innerHTML = '<p class="no-history">Could not load history.</p>';
        });
}

function showPaymentSlipPreview(imageUrl) {
    const modal = document.getElementById('slip-preview-modal');
    const img = document.getElementById('preview-image');
    img.src = imageUrl;
    modal.style.display = 'flex';
}

function closePaymentSlipPreview() {
    const modal = document.getElementById('slip-preview-modal');
    modal.style.display = 'none';
    document.getElementById('preview-image').src = '';
}

const closePreviewBtn = document.getElementById('close-preview-btn');
if (closePreviewBtn) {
    closePreviewBtn.onclick = closePaymentSlipPreview;
}

const previewModal = document.getElementById('slip-preview-modal');
if (previewModal) {
    previewModal.onclick = function (e) {
        if (e.target === this) {
            closePaymentSlipPreview();
        }
    };
}

// ==================================================================
// ==             ACTOR SELECTION LOGIC FUNCTIONS                ==
// ==================================================================

function setupActorSelection(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const searchInput = modal.querySelector('.actor-search-input');
    const resultsContainer = modal.querySelector('.actor-search-results');
    const selectedList = modal.querySelector('.selected-actors-list');
    const hiddenInputs = modal.querySelectorAll('input[name="actor_ids[]"]');
    const countMessage = modal.querySelector('.actor-count-message');

    if (!searchInput || !resultsContainer || !selectedList || hiddenInputs.length !== 5 || !countMessage) {
        console.error("Actor selection elements not found in modal:", modalId);
        return;
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        clearTimeout(actorSearchDebounceTimeout);

        if (query.length < 1) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        actorSearchDebounceTimeout = setTimeout(() => {
            fetch(`search_actors.php?query=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(actors => displayActorSearchResults(actors, resultsContainer, selectedList, hiddenInputs, countMessage, searchInput))
                .catch(err => console.error("Actor search fetch error:", err));
        }, 300);
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => { resultsContainer.style.display = 'none'; }, 200);
    });
    searchInput.addEventListener('focus', () => {
        if (resultsContainer.innerHTML.trim() !== '') {
            resultsContainer.style.display = 'block';
        }
    });

    selectedList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-actor-btn')) {
            const actorIdToRemove = event.target.dataset.id;
            removeSelectedActor(actorIdToRemove, selectedList, hiddenInputs, countMessage);
        }
    });

    updateSelectedActorCount(selectedList, countMessage);
}

function displayActorSearchResults(actors, resultsContainer, selectedList, hiddenInputs, countMessage, searchInput) {
    resultsContainer.innerHTML = '';
    if (actors.length > 0) {
        actors.forEach(actor => {
            const isSelected = Array.from(hiddenInputs).some(input => input.value == actor.id);
            if (isSelected) return;

            const item = document.createElement('div');
            item.className = 'actor-result-item';
            item.innerHTML = `
                <img src="${actor.image_url}" alt="${actor.name}">
                <span>${actor.name}</span>
            `;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                addSelectedActor(actor, selectedList, hiddenInputs, countMessage);
                searchInput.value = '';
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'none';
            });
            resultsContainer.appendChild(item);
        });
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.innerHTML = '<div class="actor-result-item no-results">No actors found.</div>';
        resultsContainer.style.display = 'block';
    }
}

function addSelectedActor(actor, selectedList, hiddenInputs, countMessage) {
    const emptyInput = Array.from(hiddenInputs).find(input => input.value === "");

    if (!emptyInput) {
        showModal('Limit Reached', 'You can only select up to 5 actors.', false);
        return;
    }

    emptyInput.value = actor.id;

    const tag = document.createElement('div');
    tag.className = 'selected-actor-tag';
    tag.id = `selected-actor-${actor.id}`;
    tag.innerHTML = `
        <img src="${actor.image_url}" alt="${actor.name}">
        <span>${actor.name}</span>
        <button type="button" class="remove-actor-btn" data-id="${actor.id}">&times;</button>
    `;
    selectedList.appendChild(tag);

    updateSelectedActorCount(selectedList, countMessage);
}

function removeSelectedActor(actorId, selectedList, hiddenInputs, countMessage) {
    const tagToRemove = document.getElementById(`selected-actor-${actorId}`);
    if (tagToRemove) {
        tagToRemove.remove();
    }

    const inputToClear = Array.from(hiddenInputs).find(input => input.value == actorId);
    if (inputToClear) {
        inputToClear.value = "";
    }

    updateSelectedActorCount(selectedList, countMessage);
}

function updateSelectedActorCount(selectedList, countMessage) {
    const count = selectedList.children.length;
    countMessage.textContent = `Selected: ${count} / 5`;
    countMessage.classList.toggle('error', count !== 5 && count > 0);
}

function resetActorSelection(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const selectedList = modal.querySelector('.selected-actors-list');
    const hiddenInputs = modal.querySelectorAll('input[name="actor_ids[]"]');
    const countMessage = modal.querySelector('.actor-count-message');
    const searchInput = modal.querySelector('.actor-search-input');

    if (selectedList) selectedList.innerHTML = '';
    if (hiddenInputs) hiddenInputs.forEach(input => input.value = '');
    if (countMessage) updateSelectedActorCount(selectedList, countMessage);
    if (searchInput) searchInput.value = '';
}

function populateEditActors(actorsData, modalId) {
    const modal = document.getElementById(modalId);
    if (!modal || !actorsData || actorsData.length === 0) return;

    const selectedList = modal.querySelector('.selected-actors-list');
    const hiddenInputs = modal.querySelectorAll('input[name="actor_ids[]"]');
    const countMessage = modal.querySelector('.actor-count-message');

    resetActorSelection(modalId);

    actorsData.slice(0, 5).forEach(actor => {
        addSelectedActor(actor, selectedList, hiddenInputs, countMessage);
    });
}

// ==================================================================
// == (FIX) COLLECTION SELECTION LOGIC FUNCTIONS (NEW)           ==
// ==================================================================

/**
 * Initializes collection name search functionality for a given modal.
 * @param {string} modalId - The ID of the modal ('add-movie-modal', 'edit-movie-modal')
 */
function setupCollectionSearch(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const searchInput = modal.querySelector('.collection-search-input');
    const resultsContainer = modal.querySelector('.collection-search-results');

    if (!searchInput || !resultsContainer) {
        console.error("Collection search elements not found in modal:", modalId);
        return;
    }

    // --- Search Input Listener ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        clearTimeout(collectionSearchDebounceTimeout);

        if (query.length < 1) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        collectionSearchDebounceTimeout = setTimeout(() => {
            fetch(`search_collections.php?query=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(collections => displayCollectionSearchResults(collections, resultsContainer, searchInput))
                .catch(err => console.error("Collection search fetch error:", err));
        }, 300); // 300ms debounce
    });

    // --- Hide results on blur/click outside (with delay) ---
    searchInput.addEventListener('blur', () => {
        setTimeout(() => { resultsContainer.style.display = 'none'; }, 200);
    });
    searchInput.addEventListener('focus', () => {
        if (resultsContainer.innerHTML.trim() !== '') {
            resultsContainer.style.display = 'block';
        }
    });
}

/**
 * Displays collection search results.
 * @param {string[]} collections - Array of collection name strings.
 */
function displayCollectionSearchResults(collections, resultsContainer, searchInput) {
    resultsContainer.innerHTML = '';
    if (collections.length > 0) {
        collections.forEach(name => {
            const item = document.createElement('div');
            item.className = 'actor-result-item'; // Re-use actor item style
            item.innerHTML = `<span>${name}</span>`; // Just the name

            item.addEventListener('mousedown', (e) => { // Use mousedown to trigger before blur
                e.preventDefault();
                searchInput.value = name; // Fill input with selected name
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'none';
            });
            resultsContainer.appendChild(item);
        });
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.innerHTML = '<div class="actor-result-item no-results">No existing collections found.</div>';
        resultsContainer.style.display = 'block';
    }
}

/** Resets the collection search UI in a modal */
function resetCollectionSearch(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const searchInput = modal.querySelector('.collection-search-input');
    const resultsContainer = modal.querySelector('.collection-search-results');
    const movieNumberInput = modal.querySelector('input[name="movie_number"]');

    if (searchInput) searchInput.value = '';
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
    }
    if (movieNumberInput) movieNumberInput.value = '';
}


// ==================================================================
// ==                  SIDEBAR TOGGLE FUNCTION                     ==
// ==================================================================

function setupSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const adminContent = document.querySelector('.admin-content');

    let contentOverlay = document.createElement('div');
    contentOverlay.classList.add('content-overlay');
    document.body.appendChild(contentOverlay);

    if (toggleBtn && sidebar && adminContent && contentOverlay) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            contentOverlay.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        });

        contentOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            contentOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        });

        sidebar.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item a')) {
                sidebar.classList.remove('open');
                contentOverlay.classList.remove('active');
                document.body.classList.remove('sidebar-open');
            }
        });
    }
}

// Season Card එකට Toggle (Minimize) කිරීමේ හැකියාව ලබා දෙන Function එක
function attachSeasonToggle(seasonCardElement) {
    const toggleBtn = seasonCardElement.querySelector('.toggle-season-btn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            // මෙතනදී අපි 'collapsed' class එක දානවා/අයින් කරනවා විතරයි.
            // Icon එක කරකවන වැඩේ CSS වලින් බලාගනී.
            seasonCardElement.classList.toggle('collapsed');
        });
    }
}