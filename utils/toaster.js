export function showToast(message, type = 'success', title = 'Notification') {
    const toastContainer = document.querySelector('.toast-container');
    const toastTemplate = document.getElementById('toastTemplate');

    if (!toastContainer || !toastTemplate) {
        console.error('Toast container or template not found!');
        // Fallback to alert if elements are missing
        alert(`${title}: ${message}`);
        return;
    }

    const newToastEl = toastTemplate.cloneNode(true);
    newToastEl.id = ''; // Remove ID from clone
    newToastEl.style.display = 'block'; // Make it visible initially (Bootstrap JS will handle 'hide')

    const toastHeader = newToastEl.querySelector('.toast-header');
    const toastTitle = newToastEl.querySelector('.toast-title');
    const toastBody = newToastEl.querySelector('.toast-body');

    toastTitle.textContent = title;
    toastBody.textContent = message;

    // Add Bootstrap coloring classes to header based on type
    toastHeader.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'text-white'); // Clean up
    if (type === 'success') {
        toastHeader.classList.add('bg-success', 'text-white');
        toastHeader.querySelector('.btn-close').classList.add('btn-close-white');
    } else if (type === 'danger') {
        toastHeader.classList.add('bg-danger', 'text-white');
        toastHeader.querySelector('.btn-close').classList.add('btn-close-white');
    } else if (type === 'warning') {
        toastHeader.classList.add('bg-warning', 'text-dark');
        toastHeader.querySelector('.btn-close').classList.remove('btn-close-white'); // Ensure not white
    } else {
        // Default (info or primary-like look)
        toastHeader.classList.add('bg-primary', 'text-white');
        toastHeader.querySelector('.btn-close').classList.add('btn-close-white');
    }

    toastContainer.appendChild(newToastEl);

    const toast = new bootstrap.Toast(newToastEl, {
        autohide: true,
        delay: 5000 // 5 seconds
    });
    
    toast.show();

    // Remove toast element from DOM after it's hidden
    newToastEl.addEventListener('hidden.bs.toast', () => {
        newToastEl.remove();
    });
}