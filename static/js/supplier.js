const suppliers = [];

// Fetch suppliers from the backend when the page loads
async function fetchSuppliers() {
    try {
        const response = await fetch('/suppliers');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        suppliers.length = 0; // Clear existing data
        suppliers.push(...data);
        renderSuppliers();
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
}

// Render suppliers in the table
function renderSuppliers() {
    const supplierList = document.querySelector('#supplier-list tbody');
    supplierList.innerHTML = ''; // Clear existing rows
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.company_name}</td>
            <td>${supplier.contact_person}</td>
            <td>${supplier.email}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.address}</td>
            <td>
                <button onclick="openEditSupplierModal(${supplier.id})">Edit</button>
                <button onclick="removeSupplier(${supplier.id})">Delete</button>
            </td>
        `;
        supplierList.appendChild(row);
    });
}

// Open and close modal functions
function openAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'block';
}

function closeAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'none';
}

// Add a new supplier
async function addSupplier(event) {
    event.preventDefault();
    const formData = {
        companyName: document.getElementById('company-name').value,
        contactPerson: document.getElementById('contact-person').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
    };

    try {
        const response = await fetch('/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

// Open the edit supplier modal and load the supplier data
function openupdateSupplierModal(supplierId) {
    fetch(`/suppliers/${supplierId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch supplier data');
            }
            return response.json();
        })
        .then(supplier => {
            // Fill the modal with supplier data
            document.getElementById('edit-company-name').value = supplier.company_name;
            document.getElementById('edit-contact-person').value = supplier.contact_person;
            document.getElementById('edit-email').value = supplier.email;
            document.getElementById('edit-phone').value = supplier.phone;
            document.getElementById('edit-address').value = supplier.address;

            // Store the supplier ID globally for later use
            window.supplierId = supplierId;
            window.originalSupplier = supplier; // Store the original supplier data

            // Open the modal
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch supplier data');
            }
            return response.json();
        })
        .then(supplier => {
            // Fill the modal with supplier data
            document.getElementById('edit-company-name').value = supplier.company_name;
            document.getElementById('edit-contact-person').value = supplier.contact_person;
            document.getElementById('edit-email').value = supplier.email;
            document.getElementById('edit-phone').value = supplier.phone;
            document.getElementById('edit-address').value = supplier.address;

            // Store the supplier ID globally for later use
            window.supplierId = supplierId;

            // Store the initial values
            window.initialData = {
                companyName: supplier.company_name,
                contactPerson: supplier.contact_person,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
            };

            // Open the modal
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

// Update supplier data
async function updateSupplier(event) {
    event.preventDefault();

    // If no changes, show error message
    if (!checkForChanges()) {
        closeupdateSupplierModal();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No changes have been made to the data. Please modify the fields before submitting.',
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

// Listen for changes and enable/disable the update button
document.querySelectorAll('.edit-modal-input').forEach(input => {
    input.addEventListener('input', toggleUpdateButton);
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
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete supplier');
                    }
                    return response.json();
                })
                .then(() => {
                    window.location.reload()
                    closeremoveSupplier();
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Supplier has been deleted.',
                    }).then(() => {
                        window.location.reload(); // Reload to remove the supplier from the list
                    });
                })
                .catch(error => {
                    closeremoveSupplier();
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

// Load suppliers when the page is ready
document.addEventListener('DOMContentLoaded', fetchSuppliers);
