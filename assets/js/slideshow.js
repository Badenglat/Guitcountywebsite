/* ===================================
   GUIT COUNTY - HERO SLIDESHOW
   Version: 2.0.1 (Enhanced)
   =================================== */

(function () {
    'use strict';

    console.log('%c🎬 Slideshow script loaded', 'color: #0061f2; font-weight: bold;');

    // ===================================
    // CONFIGURATION
    // ===================================
    const CONFIG = {
        SLIDE_INTERVAL: 5000,        // 5 seconds per slide
        TRANSITION_DURATION: 1000,   // 1 second fade transition
        PAUSE_ON_HOVER: true,
        PAUSE_ON_INTERACTION: true,
        KEYBOARD_NAVIGATION: true,
        TOUCH_SWIPE: true,
        AUTO_PLAY: true,
        LOOP: true,
        PRELOAD_IMAGES: true
    };

    // ===================================
    // STATE
    // ===================================
    const state = {
        currentSlide: 0,
        totalSlides: 0,
        slideInterval: null,
        isPaused: false,
        isInitialized: false,
        touchStartX: 0,
        touchEndX: 0,
        isTransitioning: false
    };

    // ===================================
    // DOM ELEMENTS
    // ===================================
    let elements = {
        slides: null,
        indicators: null,
        heroSection: null,
        prevBtn: null,
        nextBtn: null
    };

    // ===================================
    // INITIALIZE SLIDESHOW
    // ===================================
    function init() {
        if (state.isInitialized) {
            console.warn('⚠️ Slideshow already initialized');
            return;
        }

        console.log('🚀 Initializing slideshow...');

        try {
            // Cache DOM elements
            cacheElements();

            // Validate elements
            if (!validateElements()) {
                console.error('❌ Slideshow initialization failed: Missing required elements');
                return;
            }

            // Set total slides
            state.totalSlides = elements.slides.length;
            console.log(`✅ Found ${state.totalSlides} slides`);

            // Preload images if enabled
            if (CONFIG.PRELOAD_IMAGES) {
                preloadImages();
            }

            // Setup event listeners
            setupEventListeners();

            // Show first slide
            showSlide(0);

            // Start auto-play if enabled
            if (CONFIG.AUTO_PLAY) {
                startAutoPlay();
            }

            state.isInitialized = true;

            // Expose API
            exposeAPI();

            console.log('✅ Slideshow initialized successfully!');

            // Dispatch custom event
            dispatchEvent('slideshowInitialized', {
                totalSlides: state.totalSlides
            });

        } catch (error) {
            console.error('❌ Slideshow initialization error:', error);
            handleError(error);
        }
    }

    // ===================================
    // CACHE DOM ELEMENTS
    // ===================================
    function cacheElements() {
        elements = {
            slides: document.querySelectorAll('.hero-slideshow .fade-slide, .hero-slideshow .hero-slide'),
            indicators: document.querySelectorAll('.slideshow-indicators .indicator'),
            heroSection: document.querySelector('.hero-slideshow, .hero-section'),
            prevBtn: document.querySelector('.hero-prev, .slideshow-prev'),
            nextBtn: document.querySelector('.hero-next, .slideshow-next')
        };

        console.log('📦 DOM Elements cached:', {
            slides: elements.slides?.length || 0,
            indicators: elements.indicators?.length || 0,
            heroSection: !!elements.heroSection,
            prevBtn: !!elements.prevBtn,
            nextBtn: !!elements.nextBtn
        });
    }

    // ===================================
    // VALIDATE ELEMENTS
    // ===================================
    function validateElements() {
        if (!elements.slides || elements.slides.length === 0) {
            console.error('❌ No slides found!');
            return false;
        }

        if (!elements.heroSection) {
            console.warn('⚠️ Hero section not found, some features may not work');
        }

        return true;
    }

    // ===================================
    // PRELOAD IMAGES
    // ===================================
    function preloadImages() {
        console.log('🖼️ Preloading images...');

        let loadedCount = 0;
        const totalImages = elements.slides.length;

        elements.slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                const image = new Image();
                image.onload = () => {
                    loadedCount++;
                    console.log(`✅ Loaded image ${loadedCount}/${totalImages}`);

                    if (loadedCount === totalImages) {
                        console.log('✅ All images preloaded');
                        dispatchEvent('imagesPreloaded');
                    }
                };
                image.onerror = () => {
                    console.warn(`⚠️ Failed to load image for slide ${index}`);
                    loadedCount++;
                };
                image.src = img.src;
            }
        });
    }

    // ===================================
    // SHOW SLIDE
    // ===================================
    function showSlide(index, direction = 'next') {
        if (state.isTransitioning) {
            console.log('⏳ Transition in progress, ignoring request');
            return;
        }

        // Validate index
        if (index < 0 || index >= state.totalSlides) {
            console.warn(`⚠️ Invalid slide index: ${index}`);
            return;
        }

        console.log(`🎬 Showing slide ${index + 1}/${state.totalSlides}`);

        state.isTransitioning = true;

        // Remove active class from all slides
        elements.slides.forEach((slide, i) => {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');

            // Add exit animation
            if (i === state.currentSlide) {
                slide.classList.add('exiting');
            }
        });

        // Remove active class from all indicators
        if (elements.indicators) {
            elements.indicators.forEach((indicator, i) => {
                indicator.classList.remove('active');
                indicator.setAttribute('aria-selected', 'false');
            });
        }

        // Add active class to current slide
        const currentSlideElement = elements.slides[index];
        currentSlideElement.classList.add('active');
        currentSlideElement.setAttribute('aria-hidden', 'false');

        // Add active class to current indicator
        if (elements.indicators && elements.indicators[index]) {
            elements.indicators[index].classList.add('active');
            elements.indicators[index].setAttribute('aria-selected', 'true');
        }

        // Update state
        const previousSlide = state.currentSlide;
        state.currentSlide = index;

        // Announce to screen readers
        announceSlideChange(index + 1, state.totalSlides);

        // Remove exiting class after transition
        setTimeout(() => {
            elements.slides.forEach(slide => {
                slide.classList.remove('exiting');
            });
            state.isTransitioning = false;
        }, CONFIG.TRANSITION_DURATION);

        // Dispatch custom event
        dispatchEvent('slideChanged', {
            currentSlide: index,
            previousSlide: previousSlide,
            totalSlides: state.totalSlides,
            direction: direction
        });
    }

    // ===================================
    // NAVIGATION FUNCTIONS
    // ===================================
    function nextSlide() {
        let next = state.currentSlide + 1;

        if (next >= state.totalSlides) {
            next = CONFIG.LOOP ? 0 : state.totalSlides - 1;
        }

        showSlide(next, 'next');
    }

    function prevSlide() {
        let prev = state.currentSlide - 1;

        if (prev < 0) {
            prev = CONFIG.LOOP ? state.totalSlides - 1 : 0;
        }

        showSlide(prev, 'prev');
    }

    function goToSlide(index) {
        if (typeof index !== 'number' || isNaN(index)) {
            console.error('❌ Invalid slide index');
            return;
        }

        const direction = index > state.currentSlide ? 'next' : 'prev';
        showSlide(index, direction);
    }

    // ===================================
    // AUTO-PLAY CONTROL
    // ===================================
    function startAutoPlay() {
        stopAutoPlay();

        if (!CONFIG.AUTO_PLAY) {
            console.log('⏸️ Auto-play disabled');
            return;
        }

        console.log('▶️ Starting auto-play');

        state.slideInterval = setInterval(() => {
            if (!state.isPaused && !state.isTransitioning) {
                nextSlide();
            }
        }, CONFIG.SLIDE_INTERVAL);

        dispatchEvent('autoPlayStarted');
    }

    function stopAutoPlay() {
        if (state.slideInterval) {
            clearInterval(state.slideInterval);
            state.slideInterval = null;
            console.log('⏹️ Stopped auto-play');
            dispatchEvent('autoPlayStopped');
        }
    }

    function pauseAutoPlay() {
        state.isPaused = true;
        console.log('⏸️ Paused auto-play');
        dispatchEvent('autoPlayPaused');
    }

    function resumeAutoPlay() {
        state.isPaused = false;
        console.log('▶️ Resumed auto-play');
        dispatchEvent('autoPlayResumed');
    }

    function toggleAutoPlay() {
        if (state.slideInterval) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    function setupEventListeners() {
        console.log('🎧 Setting up event listeners...');

        // Indicator clicks
        if (elements.indicators) {
            elements.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    goToSlide(index);
                    if (CONFIG.PAUSE_ON_INTERACTION) {
                        startAutoPlay(); // Restart auto-play timer
                    }
                });

                // Keyboard support for indicators
                indicator.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goToSlide(index);
                        if (CONFIG.PAUSE_ON_INTERACTION) {
                            startAutoPlay();
                        }
                    }
                });
            });
        }

        // Navigation buttons
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', () => {
                prevSlide();
                if (CONFIG.PAUSE_ON_INTERACTION) {
                    startAutoPlay();
                }
            });
        }

        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', () => {
                nextSlide();
                if (CONFIG.PAUSE_ON_INTERACTION) {
                    startAutoPlay();
                }
            });
        }

        // Pause on hover
        if (CONFIG.PAUSE_ON_HOVER && elements.heroSection) {
            elements.heroSection.addEventListener('mouseenter', pauseAutoPlay);
            elements.heroSection.addEventListener('mouseleave', resumeAutoPlay);
            elements.heroSection.addEventListener('focusin', pauseAutoPlay);
            elements.heroSection.addEventListener('focusout', resumeAutoPlay);
        }

        // Pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoPlay();
            } else if (CONFIG.AUTO_PLAY) {
                startAutoPlay();
            }
        });

        // Keyboard navigation
        if (CONFIG.KEYBOARD_NAVIGATION) {
            document.addEventListener('keydown', handleKeyboardNavigation);
        }

        // Touch swipe support
        if (CONFIG.TOUCH_SWIPE && elements.heroSection) {
            elements.heroSection.addEventListener('touchstart', handleTouchStart, { passive: true });
            elements.heroSection.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', cleanup);

        // Reduced motion support
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            console.log('♿ Reduced motion detected, disabling auto-play');
            CONFIG.AUTO_PLAY = false;
            stopAutoPlay();
        }

        mediaQuery.addEventListener('change', (e) => {
            if (e.matches) {
                CONFIG.AUTO_PLAY = false;
                stopAutoPlay();
            }
        });
    }

    // ===================================
    // KEYBOARD NAVIGATION HANDLER
    // ===================================
    function handleKeyboardNavigation(e) {
        if (!elements.heroSection) return;

        // Check if hero section is in viewport
        const rect = elements.heroSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (!isVisible) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                startAutoPlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                startAutoPlay();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                startAutoPlay();
                break;
            case 'End':
                e.preventDefault();
                goToSlide(state.totalSlides - 1);
                startAutoPlay();
                break;
        }
    }

    // ===================================
    // TOUCH SWIPE HANDLERS
    // ===================================
    function handleTouchStart(e) {
        state.touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
        state.touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const SWIPE_THRESHOLD = 50;
        const diff = state.touchStartX - state.touchEndX;

        if (Math.abs(diff) > SWIPE_THRESHOLD) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
            } else {
                // Swipe right - previous slide
                prevSlide();
            }

            if (CONFIG.PAUSE_ON_INTERACTION) {
                startAutoPlay();
            }
        }
    }

    // ===================================
    // ACCESSIBILITY
    // ===================================
    function announceSlideChange(current, total) {
        let announcer = document.getElementById('slideshow-announcer');

        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'slideshow-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'visually-hidden sr-only';
            document.body.appendChild(announcer);
        }

        announcer.textContent = `Slide ${current} of ${total}`;
    }

    // ===================================
    // EVENT DISPATCHER
    // ===================================
    function dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`slideshow:${eventName}`, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(event);
    }

    // ===================================
    // ERROR HANDLER
    // ===================================
    function handleError(error) {
        console.error('❌ Slideshow error:', error);

        // Attempt to show at least the first slide
        if (elements.slides && elements.slides.length > 0) {
            elements.slides[0].classList.add('active');
        }

        dispatchEvent('error', { error: error.message });
    }

    // ===================================
    // CLEANUP
    // ===================================
    function cleanup() {
        console.log('🧹 Cleaning up slideshow...');
        stopAutoPlay();

        if (elements.heroSection) {
            elements.heroSection.removeEventListener('touchstart', handleTouchStart);
            elements.heroSection.removeEventListener('touchend', handleTouchEnd);
        }

        document.removeEventListener('keydown', handleKeyboardNavigation);

        dispatchEvent('cleanup');
    }

    // ===================================
    // API EXPOSURE
    // ===================================
    function exposeAPI() {
        window.HeroSlideshow = {
            // Navigation
            next: nextSlide,
            prev: prevSlide,
            goto: goToSlide,

            // Auto-play control
            play: startAutoPlay,
            pause: pauseAutoPlay,
            resume: resumeAutoPlay,
            stop: stopAutoPlay,
            toggle: toggleAutoPlay,

            // State getters
            getCurrentSlide: () => state.currentSlide,
            getTotalSlides: () => state.totalSlides,
            isPaused: () => state.isPaused,
            isPlaying: () => !!state.slideInterval,
            isInitialized: () => state.isInitialized,

            // Configuration
            getConfig: () => ({ ...CONFIG }),
            setConfig: (newConfig) => {
                Object.assign(CONFIG, newConfig);
                console.log('⚙️ Configuration updated:', CONFIG);
            },

            // Utility
            refresh: () => {
                console.log('🔄 Refreshing slideshow state...');
                stopAutoPlay();
                cacheElements();
                state.totalSlides = elements.slides.length;
                console.log(`✅ Refreshed: ${state.totalSlides} slides found`);

                // Re-bind click events for new indicators if needed
                if (elements.indicators) {
                    elements.indicators.forEach((indicator, index) => {
                        // Remove old listeners to avoid duplicates (optional, but good practice if not using delegation)
                        // simpler to just re-add since we have new DOM elements usually
                        indicator.onclick = () => {
                            goToSlide(index);
                            if (CONFIG.PAUSE_ON_INTERACTION) startAutoPlay();
                        };
                    });
                }

                goToSlide(0);
                startAutoPlay();
            },
            restart: () => {
                // Determine if we need to full refresh (e.g. if slides count changed)
                const currentCount = document.querySelectorAll('.hero-slideshow .fade-slide, .hero-slideshow .hero-slide').length;
                if (currentCount !== state.totalSlides || elements.slides[0] !== document.querySelector('.hero-slideshow .fade-slide')) {
                    window.HeroSlideshow.refresh();
                } else {
                    stopAutoPlay();
                    goToSlide(0);
                    startAutoPlay();
                }
            },
            destroy: cleanup
        };

        console.log('🌐 API exposed as window.HeroSlideshow');
    }

    // ===================================
    // AUTO-INITIALIZE
    // ===================================
    if (document.readyState === 'loading') {
        console.log('⏳ Waiting for DOM to load...');
        document.addEventListener('DOMContentLoaded', init);
    } else {
        console.log('✅ DOM already loaded, initializing immediately');
        // Small delay to ensure other scripts have loaded
        setTimeout(init, 100);
    }

})();