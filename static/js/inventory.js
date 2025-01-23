document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const tableBody = document.getElementById('inventory-table-body');
    const viewDetailsTableBody = document.getElementById('view-details-table-body');
    const editDetailsTableBody = document.getElementById('edit-details-table-body');
    const viewModal = document.getElementById('itemModal');
    const editModal = document.getElementById('edit-modal');
  
    // Dummy data for example purposes
    const detailsData = {}; // Populate with actual data
    const inventoryData = []; // Populate with actual data
    let currentItemId = null;
  
    // Function to view item details
    window.viewItem = function (id) {
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
  
  
  
    // Function to edit item details
      window.editItem = function (id) {
          const item = inventoryData.find(i => i.id === id); // Find the item by ID
          const itemDetails = detailsData[id] || []; // Get item details or use an empty array if none exist
      
          editDetailsTableBody.innerHTML = ''; // Clear any existing details in the table body
      
          // Populate main item fields
          if (item) {
          document.getElementById('edit-description').value = item.description || '';
          document.getElementById('edit-quantity').value = item.quantity || '';
          document.getElementById('edit-status').value = item.status || '';
          document.getElementById('edit-unitCost').value = item.unitCost || '';
          document.getElementById('edit-unitPrice').value = item.unitPrice || '';
          document.getElementById('edit-category').value = item.category || '';
          document.getElementById('edit-baseUnit').value = item.baseUnit || '';
          }
      
          // Populate item entry details
          itemDetails.forEach(detail => {
          const detailRow = document.createElement('tr');
          detailRow.innerHTML = `
              <td><span>${detail.evaluatedOn || ''}</span></td>
              <td>
              <select>
                  <option value="Purchase Order" ${detail.entryType === 'Purchase Order' ? 'selected' : ''}>Purchase Order</option>
                  <option value="Return" ${detail.entryType === 'Return' ? 'selected' : ''}>Return</option>
              </select>
              </td>
              <td><span>${detail.poNumber || ''}</span></td>
              <td><input type="text" value="${detail.itemNo || ''}" /></td>
              <td><input type="text" value="${detail.description || ''}" /></td>
              <td><input type="date" value="${detail.expirationDate || ''}" /></td>
              <td><input type="text" value="${detail.lotPosition || ''}" /></td>
          `;
          editDetailsTableBody.appendChild(detailRow);
          });
      
          editModal.style.display = 'block'; // Show the modal
      };
  
      // Function to delete an item
      window.deleteItem = function (id) {
          if (confirm('Are you sure you want to delete this item?')) {
          // Implement deletion logic here
          console.log(`Item with ID ${id} deleted.`);
          }
      };
  
      // Function to save changes (edit modal)
      window.saveChanges = function () {
          const updatedItem = {
          description: document.getElementById('edit-description').value,
          quantity: document.getElementById('edit-quantity').value,
          status: document.getElementById('edit-status').value,
          unitCost: document.getElementById('edit-unitCost').value,
          unitPrice: document.getElementById('edit-unitPrice').value,
          category: document.getElementById('edit-category').value,
          baseUnit: document.getElementById('edit-baseUnit').value,
          };
          console.log(`Updated item with ID ${currentItemId}:`, updatedItem);
          closeEditModal();
      };
  
      // Function to close modals
      window.closeModal = function () {
          viewModal.style.display = 'none';
      };
  
      window.closeEditModal = function () {
          editModal.style.display = 'none';
      };
  
      // Close modals when clicking outside
      window.addEventListener('click', (event) => {
          if (event.target === viewModal) closeModal();
          if (event.target === editModal) closeEditModal();
      });
  
      // Function to filter inventory data based on search criteria
      function filterInventory() {
          const searchId = document.getElementById('search-id').value.toLowerCase();
          const searchDescription = document.getElementById('search-description').value.toLowerCase();
          const searchStatus = document.getElementById('search-status').value;
          const searchCategory = document.getElementById('search-category').value.toLowerCase();
  
          const filteredData = inventoryData.filter(item => {
              return (
                  (searchId === '' || item.id.toString().includes(searchId)) &&
                  (searchDescription === '' || item.description.toLowerCase().includes(searchDescription)) &&
                  (searchStatus === '' || item.status === searchStatus) &&
                  (searchCategory === '' || item.category.toLowerCase().includes(searchCategory))
              );
          });
  
          renderTable(filteredData);
      }
  
      // Add event listeners to the search inputs
      document.getElementById('search-id').addEventListener('input', filterInventory);
      document.getElementById('search-description').addEventListener('input', filterInventory);
      document.getElementById('search-status').addEventListener('change', filterInventory);
      document.getElementById('search-category').addEventListener('input', filterInventory);
  
      //inventory view
      document.getElementById('generateReportBtn').addEventListener('click', () => {
          const table = document.querySelector('.inventory-table');
          const rows = table.querySelectorAll('tr');
  
          let reportContent = '<table border="1" style="border-collapse: collapse; width: 100%;">';
          reportContent += '<thead><tr>';
          // Add table headers (excluding "Reorder Level" and "Actions")
          const headers = [...rows[0].children];
          headers.forEach((header, index) => {
              if (index !== 8 && index !== 9) {
                  reportContent += `<th>${header.innerText}</th>`;
              }
          });
          reportContent += '</tr></thead><tbody>';
  
          // Add table rows
          rows.forEach((row, rowIndex) => {
              if (rowIndex === 0) return; // Skip headers
              const cells = [...row.children];
              reportContent += '<tr>';
              cells.forEach((cell, index) => {
                  if (index !== 8 && index !== 9) {
                      reportContent += `<td>${cell.innerText}</td>`;
                  }
              });
              reportContent += '</tr>';
          });
  
          reportContent += '</tbody></table>';
  
          // Open a new window to display the report
          const reportWindow = window.open('', '', 'width=800,height=600');
          reportWindow.document.write(`
              <html>
              <head><title>Inventory Report</title></head>
              <body>${reportContent}</body>
              </html>
          `);
          reportWindow.document.close();
          reportWindow.print();
      });
  
  
      
  });
  