<<<<<<< HEAD
let cart = [];
let inventory = [
    { id: 1, name: "Biogesic", quantity: 100, price: 10.00 },
    { id: 2, name: "BioFlu", quantity: 50, price: 8.00 },
    { id: 3, name: "Amlodipine", quantity: 150, price: 0.50 },
    { id: 4, name: "Paracetamol", quantity: 100, price: 29.25 },
];

const cartList = document.getElementById("cart-list");
const totalAmountElement = document.getElementById("total-amount");
const confirmationMessage = document.getElementById("confirmation-message");

// Adding event listeners for "Add to Cart" buttons
document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", function() {
        const productName = this.getAttribute("data-name");
        const productPrice = parseFloat(this.getAttribute("data-price"));
        addToCart(productName, productPrice);
    });
});

// Function to add items to the cart
function addToCart(name, price) {
    const inventoryItem = inventory.find(item => item.name === name);

    // Check if there is stock left to add
    if (inventoryItem && inventoryItem.quantity > 0) {
        const existingCartItem = cart.find(item => item.name === name);

        if (existingCartItem) {
            existingCartItem.quantity += 1;
        } else {
            const sku = Math.floor(Math.random() * 1000000);  // Example SKU generator
            cart.push({ sku, name, price, quantity: 1 });
        }

        // Decrease inventory only if adding to cart
        inventoryItem.quantity -= 1;

        updateCart();
        updateInventoryDisplay();
    } else {
        alert("Item out of stock!");
    }
}

// Function to update the cart display
function updateCart() {
    cartList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.sku}</td>
            <td>${item.name}</td>
            <td>
                <button onclick="changeQuantity(${index}, -1)">-</button>
                ${item.quantity}
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </td>
            <td>₱${(item.price * item.quantity).toFixed(2)}</td>
            <td><button onclick="removeFromCart(${index})">✖</button></td>
        `;

        cartList.appendChild(row);
        total += item.price * item.quantity;
    });

    totalAmountElement.textContent = total.toFixed(2);
}

// Function to change item quantity in the cart
function changeQuantity(index, delta) {
    const cartItem = cart[index];
    const inventoryItem = inventory.find(item => item.name === cartItem.name);

    // Check if adding will exceed inventory or removing makes quantity zero
    if (delta === 1 && inventoryItem.quantity > 0) {
        cartItem.quantity += 1;
        inventoryItem.quantity -= 1;
    } else if (delta === -1 && cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        inventoryItem.quantity += 1;
    } else if (delta === -1 && cartItem.quantity === 1) {
        removeFromCart(index);
        return;
    } else if (delta === 1 && inventoryItem.quantity === 0) {
        alert("Insufficient stock!");
    }

    updateCart();
    updateInventoryDisplay();
}

// Function to remove item from the cart
function removeFromCart(index) {
    const cartItem = cart[index];
    const inventoryItem = inventory.find(item => item.name === cartItem.name);

    // Return the cart item's quantity to inventory
    inventoryItem.quantity += cartItem.quantity;

    cart.splice(index, 1);
    updateCart();
    updateInventoryDisplay();
}

// Function to confirm payment with SweetAlert
function confirmPayment() {
    // Show SweetAlert confirmation dialog
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed with payment!"
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear the cart and reset total
            cart = [];
            updateCart();

            // Show success message with SweetAlert
            Swal.fire({
                title: "Payment Successful!",
                text: "Your payment has been processed successfully.",
                icon: "success"
            });
        } else {
            // If canceled, show a message indicating the payment was canceled
            Swal.fire({
                title: "Payment Canceled",
                text: "You canceled the payment.",
                icon: "error"
            });
        }
    }).catch((error) => {
        // Log any errors that may occur
        console.error("SweetAlert error:", error);
    });
}

// Add event listener to the Pay button after the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const payButton = document.getElementById("pay-button");
    if (payButton) {
        payButton.addEventListener("click", confirmPayment);
    } else {
        console.error("Pay button not found!");
    }
});

// Function to update inventory display
function updateInventoryDisplay() {
    document.querySelectorAll(".inventory-panel tbody tr").forEach(row => {
        const itemName = row.querySelector("td:nth-child(2)").textContent;
        const inventoryItem = inventory.find(item => item.name === itemName);

        if (inventoryItem) {
            row.querySelector("td:nth-child(3)").textContent = inventoryItem.quantity;

            // Disable "Add" button if item is out of stock
            const addButton = row.querySelector(".add-to-cart");
            addButton.disabled = inventoryItem.quantity === 0;
            addButton.textContent = inventoryItem.quantity === 0 ? "Out of Stock" : "Add";
        }
    });
}

const searchInput = document.getElementById("search-input");  // Select search input

// Function to filter inventory based on search input
function filterInventory() {
    const searchTerm = searchInput.value.toLowerCase();  // Get the search term and convert to lowercase
    return inventory.filter(item => item.name.toLowerCase().includes(searchTerm));
}

// Function to update inventory display
function updateInventoryDisplay() {
    const filteredInventory = filterInventory();  // Get filtered inventory

    // Clear the table
    const tbody = document.querySelector(".inventory-panel tbody");
    tbody.innerHTML = "";

    // Loop through filtered inventory and populate the table
    filteredInventory.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₱${item.price.toFixed(2)}</td>
            <td>Category A</td>
            <td><button class="add-to-cart" data-name="${item.name}" data-price="${item.price}">Add</button></td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners for the new "Add to Cart" buttons
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function() {
            const productName = this.getAttribute("data-name");
            const productPrice = parseFloat(this.getAttribute("data-price"));
            addToCart(productName, productPrice);
        });
    });
}

// Add event listener to the search input to update inventory display
searchInput.addEventListener("input", updateInventoryDisplay);

// Initial inventory display
updateInventoryDisplay();
=======
document.addEventListener("DOMContentLoaded", function () {
  // Function to update the summary (Medicines Bought & Total Price)
  function updateSummary() {
    const itemTableBody = document.getElementById("item-table-body");
    const totalPriceElement = document.getElementById("total-price");
    const medicinesBoughtList = document.getElementById("medicines-bought");

    let total = 0;
    medicinesBoughtList.innerHTML = ""; // Clear the current list

    // Loop through each row in the item table to calculate the total and build the medicines list
    const rows = itemTableBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const quantity = parseInt(row.children[1].textContent);
      const medicineName = row.children[2].textContent;
      const price = parseFloat(
        row.children[3].textContent.replace("₱", "").trim()
      );
      const totalForRow = price * quantity;

      // Add medicine to the medicines bought list
      const listItem = document.createElement("li");
      listItem.textContent = `${medicineName} (${quantity}x)`;
      medicinesBoughtList.appendChild(listItem);

      // Add to the total price
      total += totalForRow;
    });

    // Update the total price in the summary
    totalPriceElement.textContent = total.toFixed(2);
  }

  // Function to populate medicines data before form submission
    function populateMedicinesData() {
    const itemTableBody = document.getElementById("item-table-body");
    const medicinesDataInput = document.getElementById("medicines-data");
    const rows = itemTableBody.querySelectorAll("tr");

    const medicines = [];

    // Extract details from each row in the table
    rows.forEach((row) => {
        const quantity = parseInt(row.children[1].textContent);
        const medicineDetails = row.children[2].textContent.split(" - ");
        const medicineId = row.getAttribute("data-medicine-id"); // Retrieve medicine_id
        const medicineName = medicineDetails[1]; // Extract Medicine Name
        const unitPrice = parseFloat(
        row.children[3].textContent.replace("₱", "").trim()
        );

        medicines.push({
        medicine_id: medicineId,
        name: medicineName,
        quantity: quantity,
        unit_price: unitPrice,
        });
    });

    // Populate the hidden input with JSON data
    medicinesDataInput.value = JSON.stringify(medicines);
    }

  // Add item function
    function addItem() {
    const medicineDropdown = document.getElementById("medicine-dropdown");
    const quantityInput = document.getElementById("quantity-input");

    const selectedOption =
        medicineDropdown.options[medicineDropdown.selectedIndex];
    const medicineId = selectedOption.value; // Extract medicine_id from the value attribute
    const medicineSku = selectedOption.getAttribute("data-sku");
    const medicineName = selectedOption.getAttribute("data-name");
    const unitPrice = parseFloat(selectedOption.getAttribute("data-price"));

    let quantity = parseInt(quantityInput.value);

    // Validate the quantity
    if (quantity <= 0 || isNaN(quantity)) {
        alert("Please enter a valid quantity (greater than 0).");
        return;
    }

    const totalPrice = unitPrice * quantity;

    const tableBody = document.getElementById("item-table-body");
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
            <td><button class="remove-item-btn">Remove</button></td>
            <td>${quantity}</td>
            <td>${medicineSku} - ${medicineName}</td>
            <td>₱${unitPrice.toFixed(2)}</td>
            <td>₱${totalPrice.toFixed(2)}</td>
        `;
    newRow.setAttribute("data-medicine-id", medicineId); // Store medicine_id as an attribute on the row

    // Append the new row to the table body
    tableBody.appendChild(newRow);

    // Add the event listener to the remove button
    const removeButton = newRow.querySelector(".remove-item-btn");
    removeButton.addEventListener("click", function () {
        removeItem(newRow);
    });

    // Reset dropdown and quantity input
    medicineDropdown.selectedIndex = 0;
    quantityInput.value = "";

    // Update the summary after adding an item
    updateSummary();
    }

  // Function to remove an item from the table
  function removeItem(row) {
    row.remove();

    // Update the summary after removing an item
    updateSummary();
  }

  // Attach the addItem function to the button through event listener
  const addItemButton = document.getElementById("add-item-btn");
  if (addItemButton) {
    addItemButton.addEventListener("click", addItem);
  }

  // Attach the form submission event listener
  const billingForm = document.getElementById("billing-form");
  if (billingForm) {
    billingForm.addEventListener("submit", function (event) {
      populateMedicinesData(); // Populate medicines data before submitting
    });
  }

  const existingRow = Array.from(
    document.querySelectorAll("#item-table-body tr")
  ).find((row) => row.getAttribute("data-medicine-id") === medicineId);

  if (existingRow) {
    const quantityCell = existingRow.children[1];
    const newQuantity = parseInt(quantityCell.textContent) + quantity;
    quantityCell.textContent = newQuantity;
    updateSummary();
    return;
  }

});

>>>>>>> d177f90300f1b12f91728b542fdaa266ef2e30cf
