let currentRequisitionId = 1001; // Starting ID (modify as needed)

// Fetch Requisition Data from the server
async function fetchRequisition() {
    try {
        const response = await fetch('/requisitions');
        if (!response.ok) throw new Error('Failed to fetch requisitions');
        const data = await response.json();
        renderRequisition(data.requisitions);
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

function renderRequisition(requisitions) {
    const requisitionList = document.getElementById('requisition-list');
    requisitionList.innerHTML = '';

    requisitions.forEach(requisition => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${requisition.id}</td>
            <td>${requisition.purpose}</td>
            <td>${requisition.billing}</td>
            <td>${requisition.total}</td>
            <td><button onclick="viewDetails(${requisition.id})">View Details</button></td>
        `;
        requisitionList.appendChild(row);
    });
}

// Save a New Requisition
async function saveRequisition(event) {
    event.preventDefault();
    
    const form = document.getElementById('requisition-form');
    const items = Array.from(form.querySelectorAll('tbody tr')).map(row => ({
        name: row.querySelector('input[name="item-name[]"]').value,
        quantity: parseFloat(row.querySelector('input[name="item-quantity[]"]').value) || 0,
        price: parseFloat(row.querySelector('input[name="item-price[]"]').value) || 0
    })).filter(item => item.name); // Filter out items with empty names

    const requisitionData = {
        date: form.date.value, // Make sure to include the date
        purpose: form.purpose.value,
        billing: form.billing.value,
        total: parseFloat(form['total-price'].value) || 0,
        items: items
    };

    try {
        const response = await fetch('/requisition', { // Ensure this matches your Flask route
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requisitionData)
        });

        if (!response.ok) throw new Error('Failed to save requisition');
        showSuccessMessage('Requisition saved successfully!');
        fetchRequisition(); // Refresh the list
        closeModal(); // Close modal after saving
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

// View Details of a Specific Requisition
function viewDetails(requisitionId) {
    // Fetch requisition details from the Flask route
    fetch(`/requisitions/${requisitionId}`)
        .then(response => response.json())  // Ensure this matches the Flask route and returns JSON
        .then(data => {
            
            // Populate modal content
            document.getElementById('details-content').innerHTML = `
                <p><strong>ID:</strong> ${data.requisition.id}</p>
                <p><strong>Date:</strong> ${data.requisition.date}</p>
                <p><strong>Purpose:</strong> ${data.requisition.purpose}</p>
                <p><strong>Billing:</strong> ${data.requisition.billing}</p>
                <p><strong>Total:</strong> ₱${data.requisition.total}</p>
                <p><strong>Status:</strong> ${data.requisition.status}</p>
                <!-- Add more details as needed -->
                <h3>Items Requested:</h3>
            `;
            // Open the modal
            openDetailsModal();
        })
        .catch(error => {
            console.error('Error fetching requisition details:', error);
        });
}

function openDetailsModal() {
    document.getElementById('details-modal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Toggle modal visibility
function toggleModal(modalId, display) {
    const modal = document.getElementById(modalId);
    modal.style.display = display ? 'block' : 'none';
}

// Open modal for managing requisition
function openModal() {
    toggleModal('manage-requisition-modal', true);
    document.getElementById('requisition-id').textContent = currentRequisitionId; // Display the ID
    document.getElementById('date').value = getCurrentDate(); // Set the date in the modal
}

// Close modal
function closeModal() {
    toggleModal('manage-requisition-modal', false);
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Add new item row in the table
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

// Remove an item row from the table
function removeItem(button) {
    const row = button.closest('tr');
    row.parentNode.removeChild(row);
    updateTotalPrice(); // Update the overall total after removing the item
}

// Calculate total for a specific item row
function calculateTotal(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = row.querySelector('.item-total');

    total.value = (quantity * price).toFixed(2); // Calculates total and fixes to 2 decimal places
    updateTotalPrice(); // Update the overall total
}

// Update the overall total price
function updateTotalPrice() {
    const totalPrice = Array.from(document.querySelectorAll('.item-total'))
        .reduce((sum, total) => sum + (parseFloat(total.value) || 0), 0);

    document.getElementById('total-price').value = totalPrice.toFixed(2);
}

// Event listeners and search/filter functions
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.item-quantity, .item-price').forEach(input => {
        input.oninput = () => calculateTotal(input);
    });
});
