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
        attachments: ["vaccine-order.pdf", "invoice-1001.pdf"]
    },
    {
        id: 1002,
        date: "2024-09-22",
        purpose: "Restock Masks",
        total: 500.00,
        status: "Rejected",
        signatories: {
            signatory1: { approved: false, name: "Maverick Ko" },
            signatory2: { approved: false, name: "Rene Letegio" },
            signatory3: { approved: null, name: "Paulo Sangreo" }
        },
        items: [
            { name: "Surgical Mask", quantity: 1000, price: 0.50, total: 500.00 }
        ],
        billing: "ABC Pharmaceuticals",
        attachments: ["mask-requisition.pdf"]
    },
    // Add more requisitions as needed
];

// The currently logged-in signatory's name
const signatoryName = "Maverick Ko";
document.getElementById('signatoryName').innerText = signatoryName; // Display signatory name

// Function to populate the requisition cards with a summary of requisition details
function populateRequisitionList() {
    const cardsContainer = document.getElementById('requisition-cards');
    cardsContainer.innerHTML = ""; // Clear existing cards

    requisitions.forEach(req => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => viewDetails(req.id); // Open details on card click

        // Create a summary of the first 2 items or less
        const itemSummary = req.items.slice(0, 2).map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');
        const moreItems = req.items.length > 2 ? `...+${req.items.length - 2} more` : ''; // If more than 2 items, show a hint

        card.innerHTML = `
            <h3>ID: ${req.id}</h3>
            <p><strong>Date:</strong> ${req.date}</p>
            <p><strong>Purpose:</strong> ${req.purpose}</p>
            <p><strong>Total (₱):</strong> ${req.total.toFixed(2)}</p>
            <p><strong>Items:</strong> ${itemSummary} ${moreItems}</p>
            ${renderButtons(req)}
        `;

        cardsContainer.appendChild(card);
    });
}

// Function to determine if the current signatory needs to take action
function requiresAction(requisition) {
    return Object.values(requisition.signatories).some(signatory => signatory.approved === null);
}

// Function to view requisition details
function viewDetails(id) {
    const requisition = requisitions.find(req => req.id === id);
    const detailsContent = document.getElementById('details-content');
    
    // Create table for items
    let itemsTable = `
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Price (₱)</th>
                    <th>Total (₱)</th>
                </tr>
            </thead>
            <tbody>
                ${requisition.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Create list of attachments
    let attachmentsList = requisition.attachments.length > 0
        ? `
            <ul>
                ${requisition.attachments.map(attachment => `
                    <li><a href="path/to/attachments/${attachment}" target="_blank">${attachment}</a></li>
                `).join('')}
            </ul>
        `
        : '<p>No attachments available.</p>';

    detailsContent.innerHTML = `
        <h3>Requisition ID: ${requisition.id}</h3>
        <p><strong>Date:</strong> ${requisition.date}</p>
        <p><strong>Purpose:</strong> ${requisition.purpose}</p>
        <h4>Items:</h4>
        ${itemsTable}
        <p><strong>Total (₱):</strong> ${requisition.total.toFixed(2)}</p>
        <h4>Billing:</h4>
        <p>${requisition.billing}</p>
        <h4>Attachments:</h4>
        ${attachmentsList}
    `;
    
    document.getElementById('details-modal').style.display = "block"; // Show the modal
}

// Function to close the modal
function closeDetailsModal() {
    document.getElementById('details-modal').style.display = "none";
}

// Function to approve a requisition
function approveRequisition(id) {
    const requisition = requisitions.find(req => req.id === id);
    requisition.signatories.signatory1.approved = true; // Update the signatory's approval status
    populateRequisitionList(); // Refresh the list
}

// Function to trigger rejection of a requisition
function triggerRejection(id) {
    const requisition = requisitions.find(req => req.id === id);
    requisition.signatories.signatory1.approved = false; // Update the signatory's approval status
    populateRequisitionList(); // Refresh the list
}

// Function to render buttons and stop propagation
function renderButtons(req) {
    const signatory = req.signatories.signatory1; // Assuming we only check one signatory for now
    let buttonsHtml = "";

    if (signatory.approved === null) {
        // Pending approval
        buttonsHtml += `
            <button class="approve" onclick="approveRequisition(${req.id}); event.stopPropagation();">Approve</button>
            <button class="reject" onclick="triggerRejection(${req.id}); event.stopPropagation();">Reject</button>
        `;
    } else if (signatory.approved === true) {
        // Approved
        buttonsHtml += `
            <button class="approve" style="background-color: green; cursor: not-allowed;" disabled>Approved</button>
        `;
    } else if (signatory.approved === false) {
        // Rejected
        buttonsHtml += `
            <button class="reject" style="background-color: red; cursor: not-allowed;" disabled>Rejected</button>
        `;
    }

    return buttonsHtml;
}

// Initial population of requisition cards
populateRequisitionList();


// Function to determine if the current signatory needs to take action
function requiresAction(requisition) {
    return Object.values(requisition.signatories).some(signatory => signatory.approved === null);
}

// Function to view requisition details
function viewDetails(id) {
    const requisition = requisitions.find(req => req.id === id);
    const detailsContent = document.getElementById('details-content');
    
    // Create table for items
    let itemsTable = `
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Price (₱)</th>
                    <th>Total (₱)</th>
                </tr>
            </thead>
            <tbody>
                ${requisition.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Create list of attachments
    let attachmentsList = requisition.attachments.length > 0
        ? `
            <ul>
                ${requisition.attachments.map(attachment => `
                    <li><a href="path/to/attachments/${attachment}" target="_blank">${attachment}</a></li>
                `).join('')}
            </ul>
        `
        : '<p>No attachments available.</p>';

    detailsContent.innerHTML = `
        <h3>Requisition ID: ${requisition.id}</h3>
        <p><strong>Date:</strong> ${requisition.date}</p>
        <p><strong>Purpose:</strong> ${requisition.purpose}</p>
        <h4>Items:</h4>
        ${itemsTable}
        <p><strong>Total (₱):</strong> ${requisition.total.toFixed(2)}</p>
        <h4>Billing:</h4>
        <p>${requisition.billing}</p>
        <h4>Attachments:</h4>
        ${attachmentsList}
    `;
    
    document.getElementById('details-modal').style.display = "block"; // Show the modal
}



// Function to close the modal
function closeDetailsModal() {
    document.getElementById('details-modal').style.display = "none";
}

// Function to approve a requisition
function approveRequisition(id) {
    const requisition = requisitions.find(req => req.id === id);
    requisition.signatories.signatory1.approved = true; // Update the signatory's approval status
    populateRequisitionList(); // Refresh the list
}

// Function to trigger rejection of a requisition
function triggerRejection(id) {
    const requisition = requisitions.find(req => req.id === id);
    requisition.signatories.signatory1.approved = false; // Update the signatory's approval status
    populateRequisitionList(); // Refresh the list
}

// Function to filter requisitions based on search and status
function filterRequisitions() {
    const filterId = document.getElementById('filter-id').value.toLowerCase();
    const filterDate = document.getElementById('filter-date').value;
    const filterDetails = document.getElementById('filter-details').value.toLowerCase();
    
    const filteredRequisitions = requisitions.filter(req => {
        return (req.id.toString().includes(filterId) || filterId === "") &&
               (req.date.includes(filterDate) || filterDate === "") &&
               (req.items.some(item => item.name.toLowerCase().includes(filterDetails)) || filterDetails === "");
    });

    populateFilteredRequisitionList(filteredRequisitions);
}

// Function to filter requisitions by approval status and update the active tab
function filterByStatus(status) {
    // Get all tab elements
    const tabs = document.querySelectorAll('.tab__item a');
    
    // Remove 'is-activated' class from all tabs
    tabs.forEach(tab => tab.classList.remove('is-activated'));

    // Add 'is-activated' class to the clicked tab based on status
    switch (status) {
        case 'all':
            document.querySelector('.tab__item a[href="#all"]').classList.add('is-activated');
            break;
        case 'pending':
            document.querySelector('.tab__item a[href="#pending"]').classList.add('is-activated');
            break;
        case 'approved':
            document.querySelector('.tab__item a[href="#approved"]').classList.add('is-activated');
            break;
        case 'rejected':
            document.querySelector('.tab__item a[href="#rejected"]').classList.add('is-activated');
            break;
    }

    // Filter requisitions based on the selected status
    const filteredRequisitions = requisitions.filter(req => {
        if (status === 'pending') return requiresAction(req);
        if (status === 'approved') return Object.values(req.signatories).every(signatory => signatory.approved === true);
        if (status === 'rejected') return Object.values(req.signatories).some(signatory => signatory.approved === false);
        return true; // Show all for 'all' status
    });

    populateFilteredRequisitionList(filteredRequisitions);
}



// Function to populate filtered requisition list
function populateRequisitionList() {
    const cardsContainer = document.getElementById('requisition-cards');
    cardsContainer.innerHTML = ""; // Clear existing cards

    requisitions.forEach(req => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => viewDetails(req.id); // Open details on card click

        card.innerHTML = `
            <h3>ID: ${req.id} - Role: Admin</h3>
            <hr>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Date Requested:</strong> ${req.date}</p>
            <p><strong>Number:</strong> +1234567890</p>
            <p><strong>Email:</strong> john.doe@example.com</p>
            <hr>
            <p><strong>Purpose:</strong> ${req.purpose}</p>
            <p><strong>Total (₱):</strong> ${req.total.toFixed(2)}</p>
            <hr>
            ${renderButtons(req)}
        `;

        cardsContainer.appendChild(card);
    });
}

// Function to render buttons and stop propagation
function renderButtons(req) {
    const signatory = req.signatories.signatory1; // Assuming we only check one signatory for now
    let buttonsHtml = "";

    if (signatory.approved === null) {
        // Pending approval
        buttonsHtml += `
            <button class="approve" onclick="approveRequisition(${req.id}); event.stopPropagation();">Approve</button>
            <button class="reject" onclick="triggerRejection(${req.id}); event.stopPropagation();">Reject</button>
        `;
    } else if (signatory.approved === true) {
        // Approved
        buttonsHtml += `
            <button class="approve" style="background-color: green; cursor: not-allowed;" disabled>Approved</button>
        `;
    } else if (signatory.approved === false) {
        // Rejected
        buttonsHtml += `
            <button class="reject" style="background-color: red; cursor: not-allowed;" disabled>Rejected</button>
        `;
    }

    return buttonsHtml;
}   


