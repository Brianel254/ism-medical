import { titleCase, formatPhone } from '../utils/dataFormatter.js';

export class Search {
    constructor(store) {
        this.store = store;
    }

    setup() {
        this.setupSearchInput();
        this.setupGlobalSearch();
    }

    setupSearchInput() {
        const input = document.getElementById('searchInput');
        input?.addEventListener('input', e => {
            this.store.currentPage = 1;
            this.store.currentSchemeFilter = null; // Clear scheme filter when using main search
            window.dispatchEvent(new CustomEvent('members:filter', { detail: e.target.value }));
        });
    }

    setupGlobalSearch() {
        const input = document.getElementById('globalSearch');
        const dropdown = document.getElementById('globalSearchResults');
        let searchTimeout;

        input?.addEventListener('input', e => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (!query) {
                dropdown.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(() => {
                // Get all members (from all schemes) and apply search logic
                const allMembers = this.store.getMembers(); // Pass no filter to get all members
                const results = this.searchMembers(query, allMembers);
                this.renderSearchResults(results, dropdown);
            }, 300);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', e => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    searchMembers(query, allMembers) {
        const lowerQuery = query.toLowerCase();
        const keywords = lowerQuery.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings

        return allMembers.filter(member => {
            const memberName = member.memberName?.toLowerCase() || '';
            const membershipNo = member.membershipNo?.toLowerCase() || '';
            const phone = member.phone?.toString().toLowerCase() || '';
            const agentName = member.agentName?.toLowerCase() || '';

            // Check if ALL keywords are present in any of the fields
            return keywords.every(keyword => {
                return memberName.includes(keyword) ||
                       membershipNo.includes(keyword) ||
                       phone.includes(keyword) ||
                       agentName.includes(keyword);
            });
        }).slice(0, 5);
    }

    renderSearchResults(results, dropdown) {
        if (results.length === 0) {
            dropdown.innerHTML = '<div class="search-result-item">No results found</div>';
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = results.map(member => `
            <div class="search-result-item" data-member-id="${member.membershipNo}">
                <div class="d-flex align-items-center">
                    <img src="${member.gender === 'F' ? '/6997666[1].png' : '/3135715[1].png'}" 
                         alt="profile" class="rounded-circle me-2" style="width:24px;height:24px;object-fit:cover;">
                    <div>
                        <div class="fw-medium">${titleCase(member.memberName)} 
                            ${member.agentName ? `<span class="badge text-bg-secondary search-scheme-badge">${member.agentName}</span>` : ''}
                        </div>
                        <small class="text-muted">#${member.membershipNo} • ${formatPhone(member.phone)}</small>
                    </div>
                </div>
            </div>
        `).join('');

        dropdown.style.display = 'block';

        // Add click handlers
        dropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const memberId = item.dataset.memberId;
                dropdown.style.display = 'none';
                document.getElementById('globalSearch').value = ''; // Clear global search input
                window.dispatchEvent(new CustomEvent('member:details', { detail: memberId }));
            });
        });
    }
}