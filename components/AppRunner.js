import { DataStore } from '../services/DataStore.js';
import { Navigation } from './Navigation.js';
import { FileUpload } from './FileUpload.js';
import { Search } from './Search.js';
import { Dashboard } from './Dashboard.js';
import { Members } from './Members.js';
import { Schemes } from './Schemes.js';
import { Settings } from './Settings.js';
import { About } from './About.js';
import { MemberDetailsViewer } from './MemberDetailsViewer.js';

export class AppRunner {
    constructor() {
        this.store = new DataStore();
        this.nav = new Navigation(this);
        this.settings = new Settings(this.store); // Settings needs to be initialized before FileUpload
        this.fileUpload = new FileUpload(this.store, this.settings); // Pass settings here
        this.search = new Search(this.store);
        this.dashboard = new Dashboard(this.store);
        this.members = new Members(this.store);
        this.schemes = new Schemes(this.store);
        this.about = new About();
        this.memberDetailsViewer = new MemberDetailsViewer(this.store);

        // Make app instance available globally for direct calls (e.g., from old onclicks)
        // Ideally, all interactions should transition to event listeners.
        window.app = this;
    }

    init() {
        this.store.loadStoredData();
        this.nav.setup();
        this.fileUpload.setup();
        this.search.setup();
        this.dashboard.update();
        this.settings.init(); // Initialize settings for file listing and modals

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle file input changes in the sidebar upload card
        document.getElementById('excelFile')?.addEventListener('change', e => {
            this.fileUpload.handleFileUpload(e.target.files[0]);
        });

        // Handle file upload from the modal in Settings
        document.getElementById('uploadFileBtn')?.addEventListener('click', () => {
            const fileInput = document.getElementById('datasetFile');
            const datasetName = document.getElementById('datasetName').value;
            const replaceExisting = document.getElementById('replaceExisting').checked;
            // Pass fileToUpdateId from Settings, which holds it if an 'Edit' action initiated the modal
            this.fileUpload.handleModalUpload(fileInput.files[0], datasetName, replaceExisting, this.settings.fileToUpdateId);
            this.settings.fileToUpdateId = null; // Clear after use
            this.settings.fileToUpdateName = null; // Clear after use
        });

        // Trigger settings clear all data
        document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
            this.settings.clearAllData();
        });

        // Trigger settings show upload modal
        document.getElementById('showUploadModalBtn')?.addEventListener('click', () => {
            this.settings.showUploadModal();
        });

        // Trigger about download template
        document.getElementById('downloadTemplateBtn')?.addEventListener('click', () => {
            this.about.downloadTemplate();
        });

        // Handle contact form submission
        document.getElementById('contactForm')?.addEventListener('submit', e => {
            this.about.sendMessage(e);
        });

        // Scheme selection event (from dashboard or schemes page)
        window.addEventListener('scheme:select', e => {
            this.nav.showSection('members');
            // Store the selected scheme ID in DataStore to filter members
            this.store.currentSchemeFilter = e.detail; 
            document.getElementById('searchInput').value = ''; // Clear search when filtering by scheme
            this.members.load(); // Load members for the selected scheme
        });

        // Member details view event (from members list or search results)
        window.addEventListener('member:details', e => this.memberDetailsViewer.show(e.detail));

        // Back to members list event (from member details section)
        document.getElementById('backToMembersBtn')?.addEventListener('click', () => {
            this.nav.showSection('members');
            this.store.currentSchemeFilter = null; // Clear scheme filter when going back to general members
            this.members.load(document.getElementById('searchInput')?.value || '');
        });

        // Member filter event (from members search input)
        window.addEventListener('members:filter', e => {
            this.store.currentPage = 1; // Reset pagination on new filter
            this.members.load(e.detail);
        });

        // Pagination page change event
        window.addEventListener('page:go', e => {
            this.store.currentPage = e.detail;
            this.members.load(document.getElementById('searchInput')?.value || ''); // Reload members with current search filter
        });

        // View toggle (grid/list)
        document.getElementById('gridViewBtn')?.addEventListener('click', () => this.members.toggleView('grid'));
        document.getElementById('listViewBtn')?.addEventListener('click', () => this.members.toggleView('list'));

        // Listen for data changes to update dashboard/members sections
        window.addEventListener('data:updated', () => {
            this.dashboard.update();
            this.settings.loadUploadedFiles(); // Refresh file list in settings
            // If on members or schemes section, refresh them
            if (document.getElementById('members-section').style.display !== 'none') {
                this.members.load(document.getElementById('searchInput')?.value || '');
            }
            if (document.getElementById('schemes-section').style.display !== 'none') {
                this.schemes.load();
            }
        });
    }
}