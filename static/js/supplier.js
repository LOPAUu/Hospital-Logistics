const suppliers = [];

// Render supplier list
function renderSuppliers() {
    const supplierList = document.querySelector('#supplier-list tbody');
    supplierList.innerHTML = '';
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        const supplierItems = supplier.items || [];

        row.innerHTML = `
            <td>${supplier.company_name}</td>
            <td>${supplier.contact_person}</td>
            <td>${supplier.email}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.address}</td>
            <td>${supplierItems.map(item => item.item_name).join(', ')}</td>
            <td>
                <button onclick="openupdateSupplierModal(${supplier.id})">Edit</button>
                <button onclick="removeSupplier(${supplier.id})">Delete</button>
            </td>
        `;
        supplierList.appendChild(row);
    });
}

// Toggle modals
function toggleModal(modalId, isOpen) {
    const modal = document.getElementById(modalId);
    modal.style.display = isOpen ? 'block' : 'none';
}

function openEditSupplierModal(supplierId) {
    fetch(`/supplier/${supplierId}`)
        .then(response => response.json())
        .then(data => {
            if (response.ok) {
                populateSupplierForm(data);
                toggleModal('edit-supplier-modal', true);
            } else {
                alert(data.error || 'Failed to load data');
            }
        })
        .catch(error => console.error('Error fetching supplier data:', error));
}

function closeModal(modalId) {
    toggleModal(modalId, false);
}

// Populate supplier form
function populateSupplierForm(data) {
    document.getElementById('edit-company-name').value = data.company_name;
    document.getElementById('edit-contact-person').value = data.contact_person;
    document.getElementById('edit-email').value = data.email;
    document.getElementById('edit-phone').value = data.phone;
    document.getElementById('edit-address').value = data.address;

    const itemsTable = document.querySelector("#edit-supplier-items-table tbody");
    itemsTable.innerHTML = '';
    (data.items || []).forEach(item => {
        addItemRow(itemsTable, item.item_name);
    });

    window.initialData = { ...data };
    window.supplierId = data.id;
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

// Add item row
function addItemRow(tableBody, itemName = '') {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="text" name="supplier-item-name[]" value="${itemName}" placeholder="Item Name">
            <button type="button" onclick="removeRow(this)">Remove</button>
        </td>
    `;
    tableBody.appendChild(row);
}

// Remove table row
function removeRow(button) {
    button.closest('tr').remove();
}

// Add supplier
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

// Collect supplier form data
function collectSupplierFormData(itemInputName) {
    return {
        company_name: document.getElementById('company-name').value,
        contact_person: document.getElementById('contact-person').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        items: Array.from(document.querySelectorAll(`input[name="${itemInputName}"]`))
            .map(input => input.value.trim())
            .filter(item => item !== '')
    };
}

// Update supplier data
async function updateSupplier(event) {
    event.preventDefault();

     // If no changes, show error message
    if (!checkForChanges()) {
        closeupdateSupplierModal();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'NO CHANGES have been made to the data. Please modify the fields before submitting.',
            showConfirmButton: true,
        });
        return;
    }

    const updatedData = {
        companyName: document.getElementById('edit-company-name').value,
        contactPerson: document.getElementById('edit-contact-person').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        address: document.getElementById('edit-address').value,
        items: Array.from(document.querySelectorAll('input[name="edit-supplier-item-name[]"]'))
                .map(input => input.value)
                .filter(item => item.trim() !== '') // Remove empty items
    };

    try {
        const response = await fetch(`/suppliers/${window.supplierId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            closeupdateSupplierModal();
            Swal.fire({
                icon: 'success',
                title: 'Supplier Edited',
                text: 'Supplier edited successfully!',
                showConfirmButton: true,
            }).then(() => {
                window.location.reload(); // Reload to reflect the changes
            });
        } else {
            closeupdateSupplierModal();
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorData.error || 'Failed to update supplier.',
                showConfirmButton: true,
            });
        }
    } catch (error) {
        closeupdateSupplierModal();
        console.error('Error updating supplier:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred.',
            showConfirmButton: true,
        });
    }
}

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
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete supplier');
                    }
                    return response.json();
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Supplier has been deleted.',
                    }).then(() => {
                        window.location.reload(); // Reload to remove the supplier from the list
                    });
                })
                .catch(error => {
                    console.error('Error deleting supplier:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete supplier.',
                        showConfirmButton: true,
                    });
                });
        }
    });
}

// Fetch supplier items
function fetchSupplierItems(supplierId) {
    fetch(`/suppliers/${supplierId}/items`)
        .then(response => response.json())
        .then(data => console.log(data)) // Replace with rendering logic
        .catch(error => console.error('Error fetching items:', error));
}

// Fetch all suppliers
function fetchSuppliers() {
    fetch('/suppliers')
        .then(response => response.json())
        .then(data => {
            suppliers.push(...data);
            renderSuppliers();
        })
        .catch(error => console.error('Error fetching suppliers:', error));
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

function openupdateSupplierModal(supplierId) {
    fetch(`/suppliers/${supplierId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(supplier => {
            // Populate supplier data fields
            document.getElementById('edit-company-name').value = supplier.company_name;
            document.getElementById('edit-contact-person').value = supplier.contact_person;
            document.getElementById('edit-email').value = supplier.email;
            document.getElementById('edit-phone').value = supplier.phone;
            document.getElementById('edit-address').value = supplier.address;

            // Populate items into the table
            const tableBody = document.querySelector("#edit-supplier-items-table tbody");
            tableBody.innerHTML = ''; // Clear any existing rows

            const items = supplier.items || []; // Default to an empty array if items is undefined
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>
                            <input type="text" name="edit-supplier-item-name[]" value="${item}" placeholder="Item Name">
                            <button type="button" onclick="removeItem(this)">Remove</button>
                        </td>
                    `;
                    tableBody.appendChild(newRow);
                });
            } else {
                console.warn('Expected supplier.items to be an array, but got:', items);
            }

            // Store initial data for change detection
            window.supplierId = supplierId;
            window.initialData = { 
                companyName: supplier.company_name,
                contactPerson: supplier.contact_person,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                items: items
            };

            // Open the modal
            document.getElementById('edit-supplier-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching supplier data:', error);
            alert('Failed to fetch supplier data. Please try again.');
        });
}


// Close the modal
function closeupdateSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchSuppliers);
