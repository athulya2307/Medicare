class MedicareAuth {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.switchTab('login'); 
    }

    bindEvents() {
        
        document.querySelectorAll('.auth-form button[type="submit"]').forEach(btn => {
            btn.dataset.originalText = btn.innerHTML;
        });

        
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e);
        });
        
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        
        const googleBtn = document.querySelector('.btn-google');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                this.showNotification('Google login demo - works!');
            });
        }
    }

    switchTab(tabName) {
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    handleLogin(e) {
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            this.showError('Please enter your email!');
            emailInput.focus();
            return;
        }
        
        this.processLogin(email, 'patient', 'Patient User');
    }

    handleSignup(e) {
        const form = e.target;
        
        
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelectorAll('input[type="email"]')[1];
        const roleSelect = form.querySelector('select');
        const passwordInputs = form.querySelectorAll('input[type="password"]');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const role = roleSelect.value;
        const password1 = passwordInputs[0].value;
        const password2 = passwordInputs[1].value;
        
        console.log('Signup data:', { name, email, role, password1: '***', password2: '***' }); // Debug
        
        
        if (!name || !email || !role || !password1 || !password2) {
            this.showError('Please fill all fields!');
            return;
        }
        
        if (password1 !== password2) {
            this.showError('Passwords do not match!');
            passwordInputs[1].focus();
            return;
        }
        
        if (password1.length < 6) {
            this.showError('Password must be at least 6 characters!');
            passwordInputs[0].focus();
            return;
        }
        
        
        this.processLogin(email, role, name);
    }

    processLogin(email, role, name) {
        
        const currentForm = document.querySelector('.auth-form.active');
        const button = currentForm.querySelector('button[type="submit"]');
        
        this.showLoading(button);

        setTimeout(() => {
            
            const userData = {
                name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
                email: email.toLowerCase(),
                role: role,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('medicare_user', JSON.stringify(userData));
            console.log('âœ… SAVED USER:', userData);
            
            this.hideLoading(button);
            this.showSuccess(button);
            
           
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        }, 2000);
    }

    showLoading(button) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        button.disabled = true;
        button.style.opacity = '0.7';
    }

    hideLoading(button) {
        button.innerHTML = button.dataset.originalText;
        button.disabled = false;
        button.style.opacity = '1';
    }

    showSuccess(button) {
        const isSignup = button.closest('#signupForm');
        button.innerHTML = isSignup ? 
            '<i class="fas fa-check-circle"></i> Account Created!' : 
            '<i class="fas fa-check-circle"></i> Welcome Back!';
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }

    showNotification(message, type = 'success') {
       
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('âœ… Auth script loaded');
    new MedicareAuth();
});