// CargaViva - UI Management

class UIManager {
  constructor() {
    this.currentView = 'landing';
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkAuthState();
  }

  bindEvents() {
    // Auth buttons
    document.getElementById('auth-btn').addEventListener('click', () => this.showAuthModal());
    document.getElementById('get-started-btn').addEventListener('click', () => this.showAuthModal());

    // Auth modal
    document.getElementById('close-auth-modal').addEventListener('click', () => this.hideAuthModal());
    document.getElementById('auth-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideAuthModal();
    });

    // Auth form
    document.getElementById('auth-form').addEventListener('submit', (e) => this.handleAuthSubmit(e));
    document.getElementById('toggle-auth-mode').addEventListener('click', () => this.toggleAuthMode());

    // Load modal
    document.getElementById('close-load-modal').addEventListener('click', () => this.hideLoadModal());
    document.getElementById('load-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hideLoadModal();
    });

    // Load buttons
    document.getElementById('create-load-btn').addEventListener('click', () => this.showLoadModal());
    document.getElementById('create-first-load-btn').addEventListener('click', () => this.showLoadModal());

    // Load form
    document.getElementById('load-form').addEventListener('submit', (e) => this.handleLoadSubmit(e));
    document.getElementById('cancel-load-btn').addEventListener('click', () => this.hideLoadModal());

    // File upload
    document.getElementById('fotos').addEventListener('change', (e) => this.handleFileSelect(e));

    // User menu
    document.getElementById('user-menu-btn').addEventListener('click', () => this.handleUserMenu());

    // Close modals on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAuthModal();
        this.hideLoadModal();
      }
    });
  }

  checkAuthState() {
    // Check if user is already authenticated
    const checkUser = () => {
      if (window.SupabaseManager && typeof window.SupabaseManager.getCurrentUser === 'function') {
        window.SupabaseManager.getCurrentUser().then(user => {
          if (user) {
            this.showDashboard();
            if (window.LoadsManager && typeof window.LoadsManager.loadUserLoads === 'function') {
              window.LoadsManager.loadUserLoads();
            }
          } else {
            this.showLanding();
          }
        }).catch(error => {
          console.error('Error checking auth state:', error);
          this.showLanding();
        });
      } else {
        // Retry after a short delay if SupabaseManager is not ready
        setTimeout(checkUser, 100);
      }
    };

    checkUser();
  }

  // View switching
  showLanding() {
    document.getElementById('landing-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    this.currentView = 'landing';
  }

  showDashboard() {
    document.getElementById('landing-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    this.currentView = 'dashboard';
  }


  // Modal management
  showAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Focus on email input
    setTimeout(() => {
      document.getElementById('auth-email').focus();
    }, 100);
  }

  hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';

    // Reset form
    document.getElementById('auth-form').reset();
    this.resetAuthMode();
  }

  showLoadModal(loadData = null) {
    const modal = document.getElementById('load-modal');
    const form = document.getElementById('load-form');
    const title = document.getElementById('load-modal-title');

    if (loadData) {
      title.textContent = 'Editar Carga';
      this.populateLoadForm(loadData);
    } else {
      title.textContent = 'Nueva Carga';
      form.reset();
      this.clearPhotoPreview();
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Focus on first input
    setTimeout(() => {
      document.getElementById('origen').focus();
    }, 100);
  }

  hideLoadModal() {
    const modal = document.getElementById('load-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';

    // Reset form and clear files
    document.getElementById('load-form').reset();
    this.clearPhotoPreview();
  }

  // Auth handling
  async handleAuthSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const isSignUp = document.getElementById('auth-name-group').style.display !== 'none';

    if (isSignUp) {
      const name = formData.get('name');
      const company = formData.get('company');

      if (window.SupabaseManager && typeof window.SupabaseManager.signUp === 'function') {
        await window.SupabaseManager.signUp(email, password, { name, company_name: company });
      }
    } else {
      if (window.SupabaseManager && typeof window.SupabaseManager.signIn === 'function') {
        await window.SupabaseManager.signIn(email, password);
      }
    }

    // Modal will be closed by auth state change handler
  }

  toggleAuthMode() {
    const nameGroup = document.getElementById('auth-name-group');
    const companyGroup = document.getElementById('auth-company-group');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');

    if (nameGroup.style.display === 'none') {
      // Switch to sign up
      nameGroup.style.display = 'block';
      companyGroup.style.display = 'block';
      title.textContent = 'Crear Cuenta';
      submitBtn.textContent = 'Crear Cuenta';
      toggleText.innerHTML = '¿Ya tienes cuenta? <button id="toggle-auth-mode" class="link-btn">Inicia sesión</button>';
    } else {
      // Switch to sign in
      nameGroup.style.display = 'none';
      companyGroup.style.display = 'none';
      title.textContent = 'Iniciar Sesión';
      submitBtn.textContent = 'Iniciar Sesión';
      toggleText.innerHTML = '¿No tienes cuenta? <button id="toggle-auth-mode" class="link-btn">Regístrate</button>';
    }

    // Re-bind toggle event
    document.getElementById('toggle-auth-mode').addEventListener('click', () => this.toggleAuthMode());
  }

  resetAuthMode() {
    const nameGroup = document.getElementById('auth-name-group');
    const companyGroup = document.getElementById('auth-company-group');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');

    nameGroup.style.display = 'none';
    companyGroup.style.display = 'none';
    title.textContent = 'Iniciar Sesión';
    submitBtn.textContent = 'Iniciar Sesión';
  }

  // Load handling
  async handleLoadSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const loadData = {
      origen: formData.get('origen'),
      destino: formData.get('destino'),
      tipo_mercancia: formData.get('tipo-mercancia'),
      peso_kg: parseFloat(formData.get('peso')),
      fecha_requerida: formData.get('fecha-requerida'),
      tarifa_sugerida: formData.get('tarifa-sugerida') ? parseFloat(formData.get('tarifa-sugerida')) : null,
      requisitos: formData.get('requisitos')
    };

    // Handle file uploads
    const files = Array.from(document.getElementById('fotos').files || []);
    if (files.length > 0 && window.SupabaseManager && typeof window.SupabaseManager.uploadFile === 'function') {
      const loadId = Date.now().toString();
      const uploadPromises = files.map(file => window.SupabaseManager.uploadFile(file, loadId));
      const uploadResults = await Promise.all(uploadPromises);

      const photoUrls = uploadResults
        .filter(result => result.success)
        .map(result => result.url);

      if (photoUrls.length > 0) {
        loadData.fotos_urls = photoUrls;
      }
    }

    if (window.SupabaseManager && typeof window.SupabaseManager.createLoad === 'function') {
      const result = await window.SupabaseManager.createLoad(loadData);

      if (result.success) {
        this.hideLoadModal();
        if (window.LoadsManager && typeof window.LoadsManager.loadUserLoads === 'function') {
          window.LoadsManager.loadUserLoads(); // Refresh the loads list
        }
      }
    }
  }

  populateLoadForm(loadData) {
    // Populate form with existing load data for editing
    document.getElementById('origen').value = loadData.origen || '';
    document.getElementById('destino').value = loadData.destino || '';
    document.getElementById('tipo-mercancia').value = loadData.tipo_mercancia || '';
    document.getElementById('peso').value = loadData.peso_kg || '';
    document.getElementById('fecha-requerida').value = loadData.fecha_requerida ? loadData.fecha_requerida.split('T')[0] : '';
    document.getElementById('tarifa-sugerida').value = loadData.tarifa_sugerida || '';
    document.getElementById('requisitos').value = loadData.requisitos || '';

    // Handle photos if editing (for now, just show existing photos)
    if (loadData.fotos_urls && loadData.fotos_urls.length > 0) {
      // Note: For editing, we would need to handle existing photos differently
      // For MVP, we'll focus on creating new loads
      console.log('Existing photos:', loadData.fotos_urls);
    }
  }


  // User menu
  handleUserMenu() {
    // Simple sign out for now
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      if (window.SupabaseManager && typeof window.SupabaseManager.signOut === 'function') {
        window.SupabaseManager.signOut();
      }
    }
  }

  // File handling methods
  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.showPhotoPreview(files);
  }

  showPhotoPreview(files) {
    const previewContainer = document.getElementById('photo-preview');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';

    files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'photo-item';

      const img = document.createElement('img');
      img.className = 'photo-thumb';

      if (typeof file === 'string') {
        // URL from existing load
        img.src = file;
      } else {
        // File object
        img.src = URL.createObjectURL(file);
      }

      const removeBtn = document.createElement('button');
      removeBtn.className = 'photo-thumb-remove';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = () => this.removePhoto(index);

      item.appendChild(img);
      item.appendChild(removeBtn);
      previewContainer.appendChild(item);
    });
  }

  clearPhotoPreview() {
    const previewContainer = document.getElementById('photo-preview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
    const input = document.getElementById('fotos');
    if (input) {
      input.value = '';
    }
  }

  removePhoto(index) {
    const input = document.getElementById('fotos');
    if (!input) return;

    const files = Array.from(input.files);

    // Remove the file at the specified index
    files.splice(index, 1);

    // Create a new FileList with the remaining files
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    input.files = dt.files;

    // Update preview
    this.showPhotoPreview(files);
  }

  // Notification system
  showNotification(title, message, type = 'info') {
    const container = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = this.getNotificationIcon(type);

    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove after duration
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, CONFIG.UI.TOAST_DURATION);
  }

  getNotificationIcon(type) {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  }

  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatWeight(weight) {
    return `${weight} kg`;
  }
}

// Create global instance
const UI = new UIManager();
window.UI = UI;