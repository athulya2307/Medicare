class DoctorDashboard {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('medicare_user') || '{}');
    this.patients = this.getMockPatients();
    this.init();
  }

  init() {
    if (!this.user.name) window.location.href = 'login.html';
    this.updateUserInfo();
    this.bindEvents();
    this.animateOnScroll();
  }

  getMockPatients() {
    return [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 35,
        metrics: {
          weight: 75.5,
          height: 175,
          bmi: 24.6,
          bloodSugar: 95,
          bloodPressure: '120/80'
        },
        reports: [
          { title: 'Blood Test Report', date: '2026-02-15', status: 'normal', file: 'blood_test.pdf' },
          { title: 'ECG Report', date: '2026-02-10', status: 'normal', file: 'ecg_report.pdf' }
        ]
      },
      {
        id: 2,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        age: 28,
        metrics: { weight: 62, height: 165, bmi: 22.8, bloodSugar: 88, bloodPressure: '115/75' },
        reports: []
      }
    ];
  }

  updateUserInfo() {
    document.getElementById('userName').textContent = `Dr. ${this.user.name}`;
    document.getElementById('welcomeMsg').innerHTML = 
      `Good Morning, Dr. ${this.user.name}! <span class="gradient-text">🔍</span>`;
  }

  bindEvents() {
    document.querySelector('.btn-logout').addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });

    document.querySelectorAll('.action-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.action-item.active')?.classList.remove('active');
        item.classList.add('active');
      });
    });

    // Enter key search
    document.getElementById('patientSearch').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchPatients();
    });
  }

  searchPatients() {
    const query = document.getElementById('patientSearch').value.toLowerCase().trim();
    if (!query) return;

    const patient = this.patients.find(p => 
      p.name.toLowerCase().includes(query) || 
      p.email.toLowerCase().includes(query)
    );

    const resultsSection = document.getElementById('patientResults');
    const content = document.getElementById('patientContent');

    if (patient) {
      content.innerHTML = this.renderPatientCard(patient);
      resultsSection.style.display = 'block';
    } else {
      content.innerHTML = `
        <div class="no-results">
          <i class="fas fa-user-slash" style="font-size: 4rem; color: #d1d5db;"></i>
          <h3>No patient found</h3>
          <p>No patient matches "${query}". Try a different name or email.</p>
        </div>
      `;
      resultsSection.style.display = 'block';
    }

    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  clearSearch() {
    document.getElementById('patientSearch').value = '';
    document.getElementById('patientResults').style.display = 'none';
  }

  renderPatientCard(patient) {
    const metricsHtml = `
      <div class="metrics-grid-doctor">
        <div class="metric-item">
          <span class="metric-value">${patient.metrics.weight}kg</span>
          <span class="metric-label">Weight</span>
        </div>
        <div class="metric-item">
          <span class="metric-value">${patient.metrics.bmi}</span>
          <span class="metric-label">BMI</span>
        </div>
        <div class="metric-item">
          <span class="metric-value">${patient.metrics.bloodSugar}</span>
          <span class="metric-label">Blood Sugar</span>
        </div>
        <div class="metric-item">
          <span class="metric-value">${patient.metrics.bloodPressure}</span>
          <span class="metric-label">Blood Pressure</span>
        </div>
      </div>
    `;

    const reportsHtml = patient.reports.length ? `
      <div style="margin-top: 2rem;">
        <h3 style="margin-bottom: 1.5rem; color: var(--dark);">
          <i class="fas fa-file-medical-alt"></i> Medical Reports
        </h3>
        <div class="reports-list">
          ${patient.reports.map(report => `
            <div class="report-card">
              <div>
                <h4>${report.title}</h4>
                <p><i class="fas fa-calendar"></i> ${report.date} • 
                   <span style="color: ${report.status === 'normal' ? '#10b981' : '#f59e0b'}">
                     ${report.status.toUpperCase()}
                   </span>
                </p>
              </div>
              <button class="btn-primary" onclick="window.open('https://example.com/${report.file}')">
                <i class="fas fa-download"></i> View
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : `
      <div class="no-results" style="margin-top: 2rem;">
        <i class="fas fa-file-medical-alt" style="font-size: 3rem; color: #d1d5db;"></i>
        <h3>No medical reports</h3>
        <p>This patient has not uploaded any medical reports yet.</p>
      </div>
    `;

    return `
      <div class="patient-card">
        <div class="patient-header">
          <div>
            <h2 style="margin: 0; font-size: 2rem;">${patient.name}</h2>
            <p style="margin: 0.5rem 0 0 0; color: #6b7280;">${patient.email} • Age: ${patient.age}</p>
          </div>
          <div style="text-align: right;">
            <span style="background: var(--primary); color: white; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: 700;">
              Patient ID: ${patient.id}
            </span>
          </div>
        </div>
        
        ${metricsHtml}
        ${reportsHtml}
      </div>
    `;
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

const doctorDashboard = new DoctorDashboard();
