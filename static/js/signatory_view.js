// Function to fetch requisition data based on status
function filterByStatus(status) {
    // Highlight the active tab
    const tabs = document.querySelectorAll('.tab__item a');
    tabs.forEach(tab => tab.classList.remove('is-activated'));
    const activeTab = document.querySelector(`a[href="#${status}"]`);
    if (activeTab) {
        activeTab.classList.add('is-activated');
    }

    // Fetch requisition data from the backend
    fetch(`/get_requisitions?status=${status}`)
        .then(response => response.json())
        .then(data => {
            const requisitionCards = document.getElementById('requisition-cards');
            requisitionCards.innerHTML = '';  // Clear current cards

            // Check if requisitions are returned
            if (data.length === 0) {
                requisitionCards.innerHTML = '<p>No requisitions found for this status.</p>';
                return;
            }

            // Display requisition cards
data.forEach((requisition, index) => {
    const totalAmount = requisition.items.reduce((sum, item) => sum + item.quantity * item.price, 0); // Calculate total

    // Determine the status class
    let statusClass = '';
    if (requisition.status.toLowerCase() === 'approved') {
        statusClass = 'status-approved';
    } else if (requisition.status.toLowerCase() === 'rejected') {
        statusClass = 'status-rejected';
    } else if (requisition.status.toLowerCase() === 'pending') {
        statusClass = 'status-pending';
    }

    // Disable "Take Action" button for approved or rejected requisitions
    const isDisabled = requisition.status.toLowerCase() === 'approved' || requisition.status.toLowerCase() === 'rejected';
    const buttonClass = isDisabled ? 'button-take-action disabled-button' : 'button-take-action';
    const onClickAttribute = isDisabled ? '' : `onclick="openActionModal(${requisition.id})"`;

    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <h3>Requisition #${index + 1}</h3>
        <div class="card-row">
            <p><strong>Date:</strong> ${new Date(requisition.date).toLocaleDateString()}</p>
            <p><strong>Purpose:</strong> ${requisition.purpose}</p>
        </div>
        <div class="card-row">
            <p><strong>Status:</strong> <span class="${statusClass}">${requisition.status}</span></p>
            <p><strong>Requested By:</strong> ${requisition.requested_by}</p>
        </div>
        <div class="card-row">
            <p><strong>Total:</strong> ₱${totalAmount.toFixed(2)}</p>
        </div>
        <div class="card-buttons">
            <button class="button button-view-details" onclick="viewDetails(${requisition.id})">View Details</button>
            <button class="${buttonClass}" ${onClickAttribute}>Take Action</button>
        </div>
    `;
    requisitionCards.appendChild(card);
});
        
            
            
            

        })
        .catch(error => {
            console.error('Error fetching requisitions:', error);
            alert('An error occurred while fetching requisitions.');
        });
}

// Function to view requisition details
function viewDetails(requisitionId) {
    console.log(`viewDetails called with ID: ${requisitionId}`);

    // Show the modal
    document.getElementById('view-details-modal').style.display = 'block';

    // Fetch requisition details from the backend
    fetch(`/get_requisition_details_modal?id=${requisitionId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data);
            if (data.error) {
                console.error('Error:', data.error);
                alert('An error occurred while fetching requisition details.');
                return;
            }

            // Determine the status class
            let statusClass = '';
            if (data.status.toLowerCase() === 'approved') {
                statusClass = 'status-approved';
            } else if (data.status.toLowerCase() === 'rejected') {
                statusClass = 'status-rejected';
            } else if (data.status.toLowerCase() === 'pending') {
                statusClass = 'status-pending';
            }

            // Get the modal content element
            const modalContent = document.getElementById('view-details-content');

            // Calculate the overall total for items
            let totalAmount = 0;
            if (data.items && data.items.length > 0) {
                totalAmount += data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
            }

            // Update the modal content
            modalContent.innerHTML = `
                <div class="view-details-top">
                    <div class="view-details-left">
                        <p><strong>Date:</strong> ${data.date ? new Date(data.date).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Company:</strong> ${data.company_name || 'N/A'}</p>
                        <p><strong>Status:</strong> <span class="${statusClass}">${data.status || 'N/A'}</span></p>
                    </div>
                    <div class="view-details-right">
                        <p><strong>Purpose:</strong> ${data.purpose || 'N/A'}</p>
                        <p><strong>Requested By:</strong> ${data.requested_by || 'N/A'}</p>
                    </div>
                </div>
                <div class="view-details-bottom">
                    <h4>Items Requested</h4>
                    <div class="scrollable-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Price (₱)</th>
                                <th>Total (₱)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.items.map(item => `
                                <tr>
                                    <td>${item.name || 'N/A'}</td>
                                    <td>${item.quantity || 0}</td>
                                    <td>${item.price ? item.price : '0.00'}</td>
                                    <td>${item.quantity && item.price ? (item.quantity * item.price).toFixed(2) : '0.00'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        </table>
                    </div>
                    <h5>Total: ₱${totalAmount.toFixed(2)}</h5>
                    <h4>Attachments</h4>
                    <ul>
                        ${data.attachments && data.attachments.length > 0 ? 
                            data.attachments.map(attachment => `
                                <li><a href="${attachment.file_path}" target="_blank">${attachment.file_name}</a></li>
                            `).join('') : '<li>No attachments found</li>'
                        }
                    </ul>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error fetching requisition details:', error);
            alert('An error occurred while fetching requisition details.');
        });
}



// Function to close the view details modal
function closeViewDetailsModal() {
    document.getElementById('view-details-modal').style.display = 'none';
}

// Function to open the action modal
function openActionModal(requisitionId) {
    Swal.fire({
        title: `Take Action for Requisition #${requisitionId}`,
        text: "Would you like to approve or reject this requisition?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Approve",
        cancelButtonText: "Reject",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            approveRequisition(requisitionId);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            rejectRequisition(requisitionId);
        }
    });
}



// Function to close the action modal
function closeActionModal() {
    document.getElementById('action-modal').style.display = 'none';
}

function approveRequisition(requisitionId) {
    fetch(`/approve_requisition?id=${requisitionId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            Swal.fire("Success", data.message, "success");
            filterByStatus('all'); // Refresh the requisition list
        })
        .catch(error => {
            console.error('Error approving requisition:', error);
            Swal.fire("Error", "Failed to approve requisition.", "error");
        });
}

function rejectRequisition(requisitionId) {
    fetch(`/reject_requisition?id=${requisitionId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            Swal.fire("Success", data.message, "success");
            filterByStatus('all'); // Refresh the requisition list
        })
        .catch(error => {
            console.error('Error rejecting requisition:', error);
            Swal.fire("Error", "Failed to reject requisition.", "error");
        });
}



// Initial load of all requisitions
filterByStatus('all');



