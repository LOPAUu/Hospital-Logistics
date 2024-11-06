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
            fetchSuppliers();
            closeAddSupplierModal();
        }
    } catch (error) {
        console.error("Error adding supplier:", error);
    }
}

// Remove a supplier
async function removeSupplier(id) {
    try {
        const response = await fetch(`/suppliers/${id}`, { method: 'DELETE' });
        if (response.ok) fetchSuppliers();
    } catch (error) {
        console.error("Error deleting supplier:", error);
    }
}

// Open the modal for editing supplier details and set the supplierId
function openEditSupplierModal(supplierId) {
    window.supplierId = supplierId; // Set the global supplierId

    fetch(`/suppliers/${supplierId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch supplier data');
            return response.json();
        })
        .then(supplier => {
            document.getElementById('edit-company-name').value = supplier.company_name || '';
            document.getElementById('edit-contact-person').value = supplier.contact_person || '';
            document.getElementById('edit-email').value = supplier.email || '';
            document.getElementById('edit-phone').value = supplier.phone || '';
            document.getElementById('edit-address').value = supplier.address || '';

            document.getElementById('edit-supplier-modal').style.display = 'block';
        })
        .catch(error => console.error('Error fetching supplier data:', error));
}

function closeEditSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}


// Function to update the supplier details
async function updateSupplier(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const supplierId = window.supplierId; // Get the supplier ID from the global variable

    // Check if supplierId is available
    if (!supplierId) {
        alert('No supplier selected for update.');
        return;
    }

    const updatedData = {
        company_name: document.getElementById('edit-company-name').value,
        contact_person: document.getElementById('edit-contact-person').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        address: document.getElementById('edit-address').value,
    };

    try {
        const response = await fetch(`/suppliers/${supplierId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            alert('Supplier updated successfully');
            closeEditSupplierModal();
            fetchSuppliers(); // Refresh the supplier list to reflect the changes
        } else {
            throw new Error(`Failed to update supplier: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error updating supplier:", error);
        alert('Error updating supplier');
    }
}

// Load suppliers when the page is ready
document.addEventListener('DOMContentLoaded', fetchSuppliers);
