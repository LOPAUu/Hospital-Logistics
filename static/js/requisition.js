function viewDetails(id) {
    // Fetch and display details for the requisition with the given id
    console.log("Viewing details for requisition ID:", id);

    // Assuming requisitions is an array of requisition objects accessible here
    const requisition = requisitions.find(req => req.id === id);

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
        console.error("Details not found for requisition ID:", id);
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

let currentRequisitionId = 1003; // Starting ID (modify as needed)

function openModal() {
    document.getElementById('manage-requisition-modal').style.display = 'block';
    document.getElementById('requisition-id').textContent = currentRequisitionId; // Display the ID
    document.getElementById('date').value = getCurrentDate(); // Automatically set the current date
    currentRequisitionId++; // Increment for the next requisition
}

function closeModal() {
    document.getElementById('manage-requisition-modal').style.display = 'none';
}

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to delete a requisition
function deleteRequisition(id) {
    if (confirm('Are you sure you want to delete this requisition?')) {
        fetch(`/delete_requisition/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert('Requisition deleted successfully.');
                location.reload(); // Reload the page to see changes
            } else {
                alert('Failed to delete requisition.');
            }
        })
        .catch(error => console.error('Error deleting requisition:', error));
}      

// Function to open the update modal and populate it with existing data
function openUpdateModal(id) {
    fetch(`/get_requisition/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('requisition-id').innerText = data.id;
            document.getElementById('date').value = data.date;
            document.getElementById('purpose').value = data.purpose;
            document.getElementById('billing').value = data.billing;
            document.getElementById('shipping').value = data.shipping;
            document.getElementById('items').value = data.items;
            document.getElementById('details').value = data.details;
            openModal(); // Open the modal for updating requisition
        })
        .catch(error => console.error('Error fetching requisition:', error));
}

// Function to handle the form submission for updating a requisition
document.getElementById('requisition-form').onsubmit = function(event) {
    event.preventDefault(); // Prevent the default form submission

    const requisitionId = document.getElementById('requisition-id').innerText;
    const formData = new FormData(this); // Get form data

    fetch(`/update_requisition/${requisitionId}`, {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            alert('Requisition updated successfully.');
            location.reload(); // Reload the page to see changes
        } else {
            alert('Failed to update requisition.');
        }
    })
    .catch(error => console.error('Error updating requisition:', error));
}   
}