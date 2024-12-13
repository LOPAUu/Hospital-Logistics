document.addEventListener("DOMContentLoaded", function () {
  const inventoryTableBody = document.getElementById("inventory-table-body");

  // Function to handle search
  function filterInventory() {
    const searchId = document.getElementById("search-id").value.toLowerCase();
    const searchDescription = document
      .getElementById("search-description")
      .value.toLowerCase();
    const searchStatus = document
      .getElementById("search-status")
      .value.toLowerCase();
    const searchCategory = document
      .getElementById("search-category")
      .value.toLowerCase();

    const rows = inventoryTableBody.getElementsByTagName("tr");

    Array.from(rows).forEach((row) => {
      const cells = row.getElementsByTagName("td");
      const sku = cells[0].textContent.toLowerCase();
      const description = cells[1].textContent.toLowerCase();
      const status = cells[3].textContent.toLowerCase();
      const category = cells[6].textContent.toLowerCase();

      if (
        (sku.includes(searchId) || searchId === "") &&
        (description.includes(searchDescription) || searchDescription === "") &&
        (status.includes(searchStatus) || searchStatus === "") &&
        (category.includes(searchCategory) || searchCategory === "")
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  // Bind search input events
  document
    .getElementById("search-id")
    .addEventListener("input", filterInventory);
  document
    .getElementById("search-description")
    .addEventListener("input", filterInventory);
  document
    .getElementById("search-status")
    .addEventListener("change", filterInventory);
  document
    .getElementById("search-category")
    .addEventListener("input", filterInventory);

 // View item modal functionality
window.viewItem = function (medicineId) {
  fetch(`/medicine/${medicineId}`)
      .then((response) => {
          if (!response.ok) {
              throw new Error("Failed to fetch medicine details.");
          }
          return response.json();
      })
      .then((data) => {
          if (data.details) {
              const detailsTableBody = document.getElementById("view-details-table-body");
              detailsTableBody.innerHTML = ""; // Clear existing details
              data.details.forEach((detail) => {
                  const row = document.createElement("tr");
                  row.innerHTML = `
                      <td>${detail.evaluated_on}</td>
                      <td>${detail.entry_type}</td>
                      <td>${detail.po_number}</td>
                      <td>${detail.item_no}</td>
                      <td>${detail.description}</td>
                      <td>${detail.expiration_date}</td>
                      <td>${detail.lot_position}</td>
                  `;
                  detailsTableBody.appendChild(row);
              });
              document.getElementById("itemModal").style.display = "block";
          } else {
              alert("Medicine details not found.");
          }
      })
      .catch((error) => {
          console.error("Error fetching medicine details:", error);
      });
};

window.closeModal = function () {
  document.getElementById("itemModal").style.display = "none";
};



  // Edit item modal functionality
  window.editItem = function (medicineId) {
    // Fetch current data and populate the modal
    fetch(`/medicine/edit/${medicineId}`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("edit-description").value = data.description;
        document.getElementById("edit-quantity").value = data.quantity;
        document.getElementById("edit-status").value = data.status;
        document.getElementById("edit-unitCost").value = data.unit_cost;
        document.getElementById("edit-unitPrice").value = data.unit_price;
        document.getElementById("edit-category").value = data.category;
        document.getElementById("edit-baseUnit").value = data.base_unit;
        document.getElementById("edit-modal").style.display = "block";
      });
  };

  window.closeEditModal = function () {
    document.getElementById("edit-modal").style.display = "none";
  };

  window.saveChanges = function () {
    // Save changes after editing
    const editedData = {
      description: document.getElementById("edit-description").value,
      quantity: document.getElementById("edit-quantity").value,
      status: document.getElementById("edit-status").value,
      unit_cost: document.getElementById("edit-unitCost").value,
      unit_price: document.getElementById("edit-unitPrice").value,
      category: document.getElementById("edit-category").value,
      base_unit: document.getElementById("edit-baseUnit").value,
    };

    fetch(`/medicine/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Changes saved successfully!");
          location.reload(); // Reload page to reflect changes
        } else {
          alert("Failed to save changes.");
        }
      });
  };

  // Deleting item
  window.deleteItem = function (medicineId) {
    if (confirm("Are you sure you want to delete this item?")) {
      fetch(`/medicine/delete/${medicineId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Item deleted successfully!");
            location.reload(); // Reload page to reflect deletion
          } else {
            alert("Failed to delete item.");
          }
        });
    }
  };
});
