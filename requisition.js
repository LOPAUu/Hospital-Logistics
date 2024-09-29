function viewDetails(requisitionId) {
    const requisitions = {
        1001: {
            purpose: "Order More Vaccines",
            billing: "Mercury Drugs collab",
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
            billing: "ABC Pharmaceuticals",
            items: [
                { name: "Surgical Mask", quantity: 1000, price: 0.50, total: 500.00 }
            ],
            signatory1: { approved: true, name: "Maverick Ko" },
            signatory2: { approved: false, name: "Rene Letegio" },
            signatory3: { approved: null, name: "Paulo Sangreo" }
        }
    };

    const requisition = requisitions[requisitionId];

    if (requisition) {
        // Calculate total of all items
        const total = requisition.items.reduce((sum, item) => sum + item.total, 0).toFixed(2);

        const status = getStatus(requisition.signatory1, requisition.signatory2, requisition.signatory3);
        const statusClass = getStatusClass(status);

        let itemsRequested = requisition.items.map(item => 
            `<tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₱${item.price.toFixed(2)}</td> <!-- Changed to Peso -->
                <td>₱${item.total.toFixed(2)}</td> <!-- Changed to Peso -->
            </tr>`).join('');

        const approvalDetails = `
            <p><strong>Signatory 1 (${requisition.signatory1.name}):</strong> ${getApprovalStatus(requisition.signatory1.approved)}</p>
            <p><strong>Signatory 2 (${requisition.signatory2.name}):</strong> ${getApprovalStatus(requisition.signatory2.approved)}</p>
            <p><strong>Signatory 3 (${requisition.signatory3.name}):</strong> ${getApprovalStatus(requisition.signatory3.approved)}</p>
        `;

        const content = `
            <p><strong>Purpose:</strong> ${requisition.purpose}</p>
            <p><strong>Billing:</strong> ${requisition.billing}</p>
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
            <p><strong>Total:</strong> ₱${total}</p> <!-- Changed to Peso -->
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

function removeItem(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    
    // Update the overall total after removing the item
    updateTotalPrice();
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
    // Get all filter values
    const idFilter = document.getElementById('filter-id').value.toLowerCase();
    const dateFilter = document.getElementById('filter-date').value;
    const statusFilter = document.getElementById('filter-status').value.toLowerCase();
    const detailsFilter = document.getElementById('filter-details').value.toLowerCase();

    // Get table and rows
    const table = document.getElementById('requisition-list');
    const rows = table.getElementsByTagName('tr');

    // Loop through all table rows, excluding the first (header)
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let rowId = row.getElementsByTagName('td')[0].textContent.toLowerCase();
        let rowDate = row.getElementsByTagName('td')[1].textContent;
        let rowStatus = row.getElementsByTagName('td')[6].textContent.toLowerCase();
        let rowDetails = row.getElementsByTagName('td')[2].textContent.toLowerCase();

        // Check if the row matches all the filter criteria
        let idMatch = rowId.includes(idFilter);
        let dateMatch = (dateFilter === "" || rowDate === dateFilter);
        let statusMatch = (statusFilter === "" || rowStatus === statusFilter);
        let detailsMatch = rowDetails.includes(detailsFilter);

        // If the row matches all filters, show it; otherwise, hide it
        if (idMatch && dateMatch && statusMatch && detailsMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}
