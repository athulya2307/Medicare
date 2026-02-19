class DashboardHandler {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('medicare_user') || '{}');
        this.hasMetrics = localStorage.getItem('medicare_has_metrics') === 'true';
        this.init();
    }

    async init() {
        this.showLoading();
        
        // Simulate checking if user has metrics (backend API call)
        await this.checkUserMetrics();
        
        this.hideLoading();
        this.bindEvents();
        this.updateUI();
        
        if (this.hasMetrics) {
            await this.loadMetrics();
            this.showDashboard();
        } else {
            this.showOnboarding();
        }
    }

    showLoading() {
        document.getElementById('loadingScreen').style.display = 'flex';
        document.getElementById('dashboardNav').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingScreen').style.display = 'none';
    }

    async checkUserMetrics() {
    try {
        const token = localStorage.getItem('medicare_token');
        const response = await fetch('http://localhost:5000/api/health-metrics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        this.hasMetrics = result.data && result.data.length > 0;
        localStorage.setItem('medicare_has_metrics', this.hasMetrics);
    } catch (error) {
        console.error('Check metrics failed:', error);
        this.hasMetrics = false;
    }
}


    bindEvents() {
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        // Onboarding form
        const onboardingForm = document.getElementById('onboardingForm');
        if (onboardingForm) {
            onboardingForm.addEventListener('submit', (e) => this.handleOnboardingSubmit(e));
        }

        // Update metrics modal
        const updateBtn = document.getElementById('updateMetricsBtn');
        const modal = document.getElementById('metricsModal');
        const closeModal = document.getElementById('closeMetricsModal');
        
        if (updateBtn) updateBtn.addEventListener('click', () => modal.classList.add('active'));
        if (closeModal) closeModal.addEventListener('click', () => modal.classList.remove('active'));
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }

        // Regular metrics form
        const metricsForm = document.getElementById('metricsForm');
        if (metricsForm) {
            metricsForm.addEventListener('submit', (e) => this.handleMetricsSubmit(e));
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    showOnboarding() {
        document.getElementById('onboardingSection').style.display = 'block';
        document.getElementById('metricsSection').style.display = 'none';
        document.getElementById('dashboardNav').style.display = 'flex';
        document.getElementById('dashboardContainer').style.display = 'flex';
    }

    async showDashboard() {
        document.getElementById('onboardingSection').style.display = 'none';
        document.getElementById('metricsSection').style.display = 'block';
        document.getElementById('dashboardNav').style.display = 'flex';
        document.getElementById('dashboardContainer').style.display = 'flex';
        
        await this.loadMetrics();
        this.updateLastUpdated();
    }

updateUI() {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        if (this.user.name) {
            userNameEl.textContent = `Welcome back, ${this.user.name}!`;
        } else {
            userNameEl.textContent = 'Welcome back!';
        }
    }
}


    async loadMetrics() {
        const grid = document.getElementById('metricsGrid');
        if (!grid) return;

        // Mock API: GET /api/health-metrics/latest?user_id=123
        const mockMetrics = await this.fetchUserMetrics();
        
        grid.innerHTML = mockMetrics.map(metric => this.createMetricCard(metric)).join('');
    }

    async fetchUserMetrics() {
    try {
        const token = localStorage.getItem('medicare_token') || localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/health-metrics', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        console.log('✅ Real API Response:', result);
        
        if (!result.success || !result.data || result.data.length === 0) {
            return [];
        }

        // ✅ MAP ALL health metrics to card format
        const latestMetrics = result.data[0]; // Get latest entry
        
        return [
            {
                name: 'Weight',
                value: latestMetrics.weight ? `${latestMetrics.weight}` : 'N/A',
                unit: 'kg',
                trend: '-0.3',
                trendType: 'positive',
                risk: 'low',
                riskColor: '#48bb78',
                icon: 'fa-weight-hanging',
                recorded_at: latestMetrics.recorded_at
            },
            {
                name: 'BMI', 
                value: latestMetrics.bmi ? `${latestMetrics.bmi}` : 'N/A',
                unit: 'Normal',
                risk: 'low',
                riskColor: '#4299e1',
                icon: 'fa-chart-line',
                recorded_at: latestMetrics.recorded_at
            },
            {
                name: 'Blood Pressure',
                value: latestMetrics.bp_systolic && latestMetrics.bp_diastolic 
                    ? `${latestMetrics.bp_systolic}/${latestMetrics.bp_diastolic}` 
                    : 'N/A',
                unit: 'mmHg',
                risk: 'low',
                riskColor: '#48bb78',
                icon: 'fa-heartbeat',
                recorded_at: latestMetrics.recorded_at
            },
            {
                name: 'Blood Sugar',
                value: latestMetrics.blood_sugar ? `${latestMetrics.blood_sugar}` : 'N/A',
                unit: 'mg/dL',
                risk: 'low',
                riskColor: '#9f7aea',
                icon: 'fa-tint',
                recorded_at: latestMetrics.recorded_at
            },
            {
                name: 'Cholesterol',
                value: latestMetrics.cholesterol ? `${latestMetrics.cholesterol}` : 'N/A',
                unit: 'mg/dL',
                risk: 'medium',
                riskColor: '#ed8936',
                icon: 'fa-vial',
                recorded_at: latestMetrics.recorded_at
            }
        ];
    } catch (error) {
        console.error('❌ API Error:', error);
        return [];
    }
}



    createMetricCard(metric) {
        const trendHtml = metric.trend ? 
            `<div class="metric-trend trend-${metric.trendType}">
                <i class="fas ${metric.trendType === 'positive' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                ${metric.trend} ${metric.unit}
            </div>` : 
            `<div class="metric-status" style="color: ${metric.riskColor}; background: ${metric.riskColor}20; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                ${metric.unit}
            </div>`;

        return `
            <div class="metric-card risk-${metric.risk}" style="--risk-color: ${metric.riskColor}">
                <div class="metric-header">
                    <i class="fas ${metric.icon}" style="color: ${metric.riskColor}"></i>
                    <span>${metric.name}</span>
                </div>
                <div class="metric-value">${metric.value}</div>
                ${trendHtml}
            </div>
        `;
    }

    async handleOnboardingSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const metrics = Object.fromEntries(formData);
        
        // Calculate BMI server-side ready
        const heightM = metrics.height / 100;
        metrics.bmi = heightM > 0 ? (metrics.weight / (heightM * heightM)).toFixed(1) : 0;
        metrics.is_first_entry = true;

        try {
            await this.saveMetrics(metrics);
            
            // Mark user as having metrics
            this.hasMetrics = true;
            localStorage.setItem('medicare_has_metrics', 'true');
            
            this.showSuccess('🎉 Welcome to Medicare! Your metrics have been saved.');
            setTimeout(() => this.showDashboard(), 1500);
            
        } catch (error) {
            console.error('Onboarding failed:', error);
            this.showError('Failed to save metrics. Please try again.');
        }
    }

    async handleMetricsSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const metrics = Object.fromEntries(formData);
        
        // Calculate BMI
        const heightM = metrics.height / 100;
        metrics.bmi = heightM > 0 ? (metrics.weight / (heightM * heightM)).toFixed(1) : 0;

        try {
            await this.saveMetrics(metrics);
            document.getElementById('metricsModal').classList.remove('active');
            this.showSuccess('Metrics updated successfully!');
            await this.loadMetrics();
            this.updateLastUpdated();
            
        } catch (error) {
            this.showError('Failed to update metrics.');
        }
    }

async saveMetrics(metrics) {
    const token = localStorage.getItem('medicare_token') || localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/health-metrics', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            weight: parseFloat(metrics.weight) || 0,
            height: parseFloat(metrics.height) || 0,
            blood_sugar: parseFloat(metrics.blood_sugar) || 0,
            cholesterol: parseFloat(metrics.cholesterol) || 0,
            bp_systolic: parseInt(metrics.bp_systolic) || 0,
            bp_diastolic: parseInt(metrics.bp_diastolic) || 0,
            bmi: parseFloat(metrics.bmi) || 0
        })
    });
    
    const result = await response.json();
    console.log('✅ Save Response:', result);
    
    if (!response.ok) {
        throw new Error(result.error || 'Save failed');
    }
    
    // ✅ REFRESH DATA IMMEDIATELY after save
    await this.loadMetrics();
}

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = 
            `Last updated: ${now.toLocaleString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })}`;
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            min-width: 320px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(400px);
            transition: all 0.3s ease;
            ${type === 'success' ? 
                'background: linear-gradient(135deg, #48bb78, #38a169);' : 
                'background: linear-gradient(135deg, #f56565, #e53e3e);'
            }
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
        
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardHandler();
});
