function openAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'block';
}

function closeAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'none';
    document.getElementById('supplier-form').reset(); // Reset the form
}

function addSupplier(event) {
    event.preventDefault(); // Prevent default form submission

    // Get the input values
    const companyName = document.getElementById('company-name').value;
    const contactPerson = document.getElementById('contact-person').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    // Create a new row in the supplier table
    const tbody = document.querySelector('#supplier-list tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${companyName}</td>
        <td>${contactPerson}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>${address}</td>
        <td><button onclick="editSupplier('${Date.now()}')">Edit</button></td>
    `;
    tbody.appendChild(newRow);

    closeAddSupplierModal(); // Close the modal
}

function editSupplier(id) {
    // Fetch the row with the matching ID
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        // Extract supplier details from the table row
        const companyName = row.cells[0].textContent;
        const contactPerson = row.cells[1].textContent;
        const email = row.cells[2].textContent;
        const phone = row.cells[3].textContent;
        const address = row.cells[4].textContent;

        // Populate the edit form with supplier details
        document.getElementById('edit-company-name').value = companyName;
        document.getElementById('edit-contact-person').value = contactPerson;
        document.getElementById('edit-email').value = email;
        document.getElementById('edit-phone').value = phone;
        document.getElementById('edit-address').value = address;

        // Store the ID of the supplier being edited (optional, for saving changes later)
        document.getElementById('edit-supplier-form').dataset.supplierId = id;

        // Open the edit modal
        document.getElementById('edit-supplier-modal').style.display = 'block';
    }
}

function closeEditSupplierModal() {
    // Close the modal and reset the form
    document.getElementById('edit-supplier-modal').style.display = 'none';
    document.getElementById('edit-supplier-form').reset();
}

function searchSuppliers() {
    // Implement your search function here
}

function filterSuppliers() {
    // Implement your filter function here
}
