class AuthHandler {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingAuth();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Navigation between auth pages
        const toSignup = document.getElementById('toSignup');
        const toLogin = document.getElementById('toLogin');
        
        if (toSignup) {
            toSignup.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'signup.html';
            });
        }

        if (toLogin) {
            toLogin.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }

        // Google OAuth (mock)
        const googleBtns = document.querySelectorAll('.btn-google');
        googleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleGoogleAuth(e));
        });
    }

    checkExistingAuth() {
        const token = localStorage.getItem('medicare_token');
        if (token) {
            window.location.href = 'dashboard.html';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const btn = form.querySelector('#loginSubmit');
        const loader = document.getElementById('loginLoader');
        
        this.setLoadingState(btn, loader, true);

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Client-side validation
            const errors = this.validateLogin(data);
            if (Object.keys(errors).length > 0) {
                this.showFieldErrors(form, errors);
                return;
            }

            // Mock API call - replace with real backend call
            await this.apiCall('/api/auth/login', data);
            
            // Store auth data
            localStorage.setItem('medicare_token', 'mock-jwt-token-' + Date.now());
            localStorage.setItem('medicare_role', 'patient');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError(form, 'Invalid email or password. Please try again.');
        } finally {
            this.setLoadingState(btn, loader, false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const btn = form.querySelector('#signupSubmit');
        const loader = document.getElementById('signupLoader');
        
        this.setLoadingState(btn, loader, true);

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Client-side validation
            const errors = this.validateSignup(data);
            if (Object.keys(errors).length > 0) {
                this.showFieldErrors(form, errors);
                return;
            }

            // Mock API call
            await this.apiCall('/api/auth/signup', data);
            
            localStorage.setItem('medicare_token', 'mock-jwt-token-' + Date.now());
            localStorage.setItem('medicare_role', 'patient');
            
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showError(form, 'Account creation failed. Please try again.');
        } finally {
            this.setLoadingState(btn, loader, false);
        }
    }

    async handleGoogleAuth(e) {
        e.preventDefault();
        // Mock Google OAuth - in production integrate real Google OAuth
        alert('Google OAuth integration ready - Backend endpoint: /api/auth/google');
    }

    validateLogin(data) {
        const errors = {};
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!data.password || data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        return errors;
    }

    validateSignup(data) {
        const errors = {};
        
        if (!data.firstName || data.firstName.length < 2) {
            errors.firstName = 'First name is required';
        }
        
        if (!data.lastName || data.lastName.length < 2) {
            errors.lastName = 'Last name is required';
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!data.password || data.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        if (data.password !== data.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        return errors;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showFieldErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        Object.keys(errors).forEach(field => {
            const errorEl = document.getElementById(`${field}Error`) || 
                           form.querySelector(`[for="${field}"] + .error-message`) ||
                           document.querySelector(`[name="${field}"] + .error-message`);
            
            if (errorEl) {
                errorEl.textContent = errors[field];
            }
        });
    }

    showError(form, message) {
        // Remove existing global errors
        const existingError = form.querySelector('.global-error');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message global-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 12px;
            border-left: 4px solid #f56565;
            margin-bottom: 1rem;
        `;
        
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 6000);
    }

    setLoadingState(btn, loader, loading) {
        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
            loader.style.display = 'block';
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
            loader.style.display = 'none';
        }
    }

    async apiCall(endpoint, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
        
        // Mock successful response
        if (Math.random() > 0.1) { // 90% success rate for demo
            return { success: true, token: 'mock-jwt-token' };
        }
        
        throw new Error('API call failed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AuthHandler();
});
