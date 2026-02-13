const API_KEY = '97df57ffd9278a37bc12191e00332053';
let currentPage = 1;
let currentType = '';
const grid = document.getElementById('seeAllGrid');
const loading = document.getElementById('loading');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const categoryTitle = document.getElementById('categoryTitle');

// Category labels and API endpoints
const categories = {
    'trending_movie': {
        title: 'Trending Movies',
        endpoint: 'trending/movie/day'
    },
    'popular_tv': {
        title: 'Popular TV Shows',
        endpoint: 'trending/tv/day'
    },
    'top_rated_tv': {
        title: '16+ Animation',
        endpoint: 'discover/tv',
        params: '&with_genres=16'
    }
};

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentType = urlParams.get('type') || 'trending_movie';

    if (categories[currentType]) {
        categoryTitle.textContent = categories[currentType].title;
        fetchData();
    } else {
        categoryTitle.textContent = 'Category Not Found';
        loading.classList.add('hidden');
    }
}

async function fetchData() {
    loading.classList.remove('hidden');
    document.getElementById('loadMoreContainer').classList.add('hidden');

    try {
        const cat = categories[currentType];
        let url = `https://api.themoviedb.org/3/${cat.endpoint}?api_key=${API_KEY}&page=${currentPage}${cat.params || ''}`;

        const response = await fetch(url);
        const data = await response.json();

        renderCards(data.results);

        if (data.page < data.total_pages) {
            document.getElementById('loadMoreContainer').classList.remove('hidden');
            currentPage++;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        grid.innerHTML = '<p class="col-span-full text-center text-gray-400">Error loading content.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}

function renderCards(items) {
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

// Modal functions
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
loadMoreBtn.addEventListener('click', fetchData);
window.closeModal = closeModal;

// Initialize
init();
