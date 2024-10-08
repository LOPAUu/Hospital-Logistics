const suppliers = [
    {
        id: "001",
        companyName: "ABC Pharmaceuticals",
        contactPerson: "Dora de Explorer",
        email: "doreexplorer@abcpharma.com",
        phone: "(02) 1234-5678",
        address: "123 Pharma St, Quezon City",
    },
    {
        id: "002",
        companyName: "Mercury Drugs",
        contactPerson: "Boots Smith",
        email: "bootsmith@mercurydrugs.com",
        phone: "(02) 8765-4321",
        address: "456 Drug St, Quezon City",
    },
];

let currentEditId = null; // Global variable to store the ID of the supplier being edited

// Function to open the modal for adding a supplier
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

    // Generate a new ID for the supplier
    const newId = Date.now().toString(); // Unique ID based on timestamp

    // Create a new row in the supplier table
    const tbody = document.querySelector('#supplier-list tbody');
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', newId); // Set the data-id attribute
    newRow.innerHTML = `
    <td>${companyName}</td>
    <td>${contactPerson}</td>
    <td>${email}</td>
    <td>${phone}</td>
    <td>${address}</td>
    <td>
        <button onclick="editSupplier('${newId}')">Edit</button>
        <button class="remove" onclick="removeSupplier('${newId}')">Remove</button>
    </td>
`;

    tbody.appendChild(newRow);

    closeAddSupplierModal(); // Close the modal
}

function editSupplier(id) {
    // Store the current edit ID
    currentEditId = id;

    // Fetch the row with the matching ID
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        // Extract supplier details from the table row
        const companyName = row.cells[0].textContent;
        const contactPerson = row.cells[1].textContent;
        const email = row.cells[2].textContent;
        const phone = row.cells[3].textContent;
        const address = row.cells[4].textContent;

        // Populate the edit form
        document.getElementById('edit-company-name').value = companyName;
        document.getElementById('edit-contact-person').value = contactPerson;
        document.getElementById('edit-email').value = email;
        document.getElementById('edit-phone').value = phone;
        document.getElementById('edit-address').value = address;

        // Show the edit modal
        document.getElementById('edit-supplier-modal').style.display = 'block';
    }
}

function closeEditSupplierModal() {
    document.getElementById('edit-supplier-modal').style.display = 'none';
}

// Add an event listener for the edit supplier form submission
document.getElementById('edit-supplier-form').onsubmit = function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get the updated values from the form
    const updatedCompanyName = document.getElementById('edit-company-name').value;
    const updatedContactPerson = document.getElementById('edit-contact-person').value;
    const updatedEmail = document.getElementById('edit-email').value;
    const updatedPhone = document.getElementById('edit-phone').value;
    const updatedAddress = document.getElementById('edit-address').value;

    // Update the corresponding row in the supplier table
    const row = document.querySelector(`tr[data-id="${currentEditId}"]`);
    if (row) {
        row.cells[0].textContent = updatedCompanyName;
        row.cells[1].textContent = updatedContactPerson;
        row.cells[2].textContent = updatedEmail;
        row.cells[3].textContent = updatedPhone;
        row.cells[4].textContent = updatedAddress;
    }

    closeEditSupplierModal(); // Close the modal
};

// Functionality for filtering suppliers
function filterSuppliers() {
    const filterName = document.getElementById('filter-name').value.toLowerCase();
    const filterContact = document.getElementById('filter-contact').value.toLowerCase();
    const filterEmail = document.getElementById('filter-email').value.toLowerCase();
    const rows = document.querySelectorAll('#supplier-list tbody tr');

    rows.forEach(row => {
        const companyName = row.cells[0].textContent.toLowerCase();
        const contactPerson = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();
        row.style.display = (companyName.includes(filterName) &&
                             contactPerson.includes(filterContact) &&
                             email.includes(filterEmail)) ? '' : 'none';
    });
}

// Functionality for searching suppliers in the search bar
function searchSuppliers() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const rows = document.querySelectorAll('#supplier-list tbody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let rowContainsSearchTerm = false;
        for (let cell of cells) {
            if (cell.textContent.toLowerCase().includes(searchInput)) {
                rowContainsSearchTerm = true;
                break;
            }
        }
        row.style.display = rowContainsSearchTerm ? '' : 'none';
    });
}

// Initial rendering of suppliers
function renderSuppliers() {
    const tbody = document.querySelector('#supplier-list tbody');
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', supplier.id);
        row.innerHTML = `
        <td>${supplier.companyName}</td>
        <td>${supplier.contactPerson}</td>
        <td>${supplier.email}</td>
        <td>${supplier.phone}</td>
        <td>${supplier.address}</td>
        <td>
            <button onclick="editSupplier('${supplier.id}')">Edit</button>
            <button class="remove" onclick="removeSupplier('${supplier.id}')">Remove</button>
        </td>
    `;
    
        tbody.appendChild(row);
    });
}

// Remove supplier function
function removeSupplier(id) {
    // Find the row with the specified supplier ID
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        // Remove the row from the table
        row.remove();
    }
}

// Call renderSuppliers on page load
document.addEventListener('DOMContentLoaded', renderSuppliers);
