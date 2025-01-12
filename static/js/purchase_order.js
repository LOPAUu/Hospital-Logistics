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
    const items = []; // Declare items array in a broader scope

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

    // Populate the items table and synchronize the items array
    const populateItemsTable = itemsData => {
        tableBody.innerHTML = ''; // Clear existing rows
        items.length = 0; // Reset items array

        itemsData.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add('item-row');
            row.innerHTML = `
                <td class="item-name">${item.name}</td>
                <td class="item-quantity">${item.quantity}</td>
                <td class="item-price">${item.price}</td>
                <td class="item-total">${(item.quantity * item.price).toFixed(2)}</td>
            `;
            tableBody.appendChild(row);

            // Add item to items array
            items.push({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            });
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

    // Event listener for submitting the purchase order
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    confirmOrderBtn.addEventListener('click', async () => {
        const orderNumber = dropdown.value;
        const supplierName = companyNameField.textContent.trim();
        const requestedBy = requestedByField.textContent.trim();
        const orderStatus = statusField.textContent.trim();
        const issueDate = dateField.textContent.trim();
        const totalAmount = parseFloat(totalAmountField.textContent.replace(/[^\d.-]/g, '')) || 0;

        if (!items.length) {
            alert('Please add items to the order.');
            return; // Prevent submission if no items are present
        }

        const orderData = {
            orderNumber,
            supplierName,
            requestedBy,
            orderStatus,
            issueDate,
            totalAmount,
            items
        };

        try {
            const response = await fetch('/submit_purchase_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
});






document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector("table");

    // Fetch purchase orders from the backend
    const fetchPurchaseOrders = async () => {
        try {
            const response = await fetch('/purchase-orders');
            const data = await response.json();
            renderPurchaseOrders(data);
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
        }
    };

    // Render purchase orders to the table
    const renderPurchaseOrders = (orders) => {
        const tbody = document.createElement("tbody");

        orders.forEach(order => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.supplier}</td>
                <td>${order.status}</td>
                <td>${order.received}</td>
                <td>${order.total_amount.toFixed(2)}</td>
                <td>${order.issue_date}</td>
                <td>${order.ordered_by}</td>
                <td>
                    <button class="view-btn" data-id="${order.id}">View</button>
                    <button class="evaluate-btn" data-id="${order.id}">Evaluate</button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Clear existing rows and append the new ones
        const existingTbody = table.querySelector("tbody");
        if (existingTbody) table.removeChild(existingTbody);
        table.appendChild(tbody);
    };

    // Initialize fetch on page load
    fetchPurchaseOrders();

    // Example: Add event listeners for buttons
    table.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-btn")) {
            const orderId = e.target.dataset.id;
            console.log(`View order: ${orderId}`);
            // Add logic to open and populate the View Modal
        } else if (e.target.classList.contains("evaluate-btn")) {
            const orderId = e.target.dataset.id;
            console.log(`Evaluate order: ${orderId}`);
            // Add logic to open and populate the Evaluate Modal
        }
    });
});





