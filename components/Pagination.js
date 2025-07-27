export class Pagination {
    constructor(store) {
        this.store = store;
    }

    render(totalItems) {
        const totalPages = Math.ceil(totalItems / this.store.itemsPerPage);
        const container = document.getElementById('members-container');

        // Clear existing pagination
        const existingNav = container.querySelector('nav.pagination-nav');
        if (existingNav) {
            existingNav.remove();
        }

        if (totalPages <= 1) return;

        const nav = document.createElement('nav');
        nav.className = 'd-flex justify-content-center mt-4 pagination-nav'; // Added class for easier removal
        nav.innerHTML = this.buildHTML(totalPages);
        container.appendChild(nav);
    }

    buildHTML(totalPages) {
        const current = this.store.currentPage;
        const maxVisible = 3;               // how many numbers to show around current
        const maxEdge = 2;                  // how many numbers to show at ends

        let pages = [];

        // always show first pages
        const startEdge = Math.min(maxEdge, totalPages);
        for (let i = 1; i <= startEdge; i++) pages.push(i);

        // determine middle range
        const startMiddle = Math.max(startEdge + 1, current - Math.floor(maxVisible / 2));
        const endMiddle = Math.min(current + Math.floor(maxVisible / 2), totalPages - maxEdge);

        if (startMiddle > startEdge + 1) pages.push('...');

        for (let i = startMiddle; i <= endMiddle; i++) pages.push(i);

        if (endMiddle < totalPages - maxEdge) pages.push('...');

        // always show last pages
        const endEdge = Math.max(totalPages - maxEdge + 1, startEdge + 1);
        for (let i = endEdge; i <= totalPages; i++) {
            if (!pages.includes(i)) pages.push(i); // Avoid adding duplicates if middle range overlaps with end
        }

        // Sort unique pages (needed if overlaps happened)
        pages = [...new Set(pages)].sort((a, b) => (a === '...' ? Infinity : a) - (b === '...' ? Infinity : b));

        // build html
        let html = '<ul class="pagination mb-0">';
        html += `<li class="page-item ${current === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${current - 1}">Prev</a>
                 </li>`;

        pages.forEach(p => {
            if (p === '...') {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            } else {
                html += `<li class="page-item ${p === current ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${p}">${p}</a>
                         </li>`;
            }
        });

        html += `<li class="page-item ${current === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${current + 1}">Next</a>
                 </li></ul>`;
        
        // Attach click listeners after HTML is in DOM
        // This is done by AppRunner now via custom event page:go
        // We only generate the data-page attribute for AppRunner to pick up
        return html;
    }
}