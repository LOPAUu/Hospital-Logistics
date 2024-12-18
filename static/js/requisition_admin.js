// Fetch requisition data from the server
async function fetchRequisition() {
    try {
        const response = await fetch('/requisitions');
        if (!response.ok) throw new Error('Failed to fetch requisitions');
        const data = await response.json();
        renderRequisition(data);
    } catch (error) {
        showError(error.message);
    }
}

// Render requisitions to the table
function renderRequisition(requisitions) {
    const requisitionList = document.getElementById('requisition-list');
    requisitionList.innerHTML = requisitions.map(requisition => `
        <tr>
            <td>${requisition.id}</td>
            <td>${new Date(requisition.date).toLocaleDateString()}</td>
            <td>${requisition.purpose}</td>
            <td>${requisition.company_name}</td>
            <td>${requisition.requested_by}</td>
            <td>₱${requisition.total}</td>
            <td>${requisition.status}</td>
            <td><button onclick="viewDetails(${requisition.id})">View Details</button></td>
        </tr>
    `).join('');
}

// Save requisition data
async function saveRequisition(event) {
    event.preventDefault();
    const form = document.getElementById('requisition-form');
    const requisitionId = document.getElementById('requisition-id').value;

    const requisitionData = collectRequisitionData(form);
    const formData = buildFormData(requisitionId, requisitionData);

    try {
        const requisitionResponse = await fetch('/requisition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requisitionData)
        });

        const requisitionDataResponse = await requisitionResponse.json();

        if (requisitionResponse.ok && requisitionDataResponse.requisition_id) {
            await handleAttachments(formData);
            showSuccessMessage('Requisition and attachments uploaded successfully!');
        } else {
            throw new Error('Failed to save requisition');
        }
    } catch (error) {
        showError(error.message);
    }
}

// Helper function to collect requisition data
function collectRequisitionData(form) {
    return {
        date: form.date.value,
        purpose: form.purpose.value,
        company_name: form.company_name.value,
        requested_by: form.requested_by.value,
        items: getItemsFromForm(form)
    };
}

// Helper function to build FormData
function buildFormData(requisitionId, requisitionData) {
    const formData = new FormData();
    formData.append('requisition_id', requisitionId);
    formData.append('requisition_data', JSON.stringify(requisitionData));

    const files = document.getElementById('attachments').files;
    for (let file of files) {
        formData.append('attachments', file);
    }
    return formData;
}

// Handle attachments upload
async function handleAttachments(formData) {
    const attachmentResponse = await fetch('/upload_attachments', {
        method: 'POST',
        body: formData
    });

    const attachmentData = await attachmentResponse.json();
    if (attachmentData.message !== "Attachments uploaded successfully!") {
        throw new Error('Error uploading attachments');
    }
}

// Fetch requisition details
function viewDetails(requisitionId) {
    fetch(`/requisitions/${requisitionId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch requisition details');
            return response.json();
        })
        .then(data => displayDetails(data))
        .catch(error => showError('Failed to fetch requisition details. Please try again later.'));
}

// Display requisition details
function displayDetails(data) {
    document.getElementById('details-content').innerHTML = `
        <div class="details-group">
            <div class="detail-pair">
                <p><strong>No.:</strong> ${data.requisition.id}</p>
                <p><strong>Date:</strong> ${new Date(data.requisition.date).toLocaleDateString()}</p>
            </div>
            <div class="detail-pair">
                <p><strong>Purpose:</strong> ${data.requisition.purpose}</p>
                <p><strong>Company Name:</strong> ${data.requisition.company_name}</p>
            </div>
            <p><strong>Requested By:</strong> ${data.requisition.requested_by}</p>
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
}

// Manage modal visibility
function toggleModal(modalId, display) {
    document.getElementById(modalId).style.display = display ? 'block' : 'none';
}

function openModal() {
    toggleModal('manage-requisition-modal', true);
    setRequisitionDefaults();
}

function closeModal() {
    toggleModal('manage-requisition-modal', false);
}

function openDetailsModal() {
    toggleModal('details-modal', true);
}

function closeDetailsModal() {
    toggleModal('details-modal', false);
}

// Set default values for a new requisition
async function setRequisitionDefaults() {
    const requisitionID = await getCurrentRequisitionID();
    document.getElementById('requisition-id').value = requisitionID;
    document.getElementById('date').value = getCurrentDate();
}

// Fetch the next requisition ID from the backend
async function getCurrentRequisitionID() {
    try {
        const response = await fetch('/get_current_requisition_id');
        const data = await response.json();
        return data.next_requisition_id;
    } catch (error) {
        console.error('Error fetching requisition ID:', error);
        return 1001;
    }
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Item management
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

function removeItem(button) {
    button.closest('tr').remove();
    updateTotalPrice();
}

function calculateTotal(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = row.querySelector('.item-total');
    total.value = (quantity * price).toFixed(2);
    updateTotalPrice();
}

function updateTotalPrice() {
    const totalPrice = Array.from(document.querySelectorAll('.item-total'))
        .reduce((sum, total) => sum + (parseFloat(total.value) || 0), 0);
    document.getElementById('total-price').value = totalPrice.toFixed(2);
}

// Generic error and success message functions
function showError(message) {
    Swal.fire('Error', message, 'error');
}

function showSuccessMessage(message) {
    Swal.fire('Success', message, 'success');
}