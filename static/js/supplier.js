const suppliers = [];

// Fetch suppliers from the backend when the page loads
async function fetchSuppliers() {
    const response = await fetch('/suppliers');
    const data = await response.json();
    console.log(data); // Log the fetched data to inspect its structure
    suppliers.length = 0; // Clear the suppliers array
    data.forEach(supplier => {
        suppliers.push(supplier);
    });
    renderSuppliers();
}

// Render suppliers in the table
function renderSuppliers() {
    const supplierList = document.querySelector('#supplier-list tbody');
    supplierList.innerHTML = ''; // Clear existing rows
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.company_name}</td>  <!-- Use correct property names -->
            <td>${supplier.contact_person}</td>  <!-- Use correct property names -->
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

function openAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'block';
}

function closeAddSupplierModal() {
    document.getElementById('add-supplier-modal').style.display = 'none';
    document.getElementById('supplier-form').reset(); // Reset the form
}

async function addSupplier(event) {
    event.preventDefault(); // Prevent default form submission

    const companyName = document.getElementById('company-name').value;
    const contactPerson = document.getElementById('contact-person').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    const newSupplier = {
        companyName,
        contactPerson,
        email,
        phone,
        address
    };

    const response = await fetch('/suppliers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSupplier)
    });

    if (response.ok) {
        closeAddSupplierModal(); // Close the modal
        showSuccessMessage("Successfully added!"); // Show success message
        fetchSuppliers(); // Re-fetch suppliers
    }
}

function showSuccessMessage(message) {
    const successMessageElement = document.getElementById('success-message');
    successMessageElement.textContent = message; // Set the message text
    successMessageElement.style.display = 'block'; // Show the message

    // Hide the message after 3 seconds
    setTimeout(() => {
        successMessageElement.style.display = 'none';
    }, 3000);
}

// Open the edit supplier modal and populate the form with the supplier's data
function openEditSupplierModal(id) {
    const supplier = suppliers.find(s => s.id === id);
    document.getElementById('edit-company-name').value = supplier.company_name;
    document.getElementById('edit-contact-person').value = supplier.contact_person;
    document.getElementById('edit-email').value = supplier.email;
    document.getElementById('edit-phone').value = supplier.phone;
    document.getElementById('edit-address').value = supplier.address;

    // Store the supplier ID for updates
    document.getElementById('edit-supplier-form').setAttribute('data-supplier-id', id);
    document.getElementById('edit-supplier-modal').style.display = 'block';
}

// Close the edit supplier modal
function closeEditSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}

// Update supplier function
async function updateSupplier(event) {
    event.preventDefault(); // Prevent default form submission
    const id = document.getElementById('edit-supplier-form').getAttribute('data-supplier-id');

    const updatedSupplier = {
        companyName: document.getElementById('edit-company-name').value,
        contactPerson: document.getElementById('edit-contact-person').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        address: document.getElementById('edit-address').value
    };

    const response = await fetch(`/supplier/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSupplier)
    });

    if (response.ok) {
        closeEditSupplierModal(); // Close the modal
        showSuccessMessage("Successfully updated!"); // Show success message
        fetchSuppliers(); // Re-fetch suppliers to refresh the list
    } else {
        showError('Failed to update supplier');
    }
}

function showError(message) {
    // Display the error message to the user
    alert(message);
}

function showSuccessMessage(message) {
    // Display a success message to the user
    alert(message);
}

async function removeSupplier(id) {
    try {
        const response = await fetch(`/supplier/${id}`, { // Use the correct endpoint
            method: 'DELETE'
        });

        if (response.ok) {
            showSuccessMessage("Successfully deleted!"); // Show success message
            fetchSuppliers(); // Re-fetch suppliers after deletion
        } else if (response.status === 404) {
            showErrorMessage("Supplier not found!"); // Show error message for not found
        } else {
            showErrorMessage("Failed to delete supplier!"); // Show error message for other errors
        }
    } catch (error) {
        console.error("Error deleting supplier:", error);
        showErrorMessage("An error occurred while trying to delete the supplier.");
    }
}

// Search suppliers based on input
function searchSuppliers() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const filteredSuppliers = suppliers.filter(supplier => {
        return (
            supplier.companyName.toLowerCase().includes(searchInput) ||
            supplier.contactPerson.toLowerCase().includes(searchInput) ||
            supplier.email.toLowerCase().includes(searchInput)
        );
    });
    renderFilteredSuppliers(filteredSuppliers);
}

// Render filtered suppliers in the table
function renderFilteredSuppliers(filteredSuppliers) {
    const supplierList = document.querySelector('#supplier-list tbody');
    supplierList.innerHTML = ''; // Clear existing rows
    filteredSuppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.company_name}</td>  <!-- Use correct property names -->
            <td>${supplier.contact_person}</td>  <!-- Use correct property names -->
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

// Call fetchSuppliers on page load
document.addEventListener('DOMContentLoaded', fetchSuppliers);
