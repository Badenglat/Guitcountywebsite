/**
 * GUIT COUNTY - LOGIN HANDLER
 * Version: 2.0.0
 * Handles authentication for admin panel access
 */

(function () {
  'use strict';

  console.log('%c🔐 Login Handler initialized', 'color: #0061f2; font-weight: bold;');

  // ===================================
  // CONFIGURATION
  // ===================================
  const CONFIG = {
    ADMIN_CREDENTIALS: {
      username: 'admin',
      password: 'password' // In production, use proper authentication
    },
    SESSION_KEY: 'guitAdminSession',
    SESSION_DURATION: 3600000, // 1 hour in milliseconds
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 300000, // 5 minutes in milliseconds
    LOCKOUT_KEY: 'guitLoginLockout'
  };

  // ===================================
  // STATE
  // ===================================
  let loginAttempts = 0;

  // ===================================
  // INITIALIZE
  // ===================================
  function init() {
    // Check if already logged in
    if (isLoggedIn()) {
      console.log('✅ Already logged in, redirecting...');
      redirectToAdmin();
      return;
    }

    // Check if locked out
    if (isLockedOut()) {
      handleLockout();
      return;
    }

    // Setup form
    setupLoginForm();

    // Setup password visibility toggle
    setupPasswordToggle();

    // Check for stored login attempts
    const storedAttempts = sessionStorage.getItem('loginAttempts');
    if (storedAttempts) {
      loginAttempts = parseInt(storedAttempts);
    }

    console.log('✅ Login form ready');
  }

  // ===================================
  // SETUP LOGIN FORM
  // ===================================
  function setupLoginForm() {
    const form = document.getElementById('login-form');
    const msg = document.getElementById('login-message');

    if (!form) {
      console.error('Login form not found');
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Check lockout status
      if (isLockedOut()) {
        handleLockout();
        return;
      }

      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      }

      // Get form data
      const formData = new FormData(form);
      const username = formData.get('username')?.trim();
      const password = formData.get('password');

      // Validate inputs
      if (!username || !password) {
        showMessage('Please enter both username and password', 'error');
        resetSubmitButton(submitBtn);
        return;
      }

      // Simulate network delay for better UX
      await delay(500);

      // Authenticate
      const isValid = authenticate(username, password);

      if (isValid) {
        // Success
        loginAttempts = 0;
        sessionStorage.removeItem('loginAttempts');

        showMessage('Login successful! Redirecting...', 'success');

        // Create session
        createSession(username);

        // Redirect after short delay
        setTimeout(() => {
          redirectToAdmin();
        }, 1000);
      } else {
        // Failed attempt
        loginAttempts++;
        sessionStorage.setItem('loginAttempts', loginAttempts.toString());

        const remainingAttempts = CONFIG.MAX_LOGIN_ATTEMPTS - loginAttempts;

        if (remainingAttempts <= 0) {
          // Lock out user
          lockoutUser();
          handleLockout();
        } else {
          // Show error with remaining attempts
          showMessage(
            `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
            'error'
          );

          // Shake animation
          form.classList.add('shake');
          setTimeout(() => form.classList.remove('shake'), 500);
        }

        resetSubmitButton(submitBtn);
      }
    });
  }

  // ===================================
  // SETUP PASSWORD VISIBILITY TOGGLE
  // ===================================
  function setupPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');

    if (!passwordInput || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
      }
    });
  }

  // ===================================
  // AUTHENTICATE USER
  // ===================================
  function authenticate(username, password) {
    // In production, this would be an API call to a backend server
    // For demo purposes, using hardcoded credentials

    return (
      username === CONFIG.ADMIN_CREDENTIALS.username &&
      password === CONFIG.ADMIN_CREDENTIALS.password
    );
  }

  // ===================================
  // CREATE SESSION
  // ===================================
  function createSession(username) {
    const session = {
      username: username,
      loginTime: Date.now(),
      expiresAt: Date.now() + CONFIG.SESSION_DURATION
    };

    try {
      localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
      console.log('✅ Session created');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  // ===================================
  // CHECK IF LOGGED IN
  // ===================================
  function isLoggedIn() {
    try {
      const sessionData = localStorage.getItem(CONFIG.SESSION_KEY);
      if (!sessionData) return false;

      const session = JSON.parse(sessionData);

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }

  // ===================================
  // LOCKOUT FUNCTIONS
  // ===================================
  function lockoutUser() {
    const lockoutData = {
      lockedAt: Date.now(),
      expiresAt: Date.now() + CONFIG.LOCKOUT_DURATION
    };

    try {
      localStorage.setItem(CONFIG.LOCKOUT_KEY, JSON.stringify(lockoutData));
    } catch (error) {
      console.error('Failed to set lockout:', error);
    }
  }

  function isLockedOut() {
    try {
      const lockoutData = localStorage.getItem(CONFIG.LOCKOUT_KEY);
      if (!lockoutData) return false;

      const lockout = JSON.parse(lockoutData);

      if (Date.now() > lockout.expiresAt) {
        // Lockout expired
        localStorage.removeItem(CONFIG.LOCKOUT_KEY);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Lockout check error:', error);
      return false;
    }
  }

  function handleLockout() {
    const lockoutData = JSON.parse(localStorage.getItem(CONFIG.LOCKOUT_KEY));
    const remainingTime = Math.ceil((lockoutData.expiresAt - Date.now()) / 1000 / 60);

    showMessage(
      `Too many failed attempts. Please try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`,
      'error',
      true
    );

    // Disable form
    const form = document.getElementById('login-form');
    if (form) {
      const inputs = form.querySelectorAll('input, button');
      inputs.forEach(input => input.disabled = true);
    }

    // Auto-refresh when lockout expires
    setTimeout(() => {
      location.reload();
    }, lockoutData.expiresAt - Date.now());
  }

  // ===================================
  // LOGOUT
  // ===================================
  function logout() {
    try {
      localStorage.removeItem(CONFIG.SESSION_KEY);
      console.log('✅ Logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // ===================================
  // REDIRECT TO ADMIN
  // ===================================
  function redirectToAdmin() {
    window.location.href = 'admin.html';
  }

  // ===================================
  // UI HELPER FUNCTIONS
  // ===================================
  function showMessage(message, type = 'info', persistent = false) {
    const msgElement = document.getElementById('login-message');

    if (!msgElement) {
      console.warn('Message element not found');
      return;
    }

    msgElement.textContent = message;
    msgElement.className = `login-message ${type}`;
    msgElement.style.display = 'block';

    // Auto-hide after 5 seconds unless persistent
    if (!persistent) {
      setTimeout(() => {
        msgElement.style.display = 'none';
      }, 5000);
    }
  }

  function resetSubmitButton(button) {
    if (!button) return;

    button.disabled = false;
    button.innerHTML = 'Login <i class="fas fa-sign-in-alt"></i>';
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===================================
  // PUBLIC API
  // ===================================
  window.LoginHandler = {
    isLoggedIn: isLoggedIn,
    logout: logout,
    getSession: () => {
      try {
        const sessionData = localStorage.getItem(CONFIG.SESSION_KEY);
        return sessionData ? JSON.parse(sessionData) : null;
      } catch (error) {
        return null;
      }
    }
  };

  // ===================================
  // AUTO-INITIALIZE
  // ===================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===================================
  // ADD CSS ANIMATIONS
  // ===================================
  const style = document.createElement('style');
  style.textContent = `
        .login-message {
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            font-weight: 500;
            display: none;
            animation: slideDown 0.3s ease;
        }

        .login-message.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }

        .login-message.error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
        }

        .login-message.info {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #3b82f6;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .shake {
            animation: shake 0.5s;
        }

        #toggle-password {
            cursor: pointer;
            transition: color 0.3s ease;
        }

        #toggle-password:hover {
            color: var(--primary-color, #0061f2);
        }

        button[type="submit"]:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `;
  document.head.appendChild(style);

})();