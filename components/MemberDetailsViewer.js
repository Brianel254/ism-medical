import { titleCase, formatPhone, formatDate, formatAmount, determineGender } from '../utils/dataFormatter.js';

export class MemberDetailsViewer {
    constructor(store) {
        this.store = store;
        this.container = document.getElementById('member-details-container');
    }

    show(membershipNo) {
        const member = this.store.getMemberById(membershipNo);
        if (!member) {
            console.error(`Member with ID ${membershipNo} not found.`);
            return;
        }

        const family = this.store.getFamilyMembers(member.employeeId);
        
        this.container.innerHTML = `
            <div class="row g-4">
                <!-- Member Profile Card -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm h-100 bg-gradient-primary text-white">
                        <div class="card-body text-center p-4">
                            <div class="mb-4">
                                <img src="${determineGender(member.gender, member.memberName) === 'F' ? '/6997666[1].png' : '/3135715[1].png'}" 
                                     alt="profile" 
                                     class="rounded-circle border border-3 border-white mb-3"
                                     style="width: 100px; height: 100px; object-fit: cover;">
                            </div>
                            <h4 class="fw-bold mb-2">${titleCase(member.memberName)}</h4>
                            <p class="mb-2">Member No: ${member.membershipNo}</p>
                            <span class="badge ${member.relation?.toLowerCase().includes('spouse') ? 'bg-warning' : 
                                                  member.relation?.toLowerCase().includes('child') ? 'bg-info' : 
                                                  'bg-success'} fs-6 px-3 py-2">${member.relation || 'MAIN MEMBER'}</span>
                            
                            <div class="mt-4 pt-3 border-top border-light">
                                <div class="row text-center">
                                    <div class="col-6">
                                        <i class="bi bi-telephone-fill fs-4 mb-2 d-block"></i>
                                        <small>${formatPhone(member.phone)}</small>
                                    </div>
                                    <div class="col-6">
                                        <i class="bi bi-envelope-fill fs-4 mb-2 d-block"></i>
                                        <small>${(member.email || 'N/A').toLowerCase()}</small>
                                    </div>
                                </div>
                                <div class="row text-center mt-3">
                                    <div class="col-6">
                                        <i class="bi bi-person-badge fs-4 mb-2 d-block"></i>
                                        <small>${member.idNumber || 'N/A'}</small>
                                    </div>
                                    <div class="col-6">
                                        <i class="bi bi-calendar-date fs-4 mb-2 d-block"></i>
                                        <small>${formatDate(member.dob)}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Personal & Policy Information -->
                <div class="col-lg-8">
                    <div class="row g-4">
                        <!-- Personal Info -->
                        <div class="col-12">
                            <div class="card border-0 shadow-sm">
                                <div class="card-header bg-light border-0 d-flex align-items-center">
                                    <i class="bi bi-person-circle text-primary fs-5 me-2"></i>
                                    <h5 class="fw-semibold text-primary mb-0">Personal Information</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-building text-muted me-2"></i>
                                                <small class="text-muted">Employee ID</small>
                                            </div>
                                            <p class="fw-medium mb-0">${member.employeeId || 'N/A'}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-gender-ambiguous text-muted me-2"></i>
                                                <small class="text-muted">Gender</small>
                                            </div>
                                            <p class="fw-medium mb-0">${determineGender(member.gender, member.memberName)}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-card-text text-muted me-2"></i>
                                                <small class="text-muted">ID Type</small>
                                            </div>
                                            <p class="fw-medium mb-0">${member.idType || 'N/A'}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-person-gear text-muted me-2"></i>
                                                <small class="text-muted">Member Category</small>
                                            </div>
                                            <p class="fw-medium mb-0">${member.memberCategory || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Category Limits -->
                        ${member.category ? `
                        <div class="col-12">
                            <div class="card border-0 shadow-sm">
                                <div class="card-header bg-light border-0 d-flex align-items-center">
                                    <i class="bi bi-shield-fill-check text-success fs-5 me-2"></i>
                                    <h5 class="fw-semibold text-success mb-0">Coverage Limits</h5>
                                </div>
                                <div class="card-body">
                                    ${this.parseCategoryLimits(member.category)}
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Policy Information -->
                        <div class="col-12">
                            <div class="card border-0 shadow-sm">
                                <div class="card-header bg-light border-0 d-flex align-items-center">
                                    <i class="bi bi-shield-check text-info fs-5 me-2"></i>
                                    <h5 class="fw-semibold text-info mb-0">Policy Information</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-diagram-3 text-muted me-2"></i>
                                                <small class="text-muted">Scheme</small>
                                            </div>
                                            <p class="fw-medium mb-0">${member.agentName || 'N/A'}</p>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-calendar-check text-muted me-2"></i>
                                                <small class="text-muted">Valid From</small>
                                            </div>
                                            <p class="fw-medium mb-0">${formatDate(member.validFrom)}</p>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-calendar-x text-muted me-2"></i>
                                                <small class="text-muted">Valid To</small>
                                            </div>
                                            <p class="fw-medium mb-0">${formatDate(member.validTo)}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="bi bi-exclamation-triangle text-muted me-2"></i>
                                                <small class="text-muted">Risk Category</small>
                                            </div>
                                            <p class="fw-medium mb-0">${member.riskCategory || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Family Members -->
                ${family.length > 1 ? `
                <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-light border-0 d-flex align-items-center">
                            <i class="bi bi-people text-info fs-5 me-2"></i>
                            <h5 class="fw-semibold text-info mb-0">Family Members (${family.length} members)</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                ${family.map(fm => `
                                    <div class="col-md-6 col-lg-4">
                                        <div class="card border ${fm.membershipNo === member.membershipNo ? 'border-primary bg-light' : ''} h-100 family-member-card" 
                                             data-member-id="${fm.membershipNo}"
                                             style="cursor: pointer;">
                                            <div class="card-body p-3">
                                                <div class="d-flex align-items-center">
                                                    <img src="${determineGender(fm.gender, fm.memberName) === 'F' ? '/6997666[1].png' : '/3135715[1].png'}" 
                                                         alt="profile" 
                                                         class="rounded-circle me-3"
                                                         style="width: 40px; height: 40px; object-fit: cover;">
                                                    <div class="flex-grow-1">
                                                        <h6 class="mb-1 fw-semibold">${titleCase(fm.memberName)}</h6>
                                                        <small class="text-muted d-block">Member: ${fm.membershipNo}</small>
                                                        <span class="badge ${fm.relation?.toLowerCase().includes('spouse') ? 'bg-warning' : 
                                                                              fm.relation?.toLowerCase().includes('child') ? 'bg-info' : 
                                                                              'bg-success'} mt-1">
                                                            ${fm.relation || 'MAIN MEMBER'}
                                                        </span>
                                                        ${fm.membershipNo === member.membershipNo ? '<small class="text-primary fw-bold d-block mt-1">Currently Viewing</small>' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Add event listeners for family members
        this.container.querySelectorAll('.family-member-card').forEach(card => {
            card.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('member:details', { detail: card.dataset.memberId }));
            });
        });

        // Finally, show the section
        window.app.nav.showSection('member-details');
    }

    parseCategoryLimits(category) {
        if (!category) return '<p class="text-muted">No category information available</p>';
        
        const categoryMap = {
            'IP_': { icon: 'bi-hospital', label: 'Inpatient', color: 'text-danger' },
            'OP_': { icon: 'bi-building', label: 'Outpatient', color: 'text-primary' },
            'MAT_': { icon: 'bi-heart-pulse', label: 'Maternity', color: 'text-success' },
            'DEN_': { icon: 'bi-emoji-smile', label: 'Dental', color: 'text-info' },
            'OPT_': { icon: 'bi-eye', label: 'Optical', color: 'text-warning' },
            'XOL_': { icon: 'bi-shield-exclamation', label: 'Excess of Loss', color: 'text-secondary' }
        };

        let html = '<div class="row g-3">';
        
        // Parse category class
        const classMatch = category.match(/CAT\s+\d+\s+([A-Z])/);
        if (classMatch) {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-award text-primary me-2"></i>
                        <small class="text-muted">Category</small>
                    </div>
                    <p class="fw-medium mb-0">${classMatch[1]}</p>
                </div>
            `;
        }

        // Parse limits
        Object.entries(categoryMap).forEach(([key, config]) => {
            const regex = new RegExp(`${key.replace('_', '')}_(\\d+(?:\\.\\d+)?[KM]?)`, 'i');
            const match = category.match(regex);
            if (match) {
                html += `
                    <div class="col-md-6 col-lg-4">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi ${config.icon} ${config.color} me-2"></i>
                            <small class="text-muted">${config.label}</small>
                        </div>
                        <p class="fw-medium mb-0">KSh ${formatAmount(match[1])}</p>
                    </div>
                `;
            }
        });

        html += '</div>';
        return html;
    }
}