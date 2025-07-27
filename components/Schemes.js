export class Schemes {
    constructor(store) {
        this.store = store;
    }

    // Common array of light colors for scheme cards
    lightColors = [
        '#6200EE', // Deep Purple (Material Design)
        '#03DAC6', // Teal (Material Design)
        '#FF4081', // Pink (Material Design)
        '#00BCD4', // Cyan (Material Design)
        '#8BC34A', // Light Green (Material Design)
        '#FFC107', // Amber (Material Design)
        '#4CAF50', // Green (Material Design)
        '#2196F3', // Blue (Material Design)
        '#E91E63'  // Rose (Material Design)
    ];

    load() {
        const container = document.getElementById('schemes-container');
        if (!container) return;
        container.innerHTML = '';

        const schemes = this.store.getSchemes(); // Get list of schemes (uploaded files)

        if (schemes.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="bi bi-file-earmark-arrow-up text-muted fs-1 mb-3 d-block"></i>
                    <p class="text-muted">No schemes uploaded yet. Upload a dataset via the sidebar or settings page.</p>
                </div>
            `;
            return;
        }

        schemes.forEach(scheme => {
            container.appendChild(this.createSchemeCard(scheme.name, scheme.memberCount, scheme.mainMemberCount, scheme.dependantCount, scheme.id));
        });

        // Add event listeners to buttons
        container.querySelectorAll('.scheme-card .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const schemeId = e.target.closest('.scheme-card').dataset.schemeId;
                window.dispatchEvent(new CustomEvent('scheme:select', { detail: schemeId }));
            });
        });
    }

    createSchemeCard(name, memberCount, mainMemberCount, dependantCount, schemeId) {
        const div = document.createElement('div');
        div.className = 'scheme-card-item mb-4'; // Changed class to scheme-card-item
        div.innerHTML = `
            <div class="scheme-card" data-scheme-id="${schemeId}">
                <div class="scheme-card-header">
                    <div class="header-content">
                        <i class="bi bi-building"></i>
                        <span>${name}</span>
                    </div>
                </div>
                <div class="scheme-card-body">
                    <div class="scheme-stats mb-3">
                        <div class="stat-item">
                            <i class="bi bi-person-check-fill"></i>
                            <span>Main Members: <strong>${mainMemberCount}</strong></span>
                        </div>
                        <div class="stat-item">
                            <i class="bi bi-people-fill"></i>
                            <span>Dependants: <strong>${dependantCount}</strong></span>
                        </div>
                        <div class="stat-item">
                            <i class="bi bi-person-circle"></i>
                            <span>Total Members: <strong>${memberCount}</strong></span>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm w-100 mt-2">
                        <i class="bi bi-eye me-2"></i>View All Members
                    </button>
                </div>
            </div>
        `;
        return div;
    }
}