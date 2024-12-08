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
