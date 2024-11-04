document.addEventListener('DOMContentLoaded', () => {
    const createOrderBtn = document.getElementById('createOrderBtn');
    const purchaseOrderModal = document.getElementById('purchaseOrderModal');
    const orderDetailsModal = document.getElementById('orderDetailsModal'); // New modal for viewing details
    const closePurchaseModalBtn = document.querySelector('.close'); // Close button for purchase modal
    const closeOrderDetailsModalBtn = document.querySelector('#orderDetailsModal .close'); // Close button for order details modal
    const itemList = document.getElementById('itemList');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const orderNumberDropdown = document.getElementById('orderNumberDropdown');
    const purchaseOrdersTable = document.getElementById('purchaseOrdersTable');

    // Initialize available orders
    const availableOrders = ['#PO4', '#PO5', '#PO6', '#PO7', '#PO8', '#PO9'];

    // Function to open the purchase order modal and reset it
    function openPurchaseOrderModal() {
        resetDropdownOptions(); // Reset the dropdown options
        document.getElementById('fromDetails').value = ""; // Clear From field
        document.getElementById('billToDetails').value = ""; // Clear Bill To field
        document.getElementById('issueDate').value = new Date().toISOString().split('T')[0]; // Set today's date
        itemList.innerHTML = ''; // Clear existing items
        document.getElementById('total').value = ""; // Reset total

        // Show the purchase order modal
        purchaseOrderModal.style.display = 'block';
    }

    // Function to open the order details modal with relevant data
    function openOrderDetailsModal(orderData) {
        const detailsContent = `
            <p><strong>Purchase Order:</strong> ${orderData.orderNumber}</p>
            <p><strong>From:</strong> ${orderData.fromDetails}</p>
            <p><strong>Bill To:</strong> ${orderData.billToDetails}</p>
            <p><strong>Issue Date:</strong> ${orderData.issueDate}</p>
            <p><strong>Total:</strong> ${orderData.total}</p>
            <p><strong>Status:</strong> <span class="status-ordered">${orderData.status}</span></p>
            <p><strong>Received:</strong> ${orderData.receivedCount} of ${orderData.uniqueItemCount}</p>
        `;
        document.querySelector('#orderDetailsModal .modal-body').innerHTML = detailsContent;

        // Show the order details modal
        orderDetailsModal.style.display = 'block';
    }

    // Function to reset dropdown options based on available orders
    function resetDropdownOptions() {
        orderNumberDropdown.innerHTML = `<option value="" disabled selected>Select an Order</option>`; // Reset dropdown
        availableOrders.forEach(order => {
            const opt = document.createElement('option');
            opt.value = order;
            opt.textContent = order;
            orderNumberDropdown.appendChild(opt);
        });
    }

    // Open modal when clicking the create order button
    createOrderBtn.addEventListener('click', openPurchaseOrderModal);

    // Close purchase order modal functionality
    closePurchaseModalBtn.addEventListener('click', () => {
        purchaseOrderModal.style.display = 'none';
    });

    // Close order details modal functionality
    closeOrderDetailsModalBtn.addEventListener('click', () => {
        orderDetailsModal.style.display = 'none';
    });

    // Close modal when clicking outside of modal
    window.addEventListener('click', (event) => {
        if (event.target === purchaseOrderModal) {
            purchaseOrderModal.style.display = 'none';
        } else if (event.target === orderDetailsModal) {
            orderDetailsModal.style.display = 'none';
        }
    });

    // Add event listener for order number dropdown
    orderNumberDropdown.addEventListener('change', () => {
        const selectedOrder = orderNumberDropdown.value;
        itemList.innerHTML = ''; // Clear existing items
        let items = [];
        let fromDetails = '';
        let billToDetails = '';

        // Define items and details for different purchase order numbers
        if (selectedOrder === "#PO4") {
            items = [
                { name: "Item X", quantity: 100, price: 20.00 },
                { name: "Item Y", quantity: 200, price: 15.00 },
                { name: "Item Z", quantity: 50, price: 30.00 }
            ];
            fromDetails = "Supplier A, Address 1";
            billToDetails = "Customer A, Address 2";
        } else if (selectedOrder === "#PO5") {
            items = [
                { name: "Item A", quantity: 150, price: 30.00 },
                { name: "Item B", quantity: 100, price: 40.00 },
                { name: "Item C", quantity: 80, price: 50.00 }
            ];
            fromDetails = "Supplier B, Address 3";
            billToDetails = "Customer B, Address 4";
        } else if (selectedOrder === "#PO6") {
            items = [
                { name: "Item C", quantity: 300, price: 25.00 },
                { name: "Item D", quantity: 250, price: 10.00 },
                { name: "Item E", quantity: 150, price: 5.00 }
            ];
            fromDetails = "Supplier C, Address 5";
            billToDetails = "Customer C, Address 6";
        } else if (selectedOrder === "#PO7") {
            items = [
                { name: "Item F", quantity: 100, price: 45.00 },
                { name: "Item G", quantity: 60, price: 70.00 },
                { name: "Item H", quantity: 200, price: 12.00 }
            ];
            fromDetails = "Supplier D, Address 7";
            billToDetails = "Customer D, Address 8";
        } else if (selectedOrder === "#PO8") {
            items = [
                { name: "Item I", quantity: 150, price: 20.00 },
                { name: "Item J", quantity: 50, price: 25.00 },
                { name: "Item K", quantity: 30, price: 55.00 }
            ];
            fromDetails = "Supplier E, Address 9";
            billToDetails = "Customer E, Address 10";
        } else if (selectedOrder === "#PO9") {
            items = [
                { name: "Item L", quantity: 90, price: 35.00 },
                { name: "Item M", quantity: 80, price: 40.00 },
                { name: "Item N", quantity: 200, price: 10.00 }
            ];
            fromDetails = "Supplier F, Address 11";
            billToDetails = "Customer F, Address 12";
        }

        // Populate item list and other details
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.name}</td><td>${item.quantity}</td><td>pcs</td><td>₱${item.price.toFixed(2)}</td><td>₱${(item.price * item.quantity).toFixed(2)}</td>`;
            itemList.appendChild(row);
        });

        // Set From and Bill To details
        document.getElementById('fromDetails').value = fromDetails;
        document.getElementById('billToDetails').value = billToDetails;

        // Calculate total
        const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        document.getElementById('total').value = `₱${total.toFixed(2)}`;
    });

    // Confirm order functionality
confirmOrderBtn.addEventListener('click', () => {
    // Get values from the modal
    const orderNumber = orderNumberDropdown.value;
    const fromDetails = document.getElementById('fromDetails').value;
    const billToDetails = document.getElementById('billToDetails').value;
    const issueDate = document.getElementById('issueDate').value;
    const total = document.getElementById('total').value;

    // Determine the number of unique items for the received count
    let uniqueItemCount = 0;
    let orderStatus = "Ordered"; // Set default status as Ordered
    if (orderNumber === "#PO4") {
        uniqueItemCount = 3; // Item X, Item Y, Item Z
    } else if (orderNumber === "#PO5") {
        uniqueItemCount = 3; // Item A, Item B, Item C
    } else if (orderNumber === "#PO6") {
        uniqueItemCount = 3; // Item C, Item D, Item E
    } else if (orderNumber === "#PO7") {
        uniqueItemCount = 3; // Item F, Item G, Item H
    } else if (orderNumber === "#PO8") {
        uniqueItemCount = 3; // Item I, Item J, Item K
    } else if (orderNumber === "#PO9") {
        uniqueItemCount = 3; // Item L, Item M, Item N
    }

    // Create a new row in the purchase orders table
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${orderNumber}</td>
        <td>${fromDetails.split(',')[0]}</td>
        <td>${billToDetails.split(',')[0]}</td>
        <td><span class="status-ordered">${orderStatus}</span></td>
        <td>0 of ${uniqueItemCount}</td> <!-- Display Received as "0 of number of unique items" -->
        <td>${total}</td>
        <td>${issueDate}</td>
    `;
    newRow.classList.add('clickable-row'); // Add class to new row for click functionality
    newRow.setAttribute('data-status', orderStatus.toLowerCase()); // Set data-status attribute for filtering
    purchaseOrdersTable.appendChild(newRow);

    // Remove the selected order from dropdown
    removeOrderFromDropdown(orderNumber);

    // Reset the modal
    purchaseOrderModal.style.display = 'none'; // Close the modal after confirmation

    // Attach click event to the new row
    attachRowClickEvent(newRow);
});


    // Function to remove selected order from dropdown
    function removeOrderFromDropdown(selectedOrder) {
        const index = availableOrders.indexOf(selectedOrder);
        if (index > -1) {
            availableOrders.splice(index, 1); // Remove from available orders
        }
        resetDropdownOptions(); // Reset dropdown to show updated options
    }

    // Function to attach click event to table rows for viewing details
    function attachRowClickEvent(row) {
        row.addEventListener('click', function () {
            const orderNumber = this.cells[0].textContent; // Assuming first cell is the order number
            const fromDetails = this.cells[1].textContent; // Assuming second cell is the from details
            const billToDetails = this.cells[2].textContent; // Assuming third cell is the bill to details
            const status = this.querySelector('span').textContent; // Status of the order
            const receivedCount = this.cells[4].textContent.split(' ')[0]; // Extract received count
            const uniqueItemCount = this.cells[4].textContent.split(' ')[2]; // Extract unique item count
            const total = this.cells[5].textContent; // Total amount
            const issueDate = this.cells[6].textContent; // Issue date

            // Prepare order data for the details modal
            const orderData = {
                orderNumber,
                fromDetails,
                billToDetails,
                status,
                receivedCount,
                uniqueItemCount,
                total,
                issueDate
            };

            // Open the order details modal
            openOrderDetailsModal(orderData);
        });
    }
// Function to filter rows based on the selected tab
function filterRows(filter) {
    const rows = purchaseOrdersTable.querySelectorAll('tr'); // Get all rows
    rows.forEach(row => {
        const status = row.getAttribute('data-status'); // Get the status from the data attribute
        if (filter === 'all' || status === filter) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    });
}

// Add event listeners to the tab links
const tabLinks = document.querySelectorAll('.tab__nav a');
tabLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        tabLinks.forEach(tab => tab.classList.remove('is-activated')); // Remove activation from all tabs
        link.classList.add('is-activated'); // Activate the clicked tab
        const filter = link.getAttribute('data-filter'); // Get the filter type
        filterRows(filter); // Filter the rows based on the selected tab
    });
});

    // Make existing table rows clickable for viewing details
    const existingRows = document.querySelectorAll('.clickable-row');
    existingRows.forEach(row => {
        attachRowClickEvent(row);
    });
});