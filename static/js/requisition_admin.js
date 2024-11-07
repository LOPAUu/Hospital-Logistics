let currentRequisitionId = 1001; // Starting ID (modify as needed)

// Format number as currency
const formatCurrency = amount => '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Fetch Requisition Data - No database fetch now
async function fetchRequisition() {
    // Replace the server call with mock data
    const requisitions = [
        { id: 1, purpose: 'Office Supplies', billing: '12345', total: 100.00 },
        { id: 2, purpose: 'Medical Supplies', billing: '67890', total: 150.00 },
        { id: 3, purpose: 'Furniture', billing: '11223', total: 300.00 }
    ];
    renderRequisition(requisitions); // Use mock data directly
}

// Render requisition list with formatted currency in ascending order
function renderRequisition(requisitions) {
    // Sort requisitions in ascending order by id
    requisitions.sort((a, b) => a.id - b.id);

    const requisitionList = document.getElementById('requisition-list');
    requisitionList.innerHTML = requisitions.map(requisition => `
        <tr>
            <td>${requisition.id}</td>
            <td>${requisition.purpose}</td>
            <td>${requisition.billing}</td>
            <td>${formatCurrency(requisition.total)}</td>
            <td><button onclick="viewDetails(${requisition.id})">View Details</button></td>
        </tr>
    `).join('');
}

// Save a New Requisition - No server POST now
async function saveRequisition(event) {
    event.preventDefault();
    
    const form = document.getElementById('requisition-form');
    const items = getItemsFromForm(form);
    const total = parseFloat(document.getElementById('total-price').value) || 0;

    const requisitionData = {
        date: form.date.value,
        purpose: form.purpose.value,
        billing: form.billing.value,
        total,
        items
    };

    // Log mock data instead of saving to the database
    console.log('Saving Requisition:', requisitionData);
    showSuccessMessage('Requisition saved successfully!');
    fetchRequisition(); // Refresh the list with mock data
    closeModal(); // Close modal after saving
    location.reload(); // Automatically refresh the page
}


// Helper function to get items from the form
function getItemsFromForm(form) {
    return Array.from(form.querySelectorAll('tbody tr')).map(row => ({
        name: row.querySelector('input[name="item-name[]"]').value,
        quantity: parseFloat(row.querySelector('input[name="item-quantity[]"]').value) || 0,
        price: parseFloat(row.querySelector('input[name="item-price[]"]').value) || 0
    })).filter(item => item.name); // Filter out items with empty names
}

// View requisition details with formatted item prices and total
function viewDetails(requisitionId) {
    // Replace database fetch with mock data
    const requisition = { id: requisitionId, date: '2024-11-06', purpose: 'Office Supplies', billing: '12345', status: 'Approved' };
    const items = [
        { name: 'Item 1', quantity: 2, price: 50.00 },
        { name: 'Item 2', quantity: 1, price: 100.00 }
    ];

    document.getElementById('details-content').innerHTML = `
        <p><strong>ID:</strong> ${requisition.id}</p>
        <p><strong>Date:</strong> ${new Date(requisition.date).toLocaleDateString()}</p>
        <p><strong>Purpose:</strong> ${requisition.purpose}</p>
        <p><strong>Billing:</strong> ${requisition.billing}</p>
        <p><strong>Status:</strong> ${requisition.status}</p>
        <h3>Items Requested:</h3>
        <ul>
            ${items.map(item => `
                <li>${item.name} - Qty: ${item.quantity}, Price: ${formatCurrency(item.price)}, Total: ${formatCurrency(item.quantity * item.price)}</li>
            `).join('')}
        </ul>
    `;
    openDetailsModal();
}

// Modal handling functions
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
    fetchRequisition(); // Initialize with mock data
    document.querySelectorAll('.item-quantity, .item-price').forEach(input => {
        input.oninput = () => calculateTotal(input);
    });
});
