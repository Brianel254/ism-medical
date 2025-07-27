export class Navigation {
    constructor(app) {
        this.app = app;
    }

    setup() {
        this.setupNavigationLinks();
        this.setupMobileSidebarToggle();
    }

    setupNavigationLinks() {
        const links = document.querySelectorAll('.sidebar .nav-link');
        links.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
    }

    setupMobileSidebarToggle() {
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        if (!toggleBtn || !sidebar) return;

        toggleBtn.addEventListener('click', () => sidebar.classList.toggle('show'));

        document.addEventListener('click', e => {
            if (window.innerWidth <= 992 && sidebar.classList.contains('show') && 
                !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }

    showSection(sectionName) {
        const sections = ['dashboard-section', 'schemes-section', 'members-section', 'settings-section', 'about-section', 'member-details-section'];
        sections.forEach(section => {
            const el = document.getElementById(section);
            el.style.display = section === `${sectionName}-section` ? 'block' : 'none';
            if (section === `${sectionName}-section`) {
                if (sectionName === 'schemes') this.app.schemes.load();
                if (sectionName === 'members') {
                    this.app.members.load();
                    this.app.members.setupFilters();
                }
                if (sectionName === 'settings') {
                    this.app.settings.loadUploadedFiles();
                }
            }
        });
    }
}