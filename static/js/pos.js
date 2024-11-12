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

updateInventoryDisplay();
