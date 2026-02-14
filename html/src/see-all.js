const API_KEY = '97df57ffd9278a37bc12191e00332053';
let currentPage = 1;
let currentType = '';
const grid = document.getElementById('seeAllGrid');
const loading = document.getElementById('loading');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const categoryTitle = document.getElementById('categoryTitle');

// Filter Elements
const providerSelect = document.getElementById('providerSelect');
const genreSelect = document.getElementById('genreSelect');
const sortSelect = document.getElementById('sortSelect');
const eraSelect = document.getElementById('eraSelect');
const ratingSelect = document.getElementById('ratingSelect');
const vibeSelect = document.getElementById('vibeSelect');
const resetBtn = document.getElementById('resetFilters');
const toggleAdvancedBtn = document.getElementById('toggleAdvancedFilters');
const advancedFilters = document.getElementById('advancedFilters');

// Constants
const PROVIDERS = [
    { id: 8, name: "Netflix" },
    { id: 9, name: "Amazon Prime Video" },
    { id: 337, name: "Disney Plus" },
    { id: 103, name: "All 4" },
    { id: 333, name: "My5" },
    { id: 384, name: "BBC iPlayer" },
    { id: 29, name: "Sky Go" },
    { id: 35, name: "Rakuten TV" },
    { id: 39, name: "Now TV" },
    { id: 531, name: "Paramount Plus" },
    { id: 283, name: "Crunchyroll" }
];

const VIBES = {
    'adrenaline': { with_genres: '28,53' }, // Action, Thriller
    'feel_good': { with_genres: '35,10751' }, // Comedy, Family
    'mind_bending': { with_genres: '878,9648' }, // Sci-Fi, Mystery
    'dark_gritty': { with_genres: '80,18' }, // Crime, Drama
    'romantic': { with_genres: '10749' }, // Romance
    'tearjerker': { with_genres: '18,10749' } // Drama, Romance
};

const ERAS = {
    '2024': { 'primary_release_date.gte': '2024-01-01', 'primary_release_date.lte': '2024-12-31', 'first_air_date.gte': '2024-01-01', 'first_air_date.lte': '2024-12-31' },
    '2020s': { 'primary_release_date.gte': '2020-01-01', 'primary_release_date.lte': '2029-12-31', 'first_air_date.gte': '2020-01-01', 'first_air_date.lte': '2029-12-31' },
    '2010s': { 'primary_release_date.gte': '2010-01-01', 'primary_release_date.lte': '2019-12-31', 'first_air_date.gte': '2010-01-01', 'first_air_date.lte': '2019-12-31' },
    '2000s': { 'primary_release_date.gte': '2000-01-01', 'primary_release_date.lte': '2009-12-31', 'first_air_date.gte': '2000-01-01', 'first_air_date.lte': '2009-12-31' },
    '90s': { 'primary_release_date.gte': '1990-01-01', 'primary_release_date.lte': '1999-12-31', 'first_air_date.gte': '1990-01-01', 'first_air_date.lte': '1999-12-31' },
    'classic': { 'primary_release_date.lte': '1989-12-31', 'first_air_date.lte': '1989-12-31' }
};

// Category labels and API endpoints
const categories = {
    'trending_movie': {
        title: 'Trending Movies',
        endpoint: 'discover/movie', // Switch to discover for filtering
        baseParams: '&sort_by=popularity.desc'
    },
    'popular_tv': {
        title: 'Popular TV Shows',
        endpoint: 'discover/tv', // Switch to discover for filtering
        baseParams: '&sort_by=popularity.desc'
    },
    'top_rated_tv': {
        title: '16+ Animation',
        endpoint: 'discover/tv',
        baseParams: '&with_genres=16&sort_by=popularity.desc' // Ensure 16 is always applied
    }
};

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentType = urlParams.get('type') || 'trending_movie';

    if (categories[currentType]) {
        categoryTitle.textContent = categories[currentType].title;

        // Populate Filters
        populateProviders();
        await populateGenres(); // Wait for genres to load

        // Default sort for trending is popularity
        sortSelect.value = 'popularity.desc';

        fetchData();
    } else {
        categoryTitle.textContent = 'Category Not Found';
        loading.classList.add('hidden');
    }
}

function populateProviders() {
    PROVIDERS.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.id;
        option.textContent = provider.name;
        providerSelect.appendChild(option);
    });
}

async function populateGenres() {
    try {
        const mediaType = currentType.includes('movie') ? 'movie' : 'tv';
        const response = await fetch(`https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${API_KEY}`);
        const data = await response.json();

        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

async function fetchData() {
    loading.classList.remove('hidden');
    document.getElementById('loadMoreContainer').classList.add('hidden');

    try {
        const cat = categories[currentType];

        // Build Query Parameters
        let url = `https://api.themoviedb.org/3/${cat.endpoint}?api_key=${API_KEY}&page=${currentPage}&include_adult=false&language=en-US`;

        // Base Params (e.g., Anime genre)
        if (cat.baseParams) {
            url += cat.baseParams;
        }

        // --- FILTERS ---

        // 1. Sort By (Override baseParam sort if explicitly selected, otherwise keep default)
        // Actually, discover endpoint requires a sort_by. 
        // We appended it in baseParams, but let's replace it if the user changed it? 
        // Or better: Let's construct the param string cleanly.

        // Remove sort_by from baseparams string if we are adding it here?
        // Let's just append it. TMDB usually takes the last one or we can just manage it manually.
        // Simplest: The UI 'Sort By' defaults to popularity.desc. We can just use that value.
        // However, we need to respect the "Trending" vs "Top Rated" initial state maybe?
        // No, "Trending" maps to popularity.desc sort in Discover API.

        // Let's re-build params:
        let params = new URLSearchParams();

        // Add existing base params (like with_genres=16)
        if (cat.baseParams) {
            const baseParts = cat.baseParams.split('&');
            baseParts.forEach(part => {
                if (part) {
                    const [key, val] = part.split('=');
                    params.append(key, val);
                }
            });
        }

        // Override Sort
        if (sortSelect.value) {
            params.set('sort_by', sortSelect.value);
        }

        // Provider
        if (providerSelect.value) {
            params.set('with_watch_providers', providerSelect.value);
            params.set('watch_region', 'GB'); // Default to GB as per request context (implied) or generic? 
            // Request said "API... good little addition", user is "infraforesightuk", imply UK.
        }

        // Genre
        if (genreSelect.value) {
            // If we already have with_genres (e.g. for Anime), we need to append
            if (params.has('with_genres')) {
                const existing = params.get('with_genres');
                params.set('with_genres', existing + ',' + genreSelect.value); // AND logic
            } else {
                params.set('with_genres', genreSelect.value);
            }
        }

        // Vibe (Advanced)
        if (vibeSelect.value && VIBES[vibeSelect.value]) {
            const vibe = VIBES[vibeSelect.value];
            if (vibe.with_genres) {
                if (params.has('with_genres')) {
                    const existing = params.get('with_genres');
                    params.set('with_genres', existing + ',' + vibe.with_genres);
                } else {
                    params.set('with_genres', vibe.with_genres);
                }
            }
        }

        // Era (Advanced)
        if (eraSelect.value && ERAS[eraSelect.value]) {
            const era = ERAS[eraSelect.value];
            const isMovie = currentType.includes('movie');

            if (isMovie) {
                if (era['primary_release_date.gte']) params.set('primary_release_date.gte', era['primary_release_date.gte']);
                if (era['primary_release_date.lte']) params.set('primary_release_date.lte', era['primary_release_date.lte']);
            } else {
                if (era['first_air_date.gte']) params.set('first_air_date.gte', era['first_air_date.gte']);
                if (era['first_air_date.lte']) params.set('first_air_date.lte', era['first_air_date.lte']);
            }
        }

        // Rating (Advanced)
        if (ratingSelect.value) {
            params.set('vote_average.gte', ratingSelect.value);
            params.set('vote_count.gte', '100'); // Ensure we don't get obscure stuff with 1 vote
        }

        // Construct final URL
        // We need to bypass the default URL building above since we are using URLSearchParams now
        url = `https://api.themoviedb.org/3/${cat.endpoint}?api_key=${API_KEY}&page=${currentPage}&include_adult=false&language=en-US&${params.toString()}`;

        console.log('Fetching URL:', url); // Debug

        const response = await fetch(url);
        const data = await response.json();

        renderCards(data.results);

        if (data.page < data.total_pages) {
            document.getElementById('loadMoreContainer').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        grid.innerHTML += '<p class="col-span-full text-center text-gray-400">Error loading content. Please try again.</p>';
        document.getElementById('loadMoreContainer').classList.add('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function renderCards(items) {
    if (currentPage === 1) {
        grid.innerHTML = ''; // Clear only on first page
    }

    if (!items || items.length === 0) {
        if (currentPage === 1) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-20"><i class="fa-solid fa-film text-4xl mb-4"></i><p class="text-xl">No results found for these filters.</p></div>';
        }
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'movie-card group relative flex-shrink-0 cursor-pointer transform transition-all duration-300 hover:z-10 bg-netflix-gray rounded-lg overflow-hidden';

        const posterPath = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const mediaType = item.title ? 'movie' : 'tv';

        card.innerHTML = `
            <div class="relative h-72 lg:h-80 overflow-hidden">
                <img src="${posterPath}" alt="${title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <h3 class="text-white font-bold text-sm line-clamp-2">${title}</h3>
                        <div class="flex items-center justify-between text-xs text-gray-300 mt-2">
                            <span class="flex items-center">
                                <i class="fa-solid fa-star text-yellow-400 mr-1"></i>
                                ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                            </span>
                            <span>${releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            showMovieModal(item);
        });

        grid.appendChild(card);
    });
}

// ... Keep existing Modal functions ...
/* Modal functions below are assumed to be unchanged or we can paste them back if we want to be safe. 
   For brevity in this tool call, I will include the existing modal functions to ensure nothing breaks.
*/

async function showMovieModal(item) {
    const modal = document.getElementById('movieModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalPoster = document.getElementById('modalPoster');
    const modalTitle = document.getElementById('modalTitle');
    const modalOverview = document.getElementById('modalOverview');
    const modalRating = document.getElementById('modalRating').querySelector('span');
    const modalYear = document.getElementById('modalYear');
    const modalRuntime = document.getElementById('modalRuntime');
    const modalPlayBtn = document.getElementById('modalPlayBtn');

    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const mediaType = item.title ? 'movie' : 'tv';

    // Set basic info
    modalTitle.textContent = title;
    modalOverview.textContent = item.overview || 'No overview available.';
    modalRating.textContent = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    modalYear.textContent = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    modalPoster.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    modalBackdrop.src = `https://image.tmdb.org/t/p/original${item.backdrop_path}`;

    // Fetch details for runtime
    try {
        const detailsResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}?api_key=${API_KEY}`);
        const details = await detailsResponse.json();

        if (details.runtime) {
            const h = Math.floor(details.runtime / 60);
            const m = details.runtime % 60;
            modalRuntime.textContent = `${h}h ${m}m`;
        } else if (details.number_of_seasons) {
            modalRuntime.textContent = `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}`;
        } else {
            modalRuntime.textContent = '';
        }
    } catch (e) {
        console.error('Error fetching details:', e);
    }

    modalPlayBtn.onclick = () => {
        window.location.href = `viewMovie.html?movieId=${item.id}&type=${mediaType}`;
    };

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('movieModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Event Listeners
loadMoreBtn.addEventListener('click', () => {
    currentPage++; // Already handled in old code, but let's be explicit
    fetchData();
});

// Filter Event Listeners
function resetAndFetch() {
    currentPage = 1;
    fetchData();
}

providerSelect.addEventListener('change', resetAndFetch);
genreSelect.addEventListener('change', resetAndFetch);
sortSelect.addEventListener('change', resetAndFetch);
eraSelect.addEventListener('change', resetAndFetch);
ratingSelect.addEventListener('change', resetAndFetch);
vibeSelect.addEventListener('change', resetAndFetch);

resetBtn.addEventListener('click', () => {
    providerSelect.value = '';
    genreSelect.value = '';
    sortSelect.value = 'popularity.desc';
    eraSelect.value = '';
    ratingSelect.value = '';
    vibeSelect.value = '';
    resetAndFetch();
});

toggleAdvancedBtn.addEventListener('click', () => {
    advancedFilters.classList.toggle('hidden');
    const isHidden = advancedFilters.classList.contains('hidden');
    toggleAdvancedBtn.innerHTML = isHidden
        ? '<i class="fa-solid fa-sliders mr-2"></i> More Filters'
        : '<i class="fa-solid fa-times mr-2"></i> Less Filters';
});

window.closeModal = closeModal;

// Initialize
init();
