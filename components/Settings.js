export class Settings {
    constructor(store) {
        this.store = store;
        this.uploadModal = null;
        this.deleteModal = null;
        this.confirmDeleteCallback = null;
        this.fileToUpdateId = null; // To store ID of file being edited
        this.fileToUpdateName = null; // To store name of file being edited
    }

    init() {
        this.uploadModal = new bootstrap.Modal(document.getElementById('fileUploadModal'));
        this.deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        this.loadUploadedFiles();

        // Add event listener for the confirm delete button once
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
            if (this.confirmDeleteCallback) {
                this.confirmDeleteCallback();
            }
        });
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear ALL data from the system? This action cannot be undone and will remove all members and uploaded file records.')) {
            this.store.clearAll(); // Clears all scheme data and lastUpload in DataStore
            window.dispatchEvent(new CustomEvent('data:updated')); // Notify app to refresh UI
        }
    }

    loadUploadedFiles() {
        const container = document.getElementById('uploaded-files-list');
        if (!container) return;

        const files = this.store.getSchemes(); // Get schemes (uploaded files) from DataStore
        
        if (files.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-inbox text-muted fs-1 mb-3 d-block"></i>
                    <p class="text-muted">No files uploaded yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = files.map(file => `
            <div class="d-flex align-items-center justify-content-between p-3 border rounded mb-2">
                <div class="d-flex align-items-center">
                    <i class="bi bi-file-earmark-excel text-success fs-4 me-3"></i>
                    <div>
                        <h6 class="mb-1">${file.name}</h6>
                        <small class="text-muted">
                            Uploaded: ${new Date(file.uploadDate).toLocaleDateString()} • 
                            ${file.memberCount} records
                        </small>
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn btn-outline-primary btn-sm" data-file-id="${file.id}" data-action="edit">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm" data-file-id="${file.id}" data-file-name="${file.name}" data-action="delete">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to the dynamically created buttons
        container.querySelectorAll('[data-action="edit"]').forEach(button => {
            button.addEventListener('click', (e) => this.editFile(e.target.dataset.fileId || e.target.closest('button').dataset.fileId));
        });
        container.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', (e) => this.confirmDelete(e.target.dataset.fileId || e.target.closest('button').dataset.fileId, e.target.dataset.fileName || e.target.closest('button').dataset.file-name));
        });
    }

    showUploadModal() {
        // Pre-fill name and check 'replace existing' if an edit action initiated this.
        document.getElementById('datasetName').value = this.fileToUpdateName || '';
        document.getElementById('datasetFile').value = ''; // Always clear file input
        document.getElementById('replaceExisting').checked = (this.fileToUpdateId !== null); 
        
        this.uploadModal.show();
    }

    editFile(fileId) {
        const file = this.store.getSchemes().find(f => f.id === fileId);
        if (file) {
            this.fileToUpdateId = file.id;
            this.fileToUpdateName = file.name;
            this.showUploadModal(); // This will pre-fill and check replaceExisting
        }
    }

    confirmDelete(fileId, fileName) {
        document.getElementById('deleteFileName').textContent = fileName;
        this.confirmDeleteCallback = () => this.deleteFile(fileId); // Set the callback
        this.deleteModal.show();
    }

    deleteFile(fileId) {
        this.store.deleteScheme(fileId); // Delete the scheme from DataStore
        this.deleteModal.hide();
        window.dispatchEvent(new CustomEvent('data:updated')); // Notify app to refresh UI
    }
}