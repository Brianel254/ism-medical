import { titleCase, formatPhone, formatDate, determineGender } from '../utils/dataFormatter.js'; // NEW

export class MemberCard {
    render(member, view) {
        return view === 'grid' ? this.grid(member) : this.list(member);
    }

    grid(member) {
        const profile = this.profilePic(member);
        const badge = this.badge(member);
        const phoneFormatted = formatPhone(member.phone); // Use imported function
        const memberNameFormatted = member.memberName ? titleCase(member.memberName) : ''; // Use imported function
        return `
            <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
                <div class="member-card" data-member-id="${member.membershipNo}">
                    <div class="d-flex align-items-center mb-2">
                        <div class="profile-icon"><img src="${profile}" alt="profile"></div>
                        <div class="ms-3">
                            <h6 class="mb-0">${memberNameFormatted}</h6>
                            <small class="text-muted">Member No: ${member.membershipNo}</small>
                            ${badge}
                        </div>
                    </div>
                    <div class="mt-2">
                        <small><i class="bi bi-telephone-fill me-1"></i> ${phoneFormatted}</small><br>
                        <small><i class="bi bi-person-badge me-1"></i> ${member.idNumber || 'N/A'}</small><br>
                        <small><i class="bi bi-envelope-fill me-1"></i> ${(member.email || 'N/A').toLowerCase()}</small><br>
                        <small><i class="bi bi-calendar-date me-1"></i> ${formatDate(member.dob)}</small>
                    </div>
                </div>
            </div>`;
    }

    list(member) {
        const profile = this.profilePic(member);
        const badge = this.badge(member);
        const phoneFormatted = formatPhone(member.phone); // Use imported function
        const memberNameFormatted = member.memberName ? titleCase(member.memberName) : ''; // Use imported function
        return `
            <div class="col-12 mb-2">
                <div class="member-list-item" data-member-id="${member.membershipNo}">
                    <div class="d-flex align-items-center">
                        <div class="profile-icon-list">
                            <img src="${profile}" alt="profile" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">
                        </div>
                        <div class="ms-3 flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="mb-0">${memberNameFormatted}</h6>
                                    <small class="text-muted">Member No: ${member.membershipNo}</small>
                                    ${badge}
                                    <div class="mt-1">
                                        <small><i class="bi bi-telephone-fill me-1"></i> ${phoneFormatted}</small><br>
                                        <small><i class="bi bi-person-badge me-1"></i> ${member.idNumber || 'N/A'}</small><br>
                                        <small><i class="bi bi-envelope-fill me-1"></i> ${(member.email || 'N/A').toLowerCase()}</small><br>
                                        <small><i class="bi bi-calendar-date me-1"></i> ${formatDate(member.dob)}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    profilePic(member) {
        return determineGender(member.gender, member.memberName) === 'F' ? '/6997666[1].png' : '/3135715[1].png'; // Use imported function
    }

    badge(member) {
        const cls = member.relation?.toLowerCase().includes('spouse') ? 'badge-orange' :
                    member.relation?.toLowerCase().includes('child') ? 'badge-yellow' :
                    'badge-green';
        return `<span class="badge-relation ${cls} ms-2">${member.relation || 'MAIN MEMBER'}</span>`;
    }

    // removed function titleCase() {} (moved to utils/dataFormatter.js)
    // removed function formatPhone() {} (moved to utils/dataFormatter.js)
    // removed function formatDate() {} (moved to utils/dataFormatter.js)
}

