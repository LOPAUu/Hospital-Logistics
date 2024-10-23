let currentRequisitionId = 1001; // Starting ID (modify as needed)

// Fetch Requisition Data from the server
async function fetchRequisition() {
    try {
        const response = await fetch('/api/requisitions'); // Adjust the endpoint as needed
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const requisitions = await response.json();
        renderRequisition(requisitions);
    } catch (error) {
        showError('Failed to fetch requisitions: ' + error.message);
    }
}

// Render Requisition List in the Table
function renderRequisition(requisitions) {
    const tbody = document.querySelector('#requisition-list tbody');
    tbody.innerHTML = ''; // Clear existing entries

    requisitions.forEach(requisition => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${requisition.id}</td>
            <td>${requisition.date}</td>
            <td>${requisition.purpose}</td>
            <td>${requisition.billing}</td>
            <td><button onclick="viewDetails(${requisition.id})">View</button></td>
            <td>${requisition.total}</td>
            <td>${requisition.status}</td>
        `;
        tbody.appendChild(row);
    });
}

// Save a New Requisition
async function saveRequisition(event) {
    event.preventDefault(); // Prevent default form submission

    const form = document.getElementById('requisition-form');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/requisitions', { // Adjust the endpoint as needed
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to save requisition');
        }
        
        showSuccessMessage('Requisition saved successfully!');
        fetchRequisition(); // Refresh the requisition list
        closeModal(); // Close the modal after saving
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

// View Details of a Specific Requisition
async function viewDetails(requisitionId) {
    try {
        const response = await fetch(`/api/requisitions/${requisitionId}`); // Adjust the endpoint as needed
        if (!response.ok) {
            throw new Error('Failed to fetch requisition details');
        }

        const requisition = await response.json();
        const detailsContent = document.getElementById('details-content');
        detailsContent.innerHTML = `
            <p><strong>ID:</strong> ${requisition.id}</p>
            <p><strong>Date:</strong> ${requisition.date}</p>
            <p><strong>Purpose:</strong> ${requisition.purpose}</p>
            <p><strong>Billing:</strong> ${requisition.billing}</p>
            <p><strong>Total:</strong> ₱${requisition.total}</p>
            <p><strong>Status:</strong> ${requisition.status}</p>
            <p><strong>Items:</strong></p>
            <ul>
                ${requisition.items.map(item => `<li>${item.name} - ${item.quantity} @ ₱${item.price} each</li>`).join('')}
            </ul>
        `;
        document.getElementById('details-modal').style.display = 'block'; // Show the details modal
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

function getStatusClass(status) {
    return status === "Rejected" ? "status-rejected" : status === "Approved" ? "status-approved" : "status-pending";
}

function getApprovalStatus(approved) {
    return approved === null ? "Pending" : approved ? "Approved" : "Rejected";
}

function getStatus(signatory1, signatory2, signatory3) {
    if ([signatory1.approved, signatory2.approved, signatory3.approved].includes(false)) {
        return "Rejected";
    }
    return [signatory1.approved, signatory2.approved, signatory3.approved].every(Boolean) ? "Approved" : "Pending";
}

function toggleModal(modalId, display) {
    document.getElementById(modalId).style.display = display ? 'block' : 'none';
}

function openDetailsModal() {
    toggleModal('details-modal', true);
}

function closeDetailsModal() {
    toggleModal('details-modal', false);
}

function openModal() {
    toggleModal('manage-requisition-modal', true);
    document.getElementById('requisition-id').textContent = currentRequisitionId; // Display the ID
    document.getElementById('date').value = getCurrentDate(); // Set the date in the modal
}

function closeModal() {
    toggleModal('manage-requisition-modal', false);
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

function addItem() {
    const table = document.getElementById('items-table').querySelector('tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" name="item-name[]" placeholder="Item Name"></td>
        <td><input type="number" name="item-quantity[]" placeholder="Quantity" class="item-quantity" oninput="calculateTotal(this)"></td>
        <td><input type="number" name="item-price[]" placeholder="Price per unit" class="item-price" oninput="calculateTotal(this)"></td>
        <td><input type="text" name="item-total[]" placeholder="Total" class="item-total" readonly></td>
        <td><button type="button" onclick="removeItem(this)">Remove</button></td>
    `;
}

function removeItem(button) {
    const row = button.closest('tr');
    row.parentNode.removeChild(row);
    updateTotalPrice(); // Update the overall total after removing the item
}

function calculateTotal(input) {
    const row = input.closest('tr');
    const quantity = row.querySelector('.item-quantity').value;
    const price = row.querySelector('.item-price').value;
    const total = row.querySelector('.item-total');
    
    total.value = (quantity * price).toFixed(2); // Calculates total and fixes to 2 decimal places
    updateTotalPrice(); // Update the overall total
}

function updateTotalPrice() {
    let totalPrice = Array.from(document.querySelectorAll('.item-total'))
        .reduce((sum, total) => sum + (parseFloat(total.value) || 0), 0);

    document.getElementById('total-price').value = totalPrice.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.item-quantity, .item-price').forEach(input => {
        input.oninput = () => calculateTotal(input);
    });
});

function searchRequisitions() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const rows = document.querySelectorAll('#requisition-list tbody tr');

    rows.forEach((row, i) => {
        if (i === 0) return; // Skip header row
        row.style.display = row.textContent.toLowerCase().includes(searchInput) ? '' : 'none';
    });
}

function filterRequisitions() {
    const filterId = document.getElementById('filter-id').value.toLowerCase();
    const filterStartDate = new Date(document.getElementById('filter-start-date').value);
    const filterEndDate = new Date(document.getElementById('filter-end-date').value);
    const filterStatus = document.getElementById('filter-status').value.toLowerCase();
    const filterDetails = document.getElementById('filter-details').value.toLowerCase();
    
    const rows = document.querySelectorAll('#requisition-list tbody tr');

    rows.forEach(row => {
        const requisitionId = row.cells[0].textContent; // Assuming ID is in the first cell
        const dateCell = new Date(row.cells[1].textContent); // Assuming date is in the second cell
        const statusCell = row.cells[6].textContent.toLowerCase(); // Assuming status is in the seventh cell
        const detailsCell = row.cells[4].textContent.toLowerCase(); // Assuming details are in the fifth cell
        
        const matchesId = requisitionId.includes(filterId);
        const matchesStatus = filterStatus ? statusCell.includes(filterStatus) : true;
        const matchesDetails = detailsCell.includes(filterDetails);
        const matchesDate = (filterStartDate && dateCell < filterStartDate) || (filterEndDate && dateCell > filterEndDate) ? false : true;

        row.style.display = matchesId && matchesStatus && matchesDetails && matchesDate ? '' : 'none';
    });
}
