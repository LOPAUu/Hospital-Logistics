// Sample data representing requisitions
const requisitions = [
    {
        id: 1001,
        date: "2024-09-23",
        purpose: "Order More Vaccines",
        total: 2775.00,
        status: "Pending",
        signatories: {
            signatory1: { approved: null, name: "Maverick Ko" },
            signatory2: { approved: null, name: "Rene Letegio" },
            signatory3: { approved: null, name: "Paulo Sangreo" }
        },
        items: [
            { name: "Vaccine A", quantity: 50, price: 25.50, total: 1275.00 },
            { name: "Vaccine B", quantity: 100, price: 15.00, total: 1500.00 }
        ],
        billing: "Mercury Drugs collab",
        attachments: ["vaccine-order.pdf", "invoice-1001.pdf"],
        requester: {
            name: "Maverick Ko",
            number: "+639123456789",
            email: "maverick@gmail.com",
            role: "Nurse"
        }
    },
    {
        id: 1002,
        date: "2024-09-25",
        purpose: "Request for Surgical Supplies",
        total: 3500.00,
        status: "Approved",
        signatories: {
            signatory1: { approved: true, name: "Rene Letegio" },
            signatory2: { approved: null, name: "Maverick Ko" },
            signatory3: { approved: true, name: "Paulo Sangreo" }
        },
        items: [
            { name: "Scalpel", quantity: 20, price: 50.00, total: 1000.00 },
            { name: "Surgical Mask", quantity: 200, price: 5.00, total: 1000.00 },
            { name: "Gauze", quantity: 100, price: 3.00, total: 300.00 },
            { name: "Surgical Gloves", quantity: 100, price: 10.00, total: 1000.00 },
        ],
        billing: "Surgical Supply Co.",
        attachments: ["surgical-supplies-order.pdf"],
        requester: {
            name: "Rene Letegio",
            number: "+639987654321",
            email: "rene@gmail.com",
            role: "Nurse"
        }
    },
    {
        id: 1003,
        date: "2024-09-27",
        purpose: "Request for IV Fluids",
        total: 1500.00,
        status: "Rejected",
        signatories: {
            signatory1: { approved: false, name: "Maverick Ko" },
            signatory2: { approved: false, name: "Rene Letegio" },
            signatory3: { approved: null, name: "Paulo Sangreo" }
        },
        items: [
            { name: "Normal Saline", quantity: 50, price: 10.00, total: 500.00 },
            { name: "Lactated Ringer's Solution", quantity: 50, price: 20.00, total: 1000.00 }
        ],
        billing: "Hospital Supplies Inc.",
        attachments: ["iv-fluids-order.pdf"],
        requester: {
            name: "Paulo Sangreo",
            number: "+639852147963",
            email: "paulo@gmail.com",
            role: "Pharmacist"
        }
    },
    {
        id: 1004,
        date: "2024-09-30",
        purpose: "Order Additional Bandages",
        total: 800.00,
        status: "Pending",
        signatories: {
            signatory1: { approved: null, name: "Maverick Ko" },
            signatory2: { approved: null, name: "Rene Letegio" },
            signatory3: { approved: null, name: "Paulo Sangreo" }
        },
        items: [
            { name: "Adhesive Bandages", quantity: 100, price: 2.00, total: 200.00 },
            { name: "Gauze Bandages", quantity: 300, price: 1.50, total: 450.00 },
            { name: "Elastic Bandages", quantity: 20, price: 15.00, total: 300.00 }
        ],
        billing: "Medical Supplies Warehouse",
        attachments: ["bandage-order.pdf"],
        requester: {
            name: "Maverick Ko",
            number: "+639123456789",
            email: "maverick@gmail.com",
            role: "Nurse"
        }
    }
    // You can continue to add more requisition objects as needed
];


// Global variable to store filtered requisitions
let filteredRequisitions = requisitions;

// Initial population of requisition list
document.addEventListener("DOMContentLoaded", () => {
    populateRequisitionList(filteredRequisitions);
    document.getElementById('signatoryName').innerText = "Maverick Ko"; // Example signatory name
});

// Function to populate requisition cards
function populateRequisitionList(requisitionsToDisplay) {
    const cardsContainer = document.getElementById('requisition-cards');
    cardsContainer.innerHTML = ""; // Clear existing cards

    requisitionsToDisplay.forEach(req => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => viewDetails(req.id); // Open details on card click

        // Set button visibility based on status
        let approveButtonHTML = '';
        let rejectButtonHTML = '';

        if (req.status === 'Pending') {
            approveButtonHTML = `<button class="approve" onclick="approveRequisition(${req.id}); event.stopPropagation();">Approve</button>`;
            rejectButtonHTML = `<button class="reject" onclick="rejectRequisition(${req.id}); event.stopPropagation();">Reject</button>`;
        } else if (req.status === 'Approved') {
            approveButtonHTML = `<button class="approve" disabled>Approved</button>`;
        } else if (req.status === 'Rejected') {
            rejectButtonHTML = `<button class="reject" disabled>Rejected</button>`;
        }

        // Apply specific colors based on role, but uniform box size
        let roleColor = '';
        if (req.requester.role === 'Nurse') {
            roleColor = 'background-color: #e7f3ff; color: #007bff; border: 2px solid #007bff;'; // Blue for Nurse
        } else if (req.requester.role === 'Pharmacist') {
            roleColor = 'background-color: #e6ffe6; color: #28a745; border: 2px solid #28a745;'; // Green for Pharmacist
        }

        // Uniform box size and styling, with dynamic color for each role
        const roleStyle = `style="${roleColor} font-weight: bold; padding: 12px 20px; border-radius: 8px; font-size: 14px;"`;

        card.innerHTML = `
            <div class="card-row">
                <p><strong>ID:</strong> ${req.id}</p>
                <p><span class="role" ${roleStyle}>${req.requester.role}</span></p> <!-- Uniform size for role box -->
            </div>
            <hr>
            <div class="card-row">
                <div>
                    <p><strong>Name:</strong> ${req.requester.name}</p>
                    <p><strong>Number:</strong> ${req.requester.number}</p>
                </div>
                <div>
                    <p><strong>Date Requested:</strong> ${req.date}</p>
                    <p><strong>Email:</strong> ${req.requester.email}</p>
                </div>
            </div>
            <hr>
            <p><strong>Purpose:</strong> ${req.purpose}</p>
            <p><strong>Total (₱):</strong> ${req.total.toFixed(2)}</p>
            <hr>
            <div class="button-group">
                ${approveButtonHTML}
                ${rejectButtonHTML}
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}




// Function to approve a requisition
function approveRequisition(reqId) {
    const req = requisitions.find(r => r.id === reqId);
    if (req) {
        req.status = 'Approved';
        populateRequisitionList(filteredRequisitions); // Refresh list
    }
}

// Function to reject a requisition
function rejectRequisition(reqId) {
    const req = requisitions.find(r => r.id === reqId);
    if (req) {
        req.status = 'Rejected';
        populateRequisitionList(filteredRequisitions); // Refresh list
    }
}

function viewDetails(requisitionId) {
    // Fetch requisition details from the server
    fetch(`/requisitions/${requisitionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch requisition details');
            }
            return response.json();
        })
        .then(data => {
            // Create items table HTML
            const itemsTable = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 8px;">Item Name</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Quantity</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Price (₱)</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">Total (₱)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td style="border: 1px solid #ccc; padding: 8px;">${item.name}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${item.quantity}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${item.price.toFixed(2)}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Create attachments list HTML
            const attachmentsList = data.attachments.length > 0
                ? `<ul>
                        ${data.attachments.map(attachment => `
                            <li><a href="${attachment.file_path}" target="_blank">${attachment.file_name}</a></li>
                        `).join('')}
                   </ul>`
                : '<p>No attachments found.</p>';

            // Populate requisition details in the modal
            document.getElementById('details-content').innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <h3>Requisition No.: ${data.requisition.id}</h3>
                        <p><strong>Name:</strong> ${data.requisition.requested_by}</p>
                        <p><strong>Date Requested:</strong> ${new Date(data.requisition.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p><strong>Purpose:</strong> ${data.requisition.purpose}</p>
                        <p><strong>Company Name:</strong> ${data.requisition.company_name}</p>
                        <p><strong>Total (₱):</strong> ${data.total.toFixed(2)}</p>
                    </div>
                </div>
                <hr>
                <h4>Items:</h4>
                ${itemsTable}
                <h4>Attachments:</h4>
                ${attachmentsList}
            `;
            // Display the modal
            document.getElementById('details-modal').style.display = 'block';
        })
        .catch(error => {
            Swal.fire('Error', 'Failed to fetch requisition details. Please try again later.', 'error');
        });
}



// Function to close details modal
function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Function to filter requisitions by status
function filterByStatus(status) {
    // Get all tab links
    const tabLinks = document.querySelectorAll('.tab__item a');

    // Remove the 'is-activated' class from all links
    tabLinks.forEach(link => link.classList.remove('is-activated'));

    // Add 'is-activated' class to the clicked link
    const activeLink = document.querySelector(`a[href="#${status}"]`);
    if (activeLink) {
        activeLink.classList.add('is-activated');
    }

    // Filter requisitions based on the selected status
    if (status === 'all') {
        filteredRequisitions = requisitions;
    } else {
        filteredRequisitions = requisitions.filter(req => req.status.toLowerCase() === status.toLowerCase());
    }

    populateRequisitionList(filteredRequisitions); // Refresh list
}

