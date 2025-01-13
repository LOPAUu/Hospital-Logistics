document.addEventListener('DOMContentLoaded', () => {
    const createOrderBtn = document.getElementById('createOrderBtn');
    const purchaseOrderModal = document.getElementById('purchaseOrderModal');
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const closePurchaseModalBtn = document.querySelector('.close');
    const closeOrderDetailsModalBtn = document.querySelector('#orderDetailsModal .close');
    const itemList = document.getElementById('itemList');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const orderNumberDropdown = document.getElementById('orderNumberDropdown');
    const purchaseOrdersTable = document.getElementById('purchaseOrdersTable');
    const evaluateModal = document.getElementById("evaluateModal");
    const evaluateCloseBtn = evaluateModal.querySelector(".close");
    const submitEvaluationBtn = document.getElementById("submitEvaluationBtn");
    const skuModal = document.getElementById('skuModal');
    const skuTableBody = document.getElementById('skuTableBody');

    // Initialize available orders
    const availableOrders = ['#PO4', '#PO5', '#PO6', '#PO7', '#PO8', '#PO9'];

    // Function to open the purchase order modal and reset it
    function openPurchaseOrderModal() {
        resetDropdownOptions();
        document.getElementById('fromDetails').value = "";
        document.getElementById('fromDetails').setAttribute('readonly', true);
        document.getElementById('orderStatus').value = "Ordered";
        document.getElementById('orderStatus').setAttribute('readonly', true);
        document.getElementById('issueDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('orderedBy').value = "";
        itemList.innerHTML = '';
        document.getElementById('total').value = "";

        // Show the purchase order modal
        purchaseOrderModal.style.display = 'block';
    }

    // Function to open the order details modal with relevant data
    function openOrderDetailsModal(orderData) {
        const detailsContent = `
            <p><strong>Purchase Order:</strong> ${orderData.orderNumber}</p>
            <p><strong>From:</strong> ${orderData.fromDetails}</p>
            <p><strong>Issue Date:</strong> ${orderData.issueDate}</p>
            <p><strong>Total:</strong> ${orderData.total}</p>
            <p><strong>Status:</strong> <span class="status-ordered">${orderData.status}</span></p>
            <p><strong>Received:</strong> ${orderData.receivedCount} of ${orderData.uniqueItemCount}</p>
            <p><strong>Ordered By:</strong> ${orderData.orderedBy}</p>
        `;
        document.querySelector('#orderDetailsModal .modal-body').innerHTML = detailsContent;

        // Show the order details modal
        orderDetailsModal.style.display = 'block';
    }

    // Function to reset dropdown options based on available orders
    function resetDropdownOptions() {
        orderNumberDropdown.innerHTML = `<option value="" disabled selected>Select an Order</option>`;
        availableOrders.forEach(order => {
            const opt = document.createElement('option');
            opt.value = order;
            opt.textContent = order;
            orderNumberDropdown.appendChild(opt);
        });
    }

    // Open modal when clicking the create order button
    createOrderBtn.addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        document.getElementById('issueDate').value = today; // Set it in the issue date field
    
        // Reset the modal fields
        document.getElementById('fromDetails').value = '';
        document.getElementById('orderNumberDropdown').value = '';
        document.getElementById('total').value = '';
    
        // Set the modal to visible
        const purchaseOrderModal = document.getElementById('purchaseOrderModal');
        purchaseOrderModal.style.display = 'block';
    });
    

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
        itemList.innerHTML = '';
        let items = [];
        let fromDetails = '';
        let orderedBy = '';

        if (selectedOrder === "#PO4") {
            items = [
                { name: "Item X", quantity: 100, price: 20.00 },
                { name: "Item Y", quantity: 200, price: 15.00 },
                { name: "Item Z", quantity: 50, price: 30.00 }
            ];
            fromDetails = "Supplier A, Address 1";
            orderedBy = "Sangreo";
        } else if (selectedOrder === "#PO5") {
            items = [
                { name: "Item A", quantity: 150, price: 30.00 },
                { name: "Item B", quantity: 100, price: 40.00 },
                { name: "Item C", quantity: 80, price: 50.00 }
            ];
            fromDetails = "Supplier B, Address 3";
            orderedBy = "Mariel";
        } else if (selectedOrder === "#PO6") {
            items = [
                { name: "Item C", quantity: 300, price: 25.00 },
                { name: "Item D", quantity: 250, price: 10.00 },
                { name: "Item E", quantity: 150, price: 5.00 }
            ];
            fromDetails = "Supplier C, Address 5";
            orderedBy = "Rene";
        } else if (selectedOrder === "#PO7") {
            items = [
                { name: "Item F", quantity: 100, price: 45.00 },
                { name: "Item G", quantity: 60, price: 70.00 },
                { name: "Item H", quantity: 200, price: 12.00 }
            ];
            fromDetails = "Supplier D, Address 7";
            orderedBy = "Richard";
        } else if (selectedOrder === "#PO8") {
            items = [
                { name: "Item I", quantity: 150, price: 20.00 },
                { name: "Item J", quantity: 50, price: 25.00 },
                { name: "Item K", quantity: 30, price: 55.00 }
            ];
            fromDetails = "Supplier E, Address 9";
            orderedBy = "Mavs";
        } else if (selectedOrder === "#PO9") {
            items = [
                { name: "Item L", quantity: 90, price: 35.00 },
                { name: "Item M", quantity: 80, price: 40.00 },
                { name: "Item N", quantity: 200, price: 10.00 }
            ];
            fromDetails = "Supplier F, Address 11";
            orderedBy = "Kyle";
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.name}</td><td>${item.quantity}</td><td>pcs</td><td>₱${item.price.toFixed(2)}</td><td>₱${(item.price * item.quantity).toFixed(2)}</td>`;
            itemList.appendChild(row);
        });

        document.getElementById('fromDetails').value = fromDetails;
        document.getElementById('orderedBy').value = orderedBy;

        const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        document.getElementById('total').value = `₱${total.toFixed(2)}`;
    });

    // Event listener for creating a new purchase order
confirmOrderBtn.addEventListener('click', () => {
    const orderNumber = orderNumberDropdown.value;
    const fromDetails = document.getElementById('fromDetails').value;
    const issueDate = document.getElementById('issueDate').value;
    const total = document.getElementById('total').value;

    // Define "Ordered By" values for specific purchase orders
    let orderedBy = "";
    if (orderNumber === "#PO4") {
        orderedBy = "Sangreo";
    } else if (orderNumber === "#PO5") {
        orderedBy = "Mariel";
    } else if (orderNumber === "#PO6") {
        orderedBy = "Rene";
    } else if (orderNumber === "#PO7") {
        orderedBy = "Richard";
    } else if (orderNumber === "#PO8") {
        orderedBy = "Mavs";
    } else if (orderNumber === "#PO9") {
        orderedBy = "Kyle";
    }

    // Create a new row in the purchase orders table
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${orderNumber}</td>
        <td>${fromDetails.split(',')[0]}</td>
        <td><span class="status-ordered">Ordered</span></td>
        <td>None</td>
        <td>${total}</td>
        <td>${issueDate}</td>
        <td>${orderedBy}</td> <!-- Automatically populate "Ordered By" -->
        <td>
            <button class="viewBtn">View</button>
            <button class="deleteBtn">Delete</button>
            <button class="evaluateBtn">Evaluate</button>
        </td>
    `;
    newRow.classList.add('clickable-row'); // Add class to new row for click functionality
    newRow.setAttribute('data-status', "ordered"); // Set data-status attribute for filtering
    newRow.setAttribute('data-created-date', new Date().toISOString().split('T')[0]); // Set created date
    purchaseOrdersTable.appendChild(newRow);

    // Remove the selected order from dropdown
    removeOrderFromDropdown(orderNumber);

    // Reset the modal
    purchaseOrderModal.style.display = 'none'; // Close the modal after confirmation
});


    // Remove selected order from dropdown
    function removeOrderFromDropdown(selectedOrder) {
        const index = availableOrders.indexOf(selectedOrder);
        if (index > -1) {
            availableOrders.splice(index, 1);
        }
        resetDropdownOptions();
    }

    // Attach event listener to action buttons (View, Delete, Evaluate)
    purchaseOrdersTable.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('viewBtn')) {
            // Handle view button
            const row = target.closest('tr');
            openOrderDetailsModal({
                orderNumber: row.cells[0].textContent,    // Purchase Order Number
                fromDetails: row.cells[1].textContent,    // From
                issueDate: row.cells[5].textContent,      // Issue Date
                total: row.cells[4].textContent,          // Total
                status: row.cells[2].textContent,         // Status
                receivedCount: row.cells[3].textContent.split(' ')[0],   // Received Count
                uniqueItemCount: row.cells[3].textContent.split(' ')[2], // Unique Item Count
                orderedBy: row.cells[6].textContent       // Ordered By
            });
        } else if (target.classList.contains('deleteBtn')) {
            // Handle delete button
            const row = target.closest('tr');
            row.remove();
        } else if (target.classList.contains('evaluateBtn')) {
            // Handle evaluate button
            const row = target.closest('tr');
            const orderNumber = row.cells[0].textContent;
            const createdDate = row.getAttribute('data-created-date');
            const updatedDate = new Date().toISOString().split('T')[0]; // Get the current date

            document.getElementById('evaluateOrderNumber').value = orderNumber;
            document.getElementById('createdDate').value = createdDate;
            document.getElementById('updatedDate').value = updatedDate;

            // Populate evaluate modal
            populateEvaluateModal(row);
        }
    });

    // Function to filter rows based on the selected tab
    function filterRows(filter) {
        const rows = document.querySelectorAll("#purchaseOrdersTable tr"); // Get all rows in the table
        rows.forEach((row) => {
            const rowStatus = row.getAttribute("data-status"); // Get the row's data-status attribute

            // Show row if it matches the filter or if "all" is selected
            if (filter === "all" || rowStatus === filter) {
                row.style.display = ""; // Show the row
            } else {
                row.style.display = "none"; // Hide the row
            }
        });
    }

    // Add event listeners to the tab links
    const tabLinks = document.querySelectorAll(".tab__nav a"); // Select all filter tabs
    tabLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior

            const filter = link.getAttribute("data-filter"); // Get the filter type (all, ordered, partial, completed)

            // Highlight the active tab
            tabLinks.forEach((tab) => tab.classList.remove("is-activated")); // Remove active class from all tabs
            link.classList.add("is-activated"); // Add active class to the clicked tab

            // Filter the rows based on the selected filter
            filterRows(filter);
        });
    });

    // Make the existing rows non-clickable (no need for `clickable-row` class anymore)
    const existingRows = document.querySelectorAll('tbody tr');
    existingRows.forEach(row => {
        row.classList.remove('clickable-row');
    });

    // Function to populate evaluate modal
    function populateEvaluateModal(orderRow) {
        const orderNumber = orderRow.cells[0].textContent;
        const items = getOrderItems(orderNumber); // Get items based on the order number
        const evaluateItemList = document.getElementById("evaluateItemList");

        evaluateItemList.innerHTML = ""; // Clear the previous content

        items.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.name}</td>
                <td><in>${item.quantity}</td>
                <tdput type="number" min="0" max="${item.quantity}" value="0" class="received-input"></td>
                <td><input type="number" min="0" max="${item.quantity}" value="0" class="lost-input"></td>
                <td><input type="number" min="0" max="${item.quantity}" value="0" class="damaged-input"></td>
            `;
            evaluateItemList.appendChild(row);
        });

        // Populate order number
        document.getElementById("evaluateOrderNumber").value = orderNumber;

        // Open Modal
        evaluateModal.style.display = "block";
    }

    // Function to get order items (example data for demonstration purposes)
    function getOrderItems(orderNumber) {
        const mockData = {
            "#PO4": [
                { name: "Item X", quantity: 100 },
                { name: "Item Y", quantity: 200 },
                { name: "Item Z", quantity: 50 },
            ],
            "#PO5": [
                { name: "Item A", quantity: 150 },
                { name: "Item B", quantity: 100 },
                { name: "Item C", quantity: 80 },
            ],
            "#PO6": [
                { name: "Item C", quantity: 300 },
                { name: "Item D", quantity: 250 },
                { name: "Item E", quantity: 150 },
            ],
            "#PO7": [
                { name: "Item F", quantity: 100 },
                { name: "Item G", quantity: 60 },
                { name: "Item H", quantity: 200 },
            ],
            "#PO8": [
                { name: "Item I", quantity: 150 },
                { name: "Item J", quantity: 50 },
                { name: "Item K", quantity: 30 },
            ],
            "#PO9": [
                { name: "Item L", quantity: 90 },
                { name: "Item M", quantity: 80 },
                { name: "Item N", quantity: 200 },
            ],
            // Add more mock data as needed
        };
        return mockData[orderNumber] || [];
    }

    // Attach event listener to evaluate buttons
    purchaseOrdersTable.addEventListener("click", (event) => {
        if (event.target.classList.contains("evaluateBtn")) {
            const orderRow = event.target.closest("tr");
            const orderNumber = orderRow.cells[0].textContent.trim();
            const evaluateItemList = document.getElementById("evaluateItemList");

            // Clear previous modal content
            evaluateItemList.innerHTML = "";

            // Check if saved data exists
            const savedData = evaluations[orderNumber] || [];

            // Populate modal with saved or default data
            if (savedData.length > 0) {
                savedData.forEach((item) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${item.itemName}</td>
                        <td>${item.orderedQuantity}</td>
                        <td><input type="number" class="received-input" value="${item.receivedQuantity}" /></td>
                        <td><input type="number" class="lost-input" value="${item.lostQuantity}" /></td>
                        <td><input type="number" class="damaged-input" value="${item.damagedQuantity}" /></td>
                    `;
                    evaluateItemList.appendChild(row);
                });
            } else {
                // Load default data if no evaluation exists
                const items = getOrderItems(orderNumber); // Assume `getOrderItems` provides the original items
                items.forEach((item) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td><input type="number" class="received-input" value="0" /></td>
                        <td><input type="number" class="lost-input" value="0" /></td>
                        <td><input type="number" class="damaged-input" value="0" /></td>

                    `;
                    evaluateItemList.appendChild(row);
                });
            }

            // Set order number in the modal
            document.getElementById("evaluateOrderNumber").value = orderNumber;

            // Open modal
            evaluateModal.style.display = "block";
        }
    });

    // Close modal functionality
    evaluateCloseBtn.addEventListener("click", () => {
        evaluateModal.style.display = "none";
    });

    // Global object to store evaluations by order number
    const evaluations = {};

    submitEvaluationBtn.addEventListener("click", () => {
        const orderNumber = document.getElementById("evaluateOrderNumber").value;
        const evaluateItemList = document.querySelectorAll("#evaluateItemList tr");
    
        let isComplete = true; // Assume the order is complete initially
        let totalReceived = 0;
        let totalLost = 0;
        let totalDamaged = 0;
    
        let isValid = true;
        const evaluationData = []; // Store evaluation data for this order
    
        evaluateItemList.forEach((row, index) => {
            const itemName = row.cells[0].textContent.trim(); // Item name
            const orderedQuantity = parseInt(row.cells[1].textContent.trim(), 10);
            const receivedQuantity = parseInt(row.querySelector(".received-input").value.trim(), 10) || 0;
            const lostQuantity = parseInt(row.querySelector(".lost-input").value.trim(), 10) || 0;
            const damagedQuantity = parseInt(row.querySelector(".damaged-input").value.trim(), 10) || 0;
    
            // Validation: Check total does not exceed ordered quantity
            if (receivedQuantity + lostQuantity + damagedQuantity !== orderedQuantity) {
                alert(
                    `Row ${index + 1}: Received (${receivedQuantity}), Lost (${lostQuantity}), and Damaged (${damagedQuantity}) must equal Ordered (${orderedQuantity}).`
                );
                isValid = false;
                return;
            }
    
            // Update completeness
            if (receivedQuantity < orderedQuantity || lostQuantity > 0 || damagedQuantity > 0) {
                isComplete = false;
            }
    
            // Update totals
            totalReceived += receivedQuantity;
            totalLost += lostQuantity;
            totalDamaged += damagedQuantity;
    
            // Save data for this item
            evaluationData.push({
                itemName,
                orderedQuantity,
                receivedQuantity,
                lostQuantity,
                damagedQuantity,
            });
        });
    
        if (!isValid) return; // Stop submission if validation fails
    
        // Save evaluation data for the order
        evaluations[orderNumber] = evaluationData;
    
        // Update table with status
        const rows = purchaseOrdersTable.querySelectorAll("tr");
        rows.forEach((row) => {
            if (row.cells[0].textContent === orderNumber) {
                const statusCell = row.querySelector(".status-ordered");
                const receivedCell = row.cells[3]; // "Received" column
                const totalCell = row.cells[4];    // "Total" column
                
                let newStatus = "Partial"; // Default to Partial
    
                if (isComplete) {
                    statusCell.textContent = "Completed";
                    statusCell.classList.remove("partial");
                    statusCell.classList.add("completed");
                    row.setAttribute("data-status", "completed");
                    newStatus = "Received"; // Set to Received if complete
                } else {
                    statusCell.textContent = "Partial";
                    statusCell.classList.remove("completed");
                    statusCell.classList.add("partial");
                    row.setAttribute("data-status", "partial");
                }
    
                // Update "Received" column
                receivedCell.textContent = `Received: ${totalReceived}, Lost: ${totalLost}, Damaged: ${totalDamaged}`;
    
                // Refresh actions (add SKU button if needed)
                updateActionButtons(row, newStatus, orderNumber);
            }
        });
    
        // Update the "updated date" field in the modal
        document.getElementById('updatedDate').value = new Date().toISOString().split('T')[0];
    
        // Close modal
        evaluateModal.style.display = "none";
        Swal.fire({
            icon: "success",
            title: `Evaluation for order ${orderNumber} saved successfully.`,
            showConfirmButton: false,
            timer: 1500
          });
        });
    

    // Update the "Received" column in the table
    const orderRow = Array.from(purchaseOrdersTable.rows).find(
        (row) => row.cells[0].textContent === orderNumber
    );
    if (orderRow) {
        orderRow.cells[4].textContent = `${totalReceived} of ${orderRow.cells[4].textContent.split(' ')[2]} (Lost: ${totalLost}, Damaged: ${totalDamaged})`;
    }

    // Close and reset the modal
    resetEvaluateModal();
    evaluateModal.style.display = "none";

    alert(`Evaluation submitted for Order ${orderNumber}. Total items received: ${totalReceived}`);

    // Reset evaluation modal
    function resetEvaluateModal() {
        document.getElementById("evaluateOrderNumber").value = "";
        const evaluateItemList = document.getElementById("evaluateItemList");
        evaluateItemList.innerHTML = ""; // Clear the item list
    }

    // Close modal on clicking outside the modal
    window.addEventListener("click", (event) => {
        if (event.target === evaluateModal) {
            evaluateModal.style.display = "none";
        }
    });

    //SSSSSSSSSSKKKKKKKKKKKKKKKKKKKKKKKKUUUUUUUUUUUUUUUUUU

   // Function to open the SKU modal
   function openSkuModal(orderNumber) {
    console.log(`Opening SKU modal for order: ${orderNumber}`);

    skuTableBody.innerHTML = ''; // Clear previous data

    // Fetch SKU data for the given orderNumber (mock data for demonstration)
    const items = getOrderItems(orderNumber); // Replace with your real data
    items.forEach(item => {
        addItemRow(item.name, item.quantity);
    });

    // Hide other modals and show the SKU modal
    evaluateModal.style.display = 'none';
    skuModal.style.display = 'block';
}

// Function to add a new item row
function addItemRow(itemName, itemQuantity) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${itemName}</td>
        <td>${itemQuantity}</td>
        <td><input type="text" class="sku-input" placeholder="Enter SKU" /></td>
        <td><input type="number" class="quantity-input" placeholder="Enter Quantity" /></td>
        <td><input type="date" class="expiration-input" /></td>
        <td>
            <button class="addSkuBtn">Add SKU</button>
        </td>
    `;
    document.getElementById('skuTableBody').appendChild(row);


    // Add event listener for the add SKU button
    row.querySelector('.addSkuBtn').addEventListener('click', () => {
        addSkuRow(row);
    });
}

// Function to add a new SKU row below an existing item row
function addSkuRow(itemRow) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td></td>
        <td></td>
        <td><input type="text" class="sku-input" placeholder="Enter SKU" /></td>
        <td><input type="number" class="quantity-input" placeholder="Enter Quantity" /></td>
        <td><input type="date" class="expiration-input" /></td>
        <td><button class="deleteRowBtn">Delete</button></td>
    `;
    itemRow.insertAdjacentElement('afterend', row);

    // Add event listener for the delete button
    row.querySelector('.deleteRowBtn').addEventListener('click', () => {
        row.remove();
    });
}

// Attach event listener to the SKU button
document.querySelectorAll('.skuBtn').forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering other events
        const orderNumber = button.getAttribute('data-order'); // Assume orderNumber is set as a data attribute
        openSkuModal(orderNumber);
    });
});

// Close SKU modal functionality
document.querySelector('#skuModal .close').addEventListener('click', () => {
    skuModal.style.display = 'none';
});

// Ensure modal closes when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === skuModal) {
        skuModal.style.display = 'none';
    }
});

// Save SKU functionality
document.getElementById('saveSkuBtn').addEventListener('click', () => {
    const rows = document.querySelectorAll('#skuTableBody tr');
    const skuData = Array.from(rows).map(row => ({
        item: row.cells[0].textContent,
        quantityOrdered: row.cells[1].textContent,
        sku: row.querySelector('.sku-input').value,
        quantity: row.querySelector('.quantity-input').value,
        expiration: row.querySelector('.expiration-input').value
    }));
    console.log('Saved SKU data:', skuData); // Replace with save functionality
    document.getElementById('skuModal').style.display = 'none';
});

// Function to create SKU button with event listener
function createSkuButton(orderNumber) {
    console.log(`Creating SKU button for order: ${orderNumber}`);
    const skuButton = document.createElement('button');
    skuButton.textContent = 'SKU';
    skuButton.classList.add('skuBtn');
    
    // Add the click event listener for opening the modal
    skuButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent propagation if needed
        console.log(`SKU button clicked for order: ${orderNumber}`);
        openSkuModal(orderNumber);  // This will open the SKU modal
    });

    // Return the SKU button to be appended
    return skuButton;
}


// Update action buttons
function updateActionButtons(row, status, orderNumber) {
    console.log(`Updating actions for order ${orderNumber} with status ${status}`);
    const actionCell = row.querySelector('td:last-child'); // Actions column
    actionCell.innerHTML = ''; // Clear existing buttons

    // Add View button
    const viewButton = document.createElement('button');
    viewButton.textContent = 'View';
    viewButton.classList.add('viewBtn');
    actionCell.appendChild(viewButton);

    // Add Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('deleteBtn');
    actionCell.appendChild(deleteButton);

    // Add Evaluate button for Ordered or Partial
    const evaluateButton = document.createElement('button');
    evaluateButton.textContent = 'Evaluate';
    evaluateButton.classList.add('evaluateBtn');
    actionCell.appendChild(evaluateButton);

    // Add SKU button for Partial, Received, or Completed
    if (status === "Partial" || status === "Received" || status === "Completed") {
        const skuButton = createSkuButton(orderNumber); // Create SKU button
        actionCell.appendChild(skuButton); // Append to actions column
    }
}

// Update row actions based on order number and new status
function updateRowActions(orderNumber, newStatus) {
    if (!orderNumber) {
        console.error('Order number is undefined!');
        return;
    }

    const orderRow = Array.from(purchaseOrdersTable.rows).find(
        (row) => row.cells[0].textContent === orderNumber
    );

    if (!orderRow) {
        console.error(`No row found for order number: ${orderNumber}`);
        return;
    }

    // Update status and actions
    orderRow.setAttribute('data-status', newStatus.toLowerCase());
    updateActionButtons(orderRow, newStatus, orderNumber);
}

const orderNumber = document.getElementById('evaluateOrderNumber').value;
updateRowActions(orderNumber, isComplete ? 'Received' : 'Partial');

// Event listener for close button in modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('skuModal').style.display = 'none';
});

// Ensure modal closes when clicking outside of it
window.addEventListener('click', (event) => {
    const skuModal = document.getElementById('skuModal');
    if (event.target === skuModal) {
        skuModal.style.display = 'none';
    }
});



            
    
    
});


