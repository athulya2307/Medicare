class AdminDashboard {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('medicare_user') || '{}');
    this.doctors = this.getMockDoctors();
    this.init();
  }

  getMockDoctors() {
    return [
      { id: 1, name: 'Dr. John Smith', email: 'john@hospital.com', phone: '+1234567890', specialty: 'Cardiology', hospital: 'City Hospital', status: 'active' },
      { id: 2, name: 'Dr. Sarah Johnson', email: 'sarah@clinic.com', phone: '+1987654321', specialty: 'Neurology', hospital: 'Neuro Center', status: 'pending' },
      { id: 3, name: 'Dr. Mike Davis', email: 'mike@health.com', phone: '+1122334455', specialty: 'Orthopedics', hospital: 'Bone Clinic', status: 'active' }
    ];
  }

  init() {
    if (!this.user.name) window.location.href = 'login.html';
    this.updateUserInfo();
    this.bindEvents();
    this.renderDoctorsList();
    this.animateOnScroll();
  }

  updateUserInfo() {
    document.getElementById('userName').textContent = this.user.name;
    document.getElementById('welcomeMsg').innerHTML = 
      `Welcome back, ${this.user.name}! <span class="gradient-text">⚙️</span>`;
  }

  bindEvents() {
    document.querySelector('.btn-logout').addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelector('.admin-tab.active')?.classList.remove('active');
        document.querySelector('.admin-form.active')?.classList.remove('active');
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
      });
    });

    // Add doctor form
    document.getElementById('addDoctorFormElement').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addDoctor();
    });

    // Sidebar actions
    document.querySelectorAll('.action-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.action-item.active')?.classList.remove('active');
        item.classList.add('active');
        if (item.dataset.action === 'doctors') {
          document.querySelector('[data-tab="manage-doctors"]').click();
        }
      });
    });
  }

  addDoctor() {
    const doctor = {
      id: Date.now(),
      name: document.getElementById('doctorName').value,
      email: document.getElementById('doctorEmail').value,
      phone: document.getElementById('doctorPhone').value,
      specialty: document.getElementById('doctorSpecialty').value,
      hospital: document.getElementById('doctorHospital').value,
      status: 'pending'
    };

    this.doctors.unshift(doctor);
    this.renderDoctorsList();
    
    // Reset form
    document.getElementById('addDoctorFormElement').reset();
    
    // Success message
    const btn = document.querySelector('#addDoctorFormElement .btn-primary');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Doctor Added!';
    btn.style.background = 'var(--secondary)';
    
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
    }, 2000);
  }

  renderDoctorsList() {
    const container = document.getElementById('doctorsList');
    container.innerHTML = this.doctors.map(doctor => `
      <div class="doctor-card">
        <div class="doctor-info">
          <h4>${doctor.name}</h4>
          <p><i class="fas fa-envelope"></i> ${doctor.email}</p>
          <p><i class="fas fa-stethoscope"></i> ${doctor.specialty} • ${doctor.hospital}</p>
          <span class="status ${doctor.status === 'active' ? 'success' : 'warning'}">
            ${doctor.status === 'active' ? 'Active' : 'Pending Approval'}
          </span>
        </div>
        <div class="doctor-actions">
          <button class="btn-edit" onclick="adminDashboard.editDoctor(${doctor.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          ${doctor.status === 'pending' ? 
            `<button class="btn-approve" onclick="adminDashboard.approveDoctor(${doctor.id})">
              <i class="fas fa-check"></i> Approve
            </button>` : ''
          }
          <button class="btn-delete" onclick="adminDashboard.deleteDoctor(${doctor.id})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  editDoctor(id) {
    const doctor = this.doctors.find(d => d.id === id);
    if (doctor) {
      doctor.name = prompt('Edit name:', doctor.name) || doctor.name;
      doctor.email = prompt('Edit email:', doctor.email) || doctor.email;
      this.renderDoctorsList();
    }
  }

  approveDoctor(id) {
    const doctor = this.doctors.find(d => d.id === id);
    if (doctor) {
      doctor.status = 'active';
      this.renderDoctorsList();
    }
  }

  deleteDoctor(id) {
    if (confirm('Delete this doctor?')) {
      this.doctors = this.doctors.filter(d => d.id !== id);
      this.renderDoctorsList();
    }
  }

  refreshDoctors() {
    this.renderDoctorsList();
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

const adminDashboard = new AdminDashboard();
