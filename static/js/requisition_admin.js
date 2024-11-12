// Initialize a global requisitions object
const requisitions = {
    1001: {
        purpose: "Order More Vaccines",
        supplier: "Mercury Drugs collab",
        items: [
            { name: "Vaccine A", quantity: 50, price: 25.50, total: 1275.00 },
            { name: "Vaccine B", quantity: 100, price: 15.00, total: 1500.00 }
        ],
        signatory1: { approved: true, name: "Maverick Ko" },
        signatory2: { approved: null, name: "Rene Letegio" },
        signatory3: { approved: null, name: "Paulo Sangreo" }
    },
    1002: {
        purpose: "Restock Masks",
        supplier: "ABC Pharmaceuticals",
        items: [
            { name: "Surgical Mask", quantity: 1000, price: 0.50, total: 500.00 }
        ],
        signatory1: { approved: true, name: "Maverick Ko" },
        signatory2: { approved: false, name: "Rene Letegio" },
        signatory3: { approved: null, name: "Paulo Sangreo" }
    }
};

function submitRequisition(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Capture the form data
    const purpose = document.getElementById('purpose').value;
    const supplier = document.getElementById('supplier').value;
    const items = Array.from(document.querySelectorAll('input[name="item-name[]"]')).map((input, index) => {
        const name = input.value;
        const quantity = parseFloat(document.querySelectorAll('input[name="item-quantity[]"]')[index].value);
        const price = parseFloat(document.querySelectorAll('input[name="item-price[]"]')[index].value);
        const total = quantity * price;
        return { name, quantity, price, total };
    });

    const totalPrice = items.reduce((sum, item) => sum + item.total, 0);

    // Add the new requisition to the global requisitions object
    requisitions[currentRequisitionId] = {
        purpose,
        supplier,
        items,
        signatory1: { approved: null, name: "Maverick Ko" },
        signatory2: { approved: null, name: "Rene Letegio" },
        signatory3: { approved: null, name: "Paulo Sangreo" }
    };

    // Create a new row for the requisition list table
    const table = document.getElementById('requisition-list').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(table.rows.length);
    newRow.setAttribute('data-id', currentRequisitionId);

    // Insert the requisition data into the table row
    newRow.innerHTML = `
        <td>${currentRequisitionId}</td>
        <td>${getCurrentDate()}</td>
        <td>${purpose}</td>
        <td>${supplier}</td>
        <td>₱${totalPrice.toFixed(2)}</td>
        <td>Pending</td>
        <td>
            <button onclick="viewDetails(${currentRequisitionId})">View</button>
            <button onclick="editRequisition(${currentRequisitionId})">Edit</button>
            <button onclick="deleteRequisition(${currentRequisitionId})">Delete</button>
        </td>
    `;

    // Increment the requisition ID for the next submission
    currentRequisitionId++;

    // Close the modal and reset the form
    closeModal();
    document.getElementById('requisition-form').reset();
}

// Adjust the viewDetails function to use the global requisitions object
function viewDetails(requisitionId) {
    const requisition = requisitions[requisitionId];

    if (requisition) {
        const total = requisition.items.reduce((sum, item) => sum + item.total, 0).toFixed(2);
        const status = getStatus(requisition.signatory1, requisition.signatory2, requisition.signatory3);
        const statusClass = getStatusClass(status);

        let itemsRequested = requisition.items.map(item => 
            `<tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₱${item.price.toFixed(2)}</td>
                <td>₱${item.total.toFixed(2)}</td>
            </tr>`).join('');

        const approvalDetails = `
            <p><strong>Signatory 1 (${requisition.signatory1.name}):</strong> ${getApprovalStatus(requisition.signatory1.approved)}</p>
            <p><strong>Signatory 2 (${requisition.signatory2.name}):</strong> ${getApprovalStatus(requisition.signatory2.approved)}</p>
            <p><strong>Signatory 3 (${requisition.signatory3.name}):</strong> ${getApprovalStatus(requisition.signatory3.approved)}</p>
        `;

        const content = `
            <p><strong>Purpose:</strong> ${requisition.purpose}</p>
            <p><strong>Supplier:</strong> ${requisition.supplier}</p>
            <table>
                <thead>
                    <tr>
                        <th>Name of Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRequested}
                </tbody>
            </table>
            <p><strong>Total:</strong> ₱${total}</p>
            <p><strong>Status:</strong> <span class="${statusClass}">${status}</span></p>
            ${approvalDetails}
        `;

        document.getElementById('details-content').innerHTML = content;
        openDetailsModal();
    } else {
        console.error("Details not found for requisition ID:", requisitionId);
    }
}

let currentRequisitionId = 1003; // Initialize with the next requisition ID
document.getElementById('date').value = getCurrentDate();


function deleteRequisition(requisitionId) {
    // SweetAlert confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this deletion!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
    }).then((result) => {
        if (result.isConfirmed) {
            // Proceed with deletion if confirmed
            const row = document.querySelector(`tr[data-id="${requisitionId}"]`);
            if (row) {
                row.remove();
                console.log("Requisition deleted:", requisitionId);
                Swal.fire(
                    'Deleted!',
                    'The requisition has been deleted.',
                    'success'
                );
                // Add any additional code here if deletion needs to be saved to a database or storage.
            } else {
                console.error("Requisition not found for deletion:", requisitionId);
            }
        } else {
            Swal.fire(
                'Cancelled',
                'The requisition was not deleted.',
                'info'
            );
        }
    });
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


// Attach the submit function to the form's submit event
document.getElementById('requisition-form').addEventListener('submit', submitRequisition);


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
