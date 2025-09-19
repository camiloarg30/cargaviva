// CargaViva - Load Management

class LoadsManager {
  constructor() {
    this.loads = [];
    this.currentLoad = null;
    this.init();
  }

  init() {
    // Set up real-time subscription
    this.setupRealtimeSubscription();
  }

  async loadUserLoads() {
    if (window.SupabaseManager && typeof window.SupabaseManager.getUserLoads === 'function') {
      const result = await window.SupabaseManager.getUserLoads();

      if (result.success) {
        this.loads = result.data;
        this.renderLoads();
      } else {
        if (window.UI && typeof window.UI.showNotification === 'function') {
          window.UI.showNotification('Error', 'No se pudieron cargar las cargas', 'error');
        }
      }
    }
  }

  renderLoads() {
    const grid = document.getElementById('loads-grid');

    if (this.loads.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No tienes cargas publicadas</h3>
          <p>Comienza publicando tu primera carga para conectar con transportistas</p>
          <button id="create-first-load-btn" class="btn btn-primary">Crear Primera Carga</button>
        </div>
      `;

      // Re-bind the button
      document.getElementById('create-first-load-btn').addEventListener('click', () => {
        if (window.UI && typeof window.UI.showLoadModal === 'function') {
          window.UI.showLoadModal();
        }
      });
      return;
    }

    grid.innerHTML = this.loads.map(load => this.createLoadCard(load)).join('');

    // Bind action buttons
    this.bindLoadActions();
  }

  createLoadCard(load) {
    const statusClass = `load-status ${load.estado}`;
    const statusText = this.getStatusText(load.estado);
    const formattedDate = window.UI && typeof window.UI.formatDate === 'function' ? window.UI.formatDate(load.fecha_requerida) : load.fecha_requerida;
    const formattedWeight = window.UI && typeof window.UI.formatWeight === 'function' ? window.UI.formatWeight(load.peso_kg) : `${load.peso_kg} kg`;
    const formattedPrice = load.tarifa_sugerida && window.UI && typeof window.UI.formatCurrency === 'function' ? window.UI.formatCurrency(load.tarifa_sugerida) : (load.tarifa_sugerida ? `$${load.tarifa_sugerida}` : 'Sin especificar');

    return `
      <div class="load-card glass-card" data-load-id="${load.id}">
        <div class="load-card-header">
          <div class="load-card-title">${load.origen} → ${load.destino}</div>
          <div class="${statusClass}">${statusText}</div>
        </div>

        <div class="load-route">
          <span class="load-route-icon">🚛</span>
          <span>${load.origen} a ${load.destino}</span>
        </div>

        <div class="load-details">
          <div class="load-detail">
            <div class="load-detail-label">Tipo</div>
            <div class="load-detail-value">${this.getCargoTypeText(load.tipo_mercancia)}</div>
          </div>
          <div class="load-detail">
            <div class="load-detail-label">Peso</div>
            <div class="load-detail-value">${formattedWeight}</div>
          </div>
          <div class="load-detail">
            <div class="load-detail-label">Fecha</div>
            <div class="load-detail-value">${formattedDate}</div>
          </div>
          <div class="load-detail">
            <div class="load-detail-label">Tarifa</div>
            <div class="load-detail-value">${formattedPrice}</div>
          </div>
        </div>

        ${load.requisitos ? `
          <div class="load-requirements">
            <div class="load-detail-label">Requisitos</div>
            <div class="load-detail-value">${load.requisitos}</div>
          </div>
        ` : ''}

        ${load.fotos_urls && load.fotos_urls.length > 0 ? `
          <div class="load-photos">
            <div class="load-detail-label">Fotos (${load.fotos_urls.length})</div>
            <div class="photo-thumbnails">
              ${load.fotos_urls.slice(0, 3).map(url => `
                <img src="${url}" alt="Foto de carga" class="photo-thumb-small" onclick="window.LoadsManager && window.LoadsManager.showPhotoModal('${url}')">
              `).join('')}
              ${load.fotos_urls.length > 3 ? `<span class="photo-more">+${load.fotos_urls.length - 3}</span>` : ''}
            </div>
          </div>
        ` : ''}

        <div class="load-card-footer">
          <div class="load-price">${formattedPrice}</div>
          <div class="load-actions">
            <button class="load-action-btn edit-btn" data-action="edit" data-load-id="${load.id}" title="Editar">
              ✏️
            </button>
            <button class="load-action-btn delete-btn" data-action="delete" data-load-id="${load.id}" title="Eliminar">
              🗑️
            </button>
            <button class="load-action-btn view-btn" data-action="view" data-load-id="${load.id}" title="Ver detalles">
              👁️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindLoadActions() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const loadId = e.currentTarget.dataset.loadId;
        const load = this.loads.find(l => l.id === loadId);
        if (load && window.UI && typeof window.UI.showLoadModal === 'function') {
          window.UI.showLoadModal(load);
        }
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const loadId = e.currentTarget.dataset.loadId;
        this.confirmDeleteLoad(loadId);
      });
    });

    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const loadId = e.currentTarget.dataset.loadId;
        const load = this.loads.find(l => l.id === loadId);
        if (load) {
          this.showLoadDetails(load);
        }
      });
    });
  }

  async confirmDeleteLoad(loadId) {
    const load = this.loads.find(l => l.id === loadId);
    if (!load) return;

    const confirmed = confirm(`¿Estás seguro de que quieres eliminar la carga de ${load.origen} a ${load.destino}?`);

    if (confirmed && window.SupabaseManager && typeof window.SupabaseManager.deleteLoad === 'function') {
      const result = await window.SupabaseManager.deleteLoad(loadId);
      if (result.success) {
        this.loads = this.loads.filter(l => l.id !== loadId);
        this.renderLoads();
      }
    }
  }

  showLoadDetails(load) {
    // For now, just show the edit modal with the load data
    if (window.UI && typeof window.UI.showLoadModal === 'function') {
      window.UI.showLoadModal(load);
    }
  }

  showPhotoModal(url) {
    // Create a simple modal to show the full-size image
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content glass-card" style="max-width: 80%; max-height: 80%;">
        <div class="modal-header">
          <h3>Foto de la Carga</h3>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="text-align: center;">
          <img src="${url}" alt="Foto de carga" style="max-width: 100%; max-height: 60vh; object-fit: contain;">
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);

    // Show modal
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Utility methods
  getStatusText(status) {
    switch (status) {
      case 'published': return 'Publicada';
      case 'assigned': return 'Asignada';
      case 'in_transit': return 'En Tránsito';
      case 'delivered': return 'Entregada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  getCargoTypeText(type) {
    const types = {
      'general': 'Carga General',
      'refrigerada': 'Carga Refrigerada',
      'peligrosa': 'Carga Peligrosa',
      'liquida': 'Carga Líquida',
      'seca': 'Carga Seca',
      'otros': 'Otros'
    };
    return types[type] || type;
  }

  clearLoads() {
    this.loads = [];
    this.renderLoads();
  }

  setupRealtimeSubscription() {
    const setupSubscription = () => {
      if (window.SupabaseManager && typeof window.SupabaseManager.subscribeToLoads === 'function') {
        window.SupabaseManager.subscribeToLoads((payload) => {
          console.log('🔄 Real-time load update:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              this.loads.unshift(payload.new);
              break;
            case 'UPDATE':
              const updateIndex = this.loads.findIndex(l => l.id === payload.new.id);
              if (updateIndex !== -1) {
                this.loads[updateIndex] = payload.new;
              }
              break;
            case 'DELETE':
              this.loads = this.loads.filter(l => l.id !== payload.old.id);
              break;
          }

          this.renderLoads();
        });
      } else {
        // Retry after a short delay if SupabaseManager is not ready
        setTimeout(setupSubscription, 100);
      }
    };

    setupSubscription();
  }

  // Add a new load to the list (called after successful creation)
  addLoad(load) {
    this.loads.unshift(load);
    this.renderLoads();
  }

  // Update an existing load
  updateLoad(updatedLoad) {
    const index = this.loads.findIndex(l => l.id === updatedLoad.id);
    if (index !== -1) {
      this.loads[index] = updatedLoad;
      this.renderLoads();
    }
  }

  // Remove a load from the list
  removeLoad(loadId) {
    this.loads = this.loads.filter(l => l.id !== loadId);
    this.renderLoads();
  }
}

// Create global instance
const LoadsManagerInstance = new LoadsManager();
window.LoadsManager = LoadsManagerInstance;