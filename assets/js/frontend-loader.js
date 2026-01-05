// API Configuration
const API_URL = '/api';

// Helper to fetch data
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
}

// Date formatter
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ==========================================
// LOAD DATA FUNCTIONS
// ==========================================

async function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    const news = await fetchAPI('news');
    if (news.length === 0) return; // Keep placeholder if no data

    container.innerHTML = news.slice(0, 6).map(item => `
        <article class="news-card" data-aos="fade-up">
            <div class="news-image">
                <img src="${item.image || 'assets/images/default-news.jpg'}" alt="${item.title}" 
                     onerror="this.src='assets/images/default-news.jpg'">
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-date"><i class="far fa-calendar-alt"></i> ${formatDate(item.date)}</span>
                    <span class="news-category tag">${item.category}</span>
                </div>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-excerpt">${item.content ? item.content.substring(0, 100) + '...' : ''}</p>
                <div class="news-footer">
                    <span class="news-author"><i class="far fa-user"></i> ${item.author || 'Admin'}</span>
                </div>
            </div>
        </article>
    `).join('');
}

async function loadServices() {
    const container = document.querySelector('#services .features-grid');
    if (!container) return;

    const services = await fetchAPI('services');
    if (services.length === 0) return;

    // Filter active services
    const activeServices = services.filter(s => s.status === 'active');

    if (activeServices.length > 0) {
        container.innerHTML = activeServices.map(s => `
            <article class="feature-card" data-aos="fade-up">
                <div class="feature-icon">
                    <i class="fas fa-concierge-bell"></i>
                </div>
                <h3 class="feature-title">${s.name}</h3>
                <p class="feature-description">${s.description || ''}</p>
                ${s.location ? `<div class="feature-meta"><i class="fas fa-map-marker-alt"></i> <div class="meta-info"><span class="meta-value">${s.location}</span></div></div>` : ''}
            </article>
        `).join('');
    }
}

async function loadEducation() {
    const container = document.querySelector('#education .dynamic-container');
    if (!container) return;

    const items = await fetchAPI('education');
    if (items.length === 0) return;

    container.innerHTML = `<div class="features-grid">` + items.map(school => `
        <article class="feature-card" data-aos="fade-up">
            <div class="feature-icon"><i class="fas fa-school"></i></div>
            <h3 class="feature-title">${school.name}</h3>
            <div class="feature-content" style="text-align: left;">
                <div class="feature-meta">
                    <i class="fas fa-layer-group"></i>
                    <div class="meta-info">
                        <span class="meta-label">Level:</span>
                        <span class="meta-value">${school.level}</span>
                    </div>
                </div>
                <div class="feature-meta">
                    <i class="fas fa-user-tie"></i>
                    <div class="meta-info">
                        <span class="meta-label">Principal:</span>
                        <span class="meta-value">${school.principal || 'N/A'}</span>
                    </div>
                </div>
                <div class="feature-meta">
                    <i class="fas fa-map-pin"></i>
                    <div class="meta-info">
                        <span class="meta-label">Location:</span>
                        <span class="meta-value">${school.location}</span>
                    </div>
                </div>
            </div>
        </article>
    `).join('') + `</div>`;
}

async function loadHealthcare() {
    const container = document.querySelector('#healthcare .dynamic-container');
    if (!container) return;

    const items = await fetchAPI('healthcare');
    if (items.length === 0) return;

    container.innerHTML = `<div class="features-grid">` + items.map(facility => `
        <article class="feature-card" data-aos="fade-up">
            <div class="feature-icon"><i class="fas fa-heartbeat"></i></div>
            <h3 class="feature-title">${facility.name}</h3>
            <div class="feature-content" style="text-align: left;">
                <div class="feature-meta">
                    <i class="fas fa-hospital-alt"></i>
                    <div class="meta-info">
                        <span class="meta-label">Type:</span>
                        <span class="meta-value">${facility.type}</span>
                    </div>
                </div>
                <div class="feature-meta">
                    <i class="fas fa-stethoscope"></i>
                    <div class="meta-info">
                        <span class="meta-label">Services:</span>
                        <span class="meta-value">${facility.services || 'N/A'}</span>
                    </div>
                </div>
                <div class="feature-meta">
                    <i class="fas fa-map-pin"></i>
                    <div class="meta-info">
                        <span class="meta-label">Location:</span>
                        <span class="meta-value">${facility.location}</span>
                    </div>
                </div>
            </div>
        </article>
    `).join('') + `</div>`;
}

async function loadPoliticians() {
    const container = document.querySelector('#politician .dynamic-container');
    if (!container) return;

    const items = await fetchAPI('politicians');
    if (items.length === 0) return;

    container.innerHTML = `<div class="politicians-grid">` + items.map(pol => `
        <div class="politician-card" data-aos="fade-up">
            <div class="card-image">
                <img src="${pol.image || 'assets/images/default-avatar.png'}" alt="${pol.name}"
                     onerror="this.src='assets/images/default-avatar.png'">
            </div>
            <div class="card-content">
                <h3>${pol.name}</h3>
                <span class="position">${pol.position}</span>
                <span class="party">${pol.party || 'Independent'}</span>
                <p>${pol.bio || ''}</p>
            </div>
        </div>
    `).join('') + `</div>`;
}

async function loadStats() {
    const stats = await fetchAPI('stats');
    if (!stats) return;

    // Update stat numbers if elements exist
    const updateStat = (id, value) => {
        const el = document.querySelector(`[data-stat="${id}"]`); // Assuming we add data-stat attributes
        if (el) el.textContent = value;
    };

    // Or iterate over existing data-count elements and try to map them
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Connecting to Guit County Database...');
    loadNews();
    loadServices();
    loadEducation();
    loadHealthcare();
    loadPoliticians();
    // Add other loaders as needed
});
