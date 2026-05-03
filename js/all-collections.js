// ==================================================================
// ==                 ALL COLLECTIONS PAGE LOGIC                 ==
// ==================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Check if we are on the All Collections page
    if (document.getElementById('all-collections-grid')) {
        loadAllCollections(1); // Initial load of collections, page 1
    }
});

/**
 * Fetches and displays collections based on page number.
 */
function loadAllCollections(page = 1) {
    const grid = document.getElementById('all-collections-grid');
    if (!grid) return;

    grid.innerHTML = '<p class="loading-text">Loading collections...</p>';

    // Build the fetch URL
    const params = new URLSearchParams({ page: page });

    fetch(`get_all_collections.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            grid.innerHTML = ''; // Clear loading message

            if (data.collections && data.collections.length > 0) {
                data.collections.forEach(collection => {
                    // Use the createCollectionCardHTML function from main.js
                    const collectionCardHTML = createCollectionCardHTML(collection); 
                    grid.insertAdjacentHTML('beforeend', collectionCardHTML);
                });
            } else {
                grid.innerHTML = '<p class="no-movies">No collections found.</p>';
            }

            // Render pagination buttons
            renderAllCollectionsPagination(data.pagination);
        })
        .catch(error => {
            console.error('Error loading collections:', error);
            grid.innerHTML = '<p class="error-message">Failed to load collections. Please try again later.</p>';
        });
}

/**
 * Renders the pagination buttons for the All Collections page.
 */
function renderAllCollectionsPagination(paginationData) {
    const { currentPage, totalPages } = paginationData;
    const paginationContainer = document.getElementById('all-collections-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    if (totalPages <= 1) return;

    // A function to create a page button
    const createButton = (pageNumber) => {
        const button = document.createElement('button');
        button.textContent = pageNumber;
        button.className = 'pagination-btn';
        if (pageNumber === currentPage) {
            button.classList.add('active');
        }
        button.setAttribute('onclick', `loadAllCollections(${pageNumber})`);
        return button;
    };

    // Previous Button
    if (currentPage > 1) {
        const prevBtn = createButton(currentPage - 1);
        prevBtn.textContent = '« Prev';
        paginationContainer.appendChild(prevBtn);
    }

    // Page Number Buttons (simplified)
    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.appendChild(createButton(i));
    }

    // Next Button
    if (currentPage < totalPages) {
        const nextBtn = createButton(currentPage + 1);
        nextBtn.textContent = 'Next »';
        paginationContainer.appendChild(nextBtn);
    }
}