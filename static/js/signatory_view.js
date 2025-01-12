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
            data.forEach(requisition => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <h3>Requisition #${requisition.id}</h3>
                    <p><strong>Date:</strong> ${new Date(requisition.date).toLocaleDateString()}</p>
                    <p><strong>Purpose:</strong> ${requisition.purpose}</p>
                    <p><strong>Requested By:</strong> ${requisition.requested_by}</p>
                    <p><strong>Status:</strong> ${requisition.status}</p>
                    <button onclick="viewDetails(${requisition.id})">View Details</button>
                    <button onclick="openActionModal(${requisition.id})">Take Action</button>
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

            // Get the modal content element
            const modalContent = document.getElementById('view-details-content');

            // Calculate the overall total for items
            let totalAmount = 0;
            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    totalAmount += item.quantity * item.price; // Calculate total
                });
            }

            // Update the modal content with the fetched requisition details and the overall total
            modalContent.innerHTML = `
                <h3>Requisition #${data.id || 'N/A'}</h3>
                <p><strong>Date:</strong> ${data.date ? new Date(data.date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Purpose:</strong> ${data.purpose || 'N/A'}</p>
                <p><strong>Company:</strong> ${data.company_name || 'N/A'}</p>
                <p><strong>Requested By:</strong> ${data.requested_by || 'N/A'}</p>
                <p><strong>Status:</strong> ${data.status || 'N/A'}</p>
                <h4>Items</h4>
                <ul>
                    ${data.items && data.items.length > 0 ? 
                        data.items.map(item => `
                            <li>${item.name} - ${item.quantity} x ${item.price} = ${item.quantity * item.price}</li>
                        `).join('') : '<li>No items found</li>'
                    }
                </ul>
                <h4>Overall Total: ${totalAmount.toFixed(2)}</h4> <!-- Display the overall total -->
                <h4>Attachments</h4>
                <ul>
                    ${data.attachments && data.attachments.length > 0 ? 
                        data.attachments.map(attachment => `
                            <li><a href="${attachment.file_path}" target="_blank">${attachment.file_name}</a></li>
                        `).join('') : '<li>No attachments found</li>'
                    }
                </ul>
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
    const actionContent = document.getElementById('action-content');
    actionContent.innerHTML = `
        <p>Perform actions for Requisition #${requisitionId}</p>
        <button onclick="approveRequisition(${requisitionId})">Approve</button>
        <button onclick="rejectRequisition(${requisitionId})">Reject</button>
    `;
    document.getElementById('action-modal').style.display = 'flex';
}

// Function to close the action modal
function closeActionModal() {
    document.getElementById('action-modal').style.display = 'none';
}

function approveRequisition(requisitionId) {
    fetch(`/approve_requisition?id=${requisitionId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert(data.message); // Display success or error message
            filterByStatus('all'); // Refresh the requisition list
        })
        .catch(error => console.error('Error approving requisition:', error));
}

function rejectRequisition(requisitionId) {
    fetch(`/reject_requisition?id=${requisitionId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert(data.message); // Display success or error message
            filterByStatus('all'); // Refresh the requisition list
        })
        .catch(error => console.error('Error rejecting requisition:', error));
}


// Initial load of all requisitions
filterByStatus('all');



