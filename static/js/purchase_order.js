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




// PO TABLE 
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





// PO VIEW 
document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector("table");

    // Fetch purchase orders from the backend
    const fetchPurchaseOrders = async () => {
        try {
            const response = await fetch('/purchase-orders');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            renderPurchaseOrders(data);
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
        }
    };

    // Render purchase orders to the table
    const renderPurchaseOrders = (orders) => {
        const tbody = document.createElement("tbody");

        orders.forEach((order, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.supplier}</td>
                <td>${order.status}</td>
                <td>${order.received ? "Yes" : "No"}</td>
                <td>₱${order.total_amount.toFixed(2)}</td>
                <td>${order.issue_date}</td>
                <td>${order.ordered_by}</td>
                <td>
                    <button class="view-btn" data-id="${order.id}" data-index="${index + 1}">View</button>
                    <button class="evaluate-btn" data-id="${order.id}">Evaluate</button>
                    <button class="delete-btn" data-id="${order.id}">Delete</button>
                    <button class="sku-btn" data-id="${order.id}">SKU</button>
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

    // Handle button clicks (View, Evaluate, Delete, SKU)
    table.addEventListener("click", (e) => {
        const button = e.target;
        const orderId = button.dataset.id;
        const orderIndex = button.dataset.index; // Get the index
    
        if (button.classList.contains("view-btn")) {
            openViewModal(orderId, orderIndex); // Pass the index
        }
    });

    const openViewModal = (orderId, orderIndex) => {
        const viewModal = document.getElementById("viewModal");
        const closeModal = viewModal.querySelector(".close");
    
        // Function to close the modal and refresh the purchase orders
        const closeViewModal = () => {
            viewModal.style.display = "none";
            fetchPurchaseOrders();  // Re-fetch the purchase orders when the modal is closed
        };
    
        // Close modal on click of the close button
        closeModal.addEventListener("click", closeViewModal);
    
        // Close modal if the user clicks outside the modal content
        window.addEventListener("click", (event) => {
            if (event.target === viewModal) {
                closeViewModal();
            }
        });
    
        // Display the modal
        viewModal.style.display = "block";
    
        // Clear the existing modal content
        document.getElementById("viewOrderNumber").textContent = "Loading...";
        document.getElementById("viewFromDetails").textContent = "Loading...";
        document.getElementById("viewOrderStatus").textContent = "Loading...";
        document.getElementById("viewIssueDate").textContent = "Loading...";
        document.getElementById("viewOrderedBy").textContent = "Loading...";
        document.getElementById("viewTotal").textContent = "Loading...";
        const itemList = document.getElementById("viewItemList");
        itemList.innerHTML = "<tr><td>Loading items...</td></tr>";  // Show loading message for items

        // Fetch order details and items
        Promise.all([
            fetch(`/order-details/${orderId}`).then(response => response.json()),
            fetch(`/order-items/${orderId}`).then(response => response.json())
        ])
        .then(([orderData, items]) => {
            // Populate the modal with order details
            document.getElementById("viewOrderNumber").textContent = orderIndex || "N/A";
            document.getElementById("viewFromDetails").textContent = orderData.supplier || "N/A";
            document.getElementById("viewOrderStatus").textContent = orderData.status || "N/A";
            document.getElementById("viewIssueDate").textContent = orderData.issue_date || "N/A";
            document.getElementById("viewOrderedBy").textContent = orderData.ordered_by || "N/A";
            document.getElementById("viewTotal").textContent =
                orderData.total_amount !== undefined
                    ? parseFloat(orderData.total_amount).toFixed(2)
                    : "0.00";

            // Clear existing items and populate with new items
            itemList.innerHTML = ""; // Clear existing items
            items.forEach(item => {
                const itemTotal = item.total !== undefined
                    ? parseFloat(item.total).toFixed(2)
                    : "0.00";
                const itemPrice = item.price !== undefined
                    ? parseFloat(item.price).toFixed(2)
                    : "0.00";
                itemList.innerHTML += `
                    <tr>
                        <td>${item.name || "N/A"}</td>
                        <td>${item.quantity || 0}</td>
                        <td>${item.unit || "N/A"}</td>
                        <td>${itemPrice}</td>
                        <td>${itemTotal}</td>
                    </tr>
                `;
            });

            // Once all the content is populated, show the modal
            viewModal.style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            viewModal.style.display = "none"; // Ensure the modal doesn't appear on error
        });
    };
});




// PO EVAL
document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector("table");

    // Fetch purchase orders
    const fetchPurchaseOrders = async () => {
        try {
            const response = await fetch('/purchase-orders');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            renderPurchaseOrders(data);
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
        }
    };

    // Render purchase orders to the table
    const renderPurchaseOrders = (orders) => {
        const tbody = document.createElement("tbody");

        orders.forEach((order, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.supplier}</td>
                <td>${order.status}</td>
                <td>${order.received ? "Yes" : "No"}</td>
                <td>₱${order.total_amount.toFixed(2)}</td>
                <td>${order.issue_date}</td>
                <td>${order.ordered_by}</td>
                <td>
                    <button class="view-btn" data-id="${order.id}" data-row-number="${index + 1}">View</button>
                    <button class="evaluate-btn" data-id="${order.id}" data-row-number="${index + 1}">Evaluate</button>
                    <button class="delete-btn" data-id="${order.id}">Delete</button>
                    <button class="sku-btn" data-id="${order.id}">SKU</button>
                </td>
            `;
            tbody.appendChild(row);
        });        

        const existingTbody = table.querySelector("tbody");
        if (existingTbody) table.removeChild(existingTbody);
        table.appendChild(tbody);
    };

    // Fetch purchase orders on load
    fetchPurchaseOrders();

    // Handle button clicks (View, Evaluate, Delete, SKU)
    table.addEventListener("click", (e) => {
        const button = e.target;
        const orderId = button.dataset.id;
        const rowNumber = button.dataset.rowNumber;
    
        if (button.classList.contains("evaluate-btn")) {
            openEvaluateModal(orderId, rowNumber); // Pass the row number
        } else if (button.classList.contains("sku-btn")) {
            openSkuModal(orderId); // Handle SKU logic
        }
    });
    

    

    const openEvaluateModal = (orderId, rowNumber) => {
        const evaluateModal = document.getElementById("evaluateModal");
        const closeModal = evaluateModal.querySelector(".close");
    
        // Function to close the modal and refresh the purchase orders
        const closeEvaluateModal = () => {
            evaluateModal.style.display = "none";
            fetchPurchaseOrders();  // Re-fetch the purchase orders when the modal is closed
        };
    
        // Close modal on click of the close button
        closeModal.addEventListener("click", closeEvaluateModal);
    
        // Close modal if the user clicks outside the modal content
        window.addEventListener("click", (event) => {
            if (event.target === evaluateModal) {
                closeEvaluateModal();
            }
        });
    
        // Display the modal
        evaluateModal.style.display = "block";
    
        // Clear existing content in the modal and reset the form
        document.getElementById("evaluateOrderNumber").textContent = "Loading...";
        document.getElementById("createdDate").textContent = "Loading...";
        document.getElementById("updatedDate").textContent = "Loading...";

        const itemList = document.getElementById("evaluateItemList");
        itemList.innerHTML = "<tr><td>Loading items...</td></tr>";  // Show loading message for items

        // Display the modal after content is cleared
        evaluateModal.style.display = "block";
        
        // Fetch order details and items
        fetch(`/order-details/${orderId}`)
        .then(response => response.json())
        .then(data => {
            // Display the row number and order details in the modal
            document.getElementById("evaluateOrderNumber").textContent = rowNumber || "N/A"; // Use the row number
            document.getElementById("createdDate").textContent = data.issue_date || "N/A";
            document.getElementById("updatedDate").textContent = data.updated_date || "N/A";

            // Clear previous items and populate with fresh data
            itemList.innerHTML = ""; // Clear any existing items

            data.items.forEach((item, index) => {
                const remainingQuantity = item.quantity - (item.received || 0) - (item.lost || 0) - (item.damaged || 0);

                itemList.innerHTML += `
                    <tr data-index="${index}">
                        <td>${item.name || "N/A"}</td>
                        <td>${item.quantity || 0}</td>
                        <td><input type="number" class="received" value="${item.received || 0}" /></td>
                        <td><input type="number" class="lost" value="${item.lost || 0}" /></td>
                        <td><input type="number" class="damaged" value="${item.damaged || 0}" /></td>
                        <td><input type="number" class="remaining-quantity" value="${remainingQuantity}" disabled /></td>
                    </tr>
                `;
            });

            document.getElementById("evaluateItemList").addEventListener("input", (event) => {
                if (event.target.classList.contains("received") || 
                    event.target.classList.contains("lost") || 
                    event.target.classList.contains("damaged")) {
            
                    const row = event.target.closest("tr");
                    const quantity = parseInt(row.children[1].textContent, 10) || 0; // Ordered quantity
                    let received = parseInt(row.querySelector(".received").value, 10) || 0;
                    let lost = parseInt(row.querySelector(".lost").value, 10) || 0;
                    let damaged = parseInt(row.querySelector(".damaged").value, 10) || 0;
            
                    // Ensure the total does not exceed the ordered quantity
                    if ((received + lost + damaged) > quantity) {
                        const excess = (received + lost + damaged) - quantity;
            
                        // Adjust the current input to prevent exceeding the ordered quantity
                        if (event.target.classList.contains("received")) {
                            received -= excess;
                            row.querySelector(".received").value = received >= 0 ? received : 0;
                        } else if (event.target.classList.contains("lost")) {
                            lost -= excess;
                            row.querySelector(".lost").value = lost >= 0 ? lost : 0;
                        } else if (event.target.classList.contains("damaged")) {
                            damaged -= excess;
                            row.querySelector(".damaged").value = damaged >= 0 ? damaged : 0;
                        }
                    }
            
                    // Update the remaining quantity
                    const remainingQuantity = quantity - (received + lost + damaged);
                    row.querySelector(".remaining-quantity").value = remainingQuantity >= 0 ? remainingQuantity : 0;
                }
            });
            
            
            
            

            // Add submission logic (unchanged from your original code)
            document.getElementById("submitEvaluationBtn").addEventListener("click", async (event) => {
                event.preventDefault(); // Prevent default form submission
            
                const rows = document.querySelectorAll("#evaluateItemList tr");
            
                // Prepare the items data
                const items = Array.from(rows).map(row => {
                    const index = row.getAttribute("data-index");
                    const received = parseInt(row.querySelector(".received").value, 10) || 0;
                    const lost = parseInt(row.querySelector(".lost").value, 10) || 0;
                    const damaged = parseInt(row.querySelector(".damaged").value, 10) || 0;
                    const remainingQuantity = parseInt(row.querySelector(".remaining-quantity").value, 10); // Keep the original remaining quantity
            
                    return {
                        order_detail_id: data.items[index].id,
                        received: received,
                        lost: lost,
                        damaged: damaged,
                        remainingQuantity: remainingQuantity // Send the value as it is
                    };
                });
            
                // Prepare the payload including the purchase_order_id
                const payload = {
                    purchase_order_id: data.id,
                    items: items,
                };
            
                console.log("Sending payload:", payload); // Log the payload for debugging
            
                try {
                    const response = await fetch('/submit-evaluation', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
            
                    const result = await response.json();
            
                    if (response.ok) {
                        Swal.fire({
                            title: "Success!",
                            text: result.message || "Evaluation updated successfully.",
                            icon: "success",
                            confirmButtonText: "OK",
                        }).then(() => {
                            evaluateModal.style.display = "none"; // Close the modal
                            fetchPurchaseOrders(); // Refresh the purchase orders after closing the modal
                        });
                    } else {
                        Swal.fire({
                            title: "Error",
                            text: result.error || "Failed to submit evaluation. Please try again.",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                } catch (error) {
                    console.error("Error submitting evaluation:", error);
                    Swal.fire({
                        title: "Error",
                        text: "An error occurred while submitting the evaluation. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            }, { once: true }); // Ensures the listener is added only once
            
            
        });

    }; 
    
    


    // PO SKU
    function openSkuModal(purchaseOrderId) {
        const skuModal = document.getElementById("skuModal");
        const closeSkuModal = skuModal.querySelector(".close");
        const skuTableBody = document.getElementById("skuTableBody");
    
        // Function to close the SKU modal
        const closeSkuModalFunction = () => {
            skuModal.style.display = "none";
        };
    
        // Close modal on click of the close button
        closeSkuModal.addEventListener("click", closeSkuModalFunction);
    
        // Close modal if the user clicks outside the modal content
        window.addEventListener("click", (event) => {
            if (event.target === skuModal) {
                closeSkuModalFunction();
            }
        });
    
        console.log('Opening SKU modal for PO ID:', purchaseOrderId);
        skuTableBody.innerHTML = ''; // Clear previous data
    
        // Fetch SKU data for the specific purchase_order_id
        fetch(`/get-sku-details/${purchaseOrderId}`)
            .then(response => response.json())
            .then(items => {
                if (items.error) {
                    console.error('No items found:', items.error);
                    return;
                }
    
                items.forEach(item => {
                    if (item.item_name && item.ordered_quantity !== undefined) {
                        addItemRow(item.item_name, item.ordered_quantity); // Ensure both fields are available
                    } else {
                        console.error('Item data is incomplete:', item);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching SKU details:', error);
            });
    
        // Hide other modals and show the SKU modal
        evaluateModal.style.display = 'none';
        skuModal.style.display = 'block';
    }
    
    // Attach event listener to the SKU button and pass purchase_order_id when clicked
    document.querySelectorAll('.skuBtn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering other events
            const purchaseOrderId = button.getAttribute('data-purchase-order-id'); // Ensure each button has a data attribute for PO ID
            openSkuModal(purchaseOrderId); // Pass the PO ID to open the SKU modal for specific items
        });
    });
    
    // Function to add a new item row
    function addItemRow(itemName, orderedQuantity) {
        if (!itemName || orderedQuantity === undefined) {
            console.error('Item Name or Quantity is missing');
            return; // Prevent adding a row with missing data
        }
    
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${orderedQuantity}</td>
            <td><input type="text" class="sku-input" placeholder="Enter SKU" /></td>
            <td><input type="number" class="unit_quantity-input" placeholder="Enter Quantity" /></td>
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
            <td><input type="number" class="unit_quantity-input" placeholder="Enter Quantity" /></td>
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
            openSkuModal(); // Open the SKU modal without purchaseOrderId
        });
    });
    
    // Save SKU functionality
    document.getElementById('saveSkuBtn').addEventListener('click', () => {
        const rows = document.querySelectorAll('#skuTableBody tr');
        const skuData = Array.from(rows).map(row => ({
            item_name: row.cells[0]?.textContent.trim(),
            ordered_quantity: parseInt(row.cells[1]?.textContent.trim()) || 0,
            sku: row.querySelector('.sku-input')?.value.trim(),
            unit_quantity: parseInt(row.querySelector('.unit_quantity-input')?.value.trim()) || 0,
            expiration: row.querySelector('.expiration-input')?.value
        })).filter(sku => sku.item_name && sku.sku && sku.unit_quantity > 0 && sku.expiration); // Filter out invalid rows
    
        if (skuData.length === 0) {
            console.error('No valid SKU data to save.');
            return;
        }
    
        // Send the SKU data to the backend
        fetch('/save-sku-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skus: skuData })
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    console.log('SKU details saved successfully!');
                    document.getElementById('skuModal').style.display = 'none';
                } else {
                    console.error('Error saving SKU details:', result.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
    
});