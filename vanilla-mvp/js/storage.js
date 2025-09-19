// CargaViva - File Storage Management

class StorageManager {
  constructor() {
    this.uploadedFiles = [];
    this.maxFiles = 5;
    this.maxFileSize = CONFIG.STORAGE.MAX_FILE_SIZE;
    this.allowedTypes = CONFIG.STORAGE.ALLOWED_TYPES;
  }

  // Handle file selection from input
  handleFileSelection(files) {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      const validation = this.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show errors if any
    if (errors.length > 0) {
      UI.showNotification('Archivos inválidos', errors.join('<br>'), 'warning');
    }

    // Check total file count
    const totalFiles = this.uploadedFiles.length + validFiles.length;
    if (totalFiles > this.maxFiles) {
      UI.showNotification('Demasiados archivos', `Máximo ${this.maxFiles} archivos permitidos`, 'warning');
      return;
    }

    // Add valid files
    this.uploadedFiles.push(...validFiles);

    // Update UI
    this.updateFilePreview();

    return validFiles;
  }

  // Validate a single file
  validateFile(file) {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `Archivo demasiado grande (máximo ${this.maxFileSize / (1024 * 1024)}MB)`
      };
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no permitido. Use JPG, PNG o WebP'
      };
    }

    return { valid: true };
  }

  // Update the file preview in the UI
  updateFilePreview() {
    const previewContainer = document.getElementById('photo-preview');
    previewContainer.innerHTML = '';

    this.uploadedFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'photo-item';

      const img = document.createElement('img');
      img.className = 'photo-thumb';
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src); // Clean up object URL

      const removeBtn = document.createElement('button');
      removeBtn.className = 'photo-thumb-remove';
      removeBtn.innerHTML = '×';
      removeBtn.title = 'Remover foto';
      removeBtn.onclick = () => this.removeFile(index);

      item.appendChild(img);
      item.appendChild(removeBtn);
      previewContainer.appendChild(item);
    });
  }

  // Remove a file from the list
  removeFile(index) {
    if (index >= 0 && index < this.uploadedFiles.length) {
      // Clean up object URL if it exists
      const file = this.uploadedFiles[index];
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }

      this.uploadedFiles.splice(index, 1);
      this.updateFilePreview();
    }
  }

  // Clear all files
  clearFiles() {
    // Clean up object URLs
    this.uploadedFiles.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });

    this.uploadedFiles = [];
    this.updateFilePreview();
  }

  // Get files for upload
  getFilesForUpload() {
    return this.uploadedFiles;
  }

  // Upload all files to Supabase Storage
  async uploadFiles(loadId) {
    if (this.uploadedFiles.length === 0) {
      return { success: true, urls: [] };
    }

    try {
      const uploadPromises = this.uploadedFiles.map(file =>
        SupabaseManager.uploadFile(file, loadId)
      );

      const results = await Promise.all(uploadPromises);

      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        UI.showNotification(
          'Algunos archivos no se pudieron subir',
          `${successfulUploads.length} de ${this.uploadedFiles.length} archivos subidos`,
          'warning'
        );
      }

      const urls = successfulUploads.map(result => result.url);

      return {
        success: successfulUploads.length > 0,
        urls,
        errors: failedUploads
      };

    } catch (error) {
      console.error('❌ Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get file size in human readable format
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type description
  getFileTypeDescription(mimeType) {
    const types = {
      'image/jpeg': 'JPEG Image',
      'image/jpg': 'JPG Image',
      'image/png': 'PNG Image',
      'image/webp': 'WebP Image'
    };

    return types[mimeType] || 'Archivo';
  }

  // Check if drag and drop is supported
  isDragAndDropSupported() {
    const div = document.createElement('div');
    return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
  }

  // Set up drag and drop for file upload area
  setupDragAndDrop() {
    const uploadArea = document.querySelector('.file-upload-area');

    if (!uploadArea || !this.isDragAndDropSupported()) {
      return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove('drag-over');
      });
    });

    uploadArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelection(files);
      }
    });
  }

  // Initialize drag and drop when the modal is shown
  initForModal() {
    // Clear previous files
    this.clearFiles();

    // Set up drag and drop
    setTimeout(() => {
      this.setupDragAndDrop();
    }, 100);
  }
}

// Create global instance
const StorageManagerInstance = new StorageManager();
window.StorageManager = StorageManagerInstance;