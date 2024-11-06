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
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}


function openModal() {
    document.getElementById('manage-requisition-modal').style.display = 'block';
    document.getElementById('requisition-id').textContent = currentRequisitionId; // Display the ID
    document.getElementById('date').value = getCurrentDate(); // Set the date in the modal
    currentRequisitionId++; // Increment for the next requisition
}

function closeModal() {
    document.getElementById('manage-requisition-modal').style.display = 'none';
}

function addItem() {
    const table = document.getElementById('items-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(table.rows.length);
    newRow.innerHTML = `
        <td><input type="text" name="item-name[]" placeholder="Item Name"></td>
        <td><input type="number" name="item-quantity[]" placeholder="Quantity" class="item-quantity" oninput="calculateTotal(this)"></td>
        <td><input type="number" name="item-price[]" placeholder="Price per unit" class="item-price" oninput="calculateTotal(this)"></td>
        <td><input type="text" name="item-total[]" placeholder="Total" class="item-total" readonly></td>
        <td><button type="button" onclick="removeItem(this)">Remove</button></td>
    `;
}

function removeItem(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function calculateTotal(input) {
    let row = input.parentNode.parentNode;
    let quantity = row.getElementsByClassName('item-quantity')[0].value;
    let price = row.getElementsByClassName('item-price')[0].value;
    let total = row.getElementsByClassName('item-total')[0];
    total.value = (quantity * price).toFixed(2); // Calculates total and fixes to 2 decimal places
}

document.addEventListener('DOMContentLoaded', function() {
    const initialInputs = document.querySelectorAll('.item-quantity, .item-price');
    initialInputs.forEach(input => {
        input.oninput = () => calculateTotal(input);
    });
});

function calculateTotal(input) {
    let row = input.parentNode.parentNode;
    let quantity = row.getElementsByClassName('item-quantity')[0].value;
    let price = row.getElementsByClassName('item-price')[0].value;
    let total = row.getElementsByClassName('item-total')[0];
    
    // Calculate the total for this row
    total.value = (quantity * price).toFixed(2);
    
    // Update the overall total
    updateTotalPrice();
}

function updateTotalPrice() {
    let totalPrice = 0;
    
    // Get all the item total fields
    const totals = document.querySelectorAll('.item-total');
    
    // Sum the values of all item totals
    totals.forEach(total => {
        let value = parseFloat(total.value) || 0;  // Convert to number, default to 0 if empty
        totalPrice += value;
    });
    
    // Set the overall total price
    document.getElementById('total-price').value = totalPrice.toFixed(2);
}

function addItem() {
    const table = document.getElementById('items-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(table.rows.length);
    newRow.innerHTML = `
        <td><input type="text" name="item-name[]" placeholder="Item Name"></td>
        <td><input type="number" name="item-quantity[]" placeholder="Quantity" class="item-quantity" oninput="calculateTotal(this)"></td>
        <td><input type="number" name="item-price[]" placeholder="Price per unit" class="item-price" oninput="calculateTotal(this)"></td>
        <td><input type="text" name="item-total[]" placeholder="Total" class="item-total" readonly></td>
        <td><button type="button" onclick="removeItem(this)">Remove</button></td>
    `;
}


function searchRequisitions() {
    // Get the search input and table elements
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const table = document.getElementById('requisition-list');
    const rows = table.getElementsByTagName('tr');

    // Loop through all table rows, excluding the first (header)
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let rowText = row.textContent.toLowerCase();

        // If row text includes the search input, show the row; otherwise, hide it
        if (rowText.includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

function filterRequisitions() {
    const filterId = document.getElementById('filter-id').value.toLowerCase();
    const filterStartDate = new Date(document.getElementById('filter-start-date').value);
    const filterEndDate = new Date(document.getElementById('filter-end-date').value);
    const filterStatus = document.getElementById('filter-status').value.toLowerCase();
    const filterDetails = document.getElementById('filter-details').value.toLowerCase();

    const rows = document.querySelectorAll('#requisition-list tbody tr');

    rows.forEach(row => {
        const requisitionId = row.getAttribute('data-id');
        const dateCell = row.cells[1].textContent; // Assuming date is in the second cell
        const statusCell = row.cells[6].textContent.toLowerCase(); // Assuming status is in the seventh cell
        const detailsCell = row.cells[4].textContent.toLowerCase(); // Assuming details are in the fifth cell
        
        const rowDate = new Date(dateCell);

        const matchesId = requisitionId.includes(filterId);
        const matchesStatus = filterStatus ? statusCell.includes(filterStatus) : true;
        const matchesDetails = detailsCell.includes(filterDetails);
        const matchesDate = (!filterStartDate || rowDate >= filterStartDate) && (!filterEndDate || rowDate <= filterEndDate);

        // Show or hide the row based on all filters
        if (matchesId && matchesStatus && matchesDetails && matchesDate) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
