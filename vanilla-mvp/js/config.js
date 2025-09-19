// CargaViva - Configuration
const CONFIG = {
  // Supabase Configuration
  SUPABASE: {
    URL: 'https://tuvdpzznaoojahvtwruy.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dmRwenpuYW9vamFodnR3cnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzAyODMsImV4cCI6MjA3MzgwNjI4M30.uFsNct7hoSvJkIvMkynta429bF8mDX0NzhoYIgFyJE4'
  },

  // App Configuration
  APP: {
    NAME: 'CargaViva',
    VERSION: '1.0.0',
    ENVIRONMENT: 'development' // 'development' | 'production'
  },

  // Storage Configuration
  STORAGE: {
    BUCKET: 'load-photos',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },

  // UI Configuration
  UI: {
    TOAST_DURATION: 5000, // 5 seconds
    MODAL_ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300
  },

  // API Configuration
  API: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  }
};

// Environment-specific configuration
if (CONFIG.APP.ENVIRONMENT === 'production') {
  // Production-specific settings
  CONFIG.UI.TOAST_DURATION = 3000;
  CONFIG.API.TIMEOUT = 15000;
}

// Make CONFIG available globally
window.CONFIG = CONFIG;