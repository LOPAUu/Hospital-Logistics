// Sample data representing requisitions (for testing purposes)
const sampleData = [
    {
        id: 1,
        date: '2024-09-23',
        purpose: 'Order More Vaccines',
        requested_by: 'John Doe',
        role: 'Nurse',
        status: 'pending',
        total: 1000,
        items: [{ name: 'Vaccine A', quantity: 10, price: 100, total: 1000 }],
        attachments: ['order-vaccine.pdf', 'invoice-vaccine.pdf'],
    },
    {
        id: 2,
        date: '2024-09-25',
        purpose: 'Request Surgical Supplies',
        requested_by: 'Jane Smith',
        role: 'Pharmacist',
        status: 'approved',
        total: 3500,
        items: [
            { name: 'Scalpel', quantity: 5, price: 200, total: 1000 },
            { name: 'Surgical Gloves', quantity: 10, price: 250, total: 2500 },
        ],
        attachments: ['surgical-order.pdf', 'surgical-invoice.pdf'],
    },
    {
        id: 3,
        date: '2024-09-27',
        purpose: 'Request IV Fluids',
        requested_by: 'Alice Brown',
        role: 'Doctor',
        status: 'rejected',
        total: 1500,
        items: [
            { name: 'Normal Saline', quantity: 20, price: 50, total: 1000 },
            { name: 'Dextrose', quantity: 10, price: 50, total: 500 },
        ],
        attachments: ['iv-fluids.pdf'],
    },
    {
        id: 4,
        date: '2024-09-30',
        purpose: 'Order Bandages',
        requested_by: 'Bob White',
        role: 'Nurse',
        status: 'pending',
        total: 800,
        items: [
            { name: 'Adhesive Bandage', quantity: 20, price: 20, total: 400 },
            { name: 'Elastic Bandage', quantity: 10, price: 40, total: 400 },
        ],
        attachments: [],
    },
];

// Function to fetch requisition data based on status
function filterByStatus(status) {
    // Highlight the active tab
    const tabs = document.querySelectorAll('.tab__item a');
    tabs.forEach(tab => tab.classList.remove('is-activated'));
    const activeTab = document.querySelector(`a[href="#${status}"]`);
    if (activeTab) {
        activeTab.classList.add('is-activated');
    }

    // Filter sample data based on status
    const filteredData = status === 'all' ? sampleData : sampleData.filter(req => req.status === status);

    // Populate requisition cards dynamically
    const requisitionCards = document.getElementById('requisition-cards');
    requisitionCards.innerHTML = ''; // Clear current cards

    if (filteredData.length === 0) {
        requisitionCards.innerHTML = '<p>No requisitions found for this status.</p>';
        return;
    }

    filteredData.forEach(req => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => viewDetails(req.id); // Make the entire card clickable

        // Role-based styling
        let roleStyle = '';
        if (req.role === 'Nurse') {
            roleStyle = 'background-color: #e7f3ff; color: #007bff; border: 2px solid #007bff;';
        } else if (req.role === 'Pharmacist') {
            roleStyle = 'background-color: #e6ffe6; color: #28a745; border: 2px solid #28a745;';
        } else if (req.role === 'Doctor') {
            roleStyle = 'background-color: #fff5e6; color: #ff9933; border: 2px solid #ff9933;';
        }

        // Buttons for approve/reject if status is pending
        let actionButtons = '';
        if (req.status === 'pending') {
            actionButtons = `
                <button class="approve" onclick="approveRequisition(${req.id}); event.stopPropagation();">Approve</button>
                <button class="reject" onclick="rejectRequisition(${req.id}); event.stopPropagation();">Reject</button>
            `;
        } else if (req.status === 'approved') {
            actionButtons = `<button class="approve" disabled>Approved</button>`;
        } else if (req.status === 'rejected') {
            actionButtons = `<button class="reject" disabled>Rejected</button>`;
        }

        // Card content
        card.innerHTML = `
            <div class="card-content">
                <div class="card-row">
                    <p><strong>Requisition #</strong> ${req.id}</p>
                    <p><span class="role" style="${roleStyle} font-weight: bold; padding: 8px 12px; border-radius: 5px;">${req.role}</span></p>
                </div>
                <hr>
                <p><strong>Date:</strong> ${req.date}</p>
                <p><strong>Purpose:</strong> ${req.purpose}</p>
                <p><strong>Requested By:</strong> ${req.requested_by}</p>
                <p><strong>Status:</strong> ${req.status}</p>
                <p><strong>Total:</strong> ₱${req.total}</p>
                <hr>
                <div class="button-group">${actionButtons}</div>
            </div>
        `;
        requisitionCards.appendChild(card);
    });
}

// Function to view requisition details
function viewDetails(requisitionId) {
    const data = sampleData.find(req => req.id === requisitionId);
    if (!data) {
        alert('No details found for this requisition.');
        return;
    }

    const itemsTable = `
        <table>
            <thead>
                <tr><th>Item Name</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>₱${item.price}</td>
                        <td>₱${item.total}</td>
                    </tr>`).join('')}
            </tbody>
        </table>`;

    const attachmentsList = data.attachments.length > 0
        ? `<ul>${data.attachments.map(att => `<li><a href="#">${att}</a></li>`).join('')}</ul>`
        : '<p>No attachments available.</p>';

    const modalContent = document.getElementById('view-details-content');
    modalContent.innerHTML = `
        <h3>Requisition #${data.id}</h3>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Purpose:</strong> ${data.purpose}</p>
        <p><strong>Requested By:</strong> ${data.requested_by}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Total:</strong> ₱${data.total}</p>
        <h4>Items</h4>
        ${itemsTable}
        <h4>Attachments</h4>
        ${attachmentsList}
    `;
    document.getElementById('view-details-modal').style.display = 'block';
}

// Function to close the View Details modal
function closeViewDetailsModal() {
    document.getElementById('view-details-modal').style.display = 'none';
}

// Function to approve a requisition
function approveRequisition(reqId) {
    const req = sampleData.find(r => r.id === reqId);
    if (req) {
        req.status = 'approved';
        filterByStatus('all'); // Refresh the requisition list
        alert(`Requisition #${reqId} approved.`);
    }
}

// Function to reject a requisition
function rejectRequisition(reqId) {
    const req = sampleData.find(r => r.id === reqId);
    if (req) {
        req.status = 'rejected';
        filterByStatus('all'); // Refresh the requisition list
        alert(`Requisition #${reqId} rejected.`);
    }
}

// Initial population of all requisitions on page load
document.addEventListener('DOMContentLoaded', () => {
    filterByStatus('all');
});
