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
    requisitionList.innerHTML = requisitions.map(requisition => `
        <tr>
            <td>${requisition.id}</td> 
            <td>${requisition.purpose}</td>
            <td>${requisition.billing}</td>
            <td>${requisition.total}</td>
            <td><button onclick="viewDetails(${requisition.id})">View Details</button></td>
        </tr>
    `).join('');
}

// Save a New Requisition
async function saveRequisition(event) {
    event.preventDefault();
    
    const form = document.getElementById('requisition-form');
    const items = getItemsFromForm(form);

    const requisitionData = {
        date: form.date.value,
        purpose: form.purpose.value,
        billing: form.billing.value,
        total: parseFloat(document.getElementById('total-price').value) || 0,
        items: items
    };

    try {
        const response = await fetch('/requisition', {
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

// Helper function to get items from the form
function getItemsFromForm(form) {
    return Array.from(form.querySelectorAll('tbody tr')).map(row => ({
        name: row.querySelector('input[name="item-name[]"]').value,
        quantity: parseFloat(row.querySelector('input[name="item-quantity[]"]').value) || 0,
        price: parseFloat(row.querySelector('input[name="item-price[]"]').value) || 0
    })).filter(item => item.name); // Filter out items with empty names
}

function viewDetails(requisitionId) {
    // Fetch requisition details from the Flask route
    fetch(`/requisitions/${requisitionId}`)
        .then(response => response.json())
        .then(data => {
            // Populate modal content
            document.getElementById('details-content').innerHTML = `
                <p><strong>ID:</strong> ${data.requisition.id}</p>
                <p><strong>Date:</strong> ${new Date(data.requisition.date).toLocaleDateString()}</p>
                <p><strong>Purpose:</strong> ${data.requisition.purpose}</p>
                <p><strong>Billing:</strong> ${data.requisition.billing}</p>
                <p><strong>Total:</strong> ₱<span id="total-price">${data.total}</span></p>
                <p><strong>Status:</strong> ${data.requisition.status}</p>
                <!-- Add more details as needed -->
                <h3>Items Requested:</h3>
                <ul>
                    ${data.items.map(item => `<li>${item.name} - Qty: ${item.quantity}, Price: ₱${item.price}</li>`).join('')}
                </ul>
            `;
            // Open the modal
            openDetailsModal();
        })
        .catch(error => {
            console.error('Error fetching requisition details:', error);
            // Show a simple error message to the user
            showError('Failed to fetch requisition details. Please try again later.');
        });
}



// Populate the details modal with fetched requisition details
function populateDetailsModal(requisition) {
    document.getElementById('details-content').innerHTML = `
        <p><strong>ID:</strong> ${requisition.id}</p>
        <p><strong>Date:</strong> ${new Date(requisition.date).toLocaleDateString()}</p>
        <p><strong>Purpose:</strong> ${requisition.purpose}</p>
        <p><strong>Billing:</strong> ${requisition.billing}</p>
        <p><strong>Total:</strong> ₱${parseFloat(requisition.total).toFixed(2)}</p>
        <p><strong>Status:</strong> ${requisition.status || 'Not specified'}</p>
        <h3>Items Requested:</h3>
        <ul id="items-requested-list"></ul>
    `;

    const itemsList = document.getElementById('items-requested-list');
    requisition.items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - Qty: ${item.quantity}, Price: ₱${item.price.toFixed(2)}`;
        itemsList.appendChild(listItem);
    });

    openDetailsModal();
}

// Open/close modal functions
function toggleModal(modalId, display) {
    const modal = document.getElementById(modalId);
    modal.style.display = display ? 'block' : 'none';
}

function openModal() {
    toggleModal('manage-requisition-modal', true);
    document.getElementById('requisition-id').textContent = currentRequisitionId; // Display the ID
    document.getElementById('date').value = getCurrentDate(); // Set the date in the modal
}

function closeModal() {
    toggleModal('manage-requisition-modal', false);
}

function openDetailsModal() {
    document.getElementById('details-modal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Error handling function
function showError(message) {
    alert(message); // Placeholder for better error handling
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
