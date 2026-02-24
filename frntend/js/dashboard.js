class MedicareDashboard {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('medicare_user') || '{}');
        this.init();
    }

    init() {
        
        const roleBadge = document.getElementById('userRoleBadge');
        if (roleBadge && this.user.role) {
            const roles = {
                patient: '👤 Patient',
                doctor: '👨‍⚕️ Doctor', 
                admin: '👨‍💼 Admin'
            };
            roleBadge.textContent = roles[this.user.role];
            roleBadge.style.display = 'inline';
            roleBadge.className = `role-badge ${this.user.role}`;
        }

        if (!this.user.name) {
            window.location.href = 'login.html';
            return;
        }
        this.updateUserInfo();
        this.bindEvents();
        this.liveBMI();
        this.animateOnScroll();
    }

    updateUserInfo() {
        document.getElementById('userName').textContent = this.user.name;
        document.getElementById('welcomeMsg').innerHTML = 
            `Welcome back, ${this.user.name}! <span class="gradient-text">👋</span>`;
        
        document.querySelector('.profile-img').src = 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.name)}&background=4f46e5&color=fff&size=48`;
    }

    bindEvents() {
        const form = document.querySelector('.metrics-form');
        form.addEventListener('submit', (e) => this.handleSave(e));
        
        // Live BMI
        document.querySelectorAll('.input-metric').forEach(input => {
            input.addEventListener('input', () => this.liveBMI());
        });

        // Clear button
        document.querySelector('.btn-clear')?.addEventListener('click', () => {
            document.querySelectorAll('.input-metric').forEach(input => input.value = '');
            this.liveBMI();
        });

        // Logout
        document.querySelector('.btn-logout')?.addEventListener('click', () => {
            localStorage.removeItem('medicare_user');
            window.location.href = 'login.html';
        });

        // ✅ NEW: Quick Actions Sidebar
        document.querySelectorAll('.action-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = item.dataset.action;
                const messages = {
                    appointment: 'Opening booking system...',
                    hospital: 'Loading Google Maps...',
                    report: 'Opening AI report analyzer...',
                    reminder: 'Creating new reminder...'
                };
                alert(messages[action] || 'Feature coming soon! 🎉');
            });
        });
    }

    liveBMI() {
        const weightInput = document.querySelector('.input-metric:nth-of-type(1)');
        const heightInput = document.querySelector('.input-metric:nth-of-type(2)');
        
        const weight = parseFloat(weightInput?.value) || 65.5;
        const height = (parseFloat(heightInput?.value) || 165) / 100;
        
        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmiValue').textContent = bmi;
        
        const status = this.getBMIStatus(bmi);
        document.querySelector('.bmi-label').textContent = status;
    }

    getBMIStatus(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal BMI';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    handleSave(e) {
        e.preventDefault();
        const button = e.target.querySelector('.btn-primary');
        const original = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Saved Successfully!';
            button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                button.innerHTML = original;
                button.style.background = '';
                button.disabled = false;
            }, 2000);
        }, 1500);
    }

    animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });
        
        document.querySelectorAll('.stat-card, .metrics-card, .quick-actions-sidebar').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MedicareDashboard();
});