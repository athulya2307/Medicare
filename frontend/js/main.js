class MedicareApp {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Navigation toggle
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // Auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');

        if (loginBtn) loginBtn.addEventListener('click', () => this.showLoginModal());
        if (signupBtn) signupBtn.addEventListener('click', () => this.showSignupModal());
        if (getStartedBtn) getStartedBtn.addEventListener('click', () => this.redirectToSignup());

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.closeAuthModal();
            }
        });
    }

    checkAuthStatus() {
        const token = localStorage.getItem('medicare_token');
        const userRole = localStorage.getItem('medicare_role');
        
        if (token && userRole) {
            // User is authenticated - redirect to dashboard
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                window.location.href = 'dashboard.html';
            }
        }
    }

    showLoginModal() {
        const modal = document.getElementById('authModal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = this.getLoginModalHTML();
        modal.classList.add('active');
        
        // Load login form handler
        this.loadLoginFormHandler();
    }

    showSignupModal() {
        const modal = document.getElementById('authModal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = this.getSignupModalHTML();
        modal.classList.add('active');
        
        // Load signup form handler
        this.loadSignupFormHandler();
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.remove('active');
    }

    getLoginModalHTML() {
        return `
            <div class="modal-header">
                <h3>Sign In</h3>
                <button class="modal-close" id="closeModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="modalLoginForm" class="auth-form">
                <div class="form-group">
                    <label for="modalEmail">Email</label>
                    <div class="input-wrapper">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="modalEmail" name="email" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="modalPassword">Password</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="modalPassword" name="password" required>
                    </div>
                </div>
                <button type="submit" class="btn-primary full-width">
                    <span class="btn-text">Sign In</span>
                    <div class="btn-loader"></div>
                </button>
            </form>
            <div class="auth-footer">
                <p>New to Medicare? <a href="#" id="modalToSignup">Create account</a></p>
            </div>
        `;
    }

    getSignupModalHTML() {
        return `
            <div class="modal-header">
                <h3>Create Account</h3>
                <button class="modal-close" id="closeModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="modalSignupForm" class="auth-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name</label>
                        <input type="text" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label>Last Name</label>
                        <input type="text" name="lastName" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="modalSignupEmail">Email</label>
                    <div class="input-wrapper">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="modalSignupEmail" name="email" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock"></i>
                        <input type="password" name="password" required minlength="8">
                    </div>
                </div>
                <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="terms" required>
                        <span class="checkmark"></span>
                        I agree to Terms & Privacy Policy
                    </label>
                </div>
                <button type="submit" class="btn-primary full-width">
                    <span class="btn-text">Create Account</span>
                    <div class="btn-loader"></div>
                </button>
            </form>
        `;
    }

    loadLoginFormHandler() {
        const form = document.getElementById('modalLoginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e.target);
        });

        // Modal close buttons
        document.querySelectorAll('#closeModal, #modalToSignup').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.target.id === 'modalToSignup') {
                    this.showSignupModal();
                } else {
                    this.closeAuthModal();
                }
            });
        });
    }

    loadSignupFormHandler() {
        const form = document.getElementById('modalSignupForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSignup(e.target);
        });

        document.querySelectorAll('#closeModal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAuthModal());
        });
    }

    
    async handleLogin(form) {
    const btn = form.querySelector('button');
    const btnText = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    
    btn.classList.add('loading');
    btnText.textContent = 'Signing in...';
    loader.style.display = 'block';

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // ✅ REAL BACKEND API CALL
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            })
        });
        
        const apiData = await response.json();
        
        if (!response.ok) {
            throw new Error(apiData.error || 'Login failed');
        }
        
        // ✅ SAVE REAL TOKEN & USER
        localStorage.setItem('medicare_token', apiData.token);
        localStorage.setItem('medicare_role', apiData.user.role || 'patient');
        localStorage.setItem('medicare_user', JSON.stringify(apiData.user));
        
        this.closeAuthModal();
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Login failed:', error);
        this.showError(form, error.message || 'Invalid credentials');
    } finally {
        btn.classList.remove('loading');
        btnText.textContent = 'Sign In';
        loader.style.display = 'none';
    }
}


    async handleSignup(form) {
        const btn = form.querySelector('button');
        const btnText = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.btn-loader');
        
        btn.classList.add('loading');
        btnText.textContent = 'Creating account...';
        loader.style.display = 'block';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            if (data.password !== data.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            // Simulate API call
            await this.simulateApiCall();
            
            // Store token
            localStorage.setItem('medicare_token', 'mock-jwt-token');
            localStorage.setItem('medicare_role', 'patient');
            
            this.closeAuthModal();
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Signup failed:', error);
            this.showError(form, error.message || 'Signup failed. Please try again.');
        } finally {
            btn.classList.remove('loading');
            btnText.textContent = 'Create Account';
            loader.style.display = 'none';
        }
    }

    async simulateApiCall(delay = 1500) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    showError(form, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message global-error';
        errorDiv.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 12px;
            border-left: 4px solid #f56565;
            margin-bottom: 1rem;
        `;
        errorDiv.textContent = message;
        
        form.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    redirectToSignup() {
        window.location.href = 'signup.html';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MedicareApp();
});
