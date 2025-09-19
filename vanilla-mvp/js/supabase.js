// CargaViva - Supabase Client & Database Operations

class SupabaseManager {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.init();
  }

  init() {
    try {
      // Initialize Supabase client
      this.client = supabase.createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });

      console.log('🔧 Supabase client initialized');

      // Set up auth state listener
      this.client.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        this.currentUser = session?.user || null;

        if (event === 'SIGNED_IN') {
          this.handleSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.handleSignOut();
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      // Don't show notification here as UI might not be ready yet
      console.warn('UI not ready for error notification');
    }
  }

  handleSignIn(user) {
    console.log('✅ User signed in:', user.email);

    // Update UI if available
    const authBtn = document.getElementById('auth-btn');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userNameElement = document.querySelector('.user-name');

    if (authBtn) authBtn.style.display = 'none';
    if (userMenuBtn) userMenuBtn.style.display = 'flex';

    // Update user info in header
    if (userNameElement) {
      const userName = user.user_metadata?.name || user.email.split('@')[0];
      userNameElement.textContent = userName;
    }

    // Switch to dashboard if UI is available
    if (window.UI && typeof window.UI.showDashboard === 'function') {
      window.UI.showDashboard();
    }

    // Load user's loads if LoadsManager is available
    if (window.LoadsManager && typeof window.LoadsManager.loadUserLoads === 'function') {
      window.LoadsManager.loadUserLoads();
    }
  }

  handleSignOut() {
    console.log('👋 User signed out');

    // Update UI if available
    const authBtn = document.getElementById('auth-btn');
    const userMenuBtn = document.getElementById('user-menu-btn');

    if (authBtn) authBtn.style.display = 'flex';
    if (userMenuBtn) userMenuBtn.style.display = 'none';

    // Switch to landing if UI is available
    if (window.UI && typeof window.UI.showLanding === 'function') {
      window.UI.showLanding();
    }

    // Clear loads if LoadsManager is available
    if (window.LoadsManager && typeof window.LoadsManager.clearLoads === 'function') {
      window.LoadsManager.clearLoads();
    }
  }

  // Authentication methods
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            role: 'generator' // Default role for MVP
          }
        }
      });

      if (error) throw error;

      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification(
          'Cuenta creada',
          'Revisa tu email para confirmar tu cuenta',
          'success'
        );
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      UI.showNotification('Error', error.message, 'error');
      return { success: false, error };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification('Error', error.message, 'error');
      }
      return { success: false, error };
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;

      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification('Sesión cerrada', 'Has cerrado sesión exitosamente', 'success');
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification('Error', error.message, 'error');
      }
      return { success: false, error };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  // Load CRUD operations
  async createLoad(loadData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await this.client
        .from('cargas')
        .insert([{
          ...loadData,
          generador_id: user.id,
          estado: 'published'
        }])
        .select()
        .single();

      if (error) throw error;

      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification(
          'Carga publicada',
          'Tu carga ha sido publicada exitosamente',
          'success'
        );
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Create load error:', error);
      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification('Error', error.message, 'error');
      }
      return { success: false, error };
    }
  }

  async getUserLoads() {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await this.client
        .from('cargas')
        .select('*')
        .eq('generador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Get user loads error:', error);
      return { success: false, data: [] };
    }
  }

  async updateLoad(id, updates) {
    try {
      const { data, error } = await this.client
        .from('cargas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification(
          'Carga actualizada',
          'Los cambios han sido guardados',
          'success'
        );
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Update load error:', error);
      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification('Error', error.message, 'error');
      }
      return { success: false, error };
    }
  }

  async deleteLoad(id) {
    try {
      const { error } = await this.client
        .from('cargas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification(
          'Carga eliminada',
          'La carga ha sido eliminada exitosamente',
          'success'
        );
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Delete load error:', error);
      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification('Error', error.message, 'error');
      }
      return { success: false, error };
    }
  }

  // File upload to Supabase Storage
  async uploadFile(file, loadId) {
    try {
      // Validate file
      if (file.size > CONFIG.STORAGE.MAX_FILE_SIZE) {
        throw new Error('El archivo es demasiado grande (máximo 5MB)');
      }

      if (!CONFIG.STORAGE.ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Use JPG, PNG o WebP');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${loadId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await this.client.storage
        .from(CONFIG.STORAGE.BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.client.storage
        .from(CONFIG.STORAGE.BUCKET)
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl, path: fileName };
    } catch (error) {
      console.error('❌ Upload file error:', error);
      if (window.UI && typeof window.UI.showNotification === 'function') {
        window.UI.showNotification('Error', error.message, 'error');
      }
      return { success: false, error };
    }
  }

  // Real-time subscriptions
  subscribeToLoads(callback) {
    const user = this.currentUser;
    if (!user) return null;

    return this.client
      .channel('loads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cargas',
          filter: `generador_id=eq.${user.id}`
        },
        callback
      )
      .subscribe();
  }
}

// Create global instance
const SupabaseManagerInstance = new SupabaseManager();
window.SupabaseManager = SupabaseManagerInstance;