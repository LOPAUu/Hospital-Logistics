function viewDetails(requisitionId) {
    const requisitions = {
        1001: {
            purpose: "Order More Vaccines",
            billing: "Mercury Drugs collab",
            shipping: "ilalim ng puno ng saging",
            items: "Vaccines: 50 units",
            additionalInfo: "Description, Quantity, Price details here.",
            signatory1: { approved: true, name: "Maverick Ko" },
            signatory2: { approved: null, name: "Rene Letegio" },
            signatory3: { approved: null, name: "Paulo Sangreo" }
        },
        1002: {
            purpose: "Restock Masks",
            billing: "ABC Pharmaceuticals",
            shipping: "Warehouse #3",
            items: "Masks: 1000 units",
            additionalInfo: "Order of 1000 surgical masks.",
            signatory1: { approved: true, name: "Maverick Ko" },
            signatory2: { approved: false, name: "Rene Letegio" },
            signatory3: { approved: null, name: "Paulo Sangreo" }
        }
    };

    const requisition = requisitions[requisitionId];

    if (requisition) {
        const status = getStatus(requisition.signatory1, requisition.signatory2, requisition.signatory3);

        const statusClass = getStatusClass(status); // Get the CSS class for the status

        const approvalDetails = `
            <p><strong>Signatory 1 (${requisition.signatory1.name}):</strong> ${getApprovalStatus(requisition.signatory1.approved)}</p>
            <p><strong>Signatory 2 (${requisition.signatory2.name}):</strong> ${getApprovalStatus(requisition.signatory2.approved)}</p>
            <p><strong>Signatory 3 (${requisition.signatory3.name}):</strong> ${getApprovalStatus(requisition.signatory3.approved)}</p>
        `;

        const content = `
            <p><strong>Purpose:</strong> ${requisition.purpose}</p>
            <p><strong>Billing:</strong> ${requisition.billing}</p>
            <p><strong>Shipping:</strong> ${requisition.shipping}</p>
            <p><strong>Items Requested:</strong> ${requisition.items}</p>
            <p><strong>Additional Info:</strong> ${requisition.additionalInfo}</p>
            <p><strong>Status:</strong> <span class="${statusClass}">${status}</span></p>
            ${approvalDetails}
        `;

        document.getElementById('details-content').innerHTML = content;
        openDetailsModal();
    } else {
        console.error("Details not found for requisition ID:", requisitionId);
    }
}

function getStatusClass(status) {
    if (status === "Rejected") {
        return "status-rejected";
    }
    if (status === "Approved") {
        return "status-approved";
    }
    return "status-pending";
}
function getApprovalStatus(approved) {
    if (approved === null) {
        return "Pending";
    } else if (approved) {
        return "Approved";
    } else {
        return "Rejected";
    }
}

function getStatus(signatory1, signatory2, signatory3) {
    if (signatory1.approved === false || signatory2.approved === false || signatory3.approved === false) {
        return "Rejected";
    }
    if (signatory1.approved === true && signatory2.approved === true && signatory3.approved === true) {
        return "Approved";
    }
    return "Pending";
}

function openDetailsModal() {
    document.getElementById('details-modal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}
function openModal() {
    document.getElementById('manage-requisition-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('manage-requisition-modal').style.display = 'none';
}

let currentRequisitionId = 1003; // Starting ID (modify as needed)

function openModal() {
    document.getElementById('manage-requisition-modal').style.display = 'block';
    document.getElementById('requisition-id').textContent = currentRequisitionId; // Display the ID
    currentRequisitionId++; // Increment for the next requisition
}
// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function openModal() {
    document.getElementById('manage-requisition-modal').style.display = 'block';
    document.getElementById('requisition-id').textContent = currentRequisitionId; // Display the ID
    document.getElementById('date').value = getCurrentDate(); // Automatically set the current date
    currentRequisitionId++; // Increment for the next requisition
}

function closeModal() {
    document.getElementById('manage-requisition-modal').style.display = 'none';
}
