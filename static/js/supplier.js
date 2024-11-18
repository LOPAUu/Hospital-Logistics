const suppliers = [];


function renderSuppliers() {
    const supplierList = document.querySelector('#supplier-list tbody');
    supplierList.innerHTML = ''; // Clear rows
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        
        // Fetch and display supplier items separately
        const supplierItems = supplier.items || [];  // Assuming `items` is an array in the supplier object
        
        row.innerHTML = `
            <td>${supplier.company_name}</td>
            <td>${supplier.contact_person}</td>
            <td>${supplier.email}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.address}</td>
            <td>
                ${supplierItems.map(item => item.item_name).join(', ')}
            </td>
            <td>
                <button onclick="openupdateSupplierModal(${supplier.id})">Edit</button>
                <button onclick="removeSupplier(${supplier.id})">Delete</button>
            </td>
        `;
        supplierList.appendChild(row);
    });
}

/// Open the modal for adding a new item
function openAddItemModal(supplierId) {
    document.getElementById('add-item-modal').style.display = 'block';
    window.supplierId = supplierId;  // Store supplier ID for later use
}

// Close the add item modal
function closeAddItemModal() {
    document.getElementById('add-item-modal').style.display = 'none';
}

// Open modal for adding a new supplier
function openAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'block';
}

// Close modal for adding a supplier
function closeAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'none';
}

// Open modal for adding a new supplier
function openAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'block';
}

// Close modal for adding a supplier
function closeAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'none';
}

// Close the modal
function closeupdateSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}

// Monitor input changes in edit modal
function checkForChanges() {
    const currentData = {
        company_name: document.getElementById('edit-company-name').value,
        contact_person: document.getElementById('edit-contact-person').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        address: document.getElementById('edit-address').value,
    };
    return JSON.stringify(currentData) !== JSON.stringify(window.initialData);
}

// Enable or disable the update button
function toggleUpdateButton() {
    document.getElementById('update-button').disabled = !checkForChanges();
}


// Add a new item for a specific supplier
async function addItem(event) {
    event.preventDefault();
    const itemName = document.getElementById('item-name').value;

    try {
        const response = await fetch(`/suppliers/${window.supplierId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName })
        });

        if (response.ok) {
            closeAddItemModal();
            Swal.fire({
                icon: 'success',
                title: 'Item Added',
                text: 'The item has been added successfully!',
            }).then(() => {
                fetchSupplierItems(window.supplierId);  // Refresh item list
            });
        } else {
            closeAddItemModal();
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorData.error || 'Failed to add item.',
            });
        }
    } catch (error) {
        closeAddItemModal();
        console.error('Error adding item:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred.',
        });
    }
}

// Open the edit item modal and load the item data
function openEditItemModal(itemId) {
    fetch(`/suppliers/${window.supplierId}/items/${itemId}`)
        .then(response => response.json())
        .then(item => {
            document.getElementById('edit-item-name').value = item.item_name;
            window.itemId = itemId; // Store the item ID for later use
            document.getElementById('edit-item-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching item data:', error);
            alert('Failed to fetch item data');
        });
}

// Close the edit item modal
function closeEditItemModal() {
    document.getElementById('edit-item-modal').style.display = 'none';
}

// Update the item
async function updateItem(event) {
    event.preventDefault();
    const updatedItemName = document.getElementById('edit-item-name').value;

    try {
        const response = await fetch(`/suppliers/${window.supplierId}/items/${window.itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName: updatedItemName })
        });

        if (response.ok) {
            closeEditItemModal();
            Swal.fire({
                icon: 'success',
                title: 'Item Updated',
                text: 'The item has been updated successfully!',
            }).then(() => {
                fetchSupplierItems(window.supplierId);  // Refresh item list
            });
        } else {
            closeEditItemModal();
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorData.error || 'Failed to update item.',
            });
        }
    } catch (error) {
        closeEditItemModal();
        console.error('Error updating item:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred.',
        });
    }
}

// Delete an item
function removeItem(itemId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`/suppliers/${window.supplierId}/items/${itemId}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(() => {
                    fetchSupplierItems(window.supplierId);  // Refresh item list
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Item has been deleted.',
                    });
                })
                .catch(error => {
                    console.error('Error deleting item:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete item.',
                    });
                });
        }
    });
}

// Add a new supplier
async function addSupplier(event) {
    event.preventDefault();

    try {
        // Collect form data
        const formData = {
            company_name: document.getElementById('company-name').value,
            contact_person: document.getElementById('contact-person').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            items: Array.from(document.querySelectorAll('input[name="supplier-item-name[]"]'))
                .map(input => input.value)
                .filter(item => item.trim() !== '') // Remove empty items
        };

        // Send POST request
        const response = await fetch('/add-supplier', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeAddSupplierModal(); // Close the modal
            Swal.fire({
                icon: 'success',
                title: 'Supplier Added',
                text: 'The supplier has been added successfully!',
                showConfirmButton: true,
                allowOutsideClick: true, // Allow user to click outside to close
                backdrop: true, // Ensure the modal background is active
            }).then(() => {
                window.location.reload(); // Reload the entire page after dismissal
            });
        } else {
            closeAddSupplierModal();
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorData.error || 'Failed to add supplier.',
                showConfirmButton: true,
            });
        }
    } catch (error) {
        closeAddSupplierModal();
        console.error("Error adding supplier:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'DUPLICATE ENTRY DETECTED.',
            showConfirmButton: true,
        });
    }
}


// Open the Edit Supplier Modal and populate the form with supplier data
async function openEditSupplierModal(supplierId) {
    // Fetch supplier data from backend
    const response = await fetch(`/supplier/${supplierId}`);
    console.log(response);
    const data = await response.json();

    if (response.ok) {
        // Populate the supplier information fields
        document.getElementById('edit-company-name').value = data.supplier[0]; // company_name
        document.getElementById('edit-contact-person').value = data.supplier[1]; // contact_person
        document.getElementById('edit-email').value = data.supplier[2]; // email
        document.getElementById('edit-phone').value = data.supplier[3]; // phone
        document.getElementById('edit-address').value = data.supplier[4]; // address

        // Populate the items offered by the supplier
        const itemsTable = document.getElementById('edit-supplier-items-table').getElementsByTagName('tbody')[0];
        itemsTable.innerHTML = ''; // Clear existing rows

        data.items.forEach(item => {
            const row = itemsTable.insertRow();
            const cell = row.insertCell(0);
            cell.innerHTML = `
                <input type="text" name="edit-supplier-item-name[]" value="${item}" placeholder="Item Name">
                <button type="button" onclick="removeItem(this)">Remove</button>
            `;
        });

        // Show the modal
        document.getElementById('edit-supplier-modal').style.display = 'block';
    } else {
        console.error(data.error || 'Failed to fetch supplier data');
        alert('Error: ' + (data.error || 'Failed to load data'));
    }
}


// Close the edit supplier modal
function closeupdateSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}



// Function to check if there are any changes to the data
function hasChanges(updatedData) {
    return (
        updatedData.companyName !== originalData.companyName ||
        updatedData.contactPerson !== originalData.contactPerson ||
        updatedData.email !== originalData.email ||
        updatedData.phone !== originalData.phone ||
        updatedData.address !== originalData.address
    );
}

// Open the edit supplier modal and load the supplier data
function openupdateSupplierModal(supplierId) {
    fetch(`/suppliers/${supplierId}`)
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('edit-company-name').value = supplier.company_name;
            document.getElementById('edit-contact-person').value = supplier.contact_person;
            document.getElementById('edit-email').value = supplier.email;
            document.getElementById('edit-phone').value = supplier.phone;
            document.getElementById('edit-address').value = supplier.address;

            window.supplierId = supplierId;
            window.initialData = { 
                companyName: supplier.company_name,
                contactPerson: supplier.contact_person,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address 
            };

            // Open the modal window
            document.getElementById('edit-supplier-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching supplier data:', error);
            alert('Failed to fetch supplier data');
        });
}


// Close the edit supplier modal
function closeupdateSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}

// Check for changes
function checkForChanges() {
    const currentData = {
        companyName: document.getElementById('edit-company-name').value,
        contactPerson: document.getElementById('edit-contact-person').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        address: document.getElementById('edit-address').value,
    };

    // Compare the initial data with the current data
    return JSON.stringify(currentData) !== JSON.stringify(window.initialData);
}

// Enable or disable the update button based on changes
function toggleUpdateButton() {
    const updateButton = document.getElementById('update-button'); // Ensure the button has this ID
    if (checkForChanges()) {
        updateButton.disabled = false;
    } else {
        updateButton.disabled = true;
    }
}

// Function to update supplier details and items
function updateSupplier(supplierId) {
    // Collect the updated supplier data from the form
    const updatedSupplier = {
        companyName: document.getElementById('edit-company-name').value,
        contactPerson: document.getElementById('edit-contact-person').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        address: document.getElementById('edit-address').value,
        items: []  // Array to hold the items

    };

    // Collect items from the items table
    const itemInputs = document.querySelectorAll('#edit-supplier-items-table input[name="edit-supplier-item-name[]"]');
    itemInputs.forEach(input => {
        if (input.value.trim()) {
            updatedSupplier.items.push(input.value.trim());
        }
    });

    // Send the PUT request to update the supplier
    fetch(`/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSupplier)
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.message) {
            alert(data.message);
            // Optionally, close modal or reset form
            closeUpdateSupplierModal();
        } else if (data.error) {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating supplier: ' + error.message);
    });
}

// Close the modal after updating
function closeUpdateSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}

// Attach event listener to the form's submit button (optional)
document.getElementById('edit-supplier-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission
    const supplierId = 1;  // Replace with the actual supplier ID
    updateSupplier(supplierId);
});


// Delete supplier
function removeSupplier(supplierId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`/suppliers/${supplierId}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(() => {
                    fetchSuppliers();  // Refresh supplier list
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Supplier has been deleted.',
                    });
                })
                .catch(error => {
                    console.error('Error deleting supplier:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete supplier.',
                    });
                });
        }
    });
}

function addsupplierItem() {
    // Select the table body where new rows will be added
    const tableBody = document.querySelector("#supplier-items-table tbody");

    // Create a new table row
    const newRow = document.createElement("tr");

    // Define the HTML structure of the new row
    newRow.innerHTML = `
        <td>
            <input type="text" name="supplier-item-name[]" placeholder="Item Name">
            <button type="button" onclick="removeItem(this)">Remove</button>
        </td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(newRow);
}

// Function to remove a specific row when the "Remove" button is clicked
function removeItem(button) {
    const row = button.closest("tr"); // Find the closest <tr> element to the button
    row.remove(); // Remove the row from the table
}

function addEditedSupplierItem() {
    // Select the table body where new rows will be added
    const tableBody = document.querySelector("#edit-supplier-items-table tbody");

    // Create a new table row
    const newRow = document.createElement("tr");

    // Define the HTML structure of the new row
    newRow.innerHTML = `
        <td>
            <input type="text" name="edit-supplier-item-name[]" placeholder="Item Name">
            <button type="button" onclick="removeItem(this)">Remove</button>
        </td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(newRow);
}



// Function to remove a specific row when the "Remove" button is clicked
function removeItem(button) {
    const row = button.closest("tr"); // Find the closest <tr> element to the button
    row.remove(); // Remove the row from the table
}

// Event listener for edit modal input fields
document.querySelectorAll('.edit-modal-input').forEach(input => {
    input.addEventListener('input', toggleUpdateButton);
});


// Event listener for opening the add item modal
document.querySelector('#add-item-button').addEventListener('click', function() {
    const supplierId = window.supplierId; // Get supplier ID from a global variable or elsewhere
    openAddItemModal(supplierId);
});

// Load the items when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    const supplierId = window.supplierId; // Set this from a global variable or URL params
    fetchSupplierItems(supplierId);
});

// Load suppliers when the page is ready
document.addEventListener('DOMContentLoaded', fetchSuppliers);
