document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const createOrderBtn = document.getElementById('createOrderBtn');
    const purchaseOrderModal = document.getElementById('purchaseOrderModal');
    const closeModalBtn = document.querySelector('.close');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const tabLinks = document.querySelectorAll('.tab__item a');

    // Open modal when "Create Purchase Order" button is clicked
    createOrderBtn.addEventListener('click', () => {
        purchaseOrderModal.style.display = 'block'; // Show the modal
    });

    // Close modal when "X" is clicked
    closeModalBtn.addEventListener('click', () => {
        purchaseOrderModal.style.display = 'none'; // Hide the modal
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === purchaseOrderModal) {
            purchaseOrderModal.style.display = 'none'; // Hide the modal
        }
    });

    // Confirm order button click
    confirmOrderBtn.addEventListener('click', () => {
        const selectedOrder = document.getElementById('orderNumberDropdown').value;
        if (!selectedOrder) {
            alert('Please select an order to confirm.');
            return;
        }

        // Add logic to send the order to the server
        fetch('/confirm_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: selectedOrder }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert('Order confirmed successfully!');
                    purchaseOrderModal.style.display = 'none'; // Hide the modal
                    // Refresh the table or UI here as needed
                } else {
                    alert('Error confirming order: ' + data.error);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });

    // Tab click handling for filtering orders
    tabLinks.forEach((tabLink) => {
        tabLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior

            // Remove the 'is-activated' class from all tabs
            tabLinks.forEach((link) => link.classList.remove('is-activated'));

            // Add the 'is-activated' class to the clicked tab
            tabLink.classList.add('is-activated');

            // Get the filter type from the data attribute
            const filterType = tabLink.getAttribute('data-filter');

            // Filter the purchase orders table based on the filter type
            filterOrders(filterType);
        });
    });

    // Function to filter orders in the table
    function filterOrders(filterType) {
        const rows = document.querySelectorAll('table tbody tr'); // Assuming rows exist in the table
        rows.forEach((row) => {
            const status = row.getAttribute('data-status'); // Get the status of the row
            if (filterType === 'all' || status === filterType) {
                row.style.display = ''; // Show the row
            } else {
                row.style.display = 'none'; // Hide the row
            }
        });
    }
});





document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('approvedRequisitionsDropdown');
    const tableBody = document.querySelector('#itemList'); // Table body for items
    const companyNameField = document.getElementById('companyName'); // Field for company name
    const statusField = document.getElementById('status'); // Field for status
    const dateField = document.getElementById('date'); // Field for date
    const requestedByField = document.getElementById('requestedBy'); // Field for requested by
    const totalAmountField = document.getElementById('totalAmount'); // Field for total amount

    // Fetch and populate the dropdown with approved requisitions
    const fetchApprovedRequisitions = () => {
        fetch('/get_approved_requisitions')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch approved requisitions');
                return response.json();
            })
            .then(data => populateDropdown(data))
            .catch(error => console.error('Error:', error));
    };

    // Populate dropdown with approved requisitions
    const populateDropdown = requisitions => {
        dropdown.innerHTML = '<option value="">Select a requisition</option>'; // Default option
        requisitions.forEach(req => {
            const option = document.createElement('option');
            option.value = req.id; // Requisition ID
            option.dataset.companyName = req.company_name; // Add company name as data attribute
            option.dataset.status = 'Approved'; // All items in this dropdown are approved
            option.dataset.date = req.date; // Add date as data attribute
            option.dataset.requestedBy = req.requested_by; // Add requested by as data attribute
            option.textContent = `${req.company_name} - ${req.date}`; // Display company name and date
            dropdown.appendChild(option);
        });
    };

    // Fetch items for a selected requisition
    const fetchRequisitionItems = requisitionId => {
        fetch(`/get_requisition_items?id=${requisitionId}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch requisition items');
                return response.json();
            })
            .then(data => {
                populateItemsTable(data);  // Populate the items table
                updateTotalAmount();        // Update the total amount
            })
            .catch(error => console.error('Error:', error));
    };

    // Populate the items table
    const populateItemsTable = items => {
        tableBody.innerHTML = ''; // Clear existing rows
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>${item.quantity * item.price}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Update total amount after populating items table
    const updateTotalAmount = () => {
        let total = 0;
        const rows = document.querySelectorAll('#itemList tr');
        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('td:nth-child(2)').textContent); // Get quantity
            const price = parseFloat(row.querySelector('td:nth-child(3)').textContent); // Get price
            total += (quantity * price);
        });
        totalAmountField.textContent = `Total: ${total.toFixed(2)}`; // Update total amount display
    };

    // Display requisition details (company name, status, date, and requested by)
    const displayRequisitionDetails = (companyName, status, date, requestedBy) => {
        companyNameField.textContent = companyName || 'N/A';
        statusField.textContent = status || 'N/A';
        dateField.textContent = date || 'N/A';
        requestedByField.textContent = requestedBy || 'N/A';
    };

    // Event listener for dropdown selection
    dropdown.addEventListener('change', event => {
        const selectedOption = event.target.options[event.target.selectedIndex];
        const requisitionId = selectedOption.value;

        if (requisitionId) {
            const companyName = selectedOption.dataset.companyName;
            const status = selectedOption.dataset.status;
            const date = selectedOption.dataset.date;
            const requestedBy = selectedOption.dataset.requestedBy;

            displayRequisitionDetails(companyName, status, date, requestedBy); // Display requisition details
            fetchRequisitionItems(requisitionId); // Fetch and display items for the selected requisition
        } else {
            tableBody.innerHTML = ''; // Clear table if no requisition is selected
            displayRequisitionDetails('', '', '', ''); // Clear details
            totalAmountField.textContent = 'Total: N/A'; // Reset total amount
        }
    });

    // Fetch approved requisitions on page load
    fetchApprovedRequisitions();
});




const confirmOrderBtn = document.getElementById('confirmOrderBtn');

// Event listener for submitting the purchase order
confirmOrderBtn.addEventListener('click', async () => {
    const orderNumber = document.getElementById('approvedRequisitionsDropdown').value;
    const supplierName = document.getElementById('companyName').innerText;
    const requestedBy = document.getElementById('requestedBy').innerText;
    const orderStatus = document.getElementById('status').innerText;
    const issueDate = document.getElementById('date').innerText;
    const totalAmountText = document.getElementById('totalAmount').innerText;

    // Extract numerical value from the 'Total: N/A' text (if applicable)
    const totalAmount = totalAmountText.replace(/[^\d.-]/g, '') || 0;

    // Extract order items from the table (assuming you have rows with this class)
    const items = [];
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const name = row.querySelector('.item-name').innerText;
        const quantity = parseInt(row.querySelector('.item-quantity').innerText, 10);
        const price = parseFloat(row.querySelector('.item-price').innerText);
        const total = parseFloat(row.querySelector('.item-total').innerText);
        items.push({ name, quantity, price, total });
    });

    if (items.length === 0) {
        alert('Please add items to the order.');
        return; // Prevent sending if no items are present
    }

    const orderData = {
        orderNumber: orderNumber,
        supplierName: supplierName,
        requestedBy: requestedBy,
        orderStatus: orderStatus,
        issueDate: issueDate,
        totalAmount: parseFloat(totalAmount),
        items: items  // Send the items array as part of the payload
    };

    try {
        const response = await fetch('/submit_purchase_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the purchase order.');
    }
});

