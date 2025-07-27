export class Dashboard {
    constructor(store) {
        this.store = store;
        this.familyBreakdownChart = null; // To store Chart.js instance
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

    update() {
        this.updateStats();
        this.loadDashboardSchemes();
        this.renderFamilyBreakdownChart(); // Call the new chart method
    }

    updateStats() {
        // Use DataStore's new methods for total counts
        const totalSchemes = this.store.getTotalSchemeCount(); // Count of uploaded files/schemes
        const totalMembers = this.store.getTotalMembersCount(); // Total members across all schemes
        const activePolicies = this.store.getTotalActivePoliciesCount(); // Total active policies across all schemes
        const lastUpload = localStorage.getItem('lastUpload');

        document.getElementById('totalSchemes').textContent = totalSchemes;
        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('activePolicies').textContent = activePolicies;
        document.getElementById('lastUpload').textContent = lastUpload ? new Date(lastUpload).toLocaleDateString() : 'Never';
    }

    loadDashboardSchemes() {
        const container = document.getElementById('dashboard-schemes-container');
        container.innerHTML = '';

        const schemes = this.store.getSchemes(); // Get list of schemes (uploaded files)
        if (schemes.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="bi bi-file-earmark-arrow-up text-muted fs-1 mb-3 d-block"></i>
                    <p class="text-muted">No schemes uploaded yet. Upload a dataset to get started!</p>
                </div>
            `;
            return;
        }

        schemes.forEach(scheme => { // Iterate through the file-based schemes
            container.appendChild(this.createDashboardSchemeCard(scheme.name, scheme.memberCount, scheme.mainMemberCount, scheme.dependantCount, scheme.id));
        });
    }

    createDashboardSchemeCard(name, memberCount, mainMemberCount, dependantCount, schemeId) {
        const div = document.createElement('div');
        div.className = 'scheme-card-item mb-4'; // Changed class to scheme-card-item
        div.innerHTML = `
            <div class="scheme-card dashboard-scheme-card" data-scheme-id="${schemeId}">
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
                        <i class="bi bi-eye me-2"></i>View Members
                    </button>
                </div>
            </div>
        `;
        // Add specific listener for the button within the card
        div.querySelector('.btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('scheme:select', { detail: schemeId }));
        });
        return div;
    }

    renderFamilyBreakdownChart() {
        const ctx = document.getElementById('familyBreakdownChart');
        if (!ctx) return;

        const allMembers = this.store.getAllMembers(); // Get all members from DataStore
        const families = new Map(); // Group members by employeeId

        allMembers.forEach(member => {
            const employeeId = member.employeeId || 'NO_EMPLOYEE_ID';
            if (!families.has(employeeId)) {
                families.set(employeeId, { mainMembers: 0, dependants: 0, members: [] });
            }
            families.get(employeeId).members.push(member);
        });

        const familyBreakdown = {};

        families.forEach(family => {
            const mainMembersCount = family.members.filter(m => !m.relation || m.relation.toLowerCase().includes('main') || m.relation === '').length;
            const dependantsCount = family.members.length - mainMembersCount;

            // Determine family size category based on dependants
            let category = 'M';
            if (dependantsCount > 0) {
                category = `M+${dependantsCount}`;
            }

            if (!familyBreakdown[category]) {
                familyBreakdown[category] = { totalFamilies: 0, totalMainMembers: 0, totalDependants: 0 };
            }
            familyBreakdown[category].totalFamilies++;
            familyBreakdown[category].totalMainMembers += mainMembersCount;
            familyBreakdown[category].totalDependants += dependantsCount;
        });

        // Sort categories (M, M+1, M+2, etc.)
        const labels = Object.keys(familyBreakdown).sort((a, b) => {
            if (a === 'M') return -1;
            if (b === 'M') return 1;
            const numA = parseInt(a.split('+')[1]);
            const numB = parseInt(b.split('+')[1]);
            return numA - numB;
        });

        const dataMainMembers = labels.map(label => familyBreakdown[label].totalMainMembers);
        const dataDependants = labels.map(label => familyBreakdown[label].totalDependants);

        if (this.familyBreakdownChart) {
            this.familyBreakdownChart.destroy(); // Destroy existing chart instance
        }

        this.familyBreakdownChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Main Members',
                        data: dataMainMembers,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Primary color with opacity
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                        borderRadius: 5, // Rounded bars
                    },
                    {
                        label: 'Dependants',
                        data: dataDependants,
                        backgroundColor: 'rgba(100, 116, 139, 0.8)', // Muted secondary color
                        borderColor: 'rgba(100, 116, 139, 1)',
                        borderWidth: 1,
                        borderRadius: 5, // Rounded bars
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow canvas to resize based on container
                animation: {
                    duration: 1000, // Smooth animation duration
                    easing: 'easeOutQuart' // Functional motion
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 12,
                                family: 'Poppins'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            family: 'Poppins',
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Poppins'
                        },
                        cornerRadius: 4,
                        displayColors: true,
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false // Hide x-axis grid lines
                        },
                        title: {
                            display: true,
                            text: 'Family Size (Dependants + Main Member)',
                            font: {
                                size: 14,
                                family: 'Poppins',
                                weight: '500'
                            },
                            color: '#334155'
                        },
                        ticks: {
                            font: {
                                family: 'Poppins'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)' // Light y-axis grid lines
                        },
                        title: {
                            display: true,
                            text: 'Total Members',
                            font: {
                                size: 14,
                                family: 'Poppins',
                                weight: '500'
                            },
                            color: '#334155'
                        },
                        ticks: {
                            precision: 0, // Ensure integer ticks
                            font: {
                                family: 'Poppins'
                            }
                        }
                    }
                },
                categoryPercentage: 0.7, // Width of bars relative to category space
                barPercentage: 0.8, // Width of bars in groups
            }
        });
    }
}