/* ===================================
   GUIT COUNTY - WEBSITE FEATURES
   Version: 2.0.1 (Complete & Enhanced)
   All missing functionality implementations
   =================================== */

(function () {
    'use strict';

    console.log('%c🎨 Features script loaded', 'color: #0061f2; font-weight: bold;');

    // ===================================
    // CONFIGURATION
    // ===================================
    const CONFIG = {
        TOAST_DURATION: 5000,
        ERROR_DURATION: 3000,
        SCROLL_THRESHOLD: 300,
        COUNTER_DURATION: 2000,
        NOTIFICATION_MAX: 5
    };

    // ===================================
    // STATE
    // ===================================
    const state = {
        theme: localStorage.getItem('theme') || 'light',
        language: localStorage.getItem('language') || 'en',
        isInitialized: false
    };

    // ===================================
    // WAIT FOR DOM
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFeatures);
    } else {
        initializeFeatures();
    }

    // ===================================
    // INITIALIZE ALL FEATURES
    // ===================================
    function initializeFeatures() {
        if (state.isInitialized) {
            console.warn('⚠️ Features already initialized');
            return;
        }

        console.log('🚀 Initializing website features...');

        try {
            // Apply saved theme
            applySavedTheme();

            // Initialize all features
            initScrollToTop();
            initMobileMenu();
            initThemeToggle();
            initNotifications();
            initChatbot();
            initContactForm();
            initNewsletter();
            initLanguageSwitcher();
            initSearchFunctionality();
            initCounterAnimations();
            initUserDropdown();
            initSidebarToggle();
            initAccordions();
            initTabs();
            initTooltips();
            initAOS();
            initPreloader();
            initTagline();
            initHeaderScroll();
            updateCurrentYear();

            state.isInitialized = true;
            console.log('✅ All features initialized successfully');

            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('features:initialized'));

        } catch (error) {
            console.error('❌ Features initialization error:', error);
        }
    }

    // Update Year
    function updateCurrentYear() {
        const yearEl = document.getElementById('currentYear');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    // ===================================
    // 1. SCROLL TO TOP BUTTON
    // ===================================
    function initScrollToTop() {
        const scrollBtn = document.querySelector('.scroll-top');
        if (!scrollBtn) return;

        let ticking = false;

        const handleScroll = () => {
            const scrolled = window.pageYOffset > CONFIG.SCROLL_THRESHOLD;

            if (scrolled) {
                scrollBtn.removeAttribute('hidden');
                scrollBtn.classList.add('visible');
                scrollBtn.setAttribute('aria-hidden', 'false');
            } else {
                scrollBtn.classList.remove('visible');
                scrollBtn.setAttribute('aria-hidden', 'true');
                setTimeout(() => {
                    if (!scrollBtn.classList.contains('visible')) {
                        scrollBtn.setAttribute('hidden', '');
                    }
                }, 300);
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        }, { passive: true });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Initial check
        handleScroll();

        console.log('✓ Scroll to top initialized');
    }

    // ===================================
    // 2. MOBILE MENU
    // ===================================
    function initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.getElementById('mobileNav');
        const mobileClose = document.querySelector('.mobile-nav-close');
        const mobileLinks = document.querySelectorAll('.mobile-nav-menu a');

        if (!mobileToggle || !mobileNav) return;

        function openMobileMenu() {
            mobileNav.classList.add('active');
            mobileNav.setAttribute('aria-hidden', 'false');
            mobileToggle.setAttribute('aria-expanded', 'true');
            mobileToggle.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Focus first link
            setTimeout(() => {
                const firstLink = mobileNav.querySelector('a, button');
                if (firstLink) firstLink.focus();
            }, 100);
        }

        function closeMobileMenu() {
            mobileNav.classList.remove('active');
            mobileNav.setAttribute('aria-hidden', 'true');
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileToggle.classList.remove('active');
            document.body.style.overflow = '';
            mobileToggle.focus();
        }

        mobileToggle.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        if (mobileClose) {
            mobileClose.addEventListener('click', closeMobileMenu);
        }

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMobileMenu, 150);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Close on outside click
        mobileNav.addEventListener('click', (e) => {
            if (e.target === mobileNav) {
                closeMobileMenu();
            }
        });

        console.log('✓ Mobile menu initialized');
    }

    // ===================================
    // 3. THEME TOGGLE
    // ===================================
    function initThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            const currentTheme = state.theme === 'dark' ? 'light' : 'dark';
            state.theme = currentTheme;

            applyTheme(currentTheme);
            localStorage.setItem('theme', currentTheme);

            showToast(
                `${currentTheme === 'dark' ? 'Dark' : 'Light'} mode activated`,
                'success'
            );
        });

        console.log('✓ Theme toggle initialized');
    }

    function applySavedTheme() {
        applyTheme(state.theme);
    }

    function applyTheme(theme) {
        const body = document.body;
        const html = document.documentElement;
        const themeToggle = document.querySelector('.theme-toggle');

        if (theme === 'dark') {
            body.classList.add('dark-mode');
            html.setAttribute('data-theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            html.setAttribute('data-theme', 'light');
        }

        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            themeToggle.setAttribute('aria-label',
                `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
            );
            themeToggle.setAttribute('aria-pressed', theme === 'dark');
        }

        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0a0e27' : '#0061f2');
        }
    }

    // ===================================
    // 4. NOTIFICATIONS SYSTEM
    // ===================================
    function initNotifications() {
        const notifBtn = document.querySelector('.notification-btn');
        if (!notifBtn) return;

        // Check if dropdown already exists
        let dropdown = notifBtn.parentElement.querySelector('.notification-dropdown');

        if (!dropdown) {
            dropdown = createNotificationDropdown();
            notifBtn.parentElement.style.position = 'relative';
            notifBtn.parentElement.appendChild(dropdown);
        }

        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            const isOpen = dropdown.classList.contains('active');
            notifBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
            notifBtn.setAttribute('aria-expanded', 'false');
        });

        // Mark all as read
        const markAllBtn = dropdown.querySelector('.mark-all-read');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                markAllNotificationsAsRead(dropdown);
            });
        }

        console.log('✓ Notifications initialized');
    }

    function createNotificationDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.setAttribute('role', 'menu');
        dropdown.setAttribute('aria-label', 'Notifications');
        dropdown.innerHTML = `
            <div class="notification-header">
                <h4>Notifications</h4>
                <button class="mark-all-read" aria-label="Mark all as read" type="button">
                    <i class="fas fa-check-double" aria-hidden="true"></i>
                </button>
            </div>
            <div class="notification-list" role="menu" id="dynamicNotificationList">
                <div class="notification-placeholder">Loading updates...</div>
            </div>
            <div class="notification-footer">
                <a href="#news">View all news</a>
            </div>
        `;

        // Initial fetch
        fetchDynamicNotifications(dropdown);

        return dropdown;
    }

    async function fetchDynamicNotifications(dropdown) {
        const list = dropdown.querySelector('#dynamicNotificationList');
        if (!list) return;

        try {
            const [
                news, services, politicians, leaders, artists, students,
                education, history, healthcare, military, payams, bomas,
                sports, slides
            ] = await Promise.all([
                fetch('/api/news').then(res => res.json()).catch(() => []),
                fetch('/api/services').then(res => res.json()).catch(() => []),
                fetch('/api/politicians').then(res => res.json()).catch(() => []),
                fetch('/api/leaders').then(res => res.json()).catch(() => []),
                fetch('/api/artists').then(res => res.json()).catch(() => []),
                fetch('/api/students').then(res => res.json()).catch(() => []),
                fetch('/api/education').then(res => res.json()).catch(() => []),
                fetch('/api/history').then(res => res.json()).catch(() => []),
                fetch('/api/healthcare').then(res => res.json()).catch(() => []),
                fetch('/api/military').then(res => res.json()).catch(() => []),
                fetch('/api/payams').then(res => res.json()).catch(() => []),
                fetch('/api/bomas').then(res => res.json()).catch(() => []),
                fetch('/api/sports').then(res => res.json()).catch(() => []),
                fetch('/api/slides').then(res => res.json()).catch(() => [])
            ]);

            const allUpdates = [
                ...news.map(n => ({ type: 'News', title: n.title, time: n.date, icon: 'fa-newspaper', color: 'info' })),
                ...services.map(s => ({ type: 'Service', title: s.title || s.name, time: s.updatedAt || new Date(), icon: 'fa-concierge-bell', color: 'success' })),
                ...politicians.map(p => ({ type: 'Politician', title: p.name, time: p.updatedAt || new Date(), icon: 'fa-user-tie', color: 'warning' })),
                ...leaders.map(l => ({ type: 'Leader', title: l.name, time: l.updatedAt || new Date(), icon: 'fa-users-cog', color: 'primary' })),
                ...artists.map(a => ({ type: 'Artist', title: a.name, time: a.updatedAt || new Date(), icon: 'fa-music', color: 'event' })),
                ...students.map(s => ({ type: 'Student', title: s.title || s.name, time: s.updatedAt || new Date(), icon: 'fa-user-graduate', color: 'info' })),

                ...education.map(e => ({ type: 'Education', title: e.name || 'Education Update', time: e.updatedAt || new Date(), icon: 'fa-graduation-cap', color: 'info' })),
                ...history.map(h => ({ type: 'History', title: h.title, time: h.updatedAt || new Date(), icon: 'fa-landmark', color: 'warning' })),
                ...healthcare.map(h => ({ type: 'Healthcare', title: h.name, time: h.updatedAt || new Date(), icon: 'fa-heartbeat', color: 'success' })),
                ...military.map(m => ({ type: 'Military', title: m.name, time: m.updatedAt || new Date(), icon: 'fa-shield-alt', color: 'danger' })),
                ...payams.map(p => ({ type: 'Payam', title: p.name, time: p.updatedAt || new Date(), icon: 'fa-map-marked-alt', color: 'info' })),
                ...bomas.map(b => ({ type: 'Boma', title: b.name, time: b.updatedAt || new Date(), icon: 'fa-building', color: 'info' })),
                ...sports.map(s => ({ type: 'Sport', title: s.name || s.title, time: s.updatedAt || new Date(), icon: 'fa-futbol', color: 'success' })),
                ...slides.map(s => ({ type: 'Slide', title: s.title, time: s.updatedAt || new Date(), icon: 'fa-image', color: 'primary' }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8); // Increased limit to 8

            if (allUpdates.length > 0) {
                list.innerHTML = allUpdates.map(u => {
                    const timeStr = formatNotificationTime(u.time);
                    return `
                        <div class="notification-item unread" role="menuitem" tabindex="0">
                            <div class="notification-icon ${u.color}">
                                <i class="fas ${u.icon}" aria-hidden="true"></i>
                            </div>
                            <div class="notification-content">
                                <p class="notification-message"><strong>New ${u.type}:</strong> ${u.title}</p>
                                <span class="notification-time">
                                    <i class="far fa-clock" aria-hidden="true"></i>
                                    <span>${timeStr}</span>
                                </span>
                            </div>
                            <span class="unread-dot" aria-label="Unread"></span>
                        </div>
                    `;
                }).join('');

                // Update badge
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = allUpdates.length;
                    badge.style.display = 'flex';
                }
            } else {
                list.innerHTML = '<div class="notification-placeholder">No new updates found</div>';
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            list.innerHTML = '<div class="notification-placeholder">Could not load updates</div>';
        }
    }

    function formatNotificationTime(date) {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 60) return `${diffInMins} min ago`;
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        return `${diffInDays} days ago`;
    }

    function markAllNotificationsAsRead(dropdown) {
        const items = dropdown.querySelectorAll('.notification-item');
        const badge = document.querySelector('.notification-badge');

        items.forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
            const dot = item.querySelector('.unread-dot');
            if (dot) dot.remove();
        });

        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }

        showToast('All notifications marked as read', 'success');
    }

    // ===================================
    // 5. CHATBOT
    // ===================================
    function initChatbot() {
        const chatToggle = document.querySelector('.chatbot-toggle');
        const chatWindow = document.getElementById('chatbotWindow');
        const chatClose = document.querySelector('.chatbot-close');
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSendBtn');
        const chatMessages = document.getElementById('chatbotMessages');

        if (!chatToggle || !chatWindow) return;

        const faqResponses = {
            'hello': 'Hello! Welcome to Guit County. How can I assist you today?',
            'hi': 'Hi there! How can I help you?',
            'hey': 'Hey! What can I do for you?',
            'services': 'We offer various services including:\n• Civil Registry (birth certificates, IDs)\n• Legal Aid & Conflict Resolution\n• Agriculture Support\n• Land & Housing Services\n\nWhich would you like to know more about?',
            'contact': 'You can reach us at:\n📞 +211 912 345 678\n✉️ info@guitcounty.gov.ss\n📍 Guit County Headquarters, Unity State',
            'hours': 'Our offices are open:\n🕐 Monday - Friday\n⏰ 8:00 AM - 5:00 PM',
            'location': 'We are located in Guit County, Unity State, South Sudan',
            'help': 'I can help you with:\n• Information about our services\n• Contact details\n• Office hours\n• General inquiries about Guit County\n\nWhat would you like to know?',
            'population': 'According to 2017 projections, Guit County has approximately 49,018 residents.',
            'education': 'We have 45 schools serving our community. Visit our Education section for more details.',
            'health': 'We have 8 health centers. Check our Healthcare section for locations and services.',
            'thanks': 'You\'re welcome! Is there anything else I can help you with?',
            'thank': 'You\'re welcome! Feel free to ask more questions.',
            'bye': 'Goodbye! Have a great day!',
            'default': 'Thank you for your message. For specific inquiries, please contact us at:\n📧 info@guitcounty.gov.ss\n📞 +211 912 345 678'
        };

        function openChat() {
            chatWindow.style.display = 'flex'; // Ensure it's visible before animating
            // Force reflow
            void chatWindow.offsetWidth;
            chatWindow.classList.add('active');
            chatWindow.setAttribute('aria-hidden', 'false');
            chatToggle.setAttribute('aria-expanded', 'true');
            setTimeout(() => chatInput?.focus(), 100);
        }

        function closeChat() {
            chatWindow.classList.remove('active');
            chatWindow.setAttribute('aria-hidden', 'true');
            chatToggle.setAttribute('aria-expanded', 'false');

            // Wait for transition to finish then hide completely
            setTimeout(() => {
                if (!chatWindow.classList.contains('active')) {
                    chatWindow.style.display = 'none';
                }
            }, 300); // Matches typical transition duration
        }

        function sendMessage() {
            if (!chatInput || !chatMessages) return;

            const message = chatInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            chatInput.value = '';

            // Show typing indicator
            showTypingIndicator();

            setTimeout(() => {
                hideTypingIndicator();
                const response = getBotResponse(message);
                addMessage(response, 'bot');
            }, 800);
        }

        function addMessage(text, type) {
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';

            const time = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            messageDiv.innerHTML = `
                <p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>
                <span class="message-time">${time}</span>
            `;

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function showTypingIndicator() {
            if (!chatMessages) return;

            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.id = 'typing-indicator';
            indicator.innerHTML = '<span></span><span></span><span></span>';
            chatMessages.appendChild(indicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function hideTypingIndicator() {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
        }

        function getBotResponse(message) {
            const lowerMessage = message.toLowerCase();

            for (const [key, response] of Object.entries(faqResponses)) {
                if (lowerMessage.includes(key)) {
                    return response;
                }
            }

            return faqResponses.default;
        }

        chatToggle.addEventListener('click', openChat);
        if (chatClose) chatClose.addEventListener('click', closeChat);
        if (chatSend) chatSend.addEventListener('click', sendMessage);

        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        console.log('✓ Chatbot initialized');
    }

    // ===================================
    // 6. CONTACT FORM
    // ===================================
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const fields = {
            name: document.getElementById('contactName'),
            email: document.getElementById('contactEmail'),
            subject: document.getElementById('contactSubject'),
            message: document.getElementById('contactMessage')
        };

        // Real-time validation
        Object.values(fields).forEach(field => {
            if (field) {
                field.addEventListener('blur', () => validateField(field));
                field.addEventListener('input', () => clearFieldError(field));
            }
        });

        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                name: fields.name?.value.trim() || '',
                email: fields.email?.value.trim() || '',
                subject: fields.subject?.value.trim() || '',
                message: fields.message?.value.trim() || ''
            };

            if (!validateContactForm(formData, fields)) {
                showToast('Please fix the errors in the form', 'error');
                return;
            }

            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }

            // Real interaction with backend
            fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> <span>Send Message</span>';
                    }
                    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
                    form.reset();
                    Object.values(fields).forEach(field => {
                        if (field) field.classList.remove('success');
                    });
                })
                .catch(err => {
                    console.error('Error sending message:', err);
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> <span>Send Message</span>';
                    }
                    showToast('Failed to send message. Please try again.', 'error');
                });
        });

        console.log('✓ Contact form initialized');
    }

    function validateContactForm(data, fields) {
        let isValid = true;

        if (data.name.length < 2) {
            showFieldError(fields.name, 'Name must be at least 2 characters');
            isValid = false;
        }

        if (!isValidEmail(data.email)) {
            showFieldError(fields.email, 'Please enter a valid email address');
            isValid = false;
        }

        if (data.subject.length < 5) {
            showFieldError(fields.subject, 'Subject must be at least 5 characters');
            isValid = false;
        }

        if (data.message.length < 20) {
            showFieldError(fields.message, 'Message must be at least 20 characters');
            isValid = false;
        }

        return isValid;
    }

    function validateField(field) {
        if (!field) return;

        const value = field.value.trim();
        const type = field.type;
        const minLength = field.getAttribute('minlength');
        const required = field.hasAttribute('required');

        if (required && !value) {
            showFieldError(field, 'This field is required');
            return false;
        }

        if (type === 'email' && value && !isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        if (minLength && value.length < parseInt(minLength)) {
            showFieldError(field, `Minimum ${minLength} characters required`);
            return false;
        }

        if (value) {
            field.classList.add('success');
            field.classList.remove('error');
        }

        return true;
    }

    // ===================================
    // 7. NEWSLETTER
    // ===================================
    function initNewsletter() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('newsletterEmail');
            const submitBtn = form.querySelector('button[type="submit"]');
            if (!emailInput) return;

            const email = emailInput.value.trim();

            if (!isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                emailInput.classList.add('error');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }

            fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
                .then(res => res.json())
                .then(data => {
                    showToast('Successfully subscribed to newsletter!', 'success');
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>Subscribe</span> <i class="fas fa-paper-plane" aria-hidden="true"></i>';
                    }
                })
                .catch(err => {
                    console.error('Newsletter error:', err);
                    showToast('Failed to subscribe. Please try again.', 'error');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>Subscribe</span> <i class="fas fa-paper-plane" aria-hidden="true"></i>';
                    }
                });
        });

        console.log('✓ Newsletter initialized');
    }

    // ===================================
    // 8. LANGUAGE SWITCHER
    // ===================================
    function initLanguageSwitcher() {
        const langToggle = document.querySelector('.lang-toggle');
        const langMenu = langToggle?.nextElementSibling?.classList.contains('lang-menu')
            ? langToggle.nextElementSibling
            : null;
        const langLinks = document.querySelectorAll('[data-lang]');

        if (!langToggle || !langMenu) return;

        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = langMenu.classList.toggle('active');
            langToggle.setAttribute('aria-expanded', isOpen);
        });

        langLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                if (lang) {
                    switchLanguage(lang);
                    langMenu.classList.remove('active');
                    langToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.addEventListener('click', () => {
            langMenu.classList.remove('active');
            langToggle.setAttribute('aria-expanded', 'false');
        });

        console.log('✓ Language switcher initialized');
    }

    function switchLanguage(lang) {
        const langMap = {
            'en': 'EN',
            'ar': 'AR',
            'nuer': 'NU'
        };

        const langToggle = document.querySelector('.lang-toggle span');
        if (langToggle) {
            langToggle.textContent = langMap[lang] || 'EN';
        }

        state.language = lang;
        localStorage.setItem('language', lang);

        const langNames = {
            'en': 'English',
            'ar': 'Arabic',
            'nuer': 'Nuer'
        };

        showToast(`Language changed to ${langNames[lang] || lang}`, 'success');
    }

    // ===================================
    // 9. SEARCH FUNCTIONALITY
    // ===================================
    function initSearchFunctionality() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.getElementById('mainSearchInput');
        const searchBtn = document.querySelector('.search-btn');
        const searchClose = document.querySelector('.search-close');
        const searchOverlay = document.getElementById('searchOverlay');
        const searchResults = document.getElementById('searchResults');

        if (!searchForm || !searchInput) return;

        const performSearch = (query) => {
            if (!query || query.length < 2) {
                searchResults.innerHTML = '<p class="search-placeholder">Type at least 2 characters to search...</p>';
                return;
            }

            const sections = document.querySelectorAll('section, article, .feature-card, .news-card');
            const results = [];

            sections.forEach(section => {
                const text = section.innerText.toLowerCase();
                if (text.includes(query.toLowerCase())) {
                    const title = section.querySelector('h2, h3')?.innerText || 'Result';
                    const id = section.id || section.closest('section')?.id;
                    const excerpt = section.innerText.substring(0, 150) + '...';

                    if (id && !results.find(r => r.id === id)) {
                        results.push({ title, id, excerpt });
                    }
                }
            });

            if (results.length > 0) {
                searchResults.innerHTML = results.map(r => `
                    <div class="search-result-item" onclick="window.location.hash='${r.id}'; document.querySelector('.search-close').click();">
                        <h3>${r.title}</h3>
                        <p>${r.excerpt}</p>
                        <small><i class="fas fa-link"></i> Scroll to section</small>
                    </div>
                `).join('');
            } else {
                searchResults.innerHTML = '<p class="search-placeholder">No results found for "' + query + '"</p>';
            }
        };

        // Live search
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value.trim());
        });

        // Open search
        if (searchBtn && searchOverlay) {
            searchBtn.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                searchOverlay.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                setTimeout(() => searchInput?.focus(), 100);
            });
        }

        // Close search
        if (searchClose && searchOverlay) {
            searchClose.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
                searchOverlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (searchInput) searchInput.value = '';
                if (searchResults) searchResults.innerHTML = '<p class="search-placeholder">Type to start searching...</p>';
            });
        }

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay?.classList.contains('active')) {
                searchClose.click();
            }
        });

        // Submit search (just focus first result or scroll to top result)
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const firstResult = searchResults.querySelector('.search-result-item');
            if (firstResult) {
                firstResult.click();
            }
        });

        console.log('✓ Search functionality initialized');
    }

    // ===================================
    // 10. COUNTER ANIMATIONS
    // ===================================
    function initCounterAnimations() {
        const counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            const duration = CONFIG.COUNTER_DURATION;
            const suffix = counter.getAttribute('data-suffix') || '';
            const prefix = counter.getAttribute('data-prefix') || '';

            if (isNaN(target)) return;

            if (prefersReducedMotion) {
                counter.textContent = prefix + target.toLocaleString() + suffix;
                return;
            }

            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(target * easeOutQuart);

                counter.textContent = prefix + current.toLocaleString() + suffix;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = prefix + target.toLocaleString() + suffix;
                }
            };

            requestAnimationFrame(updateCounter);
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            counters.forEach(counter => observer.observe(counter));
        } else {
            counters.forEach(animateCounter);
        }

        console.log('✓ Counter animations initialized');
    }

    // ===================================
    // 11. USER DROPDOWN
    // ===================================
    function initUserDropdown() {
        const userToggle = document.querySelector('.user-toggle');
        const userDropdown = document.querySelector('.user-dropdown');
        const userMenu = document.querySelector('.user-menu');

        if (!userToggle || !userDropdown) return;

        let isOpen = false;

        userToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            isOpen = !isOpen;
            userDropdown.classList.toggle('active', isOpen);
            userToggle.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (isOpen && userMenu && !userMenu.contains(e.target)) {
                userDropdown.classList.remove('active');
                userToggle.setAttribute('aria-expanded', 'false');
                isOpen = false;
            }
        });

        console.log('✓ User dropdown initialized');
    }

    // ===================================
    // 12. SIDEBAR TOGGLE
    // ===================================
    function initSidebarToggle() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarClose = document.querySelector('.sidebar-close');

        if (!sidebar) return;

        // Create overlay if doesn't exist
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        const closeSidebar = () => {
            sidebar.classList.remove('active');
            sidebar.setAttribute('aria-hidden', 'true');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (sidebarClose) {
            sidebarClose.addEventListener('click', closeSidebar);
        }

        overlay.addEventListener('click', closeSidebar);

        console.log('✓ Sidebar toggle initialized');
    }

    // ===================================
    // 13. ACCORDIONS
    // ===================================
    function initAccordions() {
        const accordions = document.querySelectorAll('.accordion');

        accordions.forEach(accordion => {
            const items = accordion.querySelectorAll('.accordion-item');

            items.forEach(item => {
                const header = item.querySelector('.accordion-header');
                const content = item.querySelector('.accordion-content');

                if (!header || !content) return;

                header.addEventListener('click', () => {
                    const isOpen = item.classList.contains('active');

                    // Close all if single-open accordion
                    if (!accordion.hasAttribute('data-multi')) {
                        items.forEach(otherItem => {
                            otherItem.classList.remove('active');
                            const otherHeader = otherItem.querySelector('.accordion-header');
                            if (otherHeader) {
                                otherHeader.setAttribute('aria-expanded', 'false');
                            }
                        });
                    }

                    // Toggle current
                    item.classList.toggle('active', !isOpen);
                    header.setAttribute('aria-expanded', !isOpen);
                });
            });
        });

        console.log('✓ Accordions initialized');
    }

    // ===================================
    // 14. TABS
    // ===================================
    function initTabs() {
        const tabContainers = document.querySelectorAll('[data-tabs]');

        tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('[role="tab"]');
            const panels = container.querySelectorAll('[role="tabpanel"]');

            tabs.forEach((tab, index) => {
                tab.addEventListener('click', () => {
                    // Deactivate all
                    tabs.forEach(t => {
                        t.setAttribute('aria-selected', 'false');
                        t.classList.remove('active');
                    });
                    panels.forEach(p => {
                        p.hidden = true;
                        p.classList.remove('active');
                    });

                    // Activate current
                    tab.setAttribute('aria-selected', 'true');
                    tab.classList.add('active');
                    if (panels[index]) {
                        panels[index].hidden = false;
                        panels[index].classList.add('active');
                    }
                });
            });
        });

        console.log('✓ Tabs initialized');
    }

    // ===================================
    // 15. TOOLTIPS
    // ===================================
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            const text = element.getAttribute('data-tooltip');
            if (!text) return;

            const showTooltip = () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = text;
                tooltip.id = 'tooltip-' + Date.now();

                document.body.appendChild(tooltip);

                const rect = element.getBoundingClientRect();
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
                tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;

                setTimeout(() => tooltip.classList.add('visible'), 10);

                element.tooltipElement = tooltip;
            };

            const hideTooltip = () => {
                if (element.tooltipElement) {
                    element.tooltipElement.classList.remove('visible');
                    setTimeout(() => {
                        element.tooltipElement?.remove();
                        element.tooltipElement = null;
                    }, 200);
                }
            };

            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            element.addEventListener('focus', showTooltip);
            element.addEventListener('blur', hideTooltip);
        });

        console.log('✓ Tooltips initialized');
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    function showToast(message, type = 'info') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }

        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}" aria-hidden="true"></i>
            <span>${escapeHtml(message)}</span>
            <button class="toast-close" aria-label="Close notification" type="button">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        const removeToast = () => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', removeToast);
        }

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(removeToast, CONFIG.TOAST_DURATION);
    }

    function showFieldError(field, message) {
        if (!field) return;

        field.classList.add('error');
        field.classList.remove('success');
        field.setAttribute('aria-invalid', 'true');

        const errorSpan = field.parentElement?.querySelector('.error-message, .field-error');
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    }

    function clearFieldError(field) {
        if (!field) return;

        field.classList.remove('error');
        field.removeAttribute('aria-invalid');

        const errorSpan = field.parentElement?.querySelector('.error-message, .field-error');
        if (errorSpan) {
            errorSpan.textContent = '';
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===================================
    // 16. AOS ANIMATION
    // ===================================
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100
            });
            console.log('✓ AOS initialized');
        } else {
            console.warn('⚠️ AOS library not found');
        }
    }

    // ===================================
    // 17. PRELOADER
    // ===================================
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    preloader.style.visibility = 'hidden';
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }, 1000);
            });
            console.log('✓ Preloader initialized');
        }
    }

    // ===================================
    // 18. TAGLINE TYPEWRITER
    // ===================================
    function initTagline() {
        const taglines = [
            "Unity, Progress, and Prosperity",
            "Building a Brighter Future Together",
            "Where Heritage Meets Development",
            "Empowering Communities, Transforming Lives",
            "Your Gateway to Unity State",
            "Serving with Integrity and Excellence"
        ];

        let taglineIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const taglineElement = document.querySelector('.tagline-text');
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const pauseTime = 2000;

        if (!taglineElement) return;

        function typeTagline() {
            const currentTagline = taglines[taglineIndex];

            if (isDeleting) {
                taglineElement.textContent = currentTagline.substring(0, charIndex - 1);
                charIndex--;
            } else {
                taglineElement.textContent = currentTagline.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? deletingSpeed : typingSpeed;

            if (!isDeleting && charIndex === currentTagline.length) {
                speed = pauseTime;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                speed = 500;
                isDeleting = false;
                taglineIndex = (taglineIndex + 1) % taglines.length;
            }

            setTimeout(typeTagline, speed);
        }

        setTimeout(typeTagline, 1000);
        console.log('✓ Tagline initialized');
    }

    // ===================================
    // 19. HEADER SCROLL
    // ===================================
    function initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        let lastScrollTop = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, { passive: true });
        console.log('✓ Header scroll behavior initialized');
    }

    // ===================================
    // EXPOSE API
    // ===================================
    window.SiteFeatures = {
        showToast,
        switchLanguage,
        state,
        version: '2.0.1'
    };

    console.log('%c✅ Features v2.0.1 loaded', 'color: #27ae60; font-weight: bold;');

})();