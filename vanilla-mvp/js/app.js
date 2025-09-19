// CargaViva - Main Application

class CargaVivaApp {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing CargaViva...');

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.startApp());
      } else {
        this.startApp();
      }

    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.showFatalError('Error al inicializar la aplicación');
    }
  }

  async startApp() {
    try {
      // Initialize components in order
      await this.initializeComponents();

      // Set up global error handling
      this.setupErrorHandling();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      // Mark as initialized
      this.initialized = true;

      console.log('✅ CargaViva initialized successfully');

    } catch (error) {
      console.error('❌ Failed to start app:', error);
      this.showFatalError('Error al iniciar la aplicación');
    }
  }

  async initializeComponents() {
    // Components are initialized in their respective files
    // This ensures proper dependency order

    // 1. Config is already loaded
    console.log('📋 Config loaded');

    // 2. Supabase client is initialized in supabase.js
    console.log('🔧 Supabase client ready');

    // 3. UI components are initialized in ui.js
    console.log('🎨 UI components ready');

    // 4. Load management is initialized in loads.js
    console.log('📦 Load management ready');

    // 5. Storage management is initialized in storage.js
    console.log('💾 Storage management ready');

    // Set up additional event listeners
    this.setupAdditionalEventListeners();
  }

  setupAdditionalEventListeners() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      // For now, just prevent default behavior
      // In a full SPA, this would handle routing
      e.preventDefault();
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      UI.showNotification('Conexión restablecida', 'Estás de vuelta en línea', 'success');
    });

    window.addEventListener('offline', () => {
      UI.showNotification('Sin conexión', 'Revisa tu conexión a internet', 'warning');
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('👁️ Tab hidden');
      } else {
        console.log('👁️ Tab visible');
        // Refresh data if needed
        if (window.SupabaseManager && window.SupabaseManager.currentUser) {
          if (window.LoadsManager && typeof window.LoadsManager.loadUserLoads === 'function') {
            window.LoadsManager.loadUserLoads();
          }
        }
      }
    });

    // Handle beforeunload
    window.addEventListener('beforeunload', (e) => {
      // Save any pending changes if needed
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tienes cambios sin guardar.';
      }
    });
  }

  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('🚨 Global error:', e.error);
      UI.showNotification('Error', 'Ha ocurrido un error inesperado', 'error');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('🚨 Unhandled promise rejection:', e.reason);
      UI.showNotification('Error', 'Ha ocurrido un error inesperado', 'error');
      e.preventDefault(); // Prevent the default browser behavior
    });

    // Handle Supabase errors
    window.addEventListener('supabase-error', (e) => {
      console.error('🚨 Supabase error:', e.detail);
      UI.showNotification('Error de base de datos', e.detail.message, 'error');
    });
  }

  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('📊 Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('🐌 Long task detected:', entry);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  hasUnsavedChanges() {
    // Check if there are unsaved changes in forms
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
      const inputs = form.querySelectorAll('input, textarea, select');
      for (const input of inputs) {
        if (input.value !== input.defaultValue) {
          return true;
        }
      }
    }
    return false;
  }

  showFatalError(message) {
    const app = document.getElementById('app');

    // Show error message
    if (app) {
      app.innerHTML = `
        <div class="fatal-error">
          <div class="error-icon">🚨</div>
          <h2>Error Fatal</h2>
          <p>${message}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            Recargar Página
          </button>
        </div>
      `;
    }

    // Log error for debugging
    console.error('💀 Fatal error:', message);
  }

  // Utility methods for debugging and development
  debugInfo() {
    return {
      initialized: this.initialized,
      user: window.SupabaseManager ? window.SupabaseManager.currentUser : null,
      loadsCount: window.LoadsManager ? window.LoadsManager.loads.length : 0,
      config: CONFIG,
      timestamp: new Date().toISOString()
    };
  }

  // Reset app state (useful for development)
  reset() {
    if (confirm('¿Estás seguro de que quieres reiniciar la aplicación?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  }

  // Health check
  async healthCheck() {
    try {
      const results = {
        supabase: false,
        ui: false,
        loads: false,
        storage: false
      };

      // Check Supabase connection
      if (SupabaseManager.client) {
        results.supabase = true;
      }

      // Check UI components
      if (UI && typeof UI.showNotification === 'function') {
        results.ui = true;
      }

      // Check loads management
      if (LoadsManager && typeof LoadsManager.loadUserLoads === 'function') {
        results.loads = true;
      }

      // Check storage management
      if (StorageManager && typeof StorageManager.uploadFiles === 'function') {
        results.storage = true;
      }

      console.log('🏥 Health check results:', results);
      return results;

    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { error: error.message };
    }
  }
}

// Initialize the app when DOM is ready
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new CargaVivaApp();
  });
} else {
  app = new CargaVivaApp();
}

// Make app available globally for debugging
window.CargaVivaApp = app;

// Development helpers
if (CONFIG.APP.ENVIRONMENT === 'development') {
  window.debug = {
    app: () => app.debugInfo(),
    reset: () => app.reset(),
    health: () => app.healthCheck(),
    user: () => window.SupabaseManager ? window.SupabaseManager.currentUser : null,
    loads: () => window.LoadsManager ? window.LoadsManager.loads : []
  };

  console.log('🐛 Development helpers available at window.debug');
}