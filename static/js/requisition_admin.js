let currentRequisitionId = 1001; // Starting ID (modify as needed)

// Fetch Requisition Data from the server
async function fetchRequisition() {
    try {
        const response = await fetch('/requisition');  // Fixed endpoint path
        if (!response.ok) throw new Error('Failed to fetch requisitions');
        const data = await response.json();
        renderRequisition(data);  // Adjusted to use 'data' directly, since it returns an array
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Render requisitions to the table
function renderRequisition(requisitions) {
    const requisitionList = document.getElementById('requisition-list');
    requisitionList.innerHTML = requisitions.map(requisition => `
        <tr>
            <td>${requisition.id}</td>
            <td>${requisition.purpose}</td>
            <td>${requisition.company_name}</td> <!-- Changed from billing -->
            <td>${requisition.total}</td>
            <td><button onclick="viewDetails(${requisition.id})">View Details</button></td>
        </tr>
    `).join('');
}



// Function to handle form submission and send requisition data with attachments to Flask
async function saveRequisition(event) {
    event.preventDefault();  // Prevent the default form submission behavior
    
    const form = document.getElementById('requisition-form');
    const requisitionId = document.getElementById('requisition-id').value;  // Get requisition ID
    
    // Create FormData object for both requisition and attachments
    let formData = new FormData();
    formData.append('requisition_id', requisitionId);  // Append requisition ID to FormData
    
    // Collect requisition data from form fields
    const requisitionData = {
        date: form.date.value,
        purpose: form.purpose.value,
        company_name: form.company_name.value,
        items: getItemsFromForm(form)
    };

    // Append requisition data to FormData (as JSON string)
    formData.append('requisition_data', JSON.stringify(requisitionData));
    
    // Get all files selected for attachment
    const files = document.getElementById('attachments').files;
    
    // Append each file to the FormData object
    for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
    }
    
    // Step 1: First save the requisition and items in the backend
    try {
        const requisitionResponse = await fetch('/requisition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requisitionData)
        });

        const requisitionDataResponse = await requisitionResponse.json();

        if (requisitionResponse.ok && requisitionDataResponse.requisition_id) {
            // Step 2: Save attachments only after requisition is saved
            const attachmentResponse = await fetch('/upload_attachments', {
                method: 'POST',
                body: formData
            });

            const attachmentData = await attachmentResponse.json();
            if (attachmentData.message === "Attachments uploaded successfully!") {
                Swal.fire({
                    title: 'Success!',
                    text: 'Requisition and attachments uploaded successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                throw new Error('Error uploading attachments');
            }
        } else {
            throw new Error('Failed to save requisition');
        }

    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Try Again'
        });
    }
}



// Helper function to extract item data from the form
function getItemsFromForm(form) {
    const itemNames = form.querySelectorAll('[name="item-name[]"]');
    const itemQuantities = form.querySelectorAll('[name="item-quantity[]"]');
    const itemPrices = form.querySelectorAll('[name="item-price[]"]');
    const items = [];

    for (let i = 0; i < itemNames.length; i++) {
        items.push({
            name: itemNames[i].value,
            quantity: itemQuantities[i].value,
            price: itemPrices[i].value,
            total: itemQuantities[i].value * itemPrices[i].value
        });
    }

    return items;
}




// Helper function to get items from the form
function getItemsFromForm(form) {
    return Array.from(form.querySelectorAll('tbody tr')).map(row => ({
        name: row.querySelector('input[name="item-name[]"]').value,
        quantity: parseFloat(row.querySelector('input[name="item-quantity[]"]').value) || 0,
        price: parseFloat(row.querySelector('input[name="item-price[]"]').value) || 0,
        total: parseFloat(row.querySelector('.item-total').value) || 0
    })).filter(item => item.name); // Filter out items with empty names
}

// Fetch and view requisition details
function viewDetails(requisitionId) {
    fetch(`/requisitions/${requisitionId}`)
        .then(response => {
            if (!response.ok) {
                console.error('Network response was not ok', response);
                throw new Error('Failed to fetch requisition details');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('details-content').innerHTML = `
                <div class="details-group">
                    <div class="detail-pair">
                        <p><strong>ID:</strong> ${data.requisition.id}</p>
                        <p><strong>Date:</strong> ${new Date(data.requisition.date).toLocaleDateString()}</p>
                    </div>
                    <div class="detail-pair">
                        <p><strong>Purpose:</strong> ${data.requisition.purpose}</p>
                        <p><strong>Company Name:</strong> ${data.requisition.company_name}</p>
                    </div>
                    <p><strong>Total:</strong> ₱${data.total}</p>
                </div>
                <div class="details-group">
                    <h3>Items Requested:</h3>
                    <ul>
                        ${data.items.map(item => `<li>${item.name} - Qty: ${item.quantity}, Price: ₱${item.price}</li>`).join('')}
                    </ul>
                </div>
            `;
            openDetailsModal();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            Swal.fire('Error', 'Failed to fetch requisition details. Please try again later.', 'error');
        });
}







// Open/close modal functions
function toggleModal(modalId, display) {
    const modal = document.getElementById(modalId);
    modal.style.display = display ? 'block' : 'none';
}

// Function to fetch the next requisition ID from the backend
async function getCurrentRequisitionID() {
    try {
        const response = await fetch('/get_current_requisition_id'); // Fetch current requisition ID from the backend
        const data = await response.json();
        return data.next_requisition_id;  // Return the next requisition ID
    } catch (error) {
        console.error('Error fetching requisition ID:', error);
        return 1001; // Fallback to 1001 if there is an error
    }
}

// Function to open the modal and set the requisition ID
async function openModal() {
    toggleModal('manage-requisition-modal', true);

    // Fetch and set the current requisition ID dynamically
    const requisitionID = await getCurrentRequisitionID();
    document.getElementById('requisition-id').value = requisitionID;  // Display the ID

    // Set the current date in the date field
    document.getElementById('date').value = getCurrentDate();
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
    Swal.fire('Error', message, 'error');
}

// Success message function
function showSuccessMessage(message) {
    Swal.fire('Success', message, 'success');
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
        <td><button type="button" class="btn-remove-item" onclick="removeItem(this)">Remove</button></td>
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