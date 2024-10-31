document.addEventListener('DOMContentLoaded', () => {
    const inventoryData = [
        { id: 1, description: 'Biogesic', quantity: 100, status: 'Active', unitCost: 10.00, unitPrice: 15.00, category: 'Category A' },
        { id: 2, description: 'BioFlu', quantity: 50, status: 'Inactive', unitCost: 8.00, unitPrice: 12.00, category: 'Category B' }
    ];

    const detailsData = {
        1: [
            { evaluatedOn: '2024-10-01', entryType: 'Purchase Order', poNumber: 'PO123', itemNo: 'A1', description: 'Biogesic', expirationDate: '2025-10-01', lotPosition: 'Shelf A' },
            { evaluatedOn: '2024-10-02', entryType: 'Return', poNumber: 'PO124', itemNo: 'A2', description: 'Biogesic', expirationDate: '2025-09-15', lotPosition: 'Shelf B' }
        ],
        2: [
            { evaluatedOn: '2024-09-15', entryType: 'Purchase Order', poNumber: 'PO125', itemNo: 'B1', description: 'BioFlu', expirationDate: '2025-08-10', lotPosition: 'Shelf C' }
        ]
    };

    let currentItemId = null;

    const tableBody = document.getElementById('inventory-table-body');
    const viewDetailsTableBody = document.getElementById('view-details-table-body');
    const editDetailsTableBody = document.getElementById('edit-details-table-body');
    const viewModal = document.getElementById('view-modal');
    const editModal = document.getElementById('edit-modal');

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.status}</td>
                <td>${item.unitCost.toFixed(2)}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${item.category}</td>
                <td>
                    <button class="action-btn view" onclick="viewItem(${item.id})">View</button>
                    <button class="action-btn edit" onclick="editItem(${item.id})">Edit</button>
                    <button class="action-btn delete" onclick="deleteItem(${item.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    window.viewItem = function(id) {
        const itemDetails = detailsData[id] || [];
        viewDetailsTableBody.innerHTML = '';
    
        itemDetails.forEach(detail => {
            const detailRow = document.createElement('tr');
            detailRow.innerHTML = `
                <td>${detail.evaluatedOn}</td>
                <td>${detail.entryType}</td>
                <td>${detail.poNumber}</td>
                <td>${detail.itemNo}</td>
                <td>${detail.description}</td>
                <td>${detail.expirationDate}</td>
                <td>${detail.lotPosition}</td>
            `;
            viewDetailsTableBody.appendChild(detailRow);
        });
    
        viewModal.style.display = 'block';
    };
    

    window.editItem = function(id) {
        currentItemId = id;
        const item = inventoryData.find(i => i.id === id);
        const itemDetails = detailsData[id] || [];

        document.getElementById('edit-description').value = item.description;
        document.getElementById('edit-quantity').value = item.quantity;
        document.getElementById('edit-status').value = item.status;
        document.getElementById('edit-unitCost').value = item.unitCost;
        document.getElementById('edit-unitPrice').value = item.unitPrice;
        document.getElementById('edit-category').value = item.category;

        editDetailsTableBody.innerHTML = '';
        itemDetails.forEach(detail => {
            const detailRow = document.createElement('tr');
            detailRow.innerHTML = `
                <td><span>${detail.evaluatedOn}<span></td> <!-- Evaluated On field is now read-only -->
                <td>
                    <select>
                        <option value="Purchase Order" ${detail.entryType === 'Purchase Order' ? 'selected' : ''}>Purchase Order</option>
                        <option value="Return" ${detail.entryType === 'Return' ? 'selected' : ''}>Return</option>
                    </select>
                </td>
                <td><span>${detail.poNumber}<span></td> <!-- PO Number field is now read-only -->
                <td><input type="text" value="${detail.itemNo}" /></td>
                <td><input type="text" value="${detail.description}" /></td>
                <td><input type="date" value="${detail.expirationDate}" /></td>
                <td><input type="text" value="${detail.lotPosition}" /></td>
            `;
            editDetailsTableBody.appendChild(detailRow);
        });

        editModal.style.display = 'block';
    };

    window.closeViewModal = function() {
        viewModal.style.display = 'none';
    };

    window.closeEditModal = function() {
        editModal.style.display = 'none';
    };

    window.saveViewChanges = function() {
        const updatedDetails = Array.from(viewDetailsTableBody.querySelectorAll('tr')).map(row => ({
            evaluatedOn: row.cells[0].querySelector('input').value,
            entryType: row.cells[1].querySelector('select').value,
            poNumber: row.cells[2].querySelector('input').value,
            itemNo: row.cells[3].querySelector('input').value,
            description: row.cells[4].querySelector('input').value,
            expirationDate: row.cells[5].querySelector('input').value,
            lotPosition: row.cells[6].querySelector('input').value
        }));

        detailsData[currentItemId] = updatedDetails;
        closeViewModal();
        renderTable(inventoryData);
    };

    window.saveChanges = function() {
        const item = inventoryData.find(i => i.id === currentItemId);
        if (item) {
            // Update main item details
            item.description = document.getElementById('edit-description').value;
            item.quantity = parseInt(document.getElementById('edit-quantity').value);
            item.status = document.getElementById('edit-status').value;
            item.unitCost = parseFloat(document.getElementById('edit-unitCost').value);
            item.unitPrice = parseFloat(document.getElementById('edit-unitPrice').value);
            item.category = document.getElementById('edit-category').value;
        }

        // Update entry details
        const updatedDetails = Array.from(editDetailsTableBody.querySelectorAll('tr')).map(row => ({
            evaluatedOn: row.cells[0].querySelector('span').textContent, // Read-only field
            entryType: row.cells[1].querySelector('select').value,
            poNumber: row.cells[2].querySelector('span').textContent, // Read-only field
            itemNo: row.cells[3].querySelector('input').value,
            description: row.cells[4].querySelector('input').value,
            expirationDate: row.cells[5].querySelector('input').value,
            lotPosition: row.cells[6].querySelector('input').value
        }));

        detailsData[currentItemId] = updatedDetails;
        closeEditModal();
        renderTable(inventoryData);
    };

    renderTable(inventoryData);
});
