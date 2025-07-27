export class About {
    constructor() {
        this.setupContactForm();
        this.setupModals();
        this.setupDatasetTemplate();
    }

    setupContactForm() {
        // Contact form event listener is set up in AppRunner.js
    }

    setupModals() {
        this.successModal = new bootstrap.Modal(document.getElementById('messageSuccessModal'));
        this.errorModal = new bootstrap.Modal(document.getElementById('messageErrorModal'));
    }

    setupDatasetTemplate() {
        // Create a sample dataset template
        this.templateData = [
            {
                'ENTRY TIME': '2024-01-15 10:30:00',
                'MEMBERSHIP NO': 'MEM001234',
                'EMPLOYEE ID': 'EMP5678',
                'MEMBER NAME': 'John Doe',
                'RELATION': 'MAIN MEMBER',
                'CATEGORY': 'CAT 25 B IP_1.2M OP_175K MAT_150K DEN_15K OPT_20K XOL_500K',
                'DATE OF BIRTH': '1985-03-15',
                'GENDER': 'M',
                'AGENT NAME': 'Premium Health Scheme',
                'VALID FROM': '2024-01-01',
                'VALID UPTO': '2024-12-31',
                'MOBIL': '254701234567',
                'EMAIL': 'john.doe@email.com',
                'ID TYPE': 'National ID',
                'ID': '12345678',
                'MEMBER CATEGORY': 'Principal',
                'RISK CATEGORY': 'Standard'
            },
            {
                'ENTRY TIME': '2024-01-15 10:35:00',
                'MEMBERSHIP NO': 'MEM001235',
                'EMPLOYEE ID': 'EMP5678',
                'MEMBER NAME': 'Jane Doe',
                'RELATION': 'SPOUSE',
                'CATEGORY': 'CAT 25 B IP_1.2M OP_175K MAT_150K DEN_15K OPT_20K XOL_500K',
                'DATE OF BIRTH': '1987-07-22',
                'GENDER': 'F',
                'AGENT NAME': 'Premium Health Scheme',
                'VALID FROM': '2024-01-01',
                'VALID UPTO': '2024-12-31',
                'MOBIL': '254709876543',
                'EMAIL': 'jane.doe@email.com',
                'ID TYPE': 'National ID',
                'ID': '87654321',
                'MEMBER CATEGORY': 'Dependant',
                'RISK CATEGORY': 'Standard'
            },
            {
                'ENTRY TIME': '2024-01-15 10:40:00',
                'MEMBERSHIP NO': 'MEM001236',
                'EMPLOYEE ID': 'EMP5678',
                'MEMBER NAME': 'Mark Doe',
                'RELATION': 'CHILD',
                'CATEGORY': 'CAT 25 B IP_1.2M OP_175K MAT_150K DEN_15K OPT_20K XOL_500K',
                'DATE OF BIRTH': '2010-12-10',
                'GENDER': 'M',
                'AGENT NAME': 'Premium Health Scheme',
                'VALID FROM': '2024-01-01',
                'VALID UPTO': '2024-12-31',
                'MOBIL': '',
                'EMAIL': '',
                'ID TYPE': 'Birth Certificate',
                'ID': 'BC123456',
                'MEMBER CATEGORY': 'Dependant',
                'RISK CATEGORY': 'Standard'
            }
        ];
    }

    downloadTemplate() {
        const ws = XLSX.utils.json_to_sheet(this.templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Members Template");
        
        // Set column widths for better readability
        const wscols = [
            {wch: 18}, // ENTRY TIME
            {wch: 15}, // MEMBERSHIP NO
            {wch: 12}, // EMPLOYEE ID
            {wch: 20}, // MEMBER NAME
            {wch: 12}, // RELATION
            {wch: 40}, // CATEGORY
            {wch: 12}, // DATE OF BIRTH
            {wch: 8},  // GENDER
            {wch: 25}, // AGENT NAME
            {wch: 12}, // VALID FROM
            {wch: 12}, // VALID UPTO
            {wch: 15}, // MOBIL
            {wch: 25}, // EMAIL
            {wch: 12}, // ID TYPE
            {wch: 12}, // ID
            {wch: 15}, // MEMBER CATEGORY
            {wch: 12}  // RISK CATEGORY
        ];
        ws['!cols'] = wscols;
        
        XLSX.writeFile(wb, "IMS_Medical_Dataset_Template.xlsx");
    }

    async sendMessage(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Sending...';
        
        try {
            const response = await fetch('send-message.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) { // Check if HTTP status is 2xx
                // Attempt to read error message from server response
                const errorBody = await response.text(); 
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorBody);
                    if (errorJson.message) {
                        errorMessage = errorJson.message;
                    } else {
                        errorMessage += `, Response: ${errorBody}`;
                    }
                } catch (jsonError) {
                    errorMessage += `, Response: ${errorBody}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            if (result.success) {
                this.showSuccessModal();
                form.reset();
            } else {
                // If response.ok is true but result.success is false, it's a server-defined error
                throw new Error(result.message || 'Failed to send message (server reported error)');
            }
            
        } catch (error) {
            console.error("Fetch error:", error); // Log the full error for debugging
            this.showErrorModal(error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    showSuccessModal() {
        document.getElementById('successModalBody').innerHTML = `
            <div class="text-center">
                <i class="bi bi-check-circle-fill text-success display-1 mb-3"></i>
                <h5 class="text-success mb-3">Message Sent Successfully!</h5>
                <p class="text-muted">Thank you for reaching out to us. We've received your message and will get back to you within 24 hours.</p>
                <p class="fw-semibold">We appreciate your interest in our services!</p>
            </div>
        `;
        this.successModal.show();
    }

    showErrorModal(errorMessage) {
        document.getElementById('errorModalBody').innerHTML = `
            <div class="text-center">
                <i class="bi bi-exclamation-triangle-fill text-danger display-1 mb-3"></i>
                <h5 class="text-danger mb-3">Message Failed to Send</h5>
                <p class="text-muted">We're sorry, but there was an issue sending your message. Please try again or contact us directly.</p>
                <div class="alert alert-light border mt-3">
                    <small class="text-muted">Error details: ${errorMessage}</small>
                </div>
                <p class="fw-semibold mt-3">Alternative contact: <a href="mailto:info@brytec.co.ke" class="text-primary">info@brytec.co.ke</a></p>
            </div>
        `;
        this.errorModal.show();
    }
}