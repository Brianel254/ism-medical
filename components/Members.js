import { MemberCard } from './MemberCard.js';
import { Pagination } from './Pagination.js';

export class Members {
    constructor(store) {
        this.store = store;
        this.card = new MemberCard();
        this.pagination = new Pagination(store);
        this.currentView = 'grid'; // Default view
        this.currentSchemeIdFilter = null; // Stores the ID of the scheme currently being viewed/filtered
        this.membersContainer = document.getElementById('members-container');
        this.searchInput = document.getElementById('searchInput');
        this.schemeFilter = document.getElementById('schemeFilter'); // Changed ID here
    }

    load(searchFilter = '') {
        if (!this.membersContainer) return;

        const filteredMembers = this.store.getMembers(searchFilter, null, this.currentSchemeIdFilter); // Pass null for typeFilter
        const start = (this.store.currentPage - 1) * this.store.itemsPerPage;
        const page = filteredMembers.slice(start, start + this.store.itemsPerPage);

        this.membersContainer.innerHTML = ''; // Clear previous content

        if (filteredMembers.length === 0) {
            this.membersContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-person-x text-muted fs-1 mb-3 d-block"></i>
                    <p class="text-muted">No members found matching your criteria.</p>
                </div>
            `;
            this.pagination.render(0); // Render pagination with 0 items
            return;
        }

        const grouped = this.groupByScheme(page); // Still group by agentName within the results
        Object.entries(grouped).forEach(([schemeName, members]) => {
            this.membersContainer.appendChild(this.renderGroup(schemeName, members));
        });

        this.pagination.render(filteredMembers.length);

        // Add event listeners to newly rendered member cards
        this.membersContainer.querySelectorAll('.member-card, .member-list-item').forEach(card => {
            card.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('member:details', { detail: card.dataset.memberId }));
            });
        });

        // Ensure view buttons are correctly active
        document.getElementById('gridViewBtn')?.classList.toggle('active', this.currentView === 'grid');
        document.getElementById('listViewBtn')?.classList.toggle('active', this.currentView === 'list');
    }

    setupFilters() {
        if (this.schemeFilter) {
            // Populate scheme filter dropdown
            const schemes = this.store.getSchemes();
            let optionsHtml = '<option value="all">All Schemes</option>';
            schemes.forEach(scheme => {
                optionsHtml += `<option value="${scheme.id}">${scheme.name}</option>`;
            });
            this.schemeFilter.innerHTML = optionsHtml;

            // Set the selected value if a filter is active
            if (this.currentSchemeIdFilter) {
                this.schemeFilter.value = this.currentSchemeIdFilter;
            } else {
                this.schemeFilter.value = 'all';
            }

            // Remove previous listener to prevent duplicates on navigation
            this.schemeFilter.removeEventListener('change', this._handleSchemeFilterChange);
            this.schemeFilter.addEventListener('change', this._handleSchemeFilterChange);
        }
    }

    _handleSchemeFilterChange = (e) => { // Use arrow function to maintain 'this' context
        const selectedSchemeId = e.target.value;
        this.currentSchemeIdFilter = selectedSchemeId === 'all' ? null : selectedSchemeId;
        this.store.currentSchemeFilter = this.currentSchemeIdFilter; // Update DataStore's filter
        this.store.currentPage = 1;
        this.load(this.searchInput?.value || '');
    }

    groupByScheme(members) {
        // This will now group by the internal 'agentName' from the Excel data
        // within the set of members passed to it (which might be from one scheme or all)
        return members.reduce((acc, m) => {
            const key = m.agentName || 'Uncategorized Scheme'; // Fallback if agentName is missing
            acc[key] = acc[key] || [];
            acc[key].push(m);
            return acc;
        }, {});
    }

    renderGroup(name, members) {
        const div = document.createElement('div');
        div.className = 'mb-4';
        if (this.currentView === 'grid') {
            div.innerHTML = `
                <h4 class="mb-3">${name}</h4>
                <div class="row gx-4 gy-4">${members.map(m => this.card.render(m, this.currentView)).join('')}</div>
            `;
        } else {
            div.innerHTML = `
                <h4 class="mb-3">${name}</h4>
                <div class="row">${members.map(m => this.card.render(m, this.currentView)).join('')}</div>
            `;
        }
        return div;
    }

    toggleView(view) {
        this.currentView = view;
        this.load(this.searchInput?.value || ''); // Reload members with current search filter
    }
}