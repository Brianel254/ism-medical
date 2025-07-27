import { processExcelData } from '../utils/dataProcessor.js';
import { getMostFrequentValue } from '../utils/dataFormatter.js';

export class DataStore {
    constructor() {
        this.schemesData = []; // Array of { id, name, members: [], uploadDate }
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSchemeFilter = null; // Stores the ID of the scheme currently being viewed/filtered in Members section
    }

    loadStoredData() {
        const stored = localStorage.getItem('kycSchemesData'); // New key for schemes
        if (stored) {
            this.schemesData = JSON.parse(stored);
        }
    }

    // Simplified: `name` is the FINAL name resolved by FileUpload.js, `membersArray` is already processed data.
    addOrUpdateSchemeData(schemeId, name, membersArray) {
        const existingSchemeIndex = this.schemesData.findIndex(s => s.id === schemeId);

        const newSchemeEntry = {
            id: schemeId,
            name: name,
            members: membersArray,
            uploadDate: new Date().toISOString()
        };

        if (existingSchemeIndex > -1) {
            this.schemesData[existingSchemeIndex] = newSchemeEntry;
        } else {
            this.schemesData.push(newSchemeEntry);
        }
        localStorage.setItem('kycSchemesData', JSON.stringify(this.schemesData));
        localStorage.setItem('lastUpload', new Date().toISOString()); // Update overall last upload time
    }

    clearAll() {
        localStorage.removeItem('kycSchemesData');
        localStorage.removeItem('lastUpload');
        this.schemesData = [];
    }

    deleteScheme(schemeId) {
        this.schemesData = this.schemesData.filter(s => s.id !== schemeId);
        localStorage.setItem('kycSchemesData', JSON.stringify(this.schemesData));
        if (this.schemesData.length === 0) {
            localStorage.removeItem('lastUpload'); // Clear last upload if no schemes left
        }
        // If the deleted scheme was the currently active filter, clear it
        if (this.currentSchemeFilter === schemeId) {
            this.currentSchemeFilter = null;
        }
    }

    getMembers(filter = '', typeFilter = 'all', schemeId = null) {
        let allMembers = [];
        if (schemeId) {
            const specificScheme = this.schemesData.find(s => s.id === schemeId);
            if (specificScheme) {
                allMembers = specificScheme.members;
            }
        } else {
            // Combine members from all schemes if no specific schemeId is provided
            this.schemesData.forEach(scheme => {
                allMembers = allMembers.concat(scheme.members);
            });
        }
        
        let filtered = allMembers;

        // Apply type filter
        if (typeFilter === 'primary') {
            filtered = filtered.filter(m => !m.relation || m.relation.toLowerCase().includes('main') || m.relation === '');
        } else if (typeFilter === 'dependants') {
            filtered = filtered.filter(m => m.relation && !m.relation.toLowerCase().includes('main') && m.relation !== '');
        }

        // Apply search filter
        if (filter) {
            filtered = filtered.filter(m => 
                (m.memberName && m.memberName.toLowerCase().includes(filter.toLowerCase())) ||
                (m.membershipNo && m.membershipNo.toLowerCase().includes(filter.toLowerCase())) ||
                (m.agentName && m.agentName.toLowerCase().includes(filter.toLowerCase()))
            );
        }

        return filtered;
    }

    getAllMembers() {
        let allMembers = [];
        this.schemesData.forEach(scheme => {
            allMembers = allMembers.concat(scheme.members);
        });
        return allMembers;
    }

    getSchemes() {
        // Return structured scheme information for UI display
        return this.schemesData.map(s => {
            const mainMembers = s.members.filter(m => {
                const relation = m.relation ? m.relation.toLowerCase() : '';
                return relation === 'main member' || relation === 'principal' || relation === '';
            });
            const dependants = s.members.filter(m => {
                const relation = m.relation ? m.relation.toLowerCase() : '';
                return relation !== 'main member' && relation !== 'principal' && relation !== '';
            });

            return {
                id: s.id,
                name: s.name, // This 'name' will now be the AGENT NAME derived from the file (or original filename/user provided)
                memberCount: s.members.length,
                mainMemberCount: mainMembers.length,
                dependantCount: dependants.length,
                uploadDate: s.uploadDate
            };
        });
    }

    getMemberById(id) {
        for (const scheme of this.schemesData) {
            const member = scheme.members.find(m => m.membershipNo === id);
            if (member) return member;
        }
        return null;
    }

    getFamilyMembers(employeeId) {
        let familyMembers = [];
        for (const scheme of this.schemesData) {
            familyMembers = familyMembers.concat(scheme.members.filter(m => m.employeeId === employeeId));
        }
        return familyMembers;
    }
    
    getTotalMembersCount() {
        return this.schemesData.reduce((sum, scheme) => sum + scheme.members.length, 0);
    }

    getTotalActivePoliciesCount() {
        return this.schemesData.reduce((sum, scheme) => 
            sum + scheme.members.filter(m => m.validTo && new Date(m.validTo) > new Date()).length, 0
        );
    }

    getTotalSchemeCount() {
        return this.schemesData.length;
    }
}