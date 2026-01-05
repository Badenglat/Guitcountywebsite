/* ===================================
   GUIT COUNTY WEBSITE - MAIN JAVASCRIPT
   Version: 2.0.1 (Complete & Error-Free)
   Author: Guit County Development Team
   =================================== */

'use strict';

// ===================================
// GLOBAL APPLICATION OBJECT
// ===================================
const GuitCounty = {

    // ===================================
    // CONFIGURATION
    // ===================================
    config: {
        animationDuration: 1000,
        sliderInterval: 5000,
        scrollOffset: 100,
        debounceDelay: 250,
        throttleDelay: 100,
        notificationDuration: 5000,
        preloaderTimeout: 5000,
        searchMinChars: 2,
        maxNotifications: 5,
        chatbotTypingDelay: 1000,
        counterAnimationDuration: 2000
    },

    // ===================================
    // STATE MANAGEMENT
    // ===================================
    state: {
        currentSlide: 0,
        totalSlides: 0,
        isScrolled: false,
        isMobileMenuOpen: false,
        isSidebarOpen: false,
        isSearchOpen: false,
        isChatbotOpen: false,
        theme: 'light',
        language: 'en',
        isInitialized: false,
        isPreloaderHidden: false,
        lastScrollPosition: 0,
        isHeaderHidden: false,
        notifications: []
    },

    // ===================================
    // EVENT SYSTEM
    // ===================================
    events: {
        listeners: {},

        on: function (event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },

        emit: function (event, data) {
            if (!this.listeners[event]) return;
            this.listeners[event].forEach(callback => callback(data));
        },

        off: function (event, callback) {
            if (!this.listeners[event]) return;
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    },

    // ===================================
    // DOM ELEMENTS CACHE
    // ===================================
    elements: {},

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    utils: {
        // Debounce function
        debounce: function (func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function
        throttle: function (func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Sanitize input
        sanitize: function (str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        // Copy to clipboard
        copyToClipboard: async function (text) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        textArea.remove();
                        return true;
                    } catch (err) {
                        textArea.remove();
                        return false;
                    }
                }
            } catch (err) {
                console.error('Copy failed:', err);
                return false;
            }
        },

        // Check if element is in viewport
        isInViewport: function (element) {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // Format date
        formatDate: function (date, format = 'short') {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Invalid Date';

            const options = format === 'short'
                ? { year: 'numeric', month: 'short', day: 'numeric' }
                : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

            return d.toLocaleDateString('en-US', options);
        }
    },

    // ===================================
    // INITIALIZATION
    // ===================================
    init: function () {
        if (this.state.isInitialized) {
            console.warn('GuitCounty: Already initialized');
            return;
        }

        try {
            console.log('%c🚀 Guit County Website Initializing...', 'color: #0061f2; font-weight: bold; font-size: 14px;');

            this.loadSavedState();
            this.cacheElements();
            this.preloader();
            this.headerScroll();
            this.mobileMenu();
            this.sidebar();
            this.searchOverlay();
            this.heroSlider();
            this.themeToggle();
            this.languageSelector();
            this.userDropdown();
            this.notifications();
            this.scrollToTop();
            this.smoothScroll();
            this.emergencyAlert();
            this.calendar();
            this.forms();
            this.chatbot();
            this.animations();
            this.lazyLoading();
            this.counterAnimation();
            this.tabs();
            this.accordions();
            this.modals();
            this.tooltips();
            this.socialShare();
            this.rippleEffect();
            this.performanceOptimization();
            this.setupAccessibility();
            this.setupKeyboardShortcuts();

            this.state.isInitialized = true;
            this.events.emit('initialized', { timestamp: Date.now() });

            console.log('%c✅ Guit County Website Loaded Successfully!', 'color: #27ae60; font-weight: bold; font-size: 14px;');

        } catch (error) {
            console.error('❌ Initialization Error:', error);
            this.handleError(error, 'initialization');
        }
    },

    // ===================================
    // LOAD SAVED STATE
    // ===================================
    loadSavedState: function () {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.state.theme = savedTheme;
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.state.theme = prefersDark ? 'dark' : 'light';
            }

            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage) {
                this.state.language = savedLanguage;
            }

            this.applyTheme(this.state.theme);

        } catch (e) {
            console.warn('Could not load saved state:', e);
        }
    },

    // ===================================
    // CACHE DOM ELEMENTS
    // ===================================
    cacheElements: function () {
        this.elements = {
            body: document.body,
            html: document.documentElement,
            header: document.querySelector('.header'),
            main: document.querySelector('main, #main-content'),
            footer: document.querySelector('.footer'),
            preloader: document.getElementById('preloader'),
            mobileNav: document.querySelector('.mobile-nav'),
            menuToggle: document.querySelector('.mobile-menu-toggle'),
            mobileNavClose: document.querySelector('.mobile-nav-close'),
            navLinks: document.querySelectorAll('.nav-link'),
            mobileNavLinks: document.querySelectorAll('.mobile-nav-menu a'),
            sidebar: document.querySelector('.sidebar'),
            sidebarClose: document.querySelector('.sidebar-close'),
            sidebarLinks: document.querySelectorAll('.sidebar-link'),
            searchOverlay: document.querySelector('.search-overlay'),
            searchBtn: document.querySelector('.search-btn'),
            searchClose: document.querySelector('.search-close'),
            searchInput: document.querySelector('.search-input'),
            searchForm: document.querySelector('.search-form'),
            searchSuggestions: document.querySelectorAll('.suggestion-tags .tag'),
            heroSection: document.querySelector('.hero-section, .hero-slideshow'),
            heroSlides: document.querySelectorAll('.hero-slide'),
            heroDots: document.querySelectorAll('.slideshow-indicators .indicator'),
            heroPrev: document.querySelector('.hero-prev'),
            heroNext: document.querySelector('.hero-next'),
            themeToggle: document.querySelector('.theme-toggle'),
            langToggle: document.querySelector('.lang-toggle'),
            langMenu: document.querySelector('.lang-menu'),
            langLinks: document.querySelectorAll('.lang-menu a'),
            userToggle: document.querySelector('.user-toggle'),
            userDropdown: document.querySelector('.user-dropdown'),
            userMenu: document.querySelector('.user-menu'),
            notificationBtn: document.querySelector('.notification-btn'),
            notificationBadge: document.querySelector('.notification-badge'),
            scrollTopBtn: document.querySelector('.scroll-top'),
            emergencyAlert: document.querySelector('.emergency-alert'),
            alertClose: document.querySelector('.alert-close'),
            calendarGrid: document.getElementById('calendarGrid'),
            calendarTitle: document.querySelector('.calendar-title'),
            calendarPrev: document.querySelector('.calendar-prev'),
            calendarNext: document.querySelector('.calendar-next'),
            chatbotContainer: document.querySelector('.chatbot-container'),
            chatbotToggle: document.querySelector('.chatbot-toggle'),
            chatbotWindow: document.querySelector('.chatbot-window'),
            chatbotClose: document.querySelector('.chatbot-close'),
            chatInput: document.getElementById('chatInput'),
            chatMessages: document.getElementById('chatbotMessages'),
            chatSendBtn: document.getElementById('chatSendBtn'),
            chatbotBadge: document.querySelector('.chatbot-badge'),
            contactForm: document.getElementById('contactForm'),
            newsletterForm: document.getElementById('newsletterForm'),
            statNumbers: document.querySelectorAll('[data-count]'),
            toastContainer: document.getElementById('toastContainer')
        };
    },

    // ===================================
    // PRELOADER
    // ===================================
    preloader: function () {
        const preloader = this.elements.preloader;
        if (!preloader) return;

        const hidePreloader = () => {
            if (this.state.isPreloaderHidden) return;

            this.state.isPreloaderHidden = true;
            preloader.classList.add('fade-out');
            document.body.style.overflow = '';

            setTimeout(() => {
                preloader.style.display = 'none';
                preloader.setAttribute('aria-hidden', 'true');
                this.triggerEntranceAnimations();
                this.events.emit('preloaderHidden');
            }, 500);
        };

        if (document.readyState === 'complete') {
            setTimeout(hidePreloader, 300);
        } else {
            window.addEventListener('load', () => setTimeout(hidePreloader, 300));
        }

        setTimeout(() => {
            if (!this.state.isPreloaderHidden) {
                console.warn('Preloader timeout - forcing hide');
                hidePreloader();
            }
        }, this.config.preloaderTimeout);
    },

    triggerEntranceAnimations: function () {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: this.config.animationDuration,
                once: true,
                offset: 100,
                easing: 'ease-out-cubic',
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }

        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('is-visible', 'revealed');
            }, index * 100);
        });
    },

    // ===================================
    // HEADER SCROLL BEHAVIOR
    // ===================================
    headerScroll: function () {
        const header = this.elements.header;
        if (!header) return;

        let lastScrollY = window.pageYOffset;
        let ticking = false;

        const updateHeader = () => {
            const currentScrollY = window.pageYOffset;

            if (currentScrollY > 50) {
                header.classList.add('scrolled');
                this.state.isScrolled = true;
            } else {
                header.classList.remove('scrolled');
                this.state.isScrolled = false;
            }

            if (currentScrollY > 300) {
                if (currentScrollY > lastScrollY && !this.state.isHeaderHidden) {
                    header.classList.add('header-hidden');
                    this.state.isHeaderHidden = true;
                } else if (currentScrollY < lastScrollY && this.state.isHeaderHidden) {
                    header.classList.remove('header-hidden');
                    this.state.isHeaderHidden = false;
                }
            } else {
                header.classList.remove('header-hidden');
                this.state.isHeaderHidden = false;
            }

            this.updateActiveNavLink();
            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });

        updateHeader();
    },

    updateActiveNavLink: function () {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset;
        const headerHeight = this.elements.header ? this.elements.header.offsetHeight : 0;

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });

        const allNavLinks = document.querySelectorAll('.nav-link, .sidebar-link, .mobile-nav-menu a');
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const isActive = href === `#${currentSection}`;
                link.classList.toggle('active', isActive);
                link.setAttribute('aria-current', isActive ? 'page' : 'false');
            }
        });
    },

    // ===================================
    // MOBILE MENU
    // ===================================
    mobileMenu: function () {
        const menuToggle = this.elements.menuToggle;
        const mobileNav = this.elements.mobileNav;
        const mobileClose = this.elements.mobileNavClose;
        const mobileLinks = this.elements.mobileNavLinks;

        if (!menuToggle || !mobileNav) return;

        const openMenu = () => {
            this.state.isMobileMenuOpen = true;
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileNav.classList.add('active');
            mobileNav.setAttribute('aria-hidden', 'false');
            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                const firstLink = mobileNav.querySelector('a, button');
                if (firstLink) firstLink.focus();
            }, 300);

            this.trapFocus(mobileNav);
            this.events.emit('mobileMenuOpened');
        };

        const closeMenu = () => {
            this.state.isMobileMenuOpen = false;
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileNav.classList.remove('active');
            mobileNav.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
            menuToggle.focus();
            this.removeFocusTrap();
            this.events.emit('mobileMenuClosed');
        };

        const toggleMenu = () => {
            if (this.state.isMobileMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        menuToggle.addEventListener('click', toggleMenu);

        if (mobileClose) {
            mobileClose.addEventListener('click', closeMenu);
        }

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMenu, 150);
            });
        });

        mobileNav.addEventListener('click', (e) => {
            if (e.target === mobileNav) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMobileMenuOpen) {
                closeMenu();
            }
        });

        window.toggleMobileMenu = toggleMenu;
        window.closeMobileMenu = closeMenu;
    },

    trapFocus: function (element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this._focusTrapHandler = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        element.addEventListener('keydown', this._focusTrapHandler);
    },

    removeFocusTrap: function () {
        if (this._focusTrapHandler) {
            document.removeEventListener('keydown', this._focusTrapHandler);
            this._focusTrapHandler = null;
        }
    },

    // ===================================
    // SIDEBAR
    // ===================================
    sidebar: function () {
        const sidebar = this.elements.sidebar;
        const sidebarClose = this.elements.sidebarClose;

        if (!sidebar) return;

        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }

        const openSidebar = () => {
            this.state.isSidebarOpen = true;
            sidebar.classList.add('active');
            sidebar.setAttribute('aria-hidden', 'false');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.events.emit('sidebarOpened');
        };

        const closeSidebar = () => {
            this.state.isSidebarOpen = false;
            sidebar.classList.remove('active');
            sidebar.setAttribute('aria-hidden', 'true');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            this.events.emit('sidebarClosed');
        };

        if (sidebarClose) {
            sidebarClose.addEventListener('click', closeSidebar);
        }

        overlay.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isSidebarOpen) {
                closeSidebar();
            }
        });

        window.openSidebar = openSidebar;
        window.closeSidebar = closeSidebar;
    },

    // ===================================
    // SEARCH OVERLAY
    // ===================================
    searchOverlay: function () {
        const searchOverlay = this.elements.searchOverlay;
        const searchBtn = this.elements.searchBtn;
        const searchClose = this.elements.searchClose;
        const searchInput = this.elements.searchInput;
        const searchForm = this.elements.searchForm;
        const searchSuggestions = this.elements.searchSuggestions;

        if (!searchOverlay) return;

        const openSearch = () => {
            this.state.isSearchOpen = true;
            searchOverlay.classList.add('active');
            searchOverlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 300);

            this.events.emit('searchOpened');
        };

        const closeSearch = () => {
            this.state.isSearchOpen = false;
            searchOverlay.classList.remove('active');
            searchOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            if (searchInput) searchInput.value = '';
            if (searchBtn) searchBtn.focus();

            this.events.emit('searchClosed');
        };

        const toggleSearch = () => {
            if (this.state.isSearchOpen) {
                closeSearch();
            } else {
                openSearch();
            }
        };

        if (searchBtn) {
            searchBtn.addEventListener('click', openSearch);
        }

        if (searchClose) {
            searchClose.addEventListener('click', closeSearch);
        }

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput?.value.trim();
                if (query && query.length >= this.config.searchMinChars) {
                    this.performSearch(query);
                } else {
                    this.showNotification('Please enter at least 2 characters', 'warning');
                }
            });
        }

        if (searchSuggestions) {
            searchSuggestions.forEach(tag => {
                tag.addEventListener('click', () => {
                    const searchTerm = tag.dataset.search || tag.textContent.trim();
                    if (searchInput) {
                        searchInput.value = searchTerm;
                        searchInput.focus();
                    }
                });

                tag.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        tag.click();
                    }
                });
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isSearchOpen) {
                closeSearch();
            }
        });

        window.toggleSearch = toggleSearch;
        window.openSearch = openSearch;
        window.closeSearch = closeSearch;
    },

    performSearch: function (query) {
        if (!query || typeof query !== 'string') return;

        const sanitizedQuery = this.utils.sanitize(query);
        this.showNotification(`Searching for "${sanitizedQuery}"...`, 'info');

        if (this.elements.searchOverlay) {
            this.elements.searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
            this.state.isSearchOpen = false;
        }

        setTimeout(() => {
            console.log('Search query:', sanitizedQuery);
            this.showNotification('Search functionality coming soon!', 'info');
        }, 500);
    },

    // ===================================
    // HERO SLIDER (CONTINUED IN NEXT PART)
    // ===================================
    heroSlider: function () {
        const heroSection = this.elements.heroSection;
        const slides = this.elements.heroSlides;
        const dots = this.elements.heroDots;
        const prevBtn = this.elements.heroPrev;
        const nextBtn = this.elements.heroNext;

        if (!slides || slides.length === 0) return;

        this.state.totalSlides = slides.length;
        let slideInterval = null;
        let isPaused = false;

        const showSlide = (index) => {
            let newIndex = index;

            if (newIndex >= slides.length) newIndex = 0;
            if (newIndex < 0) newIndex = slides.length - 1;

            slides.forEach((slide, i) => {
                const isActive = i === newIndex;
                slide.classList.toggle('active', isActive);
                slide.setAttribute('aria-hidden', !isActive);
            });

            if (dots && dots.length > 0) {
                dots.forEach((dot, i) => {
                    const isActive = i === newIndex;
                    dot.classList.toggle('active', isActive);
                    dot.setAttribute('aria-selected', isActive);
                });
            }

            this.state.currentSlide = newIndex;
            this.announceSlideChange(newIndex + 1, slides.length);
            this.events.emit('slideChanged', { index: newIndex, total: slides.length });
        };

        const nextSlide = () => {
            showSlide(this.state.currentSlide + 1);
        };

        const prevSlide = () => {
            showSlide(this.state.currentSlide - 1);
        };

        const startAutoPlay = () => {
            stopAutoPlay();
            slideInterval = setInterval(() => {
                if (!isPaused) {
                    nextSlide();
                }
            }, this.config.sliderInterval);
        };

        const stopAutoPlay = () => {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        };

        const pauseAutoPlay = () => {
            isPaused = true;
        };

        const resumeAutoPlay = () => {
            isPaused = false;
        };

        showSlide(0);
        startAutoPlay();

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoPlay();
            });
        }

        if (dots && dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                    startAutoPlay();
                });

                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        showSlide(index);
                        startAutoPlay();
                    }
                });
            });
        }

        if (heroSection) {
            heroSection.addEventListener('mouseenter', pauseAutoPlay);
            heroSection.addEventListener('mouseleave', resumeAutoPlay);
            heroSection.addEventListener('focusin', pauseAutoPlay);
            heroSection.addEventListener('focusout', resumeAutoPlay);
        }

        document.addEventListener('keydown', (e) => {
            if (!heroSection || !this.utils.isInViewport(heroSection)) return;

            if (e.key === 'ArrowLeft') {
                prevSlide();
                startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                startAutoPlay();
            }
        });

        this.addSwipeSupport(heroSection, nextSlide, prevSlide, startAutoPlay);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        });

        window.addEventListener('beforeunload', stopAutoPlay);

        window.goToSlide = showSlide;
        window.nextSlide = nextSlide;
        window.prevSlide = prevSlide;
    },

    announceSlideChange: function (current, total) {
        let announcer = document.getElementById('slide-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'slide-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'visually-hidden sr-only';
            document.body.appendChild(announcer);
        }
        announcer.textContent = `Slide ${current} of ${total}`;
    },

    addSwipeSupport: function (element, onSwipeLeft, onSwipeRight, callback) {
        if (!element) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50;

        element.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    onSwipeLeft();
                } else {
                    onSwipeRight();
                }
                if (callback) callback();
            }
        }, { passive: true });
    },

    // ===================================
    // THEME TOGGLE
    // ===================================
    themeToggle: function () {
        const themeToggle = this.elements.themeToggle;

        this.applyTheme(this.state.theme);

        const toggleTheme = () => {
            this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.state.theme);

            try {
                localStorage.setItem('theme', this.state.theme);
            } catch (e) {
                console.warn('Could not save theme preference');
            }

            if (themeToggle) {
                themeToggle.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    themeToggle.style.transform = '';
                }, 300);
            }

            this.showNotification(
                `${this.state.theme === 'dark' ? 'Dark' : 'Light'} mode activated`,
                'success'
            );

            this.events.emit('themeChanged', { theme: this.state.theme });
        };

        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            try {
                if (!localStorage.getItem('theme')) {
                    this.state.theme = e.matches ? 'dark' : 'light';
                    this.applyTheme(this.state.theme);
                }
            } catch (err) {
                // localStorage not available
            }
        });

        window.toggleTheme = toggleTheme;
    },

    applyTheme: function (theme) {
        const html = document.documentElement;
        const body = document.body;

        html.setAttribute('data-theme', theme);
        body.classList.toggle('dark-mode', theme === 'dark');
        body.classList.toggle('light-mode', theme === 'light');

        this.updateThemeIcon();

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0a0e27' : '#0061f2');
        }
    },

    updateThemeIcon: function () {
        const themeToggle = this.elements.themeToggle;
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = this.state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        themeToggle.setAttribute('aria-label',
            `Switch to ${this.state.theme === 'dark' ? 'light' : 'dark'} mode`
        );
        themeToggle.setAttribute('aria-pressed', this.state.theme === 'dark');
    },

    // ===================================
    // LANGUAGE SELECTOR
    // ===================================
    languageSelector: function () {
        const langToggle = this.elements.langToggle;
        const langLinks = this.elements.langLinks;

        if (!langLinks || langLinks.length === 0) return;

        langLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                const langText = link.textContent.trim();

                if (!lang) return;

                this.state.language = lang;

                try {
                    localStorage.setItem('language', lang);
                } catch (e) {
                    console.warn('Could not save language preference');
                }

                if (langToggle) {
                    const langSpan = langToggle.querySelector('span');
                    if (langSpan) {
                        langSpan.textContent = lang.toUpperCase();
                    }
                }

                langLinks.forEach(l => {
                    l.classList.remove('active');
                    l.removeAttribute('aria-current');
                    const checkIcon = l.querySelector('.fa-check');
                    if (checkIcon) checkIcon.remove();
                });

                link.classList.add('active');
                link.setAttribute('aria-current', 'true');

                const icon = document.createElement('i');
                icon.className = 'fas fa-check';
                icon.setAttribute('aria-hidden', 'true');
                link.insertBefore(icon, link.firstChild);

                this.showNotification(`Language changed to ${langText}`, 'success');
                this.events.emit('languageChanged', { language: lang });
            });
        });
    },

    // ===================================
    // USER DROPDOWN
    // ===================================
    userDropdown: function () {
        const userToggle = this.elements.userToggle;
        const userDropdown = this.elements.userDropdown;
        const userMenu = this.elements.userMenu;

        if (!userToggle || !userDropdown) return;

        let isOpen = false;

        const openDropdown = () => {
            isOpen = true;
            userDropdown.classList.add('active');
            userToggle.setAttribute('aria-expanded', 'true');
        };

        const closeDropdown = () => {
            isOpen = false;
            userDropdown.classList.remove('active');
            userToggle.setAttribute('aria-expanded', 'false');
        };

        const toggleDropdown = (e) => {
            e.stopPropagation();
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        userToggle.addEventListener('click', toggleDropdown);

        userToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown(e);
            }
            if (e.key === 'Escape' && isOpen) {
                closeDropdown();
            }
        });

        document.addEventListener('click', (e) => {
            if (isOpen && userMenu && !userMenu.contains(e.target)) {
                closeDropdown();
            }
        });

        document.addEventListener('focusin', (e) => {
            if (isOpen && userMenu && !userMenu.contains(e.target)) {
                closeDropdown();
            }
        });
    },

    // ===================================
    // NOTIFICATIONS
    // ===================================
    notifications: function () {
        const notificationBtn = this.elements.notificationBtn;
        if (!notificationBtn) return;

        let dropdown = notificationBtn.querySelector('.notification-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'notification-dropdown';
            dropdown.setAttribute('role', 'menu');
            dropdown.setAttribute('aria-label', 'Notifications');
            notificationBtn.style.position = 'relative';
            notificationBtn.appendChild(dropdown);
        }

        const notifications = [
            {
                id: 1,
                message: 'New community announcement posted',
                time: '5 min ago',
                read: false,
                icon: 'bullhorn',
                type: 'info'
            },
            {
                id: 2,
                message: 'Town hall meeting scheduled for next week',
                time: '1 hour ago',
                read: false,
                icon: 'calendar',
                type: 'event'
            },
            {
                id: 3,
                message: 'Your service request has been processed',
                time: '2 hours ago',
                read: true,
                icon: 'check-circle',
                type: 'success'
            }
        ];

        this.renderNotifications(notifications, dropdown);
    },

    renderNotifications: function (notifications, dropdown) {
        if (!dropdown) return;

        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = this.elements.notificationBadge;

        if (badge) {
            badge.textContent = unreadCount.toString();
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
            badge.setAttribute('aria-label', `${unreadCount} unread notifications`);
        }

        dropdown.innerHTML = `
            <div class="notification-header">
                <h4>Notifications</h4>
                <button class="mark-all-read" aria-label="Mark all as read" type="button">
                    <i class="fas fa-check-double" aria-hidden="true"></i>
                </button>
            </div>
            <div class="notification-list" role="menu"></div>
            <div class="notification-footer">
                <a href="pages/notifications.html">View all notifications</a>
            </div>
        `;

        const list = dropdown.querySelector('.notification-list');

        notifications.forEach(notif => {
            const item = document.createElement('div');
            item.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
            item.setAttribute('data-id', notif.id);
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '0');

            item.innerHTML = `
                <div class="notification-icon ${notif.type}">
                    <i class="fas fa-${this.utils.sanitize(notif.icon)}" aria-hidden="true"></i>
                </div>
                <div class="notification-content">
                    <p class="notification-message"></p>
                    <span class="notification-time">
                        <i class="far fa-clock" aria-hidden="true"></i>
                        <span class="notification-time-text"></span>
                    </span>
                </div>
                ${!notif.read ? '<span class="unread-dot" aria-label="Unread"></span>' : ''}
            `;

            item.querySelector('.notification-message').textContent = notif.message;
            item.querySelector('.notification-time-text').textContent = notif.time;

            list.appendChild(item);
        });

        const markAllBtn = dropdown.querySelector('.mark-all-read');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllNotificationsRead();
            });
        }

        this.addNotificationStyles();
    },

    markAllNotificationsRead: function () {
        const items = document.querySelectorAll('.notification-item');
        items.forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
            const dot = item.querySelector('.unread-dot');
            if (dot) dot.remove();
        });

        const badge = this.elements.notificationBadge;
        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }

        this.showNotification('All notifications marked as read', 'success');
    },

    addNotificationStyles: function () {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                width: 350px;
                max-height: 450px;
                background: var(--white, #fff);
                border-radius: 0.75rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1000;
                overflow: hidden;
            }
            .dark-mode .notification-dropdown {
                background: var(--bg-secondary, #16213e);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            }
            .notification-btn:hover .notification-dropdown,
            .notification-btn:focus-within .notification-dropdown {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            .notification-header {
                padding: 1rem 1.25rem;
                border-bottom: 1px solid var(--gray-200, #e9ecef);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .dark-mode .notification-header {
                border-bottom-color: var(--border-color, #2a2a4a);
            }
            .notification-header h4 {
                font-size: 1rem;
                font-weight: 600;
                margin: 0;
                color: var(--gray-800, #343a40);
            }
            .dark-mode .notification-header h4 {
                color: var(--text-primary, #e8e8e8);
            }
            .mark-all-read {
                padding: 0.5rem;
                color: var(--primary-color, #0061f2);
                border-radius: 50%;
                transition: all 0.3s ease;
                border: none;
                background: none;
                cursor: pointer;
            }
            .mark-all-read:hover {
                background: var(--gray-100, #f1f3f5);
            }
            .notification-list {
                max-height: 320px;
                overflow-y: auto;
            }
            .notification-item {
                padding: 1rem 1.25rem;
                border-bottom: 1px solid var(--gray-100, #f1f3f5);
                display: flex;
                gap: 1rem;
                cursor: pointer;
                transition: background 0.3s ease;
                position: relative;
            }
            .dark-mode .notification-item {
                border-bottom-color: var(--border-color, #2a2a4a);
            }
            .notification-item:hover {
                background: var(--gray-50, #f8f9fa);
            }
            .dark-mode .notification-item:hover {
                background: var(--bg-tertiary, #0f3460);
            }
            .notification-item.unread {
                background: rgba(0, 97, 242, 0.05);
            }
            .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .notification-icon.info {
                background: rgba(52, 152, 219, 0.1);
                color: #3498db;
            }
            .notification-icon.event {
                background: rgba(155, 89, 182, 0.1);
                color: #9b59b6;
            }
            .notification-icon.success {
                background: rgba(39, 174, 96, 0.1);
                color: #27ae60;
            }
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            .notification-message {
                margin: 0 0 0.5rem 0;
                font-size: 0.875rem;
                line-height: 1.5;
                color: var(--gray-700, #495057);
            }
            .dark-mode .notification-message {
                color: var(--text-primary, #e8e8e8);
            }
            .notification-time {
                font-size: 0.75rem;
                color: var(--gray-500, #adb5bd);
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            .unread-dot {
                position: absolute;
                top: 1rem;
                right: 1rem;
                width: 8px;
                height: 8px;
                background: #3498db;
                border-radius: 50%;
            }
            .notification-footer {
                padding: 1rem;
                text-align: center;
                border-top: 1px solid var(--gray-200, #e9ecef);
            }
            .dark-mode .notification-footer {
                border-top-color: var(--border-color, #2a2a4a);
            }
            .notification-footer a {
                color: var(--primary-color, #0061f2);
                font-weight: 600;
                font-size: 0.875rem;
                text-decoration: none;
            }
            @media (max-width: 480px) {
                .notification-dropdown {
                    width: calc(100vw - 20px);
                    right: -10px;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // ===================================
    // SCROLL TO TOP
    // ===================================
    scrollToTop: function () {
        const scrollTopBtn = this.elements.scrollTopBtn;
        if (!scrollTopBtn) return;

        let ticking = false;

        const toggleButton = () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
                scrollTopBtn.hidden = false;
                scrollTopBtn.setAttribute('aria-hidden', 'false');
            } else {
                scrollTopBtn.classList.remove('visible');
                scrollTopBtn.hidden = true;
                scrollTopBtn.setAttribute('aria-hidden', 'true');
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(toggleButton);
                ticking = true;
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            const main = this.elements.main;
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus({ preventScroll: true });
            }
        });

        toggleButton();

        window.scrollToTop = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    },

    // ===================================
    // SMOOTH SCROLL
    // ===================================
    smoothScroll: function () {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (!href || href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const header = this.elements.header;
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, '', href);

                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });

                if (this.state.isMobileMenuOpen && window.closeMobileMenu) {
                    window.closeMobileMenu();
                }
            });
        });
    },

    // ===================================
    // EMERGENCY ALERT
    // ===================================
    emergencyAlert: function () {
        const alert = this.elements.emergencyAlert;
        const alertClose = this.elements.alertClose;

        if (!alert) return;

        let dismissed = false;
        try {
            dismissed = sessionStorage.getItem('alertDismissed') === 'true';
        } catch (e) {
            // sessionStorage not available
        }

        if (dismissed) {
            alert.style.display = 'none';
            return;
        }

        const closeAlert = () => {
            alert.classList.add('hidden');

            try {
                sessionStorage.setItem('alertDismissed', 'true');
            } catch (e) {
                // sessionStorage not available
            }

            setTimeout(() => {
                alert.style.display = 'none';
            }, 300);
        };

        if (alertClose) {
            alertClose.addEventListener('click', closeAlert);

            alertClose.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeAlert();
                }
            });
        }

        window.closeAlert = closeAlert;
    },

    // ===================================
    // CALENDAR
    // ===================================
    calendar: function () {
        const calendarGrid = this.elements.calendarGrid;
        if (!calendarGrid) return;

        const currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const events = {
            '2024-12-20': ['Community Meeting'],
            '2024-12-25': ['Christmas Day'],
            '2025-01-01': ['New Year\'s Day']
        };

        const renderCalendar = (month, year) => {
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();

            calendarGrid.innerHTML = '';

            dayNames.forEach(day => {
                const header = document.createElement('div');
                header.className = 'calendar-day-header';
                header.setAttribute('role', 'columnheader');
                header.textContent = day;
                calendarGrid.appendChild(header);
            });

            for (let i = 0; i < firstDay; i++) {
                const empty = document.createElement('div');
                empty.className = 'calendar-day empty';
                empty.setAttribute('aria-hidden', 'true');
                calendarGrid.appendChild(empty);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const isToday = day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEvent = events[dateKey] !== undefined;

                const dayEl = document.createElement('button');
                dayEl.type = 'button';
                dayEl.className = 'calendar-day';
                if (isToday) dayEl.classList.add('today', 'active');
                if (hasEvent) dayEl.classList.add('has-event');

                dayEl.textContent = day;
                dayEl.setAttribute('data-day', day);
                dayEl.setAttribute('data-date', dateKey);
                dayEl.setAttribute('aria-label',
                    `${monthNames[month]} ${day}, ${year}${hasEvent ? ' - Has events' : ''}${isToday ? ' - Today' : ''}`
                );

                dayEl.addEventListener('click', () => {
                    this.showDayEvents(dateKey, events[dateKey]);
                });

                calendarGrid.appendChild(dayEl);
            }

            const titleEl = this.elements.calendarTitle;
            if (titleEl) {
                titleEl.textContent = `${monthNames[month]} ${year}`;
            }
        };

        const prevBtn = this.elements.calendarPrev;
        const nextBtn = this.elements.calendarNext;

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderCalendar(currentMonth, currentYear);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderCalendar(currentMonth, currentYear);
            });
        }

        renderCalendar(currentMonth, currentYear);
    },

    showDayEvents: function (dateKey, events) {
        if (events && events.length > 0) {
            this.showNotification(`Events on ${dateKey}: ${events.join(', ')}`, 'info');
        } else {
            this.showNotification(`No events on ${dateKey}`, 'info');
        }
    },

    // ===================================
    // FORMS
    // ===================================
    forms: function () {
        const forms = document.querySelectorAll('form:not(.no-validate)');

        forms.forEach(form => {
            form.setAttribute('novalidate', 'true');

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                if (this.validateForm(form)) {
                    this.submitForm(form);
                } else {
                    const firstError = form.querySelector('.error, [aria-invalid="true"]');
                    if (firstError) {
                        firstError.focus();
                    }
                    this.showNotification('Please fix the errors in the form', 'error');
                }
            });

            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    input.classList.remove('error');
                    input.removeAttribute('aria-invalid');
                    const errorEl = input.parentElement?.querySelector('.field-error, .error-message');
                    if (errorEl) {
                        errorEl.textContent = '';
                    }
                });
            });
        });

        const newsletterForm = this.elements.newsletterForm;
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = newsletterForm.querySelector('input[type="email"]');
                if (emailInput) {
                    this.subscribeNewsletter(emailInput.value);
                }
            });
        }
    },

    validateForm: function (form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    validateField: function (field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        let isValid = true;
        let errorMessage = '';

        field.classList.remove('error', 'success');
        field.removeAttribute('aria-invalid');
        const existingError = field.parentElement?.querySelector('.field-error, .error-message');
        if (existingError) {
            existingError.textContent = '';
        }

        if (!required && !value) {
            return true;
        }

        if (required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        else if (type === 'email' && value) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        else if (type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        else if (type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                isValid = false;
                errorMessage = 'Please enter a valid URL';
            }
        }
        else if (field.hasAttribute('minlength') && value) {
            const minLength = parseInt(field.getAttribute('minlength'), 10);
            if (value.length < minLength) {
                isValid = false;
                errorMessage = `Minimum ${minLength} characters required`;
            }
        }
        else if (field.hasAttribute('maxlength') && value) {
            const maxLength = parseInt(field.getAttribute('maxlength'), 10);
            if (value.length > maxLength) {
                isValid = false;
                errorMessage = `Maximum ${maxLength} characters allowed`;
            }
        }
        else if (field.hasAttribute('pattern') && value) {
            const pattern = new RegExp(field.getAttribute('pattern'));
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.getAttribute('title') || 'Please match the required format';
            }
        }

        if (!isValid) {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');

            const errorSpan = field.parentElement?.querySelector('.field-error, .error-message');
            if (errorSpan) {
                errorSpan.textContent = errorMessage;
            }
        } else if (value) {
            field.classList.add('success');
        }

        return isValid;
    },

    submitForm: function (form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const submitBtn = form.querySelector('[type="submit"]');
        const originalContent = submitBtn?.innerHTML || 'Submit';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';
        }

        setTimeout(() => {
            console.log('Form submitted:', data);
            this.showNotification('Form submitted successfully!', 'success');
            form.reset();

            form.querySelectorAll('.success').forEach(el => el.classList.remove('success'));

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = originalContent;
            }

            this.events.emit('formSubmitted', { form: form.id, data });
        }, 2000);
    },

    subscribeNewsletter: function (email) {
        if (!email) {
            this.showNotification('Please enter your email address', 'warning');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        this.showNotification('Subscribing...', 'info');

        setTimeout(() => {
            console.log('Newsletter subscription:', email);
            this.showNotification('Successfully subscribed to newsletter!', 'success');

            const input = document.querySelector('.newsletter-form input[type="email"]');
            if (input) input.value = '';

            this.events.emit('newsletterSubscribed', { email });
        }, 1500);
    },

    // I'll continue in the next part with chatbot, animations, and remaining functions...

    // ===================================
    // CHATBOT
    // ===================================
    chatbot: function () {
        const chatbotToggle = this.elements.chatbotToggle;
        const chatbotWindow = this.elements.chatbotWindow;
        const chatbotClose = this.elements.chatbotClose;
        const chatInput = this.elements.chatInput;
        const chatSendBtn = this.elements.chatSendBtn;
        const chatMessages = this.elements.chatMessages;
        const chatbotBadge = this.elements.chatbotBadge;

        if (!chatbotToggle || !chatbotWindow) return;

        const openChatbot = () => {
            this.state.isChatbotOpen = true;
            chatbotWindow.classList.add('active');
            chatbotWindow.setAttribute('aria-hidden', 'false');
            chatbotToggle.setAttribute('aria-expanded', 'true');

            if (chatbotBadge) {
                chatbotBadge.style.display = 'none';
            }

            setTimeout(() => {
                if (chatInput) chatInput.focus();
            }, 300);

            this.events.emit('chatbotOpened');
        };

        const closeChatbot = () => {
            this.state.isChatbotOpen = false;
            chatbotWindow.classList.remove('active');
            chatbotWindow.setAttribute('aria-hidden', 'true');
            chatbotToggle.setAttribute('aria-expanded', 'false');
            chatbotToggle.focus();

            this.events.emit('chatbotClosed');
        };

        const toggleChatbot = () => {
            if (this.state.isChatbotOpen) {
                closeChatbot();
            } else {
                openChatbot();
            }
        };

        const sendMessage = () => {
            const message = chatInput?.value.trim();
            if (!message) return;

            this.addChatMessage(message, 'user');
            chatInput.value = '';

            this.showTypingIndicator();

            setTimeout(() => {
                this.hideTypingIndicator();
                const response = this.getChatbotResponse(message);
                this.addChatMessage(response, 'bot');
            }, this.config.chatbotTypingDelay + Math.random() * 1000);
        };

        chatbotToggle.addEventListener('click', toggleChatbot);

        if (chatbotClose) {
            chatbotClose.addEventListener('click', closeChatbot);
        }

        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', sendMessage);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isChatbotOpen) {
                closeChatbot();
            }
        });

        window.toggleChatbot = toggleChatbot;
        window.sendMessage = sendMessage;
    },

    showTypingIndicator: function () {
        const container = this.elements.chatMessages;
        if (!container) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    },

    hideTypingIndicator: function () {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    },

    addChatMessage: function (text, type) {
        const container = this.elements.chatMessages;
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = `${type}-message`;
        messageEl.setAttribute('role', 'log');

        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const textEl = document.createElement('p');
        textEl.textContent = text;

        const timeEl = document.createElement('span');
        timeEl.className = 'message-time';
        timeEl.textContent = time;

        messageEl.appendChild(textEl);
        messageEl.appendChild(timeEl);

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;

        if (type === 'bot') {
            this.announceMessage(`Assistant says: ${text}`);
        }
    },

    announceMessage: function (message) {
        let announcer = document.getElementById('chat-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'chat-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'visually-hidden sr-only';
            document.body.appendChild(announcer);
        }
        announcer.textContent = message;
    },

    getChatbotResponse: function (message) {
        const lowerMessage = message.toLowerCase().trim();

        const intents = {
            greeting: {
                patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'],
                responses: [
                    'Hello! Welcome to Guit County. How can I assist you today?',
                    'Hi there! I\'m here to help. What would you like to know?',
                    'Greetings! How may I help you today?'
                ]
            },
            help: {
                patterns: ['help', 'assist', 'support', 'need help', 'can you help'],
                responses: [
                    'I can help you with:\n• County services & information\n• Contact details\n• Population statistics\n• Education & healthcare\n• Events & news\n\nJust ask about any topic!'
                ]
            },
            services: {
                patterns: ['services', 'service', 'what services', 'offer', 'provide'],
                responses: [
                    'Guit County offers various services including:\n• Civil Registry (birth certificates, IDs)\n• Legal Aid & Conflict Resolution\n• Agriculture Support\n• Land & Housing Services\n\nVisit our Services section for more details!'
                ]
            },
            contact: {
                patterns: ['contact', 'phone', 'email', 'reach', 'call', 'address', 'location'],
                responses: [
                    'You can contact Guit County at:\n📍 Guit County Headquarters, Unity State, South Sudan\n📞 +211 912 345 678\n✉️ info@guitcounty.gov.ss\n🕐 Mon-Fri: 8:00 AM - 5:00 PM'
                ]
            },
            population: {
                patterns: ['population', 'how many people', 'residents', 'citizens', 'demographics'],
                responses: [
                    'According to the 2017 projection, Guit County has a population of approximately 49,018 people, up from 33,004 in the 2008 census - representing a 48.5% growth!'
                ]
            },
            education: {
                patterns: ['education', 'school', 'schools', 'learning', 'students'],
                responses: [
                    'Guit County has 45 schools serving the community. We\'re committed to improving educational access and quality. Visit our Education section for more information!'
                ]
            },
            health: {
                patterns: ['health', 'hospital', 'clinic', 'medical', 'healthcare', 'doctor'],
                responses: [
                    'We have 8 health centers serving the Guit County community. Visit our Healthcare section for information on hospitals, clinics, and public health initiatives.'
                ]
            },
            history: {
                patterns: ['history', 'heritage', 'past', 'culture', 'tradition'],
                responses: [
                    'Guit County has a rich history and cultural heritage. Located in Unity State, South Sudan, our community has shown remarkable resilience. Visit our History section to learn more!'
                ]
            },
            payam: {
                patterns: ['payam', 'payams', 'divisions', 'districts', 'administrative'],
                responses: [
                    'Guit County has 12 Payams (administrative divisions). Each Payam has its own local leadership. Visit our Payams section for detailed information!'
                ]
            },
            sports: {
                patterns: ['sports', 'football', 'soccer', 'games', 'athletics'],
                responses: [
                    'Sports play an important role in Guit County! We have active football teams and promote health through various sporting activities. Check out our Sports section!'
                ]
            },
            commissioner: {
                patterns: ['commissioner', 'leader', 'government', 'administration'],
                responses: [
                    'The County Commissioner leads the executive branch of Guit County. Visit our Commissioner section to learn about the current leadership and their vision.'
                ]
            },
            thanks: {
                patterns: ['thank', 'thanks', 'appreciate', 'helpful'],
                responses: [
                    'You\'re welcome! Is there anything else I can help you with?',
                    'Happy to help! Let me know if you have more questions.',
                    'My pleasure! Feel free to ask anything else.'
                ]
            },
            goodbye: {
                patterns: ['bye', 'goodbye', 'see you', 'take care', 'later'],
                responses: [
                    'Goodbye! Thank you for visiting Guit County. Have a wonderful day!',
                    'Take care! Feel free to return anytime you have questions.',
                    'Bye! Wishing you all the best from Guit County!'
                ]
            }
        };

        for (const [intent, data] of Object.entries(intents)) {
            for (const pattern of data.patterns) {
                if (lowerMessage.includes(pattern)) {
                    const responses = data.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }

        const defaultResponses = [
            'I\'m not sure I understand. Could you rephrase that? You can ask about services, contact information, population, education, healthcare, or history.',
            'I don\'t have information on that specific topic. Try asking about our services, contact details, or general county information.',
            'For detailed inquiries, please contact us at info@guitcounty.gov.ss or call +211 912 345 678.'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    },

    // ===================================
    // ANIMATIONS
    // ===================================
    animations: function () {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            document.querySelectorAll('.scroll-reveal, [data-animate]').forEach(el => {
                el.classList.add('revealed', 'is-visible');
            });
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed', 'is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal, [data-animate]').forEach(el => {
            observer.observe(el);
        });

        document.querySelectorAll('.stagger-children').forEach(parent => {
            const children = parent.children;
            Array.from(children).forEach((child, index) => {
                child.style.animationDelay = `${index * 0.1}s`;
            });
        });
    },

    // ===================================
    // LAZY LOADING
    // ===================================
    lazyLoading: function () {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        const srcset = img.getAttribute('data-srcset');

                        img.onerror = () => {
                            img.src = 'assets/images/placeholder.jpg';
                            img.alt = 'Image not available';
                        };

                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }

                        if (srcset) {
                            img.srcset = srcset;
                            img.removeAttribute('data-srcset');
                        }

                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0
            });

            images.forEach(img => {
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        } else {
            images.forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
            });
        }
    },

    // ===================================
    // COUNTER ANIMATION
    // ===================================
    counterAnimation: function () {
        const counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const duration = parseInt(counter.getAttribute('data-duration'), 10) || this.config.counterAnimationDuration;
            const suffix = counter.getAttribute('data-suffix') || '';
            const prefix = counter.getAttribute('data-prefix') || '';

            if (isNaN(target)) return;

            if (prefersReducedMotion) {
                counter.textContent = prefix + target.toLocaleString() + suffix;
                return;
            }

            const startTime = performance.now();
            const startValue = 0;

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);

                counter.textContent = prefix + currentValue.toLocaleString() + suffix;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = prefix + target.toLocaleString() + suffix;
                }
            };

            requestAnimationFrame(updateCounter);
        };

        if ('IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '0px'
            });

            counters.forEach(counter => counterObserver.observe(counter));
        } else {
            counters.forEach(animateCounter);
        }
    },

    // ===================================
    // TABS
    // ===================================
    tabs: function () {
        const tabContainers = document.querySelectorAll('.tabs-container, [data-tabs]');

        tabContainers.forEach(container => {
            const tabButtons = container.querySelectorAll('.tab-btn, [role="tab"], [data-tab-btn]');
            const tabPanels = container.querySelectorAll('.tab-content, [role="tabpanel"], [data-tab-panel]');

            if (tabButtons.length === 0) return;

            const activateTab = (targetId) => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                    btn.setAttribute('tabindex', '-1');
                });

                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.hidden = true;
                    panel.setAttribute('aria-hidden', 'true');
                });

                const targetBtn = container.querySelector(
                    `[data-tab="${targetId}"], [data-tab-btn="${targetId}"], [aria-controls="${targetId}"]`
                );
                const targetPanel = container.querySelector(
                    `#${targetId}, [data-panel="${targetId}"], [data-tab-panel="${targetId}"]`
                );

                if (targetBtn) {
                    targetBtn.classList.add('active');
                    targetBtn.setAttribute('aria-selected', 'true');
                    targetBtn.setAttribute('tabindex', '0');
                }

                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.hidden = false;
                    targetPanel.setAttribute('aria-hidden', 'false');
                }

                this.events.emit('tabChanged', { tabId: targetId });
            };

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetId = button.getAttribute('data-tab') ||
                        button.getAttribute('data-tab-btn') ||
                        button.getAttribute('aria-controls');
                    if (targetId) {
                        activateTab(targetId);
                    }
                });

                button.addEventListener('keydown', (e) => {
                    const btnArray = Array.from(tabButtons);
                    const currentIndex = btnArray.indexOf(button);
                    let targetBtn = null;

                    switch (e.key) {
                        case 'ArrowRight':
                        case 'ArrowDown':
                            e.preventDefault();
                            targetBtn = btnArray[(currentIndex + 1) % btnArray.length];
                            break;
                        case 'ArrowLeft':
                        case 'ArrowUp':
                            e.preventDefault();
                            targetBtn = btnArray[(currentIndex - 1 + btnArray.length) % btnArray.length];
                            break;
                        case 'Home':
                            e.preventDefault();
                            targetBtn = btnArray[0];
                            break;
                        case 'End':
                            e.preventDefault();
                            targetBtn = btnArray[btnArray.length - 1];
                            break;
                    }

                    if (targetBtn) {
                        targetBtn.focus();
                        targetBtn.click();
                    }
                });
            });

            const firstTab = tabButtons[0];
            if (firstTab) {
                const targetId = firstTab.getAttribute('data-tab') ||
                    firstTab.getAttribute('data-tab-btn') ||
                    firstTab.getAttribute('aria-controls');
                if (targetId) {
                    activateTab(targetId);
                }
            }
        });
    },

    // ===================================
    // ACCORDIONS
    // ===================================
    accordions: function () {
        const accordions = document.querySelectorAll('.accordion, [data-accordion]');

        accordions.forEach(accordion => {
            const items = accordion.querySelectorAll('.accordion-item, [data-accordion-item]');

            items.forEach(item => {
                const header = item.querySelector('.accordion-header, [data-accordion-header]');
                const content = item.querySelector('.accordion-content, [data-accordion-content]');

                if (!header || !content) return;

                const isExpanded = item.classList.contains('active') || item.hasAttribute('data-expanded');
                header.setAttribute('aria-expanded', isExpanded);
                content.hidden = !isExpanded;

                header.addEventListener('click', () => {
                    const currentlyExpanded = header.getAttribute('aria-expanded') === 'true';

                    if (!accordion.hasAttribute('data-multi')) {
                        items.forEach(otherItem => {
                            if (otherItem !== item) {
                                const otherHeader = otherItem.querySelector('.accordion-header, [data-accordion-header]');
                                const otherContent = otherItem.querySelector('.accordion-content, [data-accordion-content]');
                                if (otherHeader && otherContent) {
                                    otherItem.classList.remove('active');
                                    otherHeader.setAttribute('aria-expanded', 'false');
                                    otherContent.hidden = true;
                                }
                            }
                        });
                    }

                    item.classList.toggle('active', !currentlyExpanded);
                    header.setAttribute('aria-expanded', !currentlyExpanded);
                    content.hidden = currentlyExpanded;

                    this.events.emit('accordionToggled', {
                        item: item,
                        expanded: !currentlyExpanded
                    });
                });

                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        header.click();
                    }
                });
            });
        });
    },

    // ===================================
    // MODALS
    // ===================================
    modals: function () {
        const modalTriggers = document.querySelectorAll('[data-modal-target]');
        const modals = document.querySelectorAll('.modal, [data-modal]');

        const openModal = (modalId) => {
            const modal = document.querySelector(`#${modalId}, [data-modal="${modalId}"]`);
            if (!modal) return;

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable) focusable.focus();
            }, 100);

            this.trapFocus(modal);
            this.events.emit('modalOpened', { modalId });
        };

        const closeModal = (modal) => {
            if (!modal) return;

            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            const trigger = document.querySelector(`[data-modal-target="${modal.id}"]`);
            if (trigger) trigger.focus();

            this.removeFocusTrap();
            this.events.emit('modalClosed', { modalId: modal.id });
        };

        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal-target');
                openModal(modalId);
            });
        });

        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close, [data-modal-close]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeModal(modal));
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active, [data-modal].active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });

        window.openModal = openModal;
        window.closeModal = closeModal;
    },

    // ===================================
    // TOOLTIPS
    // ===================================
    tooltips: function () {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const position = element.getAttribute('data-tooltip-position') || 'top';

            if (!tooltipText) return;

            const tooltip = document.createElement('div');
            tooltip.className = `tooltip tooltip-${position}`;
            tooltip.textContent = tooltipText;
            tooltip.setAttribute('role', 'tooltip');
            tooltip.setAttribute('aria-hidden', 'true');

            const showTooltip = () => {
                document.body.appendChild(tooltip);

                const rect = element.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();

                let top, left;

                switch (position) {
                    case 'top':
                        top = rect.top - tooltipRect.height - 8;
                        left = rect.left + (rect.width - tooltipRect.width) / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 8;
                        left = rect.left + (rect.width - tooltipRect.width) / 2;
                        break;
                    case 'left':
                        top = rect.top + (rect.height - tooltipRect.height) / 2;
                        left = rect.left - tooltipRect.width - 8;
                        break;
                    case 'right':
                        top = rect.top + (rect.height - tooltipRect.height) / 2;
                        left = rect.right + 8;
                        break;
                    default:
                        top = rect.top - tooltipRect.height - 8;
                        left = rect.left + (rect.width - tooltipRect.width) / 2;
                }

                if (left < 0) left = 8;
                if (left + tooltipRect.width > window.innerWidth) {
                    left = window.innerWidth - tooltipRect.width - 8;
                }
                if (top < 0) top = rect.bottom + 8;

                tooltip.style.top = `${top + window.scrollY}px`;
                tooltip.style.left = `${left + window.scrollX}px`;
                tooltip.classList.add('visible');
                tooltip.setAttribute('aria-hidden', 'false');
            };

            const hideTooltip = () => {
                tooltip.classList.remove('visible');
                tooltip.setAttribute('aria-hidden', 'true');
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            };

            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            element.addEventListener('focus', showTooltip);
            element.addEventListener('blur', hideTooltip);
        });

        this.addTooltipStyles();
    },

    addTooltipStyles: function () {
        if (document.getElementById('tooltip-styles')) return;

        const style = document.createElement('style');
        style.id = 'tooltip-styles';
        style.textContent = `
            .tooltip {
                position: absolute;
                z-index: 10000;
                padding: 0.5rem 0.75rem;
                background: var(--gray-800, #343a40);
                color: var(--white, #fff);
                font-size: 0.8125rem;
                border-radius: 0.375rem;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transform: translateY(5px);
                transition: all 0.2s ease;
                pointer-events: none;
                max-width: 250px;
                word-wrap: break-word;
                white-space: normal;
            }
            .dark-mode .tooltip {
                background: var(--gray-200, #e9ecef);
                color: var(--gray-800, #343a40);
            }
            .tooltip.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            .tooltip::before {
                content: '';
                position: absolute;
                border: 6px solid transparent;
            }
            .tooltip-top::before {
                bottom: -12px;
                left: 50%;
                transform: translateX(-50%);
                border-top-color: var(--gray-800, #343a40);
            }
            .tooltip-bottom::before {
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                border-bottom-color: var(--gray-800, #343a40);
            }
            .tooltip-left::before {
                right: -12px;
                top: 50%;
                transform: translateY(-50%);
                border-left-color: var(--gray-800, #343a40);
            }
            .tooltip-right::before {
                left: -12px;
                top: 50%;
                transform: translateY(-50%);
                border-right-color: var(--gray-800, #343a40);
            }
            .dark-mode .tooltip-top::before {
                border-top-color: var(--gray-200, #e9ecef);
            }
            .dark-mode .tooltip-bottom::before {
                border-bottom-color: var(--gray-200, #e9ecef);
            }
            .dark-mode .tooltip-left::before {
                border-left-color: var(--gray-200, #e9ecef);
            }
            .dark-mode .tooltip-right::before {
                border-right-color: var(--gray-200, #e9ecef);
            }
        `;
        document.head.appendChild(style);
    },

    // I'll continue with the final functions in the next part...

    // ===================================
    // SOCIAL SHARE
    // ===================================
    socialShare: function () {
        const shareButtons = document.querySelectorAll('.share-btn, [data-share]');

        shareButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();

                const url = btn.getAttribute('data-url') || window.location.href;
                const title = btn.getAttribute('data-title') || document.title;
                const text = btn.getAttribute('data-text') ||
                    document.querySelector('meta[name="description"]')?.content || '';

                if (navigator.share && navigator.canShare) {
                    try {
                        await navigator.share({ title, text, url });
                        this.showNotification('Shared successfully!', 'success');
                        return;
                    } catch (err) {
                        if (err.name === 'AbortError') return;
                        console.log('Web Share failed, using fallback');
                    }
                }

                const platform = btn.getAttribute('data-share') ||
                    (btn.classList.contains('facebook') || btn.querySelector('.fa-facebook') ? 'facebook' :
                        btn.classList.contains('twitter') || btn.querySelector('.fa-twitter') ? 'twitter' :
                            btn.classList.contains('linkedin') || btn.querySelector('.fa-linkedin') ? 'linkedin' :
                                btn.classList.contains('whatsapp') || btn.querySelector('.fa-whatsapp') ? 'whatsapp' :
                                    null);

                if (platform) {
                    this.openShareWindow(platform, url, title, text);
                } else {
                    const success = await this.utils.copyToClipboard(url);
                    if (success) {
                        this.showNotification('Link copied to clipboard!', 'success');
                    }
                }
            });
        });
    },

    openShareWindow: function (platform, url, title, text) {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedText = encodeURIComponent(text);

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
            reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`
        };

        const shareUrl = shareUrls[platform];
        if (!shareUrl) return;

        if (platform === 'email') {
            window.location.href = shareUrl;
        } else {
            const width = 600;
            const height = 400;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;

            window.open(
                shareUrl,
                `share_${platform}`,
                `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
            );
        }

        this.events.emit('shared', { platform, url });
    },

    // ===================================
    // RIPPLE EFFECT
    // ===================================
    rippleEffect: function () {
        this.addRippleStyles();

        const rippleElements = document.querySelectorAll('.btn, .action-btn, .ripple-effect, .nav-link');

        rippleElements.forEach(element => {
            if (element.dataset.ripple === 'true') return;
            element.dataset.ripple = 'true';

            element.addEventListener('click', function (e) {
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                if (this.disabled || this.classList.contains('disabled')) return;

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                const existingRipple = this.querySelector('.ripple');
                if (existingRipple) existingRipple.remove();

                this.appendChild(ripple);

                ripple.addEventListener('animationend', () => ripple.remove());

                setTimeout(() => {
                    if (ripple.parentNode) ripple.remove();
                }, 700);
            });
        });
    },

    addRippleStyles: function () {
        if (document.getElementById('ripple-styles')) return;

        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .btn, .action-btn, .ripple-effect, .nav-link {
                position: relative;
                overflow: hidden;
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            .dark-mode .ripple {
                background: rgba(255, 255, 255, 0.2);
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // ===================================
    // SHOW NOTIFICATION (Toast)
    // ===================================
    showNotification: function (message, type = 'info', duration = null) {
        let container = this.elements.toastContainer;

        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
            this.elements.toastContainer = container;
        }

        const toastDuration = duration || this.config.notificationDuration;

        const existingToasts = container.querySelectorAll('.toast');
        if (existingToasts.length >= this.config.maxNotifications) {
            existingToasts[0].remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');

        const icon = this.getNotificationIcon(type);

        toast.innerHTML = `
            <i class="fas fa-${icon}" aria-hidden="true"></i>
            <span>${this.utils.sanitize(message)}</span>
            <button class="toast-close" aria-label="Close notification" type="button">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        const closeBtn = toast.querySelector('.toast-close');
        const removeToast = () => {
            toast.classList.remove('show');
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', removeToast);
        }

        setTimeout(removeToast, toastDuration);

        this.events.emit('notificationShown', { message, type });
    },

    getNotificationIcon: function (type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    // ===================================
    // PERFORMANCE OPTIMIZATION
    // ===================================
    performanceOptimization: function () {
        // Lazy load images when scrolling stops
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.lazyLoading();
            }, 150);
        }, { passive: true });

        // Prefetch important pages
        const prefetchLinks = document.querySelectorAll('a[data-prefetch]');
        if ('IntersectionObserver' in window) {
            const prefetchObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const link = entry.target;
                        const href = link.getAttribute('href');
                        if (href && !link.dataset.prefetched) {
                            const linkElement = document.createElement('link');
                            linkElement.rel = 'prefetch';
                            linkElement.href = href;
                            document.head.appendChild(linkElement);
                            link.dataset.prefetched = 'true';
                        }
                        prefetchObserver.unobserve(link);
                    }
                });
            });

            prefetchLinks.forEach(link => prefetchObserver.observe(link));
        }

        // Report Web Vitals (if available)
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.log(`Performance: ${entry.name}`, entry);
                    }
                });
                observer.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (e) {
                console.log('Performance observer not supported');
            }
        }
    },

    // ===================================
    // ACCESSIBILITY ENHANCEMENTS
    // ===================================
    setupAccessibility: function () {
        // Announce page changes to screen readers
        this.announcePageChange();

        // Add skip links dynamically if missing
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'Skip to main content';
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        // Improve focus visibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Add ARIA live region for dynamic content
        if (!document.getElementById('aria-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden sr-only';
            document.body.appendChild(liveRegion);
        }
    },

    announcePageChange: function () {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = `Page loaded: ${document.title}`;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    },

    // ===================================
    // KEYBOARD SHORTCUTS
    // ===================================
    setupKeyboardShortcuts: function () {
        const shortcuts = {
            's': () => { // Search
                if (window.openSearch) window.openSearch();
            },
            'c': () => { // Chat
                if (window.toggleChatbot) window.toggleChatbot();
            },
            't': () => { // Theme
                if (window.toggleTheme) window.toggleTheme();
            },
            'h': () => { // Home
                window.location.hash = '#home';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            '?': () => { // Help
                this.showKeyboardShortcuts();
            }
        };

        document.addEventListener('keydown', (e) => {
            // Only trigger if not in input/textarea
            if (e.target.matches('input, textarea, select')) return;

            // Ctrl/Cmd + key
            if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();
                if (shortcuts[key]) {
                    e.preventDefault();
                    shortcuts[key]();
                }
            }
        });

        console.log('💡 Keyboard Shortcuts Available:');
        console.log('Ctrl/Cmd + S: Search');
        console.log('Ctrl/Cmd + C: Chat');
        console.log('Ctrl/Cmd + T: Toggle Theme');
        console.log('Ctrl/Cmd + H: Home');
        console.log('Ctrl/Cmd + ?: Show Shortcuts');
    },

    showKeyboardShortcuts: function () {
        const shortcuts = `
            <h3>Keyboard Shortcuts</h3>
            <ul style="list-style: none; padding: 0;">
                <li><kbd>Ctrl/Cmd + S</kbd> - Open Search</li>
                <li><kbd>Ctrl/Cmd + C</kbd> - Open Chat</li>
                <li><kbd>Ctrl/Cmd + T</kbd> - Toggle Theme</li>
                <li><kbd>Ctrl/Cmd + H</kbd> - Go to Home</li>
                <li><kbd>ESC</kbd> - Close Modals/Overlays</li>
                <li><kbd>Tab</kbd> - Navigate through elements</li>
            </ul>
        `;
        this.showNotification(shortcuts, 'info', 10000);
    },

    // ===================================
    // ERROR HANDLING
    // ===================================
    handleError: function (error, context = 'unknown') {
        console.error(`Error in ${context}:`, error);

        // Log to analytics or error tracking service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${context}: ${error.message}`,
                fatal: false
            });
        }

        // Show user-friendly message
        this.showNotification('An error occurred. Please try again.', 'error');

        // Emit error event
        this.events.emit('error', { error, context });
    },

    // ===================================
    // SANITIZE INPUT (Helper)
    // ===================================
    sanitizeInput: function (str) {
        return this.utils.sanitize(str);
    },

    // ===================================
    // IS ELEMENT IN VIEWPORT (Helper)
    // ===================================
    isElementInViewport: function (el) {
        return this.utils.isInViewport(el);
    }
};

// ===================================
// AUTO-INITIALIZE ON DOM READY
// ===================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        GuitCounty.init();
    });
} else {
    GuitCounty.init();
}

// ===================================
// GLOBAL ERROR HANDLER
// ===================================
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    GuitCounty.handleError(event.error, 'global');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    GuitCounty.handleError(event.reason, 'promise');
});

// ===================================
// EXPOSE TO WINDOW (for debugging)
// ===================================
window.GuitCounty = GuitCounty;

// ===================================
// SERVICE WORKER REGISTRATION (PWA)
// ===================================
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// ===================================
// ANALYTICS INTEGRATION
// ===================================
GuitCounty.events.on('initialized', () => {
    // Track page view
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
});

// Track outbound links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.hostname !== window.location.hostname) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'outbound',
                event_label: link.href
            });
        }
    }
});

// ===================================
// CONSOLE WELCOME MESSAGE
// ===================================
console.log('%c👋 Welcome to Guit County Website!', 'color: #0061f2; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with ❤️ for the Guit County Community', 'color: #27ae60; font-size: 14px;');
console.log('%c🔧 Developer Tools Available:', 'color: #f39c12; font-weight: bold;');
console.log('• GuitCounty - Main application object');
console.log('• GuitCounty.state - Current application state');
console.log('• GuitCounty.events - Event system');
console.log('• GuitCounty.utils - Utility functions');
console.log('%c📊 Website Statistics:', 'color: #3498db; font-weight: bold;');
console.log(`• Version: 2.0.1`);
console.log(`• Theme: ${GuitCounty.state.theme}`);
console.log(`• Language: ${GuitCounty.state.language}`);
console.log('%c⌨️  Press Ctrl/Cmd + ? for keyboard shortcuts', 'color: #9b59b6;');

// ===================================
// EXPORT FOR MODULE SYSTEMS
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuitCounty;
}

if (typeof define === 'function' && define.amd) {
    define([], function () {
        return GuitCounty;
    });
}