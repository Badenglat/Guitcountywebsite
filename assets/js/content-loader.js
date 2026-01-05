/**
 * GUIT COUNTY - CONTENT LOADER
 * Version: 2.0.1 (Enhanced)
 * Handles loading of dynamic content from Admin Panel data
 */

(function () {
    'use strict';

    console.log('%c📦 Content Loader initialized', 'color: #0061f2; font-weight: bold;');

    // ===================================
    // CONFIGURATION
    // ===================================
    const CONFIG = {
        STORAGE_KEY: 'guitPublicData',
        COMMENTS_PREFIX: 'guitNewsComments_',
        DEFAULT_IMAGE: 'assets/images/guit-logo.jpg',
        MAX_EXCERPT_LENGTH: 150,
        AUTO_RELOAD_INTERVAL: 60000 // Check for updates every 60s
    };

    // ===================================
    // STATE
    // ===================================
    let publicData = null;
    let isInitialized = false;

    // ===================================
    // INITIALIZE
    // ===================================
    async function init() {
        if (isInitialized) return;

        console.log('🌐 Fetching latest data from Guit County Server...');

        try {
            const hasData = await loadData();

            if (hasData) {
                console.log('✅ Content synchronized with database');
                renderAllContent();
            } else {
                console.log('ℹ️ No live data available - showing default sections');
            }

            isInitialized = true;

            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('contentLoaded', {
                detail: { hasData: hasData }
            }));

        } catch (error) {
            console.error('❌ Content Loader Sync Error:', error);
            handleError(error);
        }
    }

    // ===================================
    // LOAD DATA
    // ===================================
    async function loadData() {
        try {
            const response = await fetch('/api/public-data');
            if (!response.ok) throw new Error('Failed to fetch public data');

            const data = await response.json();
            if (data) {
                publicData = data;
                // Cache for offline/speed
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
                return true;
            }
        } catch (error) {
            console.warn('⚠️ API fetch failed, trying local cache...');
            const cached = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (cached) {
                publicData = JSON.parse(cached);
                return true;
            }
        }
        return false;
    }

    // ===================================
    // HANDLE STORAGE CHANGES
    // ===================================
    function handleStorageChange(e) {
        if (e.key === CONFIG.STORAGE_KEY) {
            console.log('📡 Admin data updated in another tab');
            loadData();
            renderAllContent();
        }
    }

    // ===================================
    // CHECK FOR UPDATES
    // ===================================
    function checkForUpdates() {
        const currentData = JSON.stringify(publicData);
        loadData();
        const newData = JSON.stringify(publicData);

        if (currentData !== newData) {
            console.log('🔄 Content updated, refreshing...');
            renderAllContent();
        }
    }

    // Generic Icon Map
    const iconMap = {
        'education': 'fa-graduation-cap',
        'healthcare': 'fa-heartbeat',
        'history': 'fa-landmark',
        'politicians': 'fa-user-tie',
        'military': 'fa-shield-alt',
        'sports': 'fa-futbol',
        'payams': 'fa-map-marked-alt',
        'boma': 'fa-building', // Fixed boma key to plural if needed, but keeping consistency
        'bomas': 'fa-building',
        'ports': 'fa-anchor',
        'artists': 'fa-music',
        'leaders': 'fa-users-cog',
        'students': 'fa-user-graduate'
    };

    // ===================================
    // RENDER ALL CONTENT
    // ===================================
    function renderAllContent() {
        if (!publicData) return;

        console.log('🎨 Rendering all content...');

        try {
            // 1. News
            if (publicData.news && Array.isArray(publicData.news)) {
                renderNews(publicData.news);
            }

            // 2. Services
            if (publicData.services && Array.isArray(publicData.services)) {
                renderServices(publicData.services);
            }

            // 3. Generic Sections
            const sectionMappings = {
                'education': 'education',
                'history': 'history',
                'healthcare': 'healthcare',
                'politician': 'politicians',
                'military': 'military',
                'payam': 'payams',
                'boma': 'bomas',
                'sports': 'sports',
                'ports': 'ports',
                'artists': 'artists',
                'community-leaders': 'leaders',
                'students': 'students'
            };

            Object.entries(sectionMappings).forEach(([sectionId, dataKey]) => {
                try {
                    if (publicData[dataKey] && Array.isArray(publicData[dataKey])) {
                        renderGenericList(sectionId, publicData[dataKey], dataKey);
                    }
                } catch (secErr) {
                    console.error(`Error rendering section ${sectionId}:`, secErr);
                }
            });

            // 4. Commissioner Profile
            if (publicData.commissioner) {
                renderCommissionerProfile(publicData.commissioner);
            }

            // 5. Population Stats
            if (publicData.population || publicData.payams) {
                updatePopulationStats(publicData.population);
            }

            // 6. Hero Slideshow
            if (publicData.slides && Array.isArray(publicData.slides)) {
                updateHeroSlides(publicData.slides);
            }

            // 7. Re-initialize animations and rich media
            reinitializeAnimations();
            initMediaPreviews();

            console.log('✅ All content rendered successfully');

        } catch (error) {
            console.error('Error rendering content:', error);
        }
    }

    // ===================================
    // RENDER NEWS
    // ===================================
    function renderNews(newsItems) {
        const container = document.querySelector('#news .news-grid') ||
            document.getElementById('news-container');

        if (!container) {
            console.warn('News container not found');
            return;
        }

        if (!newsItems || newsItems.length === 0) {
            container.innerHTML = `
                <div class="dynamic-container" data-aos="fade-up">
                    <div class="dynamic-container-content">
                        <i class="fas fa-newspaper" aria-hidden="true"></i>
                        <p>News content will be updated by the administrator.</p>
                        <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">Check back soon for the latest updates.</p>
                    </div>
                </div>
            `;
            if (container.classList.contains('news-grid')) {
                container.style.display = 'block';
            }
            return;
        }

        if (container.classList.contains('news-grid')) {
            container.style.display = 'grid';
        }

        const html = newsItems.map((item, index) => {
            const commentsCount = getCommentsCount(item._id || item.id);
            const mediaIcon = item.mediaType === 'video' ? 'fa-play-circle' : (item.mediaType === 'audio' ? 'fa-volume-up' : 'fa-image');

            // Smarter media preview logic
            let mediaHtml = '';
            const defaultImage = item.image || CONFIG.DEFAULT_IMAGE;

            if (item.mediaType === 'video' && item.mediaUrl) {
                const videoId = extractYoutubeId(item.mediaUrl);
                if (videoId) {
                    // YouTube video - use its high-quality thumbnail
                    mediaHtml = `
                        <div class="video-preview-wrapper">
                            <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
                                 alt="${escapeHtml(item.title)}" 
                                 class="media-preview-img"
                                 onerror="this.src='https://img.youtube.com/vi/${videoId}/sddefault.jpg'; this.onerror=function(){this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'};">
                        </div>
                    `;
                } else {
                    // Hosted video - show actual video preview
                    mediaHtml = `
                        <div class="video-preview-wrapper">
                            <video src="${item.mediaUrl}" muted loop playsinline class="media-preview-video" poster="${defaultImage}">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    `;
                }
            } else if (item.mediaType === 'audio') {
                // Audio - maybe show a stylish audio-themed background if no image
                mediaHtml = `
                    <div class="audio-placeholder-bg">
                        <img src="${defaultImage}" alt="${escapeHtml(item.title)}" onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
                        <div class="audio-waves">
                            <span></span><span></span><span></span><span></span><span></span>
                        </div>
                    </div>
                `;
            } else {
                // Standard image
                mediaHtml = `
                    <img src="${defaultImage}" 
                         alt="${escapeHtml(item.title)}" 
                         onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
                `;
            }

            return `
                <article class="news-card modern-card" data-aos="fade-up" data-aos-delay="${index * 100}" 
                         onclick="window.ContentLoader.openNewsModal('${item._id || item.id}')" style="cursor: pointer;">
                    <div class="news-image ${item.mediaType || 'image'}">
                        ${mediaHtml}
                        <span class="news-category">${escapeHtml(item.category || 'News')}</span>
                        ${item.mediaType && item.mediaType !== 'image' ? `
                            <div class="media-indicator">
                                <i class="fas ${mediaIcon}"></i>
                            </div>
                        ` : ''}
                    </div>
                    <div class="news-content">
                        <div class="news-meta">
                            <span><i class="fas fa-calendar" aria-hidden="true"></i> ${formatDate(item.date)}</span>
                            <span><i class="fas fa-user" aria-hidden="true"></i> ${escapeHtml(item.author || 'Admin')}</span>
                        </div>
                        <h3 class="news-title">${escapeHtml(item.title)}</h3>
                        <p class="news-excerpt">${escapeHtml(getExcerpt(item))}</p>
                        
                        <div class="news-card-footer">
                            <div class="news-actions">
                                <button class="action-btn like-btn ${isLiked(item._id || item.id) ? 'active' : ''}" 
                                        onclick="event.stopPropagation(); window.ContentLoader.likeNews('${item._id || item.id}')"
                                        title="Like this post">
                                    <i class="fas fa-heart"></i>
                                    <span class="likes-count">${item.likes || 0}</span>
                                </button>
                                <button class="action-btn comment-btn" 
                                        onclick="window.ContentLoader.openNewsModal('${item._id || item.id}')"
                                        title="View comments">
                                    <i class="fas fa-comment"></i>
                                    <span class="comments-count">${commentsCount}</span>
                                </button>
                            </div>
                            <button class="read-more-btn" 
                                    onclick="window.ContentLoader.openNewsModal('${item._id || item.id}')"
                                    type="button">
                                Read More <i class="fas fa-chevron-right action-icon"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        container.innerHTML = html;
        console.log(`✓ Rendered ${newsItems.length} modern news items`);
    }

    // ===================================
    // RENDER SERVICES
    // ===================================
    function renderServices(services) {
        const container = document.querySelector('#services .features-grid');

        if (!container) {
            console.warn('Services container not found');
            return;
        }

        if (!services || services.length === 0) {
            console.log('No services to display');
            return;
        }

        const html = services.map((service, index) => `
            <article class="feature-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="feature-icon">
                    <i class="fas ${escapeHtml(service.icon || 'fa-concierge-bell')}" aria-hidden="true"></i>
                </div>
                <h3 class="feature-title">${escapeHtml(service.title)}</h3>
                <p class="feature-description">${escapeHtml(service.description)}</p>
                ${service.link ? `
                    <a href="${escapeHtml(service.link)}" class="feature-link">
                        Learn More <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </a>
                ` : ''}
            </article>
        `).join('');

        container.innerHTML = html;
        console.log(`✓ Rendered ${services.length} services`);
    }

    // ===================================
    // RENDER GENERIC LIST
    // ===================================
    function renderGenericList(sectionId, items, type) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        // Find the appropriate container
        const container = section.querySelector('.features-grid') ||
            section.querySelector('.politicians-grid') ||
            section.querySelector('.dynamic-container') ||
            section.querySelector(`#${sectionId}-container`);

        if (!container) return;

        if (!items || items.length === 0) {
            container.style.display = 'none';
            if (section.querySelector('.section-subtitle') && !section.querySelector('.no-data-msg')) {
                section.querySelector('.section-subtitle').insertAdjacentHTML('afterend', `
                    <div class="text-center p-5 text-secondary no-data-msg">
                        <i class="fas ${iconMap[type] || 'fa-info-circle'} fa-3x mb-3 opacity-50"></i>
                        <p>Information under update. Please check back later.</p>
                    </div>
                 `);
            }
            return;
        }

        // Clear existing msg if any
        const msg = section.querySelector('.no-data-msg');
        if (msg) msg.remove();

        // Clear existing content and render
        const gridHtml = items.map((item, index) => createGenericCard(item, type, index)).join('');
        container.innerHTML = gridHtml;

        // Apply grid styling based on type
        if (type === 'politicians') {
            container.className = 'politicians-grid';
        } else if (!container.classList.contains('features-grid')) {
            container.classList.add('features-grid');
        }

        container.style.display = 'grid';
        if (type !== 'politicians') container.style.gap = '2rem';
    }

    // ===================================
    // CREATE GENERIC CARD
    // ===================================
    function createGenericCard(item, type, index) {
        // Handle Politicians separately for premium styling
        if (type === 'politicians') {
            const name = item.fullName || item.name || 'Anonymous Politician';
            const img = item.photo || item.image || 'assets/images/default-avatar.png';
            const position = item.position || 'County Representative';
            const party = item.party || 'Independent';
            const bio = item.bio || item.description || 'Dedicated to serving the people of Guit County.';
            const contact = item.contact || item.phone || '';

            return `
                <article class="politician-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="politician-photo-wrapper">
                        <img src="${escapeHtml(img)}" 
                             alt="${escapeHtml(name)}" 
                             class="politician-photo"
                             onerror="this.src='assets/images/default-avatar.png';">
                    </div>
                    <div class="politician-info">
                        <h3 class="politician-name">${escapeHtml(name)}</h3>
                        <div class="politician-position">
                            <i class="fas fa-briefcase"></i> ${escapeHtml(position)}
                        </div>
                        <div class="politician-party">
                            <i class="fas fa-flag"></i> ${escapeHtml(party)}
                        </div>
                        <div class="politician-bio">
                            <h4><i class="fas fa-info-circle"></i> Biography</h4>
                            <p>${escapeHtml(bio)}</p>
                        </div>
                        ${contact ? `
                            <div class="politician-contact">
                                <i class="fas fa-phone-alt"></i> 
                                <a href="tel:${escapeHtml(contact)}">${escapeHtml(contact)}</a>
                            </div>
                        ` : ''}
                    </div>
                </article>
            `;
        }

        const icon = iconMap[type] || 'fa-info-circle';

        // Priority for title based on type (Names for people, Titles for entities)
        let title = 'Untitled';
        if (['leaders', 'students', 'artists', 'military'].includes(type)) {
            title = item.fullName || item.stageName || item.name || item.title || 'Untitled';
        } else {
            title = item.title || item.name || item.fullName || 'Untitled';
        }

        const desc = item.description || item.bio || item.content || item.details || item.message || '';

        // Ensure img is either a valid string or null
        let img = item.image || item.photo || null;
        if (typeof img === 'string' && img.trim() === '') img = null;

        // Specific defaults
        const defaults = {
            'leaders': 'assets/images/default-leader.jpg',
            'students': 'assets/images/default-student.jpg',
            'artists': 'assets/images/default-artist.jpg',
            'news': 'assets/images/default-news.jpg',
            'military': 'assets/images/default-avatar.png'
        };
        const defaultImg = defaults[type] || CONFIG.DEFAULT_IMAGE;

        let metaHtml = '';

        // Metadata based on type
        if (type === 'history') {
            if (item.year) metaHtml += `<div class="feature-meta"><i class="fas fa-calendar-alt"></i> <div class="meta-info"><span class="meta-label">Year:</span> <span class="meta-value">${escapeHtml(item.year)}</span></div></div>`;
            if (item.category) metaHtml += `<div class="feature-meta"><i class="fas fa-tag"></i> <div class="meta-info"><span class="tag">${capitalizeFirst(item.category)}</span></div></div>`;
        } else if (type === 'payams') {
            if (item.chief) metaHtml += `<div class="feature-meta"><i class="fas fa-user-shield"></i> <div class="meta-info"><span class="meta-label">Chief:</span> <span class="meta-value">${escapeHtml(item.chief)}</span></div></div>`;
            if (item.population) metaHtml += `<div class="feature-meta"><i class="fas fa-users"></i> <div class="meta-info"><span class="meta-label">Population:</span> <span class="meta-value">${item.population ? Number(item.population).toLocaleString() : 'N/A'}</span></div></div>`;
        } else if (type === 'bomas') {
            if (item.payam) metaHtml += `<div class="feature-meta"><i class="fas fa-map-marker-alt"></i> <div class="meta-info"><span class="meta-label">Payam:</span> <span class="meta-value">${escapeHtml(item.payam)}</span></div></div>`;
            if (item.chief) metaHtml += `<div class="feature-meta"><i class="fas fa-user-shield"></i> <div class="meta-info"><span class="meta-label">Chief:</span> <span class="meta-value">${escapeHtml(item.chief)}</span></div></div>`;
            if (item.population) metaHtml += `<div class="feature-meta"><i class="fas fa-users"></i> <div class="meta-info"><span class="meta-label">Population:</span> <span class="meta-value">${item.population ? Number(item.population).toLocaleString() : 'N/A'}</span></div></div>`;
        } else if (type === 'education') {
            if (item.level) metaHtml += `<div class="feature-meta"><i class="fas fa-layer-group"></i> <div class="meta-info"><span class="meta-label">Level:</span> <span class="meta-value">${escapeHtml(item.level)}</span></div></div>`;
            if (item.principal) metaHtml += `<div class="feature-meta"><i class="fas fa-user-tie"></i> <div class="meta-info"><span class="meta-label">Principal:</span> <span class="meta-value">${escapeHtml(item.principal)}</span></div></div>`;
            if (item.location) metaHtml += `<div class="feature-meta"><i class="fas fa-map-pin"></i> <div class="meta-info"><span class="meta-label">Location:</span> <span class="meta-value">${escapeHtml(item.location)}</span></div></div>`;
        } else if (type === 'healthcare') {
            let healthIcon = 'fa-hospital-alt';
            if (item.type?.toLowerCase().includes('clinic')) healthIcon = 'fa-clinic-medical';
            if (item.type?.toLowerCase().includes('pharmacy')) healthIcon = 'fa-prescription-bottle-alt';

            if (item.type) metaHtml += `<div class="feature-meta"><i class="fas ${healthIcon}"></i> <div class="meta-info"><span class="meta-label">Type:</span> <span class="meta-value">${escapeHtml(item.type)}</span></div></div>`;
            if (item.services) metaHtml += `<div class="feature-meta"><i class="fas fa-stethoscope"></i> <div class="meta-info"><span class="meta-label">Services:</span> <span class="meta-value">${escapeHtml(item.services)}</span></div></div>`;
            if (item.location) metaHtml += `<div class="feature-meta"><i class="fas fa-map-pin"></i> <div class="meta-info"><span class="meta-label">Location:</span> <span class="meta-value">${escapeHtml(item.location)}</span></div></div>`;
        } else if (type === 'military') {
            if (item.rank) metaHtml += `<div class="feature-meta"><i class="fas fa-medal"></i> <div class="meta-info"><span class="meta-label">Rank:</span> <span class="meta-value">${escapeHtml(item.rank)}</span></div></div>`;
            if (item.branch) metaHtml += `<div class="feature-meta"><i class="fas fa-shield-alt"></i> <div class="meta-info"><span class="meta-label">Branch:</span> <span class="meta-value">${escapeHtml(item.branch)}</span></div></div>`;
        } else if (type === 'artists') {
            if (item.stageName && item.stageName !== item.fullName) metaHtml += `<div class="feature-meta"><i class="fas fa-microphone"></i> <div class="meta-info"><span class="meta-label">Stage:</span> <span class="meta-value">${escapeHtml(item.stageName)}</span></div></div>`;
            if (item.genre) metaHtml += `<div class="feature-meta"><i class="fas fa-tag"></i> <div class="meta-info"><span class="tag">${escapeHtml(item.genre)}</span></div></div>`;
        } else if (type === 'leaders') {
            if (item.title) metaHtml += `<div class="feature-meta"><i class="fas fa-briefcase"></i> <div class="meta-info"><span class="meta-label">Position:</span> <span class="meta-value">${escapeHtml(item.title)}</span></div></div>`;
            if (item.category) metaHtml += `<div class="feature-meta"><i class="fas fa-id-badge"></i> <div class="meta-info"><span class="tag">${escapeHtml(item.category)}</span></div></div>`;
            if (item.payam) metaHtml += `<div class="feature-meta"><i class="fas fa-map-marker-alt"></i> <div class="meta-info"><span class="meta-value">${escapeHtml(item.payam)}${item.boma ? ' / ' + escapeHtml(item.boma) : ''}</span></div></div>`;
        } else if (type === 'students') {
            if (item.level) metaHtml += `<div class="feature-meta"><i class="fas fa-graduation-cap"></i> <div class="meta-info"><span class="meta-label">Level:</span> <span class="meta-value">${escapeHtml(item.level)}</span></div></div>`;
            if (item.institution) metaHtml += `<div class="feature-meta"><i class="fas fa-university"></i> <div class="meta-info"><span class="meta-value">${escapeHtml(item.institution)}</span></div></div>`;
            if (item.field) metaHtml += `<div class="feature-meta"><i class="fas fa-book"></i> <div class="meta-info"><span class="meta-value">${escapeHtml(item.field)}</span></div></div>`;
        }

        let contentHtml = '';
        // Ensure we check mediaType case-insensitively and handle missing mediaUrl
        const activeMediaType = (item.mediaType || 'image').toLowerCase();
        const defaultImage = item.image || item.photo || defaultImg;

        if (activeMediaType === 'video' && item.mediaUrl) {
            const videoId = extractYoutubeId(item.mediaUrl);
            if (videoId) {
                const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                contentHtml = `
                    <div class="feature-image" style="height: 240px; overflow: hidden; border-radius: 0.75rem; margin-bottom: 1.25rem; background:#000; position:relative;">
                        <img src="${thumbUrl}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'; this.onerror=function(){this.src='${defaultImg}'}">
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:50px; height:50px; background:rgba(255,255,255,0.2); backdrop-filter:blur(5px); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; border:2px solid #fff; pointer-events:none;">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
            } else {
                contentHtml = `
                    <div class="feature-image" style="height: 240px; overflow: hidden; border-radius: 0.75rem; margin-bottom: 1.25rem; background:#000; position:relative;">
                        <video src="${item.mediaUrl}" muted loop playsinline class="media-preview-video" style="width: 100%; height: 100%; object-fit: cover;" poster="${defaultImage}"></video>
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:50px; height:50px; background:rgba(255,255,255,0.2); backdrop-filter:blur(5px); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; border:2px solid #fff; pointer-events:none;">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
            }
        } else if (item.mediaType === 'audio' && item.mediaUrl) {
            contentHtml = `
                <div class="feature-image" style="height: 240px; overflow: hidden; border-radius: 0.75rem; margin-bottom: 1.25rem; position:relative;">
                    <div class="audio-placeholder-bg" style="width:100%; height:100%; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <img src="${defaultImage}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.3;" onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
                        <div class="audio-waves" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 4px; height: 30px;">
                            <span style="width: 4px; background: rgba(255, 255, 255, 0.8); border-radius: 2px; height: 10px; animation: quiet 1.2s ease-in-out infinite;"></span>
                            <span style="width: 4px; background: rgba(255, 255, 255, 0.8); border-radius: 2px; height: 10px; animation: loud 1.2s ease-in-out infinite; animation-delay: 0.2s;"></span>
                            <span style="width: 4px; background: rgba(255, 255, 255, 0.8); border-radius: 2px; height: 10px; animation: loud 1.2s ease-in-out infinite; animation-delay: 0.4s;"></span>
                            <span style="width: 4px; background: rgba(255, 255, 255, 0.8); border-radius: 2px; height: 10px; animation: quiet 1.2s ease-in-out infinite; animation-delay: 0.6s;"></span>
                            <span style="width: 4px; background: rgba(255, 255, 255, 0.8); border-radius: 2px; height: 10px; animation: loud 1.2s ease-in-out infinite; animation-delay: 0.8s;"></span>
                        </div>
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:60px; height:60px; background:rgba(255,255,255,0.2); backdrop-filter:blur(10px); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; border:2px solid rgba(255,255,255,0.5);">
                            <i class="fas fa-volume-up fa-2x"></i>
                        </div>
                    </div>
                </div>
            `;
        } else if (img || defaults[type]) {
            const imgSrc = img || defaultImg;
            contentHtml = `
                <div class="feature-image" style="height: 240px; overflow: hidden; border-radius: 0.75rem; margin-bottom: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <img src="${escapeHtml(imgSrc)}" 
                         alt="${escapeHtml(title)}" 
                         style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;"
                         onerror="this.src='${defaultImg}'; this.onerror=null;"
                         onmouseover="this.style.transform='scale(1.05)'"
                         onmouseout="this.style.transform='scale(1)'">
                </div>
            `;
        } else {
            contentHtml = `
                <div class="feature-icon" style="height: 120px; width: 100%; display: flex; align-items: center; justify-content: center; background: var(--gray-50); border-radius: 0.75rem; margin-bottom: 1.25rem;">
                    <i class="fas ${icon}" aria-hidden="true" style="font-size: 3rem; color: var(--primary-color);"></i>
                </div>
            `;
        }

        const truncatedDesc = desc.length > CONFIG.MAX_EXCERPT_LENGTH
            ? desc.substring(0, CONFIG.MAX_EXCERPT_LENGTH) + '...'
            : desc;

        return `
            <article class="feature-card" data-aos="fade-up" data-aos-delay="${index * 50}" 
                     style="display: flex; flex-direction: column; padding: 1.5rem; transition: all 0.3s ease; cursor: pointer;"
                     onclick="window.ContentLoader.openGenericModal('${type}', '${item._id || item.id}')">
                ${contentHtml}
                <div class="feature-content" style="flex: 1; text-align: left;">
                    <h3 class="feature-title" style="margin-bottom: 0.5rem; font-size: 1.25rem; color: var(--primary-dark);">${escapeHtml(title)}</h3>
                    ${metaHtml}
                    ${truncatedDesc ? `<p class="feature-description" style="margin-top: 1rem; color: var(--gray-600); font-size: 0.95rem;">${escapeHtml(truncatedDesc)}</p>` : ''}
                    <div class="feature-link-container">
                        <span class="feature-link">
                            Read More <i class="fas fa-chevron-right action-icon"></i>
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    function openGenericModal(type, itemId) {
        if (!publicData || !publicData[type]) return;
        const item = publicData[type].find(i => (i._id || i.id) === itemId);
        if (!item) return;

        const title = item.fullName || item.title || item.name || 'Detail View';
        const desc = item.description || item.bio || item.content || item.details || '';

        // Media rendering for modal
        let mediaHtml = '';
        if (item.mediaType === 'video' && item.mediaUrl) {
            const videoId = extractYoutubeId(item.mediaUrl);
            if (videoId) {
                mediaHtml = `<div class="modal-media-wrapper video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
            } else {
                mediaHtml = `<div class="modal-media-wrapper video-wrapper"><video src="${item.mediaUrl}" controls style="width: 100%; max-height: 70vh;"></video></div>`;
            }
        } else if (item.mediaType === 'audio' && item.mediaUrl) {
            mediaHtml = `
                <div class="modal-media-wrapper audio-wrapper" style="padding: 3rem; background: var(--bg-tertiary); text-align: center;">
                    <div style="font-size: 4rem; color: var(--primary-color); margin-bottom: 2rem;"><i class="fas fa-volume-up"></i></div>
                    <audio src="${item.mediaUrl}" controls style="width: 100%"></audio>
                </div>`;
        } else {
            const img = item.image || item.photo || item.image || CONFIG.DEFAULT_IMAGE;
            mediaHtml = `
                <div class="news-modal-header" style="height: 350px;">
                    <img src="${img}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>`;
        }

        const modalHtml = `
            <div id="genericModal" class="news-modal-overlay">
                <div class="news-modal-content modern-modal">
                    <button onclick="this.closest('.news-modal-overlay').remove(); document.body.style.overflow=''" class="modal-close"><i class="fas fa-times"></i></button>
                    ${mediaHtml}
                    <div class="news-modal-body">
                        <h2 style="margin-top: 1rem;">${escapeHtml(title)}</h2>
                        <div class="news-full-content" style="white-space: pre-wrap; margin-top: 1.5rem;">${escapeHtml(desc)}</div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';
    }

    // ===================================
    // UPDATE POPULATION STATS
    // ===================================
    function updatePopulationStats(popData) {
        let totalPop = 0;

        // Calculate total from payams
        if (publicData.payams && Array.isArray(publicData.payams)) {
            totalPop = publicData.payams.reduce((sum, p) => {
                return sum + (parseInt(p.population) || 0);
            }, 0);
        }

        // Update sidebar stats
        document.querySelectorAll('.stat-item, .stat-card').forEach(item => {
            const label = item.querySelector('.stat-label');
            if (!label) return;

            const labelText = label.textContent.trim();
            const number = item.querySelector('.stat-number');

            if (!number) return;

            if (labelText === 'Population') {
                number.setAttribute('data-count', totalPop);
                number.textContent = totalPop.toLocaleString();
            }

            if (popData) {
                if (labelText.includes('2008 Census') && popData.census2008) {
                    number.setAttribute('data-count', popData.census2008);
                    number.textContent = parseInt(popData.census2008).toLocaleString();
                }

                if (labelText.includes('2017 Projection') && popData.projection2017) {
                    number.setAttribute('data-count', popData.projection2017);
                    number.textContent = parseInt(popData.projection2017).toLocaleString();
                }
            }
        });

        // Update population section with table
        const popSection = document.getElementById('population');
        if (popSection && publicData.payams && publicData.payams.length > 0) {
            const container = popSection.querySelector('.dynamic-container');
            if (container) {
                container.innerHTML = createPopulationTable(totalPop);
                container.style.display = 'block';
                container.style.border = 'none';
            }
        }

        console.log(`✓ Updated population stats (Total: ${totalPop.toLocaleString()})`);
    }

    // ===================================
    // CREATE POPULATION TABLE
    // ===================================
    function createPopulationTable(totalPop) {
        return `
            <div class="population-stats-container" style="width: 100%;">
                <div class="stats-summary" style="text-align: center; margin-bottom: 2rem;">
                    <h3 style="font-size: 2.5rem; color: var(--primary-color);">${totalPop.toLocaleString()}</h3>
                    <p style="color: var(--gray-600);">Total Estimated Population</p>
                </div>
                <div class="table-responsive">
                    <table class="population-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--gray-100); text-align: left;">
                                <th style="padding: 1rem; font-weight: 600;">Payam</th>
                                <th style="padding: 1rem; font-weight: 600; text-align: right;">Population</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${publicData.payams.map((p, index) => `
                                <tr style="border-bottom: 1px solid var(--gray-200); transition: background 0.2s ease;" data-aos="fade-up" data-aos-delay="${index * 50}">
                                    <td style="padding: 1rem;">${escapeHtml(p.name)}</td>
                                    <td style="padding: 1rem; text-align: right; font-weight: 600;">${(parseInt(p.population) || 0).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background: var(--primary-color); color: white; font-weight: 700;">
                                <td style="padding: 1rem;">Total</td>
                                <td style="padding: 1rem; text-align: right;">${totalPop.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    }

    // ===================================
    // RENDER COMMISSIONER PROFILE
    // ===================================
    function renderCommissionerProfile(data) {
        const section = document.getElementById('commissioner');
        if (!section) {
            console.error('Commissioner section not found in DOM');
            return;
        }

        const container = section.querySelector('.dynamic-container');
        if (!container) {
            console.error('Dynamic container for commissioner not found');
            return;
        }

        if (!data || !data.name) {
            console.log('No commissioner data available to render');
            // If explicit empty data is passed, we might want to hide or show placeholder
            return;
        }

        console.log('Rendering Commissioner:', data.name);

        const photoUrl = data.photo || 'assets/images/placeholder-user.jpg';
        const message = data.message || 'Serving the people of Guit County with dedication and integrity.';

        container.innerHTML = `
            <div class="commissioner-profile">
                <div class="profile-image-container">
                    <img src="${escapeHtml(photoUrl)}" 
                         alt="${escapeHtml(data.name)}" 
                         onerror="this.src='assets/images/placeholder-user.jpg'">
                </div>
                <h3>${escapeHtml(data.name)}</h3>
                <span class="badge">County Commissioner</span>
                <div class="profile-bio">
                    <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
                </div>
            </div>
        `;

        // Ensure container is visible
        container.style.display = 'block';
        container.style.opacity = '1';
        container.style.visibility = 'visible';

        // Reset legacy styles that might interfere with CSS classes
        container.style.border = '';
        container.style.background = '';
        container.style.boxShadow = '';

        container.parentElement.style.display = 'block'; // Ensure section is visible

        console.log('✓ Rendered commissioner profile successfully');
    }

    // ===================================
    // UPDATE HERO SLIDES
    // ===================================
    function updateHeroSlides(slides) {
        const container = document.querySelector('.slideshow-container');
        const existingSlides = container.querySelectorAll('.hero-slide');

        if (!container || !existingSlides.length) {
            console.warn('Slideshow container or slides not found');
            return;
        }

        if (!slides || slides.length === 0) {
            console.log('No custom slides to display');
            return;
        }

        // Sort by order
        const sortedSlides = [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));

        // Update existing slides with dynamic data
        sortedSlides.forEach((slide, index) => {
            if (index < existingSlides.length) {
                const slideEl = existingSlides[index];
                const img = slideEl.querySelector('img');
                const overlay = slideEl.querySelector('.hero-overlay');

                // Update Image
                if (img && slide.image) {
                    img.src = escapeHtml(slide.image);
                    if (slide.alt) img.alt = escapeHtml(slide.alt);
                }

                // Update Content (Title, Subtitle, Link)
                // Check if content wrapper exists, if not create it
                let contentDiv = slideEl.querySelector('.hero-content');
                if ((slide.title || slide.subtitle || slide.link) && !contentDiv) {
                    contentDiv = document.createElement('div');
                    contentDiv.className = 'hero-content';
                    // Insert after overlay
                    if (overlay) overlay.after(contentDiv);
                    else slideEl.appendChild(contentDiv);
                }

                if (contentDiv) {
                    let html = '';
                    html += `<span class="hero-badge animate-slide-up" style="animation-delay: 0.1s;">Welcome to Guit County</span>`;
                    if (slide.title) html += `<h1 class="hero-title animate-slide-up" data-aos="fade-up" style="animation-delay: 0.3s;">${escapeHtml(slide.title)}</h1>`;
                    if (slide.subtitle) html += `<p class="hero-subtitle animate-slide-up" data-aos="fade-up" style="animation-delay: 0.5s;">${escapeHtml(slide.subtitle)}</p>`;

                    html += `<div class="hero-actions animate-slide-up" data-aos="fade-up" style="animation-delay: 0.7s;">`;
                    if (slide.link) {
                        html += `<a href="${escapeHtml(slide.link)}" class="btn btn-primary">Learn More <i class="fas fa-arrow-right"></i></a>`;
                    }
                    html += `<a href="#services" class="btn btn-outline">Our Services</a></div>`;

                    contentDiv.innerHTML = html;
                }
            }
        });

        // Reinitialize slideshow if available to refresh state
        if (window.HeroSlideshow && typeof window.HeroSlideshow.refresh === 'function') {
            setTimeout(() => {
                window.HeroSlideshow.refresh();
            }, 100);
        }

        console.log(`✓ Updated ${sortedSlides.length} slides with dynamic content (Total slides: ${existingSlides.length})`);
    }

    // ===================================
    // NEWS MODAL FUNCTIONS
    // ===================================
    function openNewsModal(id) {
        const storedData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');

        if (!storedData.news) {
            console.error('No news data found');
            return;
        }

        const newsItem = storedData.news.find(n => (n._id || n.id) == id);

        if (!newsItem) {
            console.error(`News item ${id} not found`);
            return;
        }

        const commentsKey = `${CONFIG.COMMENTS_PREFIX}${id}`;
        const savedComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');

        // Remove existing modal if any
        const existingModal = document.getElementById('newsModal');
        if (existingModal) existingModal.remove();

        const modalHtml = createNewsModalHTML(newsItem, savedComments);

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.body.style.overflow = 'hidden';

        // Focus management
        setTimeout(() => {
            const modal = document.getElementById('newsModal');
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);

        // Close on escape key
        document.addEventListener('keydown', handleModalEscape);
    }

    // ===================================
    // CREATE NEWS MODAL HTML
    // ===================================
    function createNewsModalHTML(newsItem, comments) {
        let mediaHtml = '';
        if (newsItem.mediaType === 'video' && newsItem.mediaUrl) {
            if (newsItem.mediaUrl.includes('youtube.com') || newsItem.mediaUrl.includes('youtu.be')) {
                const videoId = extractYoutubeId(newsItem.mediaUrl);
                mediaHtml = `<div class="modal-media-wrapper video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
            } else {
                mediaHtml = `<div class="modal-media-wrapper video-wrapper"><video src="${escapeHtml(newsItem.mediaUrl)}" controls></video></div>`;
            }
        } else if (newsItem.mediaType === 'audio' && newsItem.mediaUrl) {
            mediaHtml = `<div class="modal-media-wrapper audio-wrapper"><audio src="${escapeHtml(newsItem.mediaUrl)}" controls></audio></div>`;
        } else {
            mediaHtml = `
                <div class="news-modal-header">
                    <img src="${escapeHtml(newsItem.image || CONFIG.DEFAULT_IMAGE)}" 
                         alt="${escapeHtml(newsItem.title)}" 
                         onerror="this.src='${CONFIG.DEFAULT_IMAGE}'">
                    <div class="header-overlay">
                        <span class="news-category">${escapeHtml(newsItem.category || 'News')}</span>
                        <h2>${escapeHtml(newsItem.title)}</h2>
                    </div>
                </div>
            `;
        }

        return `
            <div id="newsModal" class="news-modal-overlay" data-news-id="${newsItem._id || newsItem.id}">
                <div class="news-modal-content modern-modal">
                    <button onclick="window.ContentLoader.closeNewsModal()" 
                            class="modal-close"
                            aria-label="Close modal"
                            type="button">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                    
                    ${mediaHtml}
                    
                    <div class="news-modal-body">
                        ${newsItem.mediaType && newsItem.mediaType !== 'image' ? `<h2>${escapeHtml(newsItem.title)}</h2>` : ''}
                        <div class="news-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDate(newsItem.date)}</span>
                            <span><i class="fas fa-user"></i> ${escapeHtml(newsItem.author || 'Admin')}</span>
                            <span class="likes-badge"><i class="fas fa-heart"></i> ${newsItem.likes || 0} Likes</span>
                        </div>
                        
                        <div class="news-full-content">${escapeHtml(newsItem.content || newsItem.description || '')}</div>
                        
                        <div class="news-interaction-bar">
                            <button class="interaction-btn like-btn ${isLiked(newsItem._id || newsItem.id) ? 'active' : ''}" 
                                    onclick="window.ContentLoader.likeNews('${newsItem._id || newsItem.id}')">
                                <i class="fas fa-heart"></i> ${isLiked(newsItem._id || newsItem.id) ? 'Liked' : 'Like'}
                            </button>
                            <button class="interaction-btn share-btn" onclick="window.ContentLoader.shareNews('${newsItem._id || newsItem.id}')">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>

                        <div class="news-comments-section">
                            <h3 class="comments-title">Comments (${comments.length})</h3>
                            
                            <form id="commentForm" class="comment-form modern-comment-form" onsubmit="window.ContentLoader.handleCommentSubmit(event, '${newsItem._id || newsItem.id}')">
                                <div class="form-row">
                                    <input type="text" id="commentName" placeholder="Your Name" required>
                                </div>
                                <textarea id="commentText" placeholder="Write a comment..." required rows="3"></textarea>
                                <button type="submit" class="btn btn-primary submit-comment-btn">
                                    Post Comment <i class="fas fa-paper-plane"></i>
                                </button>
                            </form>
                            
                            <div id="commentsList" class="comments-list">
                                ${comments.length > 0 ? comments.map(c => createCommentHTML(c)).join('') : '<div class="no-comments"><p>No comments yet. Be the first to join the conversation!</p></div>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===================================
    // CREATE COMMENT HTML
    // ===================================
    function createCommentHTML(comment) {
        return `
            <div class="comment-item">
                <div class="comment-header">
                    <strong class="comment-name">${escapeHtml(comment.name)}</strong>
                    <span class="comment-date">${formatDate(comment.date)}</span>
                </div>
                <p class="comment-text">${escapeHtml(comment.text)}</p>
            </div>
        `;
    }

    // ===================================
    // CLOSE NEWS MODAL
    // ===================================
    function closeNewsModal() {
        const modal = document.getElementById('newsModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleModalEscape);
        }
    }

    // ===================================
    // HANDLE MODAL ESCAPE KEY
    // ===================================
    function handleModalEscape(e) {
        if (e.key === 'Escape') {
            closeNewsModal();
        }
    }

    // ===================================
    // HANDLE COMMENT SUBMISSION
    // ===================================
    function handleCommentSubmit(event, newsId) {
        event.preventDefault();

        const nameInput = document.getElementById('commentName');
        const textInput = document.getElementById('commentText');

        if (!nameInput || !textInput) return;

        const name = nameInput.value.trim();
        const text = textInput.value.trim();

        if (!name || !text) {
            alert('Please fill in all fields');
            return;
        }

        const comment = {
            id: Date.now(),
            name: name,
            text: text,
            date: new Date().toISOString()
        };

        // Save to localStorage
        const commentsKey = `${CONFIG.COMMENTS_PREFIX}${newsId}`;
        const savedComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
        savedComments.unshift(comment);
        localStorage.setItem(commentsKey, JSON.stringify(savedComments));

        // Update UI
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            if (commentsList.querySelector('p[style*="italic"]')) {
                commentsList.innerHTML = '';
            }
            commentsList.insertAdjacentHTML('afterbegin', createCommentHTML(comment));
        }

        // Update comment count
        const countElement = document.querySelector('.news-comments-section h3');
        if (countElement) {
            countElement.textContent = `Comments (${savedComments.length})`;
        }

        // Reset form
        nameInput.value = '';
        textInput.value = '';

        // Show success message
        showNotification('Comment posted successfully!', 'success');
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Recent';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    function getExcerpt(item) {
        const text = item.excerpt || item.description || item.content || '';
        if (text.length <= CONFIG.MAX_EXCERPT_LENGTH) return text;
        return text.substring(0, CONFIG.MAX_EXCERPT_LENGTH) + '...';
    }

    function reinitializeAnimations() {
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    function handleError(error) {
        console.error('Content Loader Error:', error);
        showNotification('Failed to load some content. Please refresh the page.', 'error');
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===================================
    // EVENT DELEGATION FOR COMMENTS
    // ===================================
    document.addEventListener('submit', function (e) {
        if (e.target && e.target.id === 'commentForm') {
            const modal = document.getElementById('newsModal');
            if (!modal) return;

            // Extract news ID from modal data
            const storedData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
            if (storedData.news && storedData.news.length > 0) {
                // Get the currently displayed news item (you might need to store this)
                const newsId = modal.dataset.newsId;
                if (newsId) {
                    handleCommentSubmit(e, newsId);
                }
            }
        }
    });

    // ===================================
    // MODAL CLICK OUTSIDE TO CLOSE
    // ===================================
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'newsModal') {
            closeNewsModal();
        }
    });

    // Like News
    async function likeNews(newsId) {
        if (isLiked(newsId)) {
            showNotification('You have already liked this post', 'info');
            return;
        }

        try {
            const response = await fetch(`/api/news/${newsId}/like`, {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();

                // Track locally to prevent spam
                const likedPosts = JSON.parse(localStorage.getItem('guitLikedPosts') || '[]');
                likedPosts.push(newsId);
                localStorage.setItem('guitLikedPosts', JSON.stringify(likedPosts));

                // Update UI in news cards if visible
                const newsCards = document.querySelectorAll(`.news-card button[onclick*="${newsId}"] .likes-count`);
                newsCards.forEach(el => el.textContent = data.likes);

                // Update active state
                const likeBtns = document.querySelectorAll(`.news-card button[onclick*="${newsId}"].like-btn`);
                likeBtns.forEach(btn => btn.classList.add('active'));

                // Update in modal if open
                const modal = document.getElementById('newsModal');
                if (modal && modal.dataset.newsId === newsId) {
                    const badge = modal.querySelector('.likes-badge');
                    if (badge) badge.innerHTML = `<i class="fas fa-heart"></i> ${data.likes} Likes`;

                    const modalLikeBtn = modal.querySelector('.interaction-btn.like-btn');
                    if (modalLikeBtn) {
                        modalLikeBtn.classList.add('active');
                        modalLikeBtn.innerHTML = '<i class="fas fa-heart"></i> Liked';
                    }
                }

                showNotification('Thanks for the like!', 'success');
            }
        } catch (err) {
            console.error('Error liking news:', err);
            showNotification('Failed to process like', 'error');
        }
    }

    function isLiked(newsId) {
        const likedPosts = JSON.parse(localStorage.getItem('guitLikedPosts') || '[]');
        return likedPosts.includes(newsId);
    }

    function getCommentsCount(newsId) {
        const commentsKey = `${CONFIG.COMMENTS_PREFIX}${newsId}`;
        const savedComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
        return savedComments.length;
    }

    function extractYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // ===================================
    // UTILITIES
    // ===================================
    function capitalizeFirst(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    function shareNews(newsId) {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'Guit County News',
                url: url
            }).catch(console.error);
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Link copied to clipboard!', 'success');
            });
        }
    }

    function initMediaPreviews() {
        const videos = document.querySelectorAll('.media-preview-video');
        videos.forEach(video => {
            const card = video.closest('.news-card') || video.closest('.feature-card');
            if (card) {
                card.addEventListener('mouseenter', () => {
                    video.play().catch(err => console.warn('Autoplay prevented:', err));
                });
                card.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            }
        });
    }

    // ===================================
    // PUBLIC API
    // ===================================
    window.ContentLoader = {
        init: init,
        reload: renderAllContent,
        openNewsModal: openNewsModal,
        openGenericModal: openGenericModal,
        closeNewsModal: closeNewsModal,
        handleCommentSubmit: handleCommentSubmit,
        likeNews: likeNews,
        shareNews: shareNews,
        getData: () => publicData,
        isInitialized: () => isInitialized
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();