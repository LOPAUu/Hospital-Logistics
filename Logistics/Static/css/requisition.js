function viewDetails(requisitionId) {
    const details = {
        1001: {
            purpose: "Order More Vaccines",
            billing: "Mercury Drugs collab",
            shipping: "ilalim ng puno ng saging",
            items: "Vaccines: 50 units",
            additionalInfo: "Description, Quantity, Price details here."
        }
        // Add more requisitions here
    };

    // Get the details for the given ID
    const requisition = details[requisitionId];

    if (requisition) {
        // Populate the details in the modal
        const content = `
            <p><strong>Purpose:</strong> ${requisition.purpose}</p>
            <p><strong>Billing:</strong> ${requisition.billing}</p>
            <p><strong>Shipping:</strong> ${requisition.shipping}</p>
            <p><strong>Items Requested:</strong> ${requisition.items}</p>
            <p><strong>Additional Info:</strong> ${requisition.additionalInfo}</p>
        `;

        document.getElementById('details-content').innerHTML = content;
        openDetailsModal();
    } else {
        console.error("Details not found for requisition ID:", requisitionId);
    }
}

function openDetailsModal() {
    document.getElementById('details-modal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}

function openModal() {
    document.getElementById('manage-requisition-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('manage-requisition-modal').style.display = 'none';
}