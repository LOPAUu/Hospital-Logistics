// Function to fetch requisition data based on status
function filterByStatus(status) {
    // Highlight the active tab
    const tabs = document.querySelectorAll('.tab__item a');
    tabs.forEach(tab => tab.classList.remove('is-activated'));
    document.querySelector(`a[href="#${status}"]`).classList.add('is-activated');
    
    // Fetch requisition data from the backend
    fetch(`/get_requisitions?status=${status}`)
        .then(response => response.json())
        .then(data => {
            const requisitionCards = document.getElementById('requisition-cards');
            requisitionCards.innerHTML = '';  // Clear current cards
            
            // Display requisition cards
            data.forEach(requisition => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <h3>Requisition #${requisition.id}</h3>
                    <p><strong>Date:</strong> ${requisition.date}</p>
                    <p><strong>Purpose:</strong> ${requisition.purpose}</p>
                    <p><strong>Requested By:</strong> ${requisition.requested_by}</p>
                    <p><strong>Status:</strong> ${requisition.status}</p>
                    <button onclick="viewDetails(${requisition.id})">View Details</button>
                `;
                requisitionCards.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching requisitions:', error));
}

// Function to display requisition details in a modal
function viewDetails(requisitionId) {
    fetch(`/get_requisition_details?id=${requisitionId}`)
        .then(response => response.json())
        .then(data => {
            const modalContent = document.getElementById('details-content');
            modalContent.innerHTML = `
                <h3>Requisition #${data.id}</h3>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Purpose:</strong> ${data.purpose}</p>
                <p><strong>Company:</strong> ${data.company_name}</p>
                <p><strong>Requested By:</strong> ${data.requested_by}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <h4>Items</h4>
                <ul>
                    ${data.items.map(item => `
                        <li>${item.name} - ${item.quantity} x ${item.price} = ${item.total}</li>
                    `).join('')}
                </ul>
                <h4>Attachments</h4>
                <ul>
                    ${data.attachments.map(attachment => `
                        <li><a href="${attachment.file_path}" target="_blank">${attachment.file_name}</a></li>
                    `).join('')}
                </ul>
            `;
            document.getElementById('details-modal').style.display = 'block';
        })
        .catch(error => console.error('Error fetching requisition details:', error));
}

// Function to close the modal
function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Initial load of all requisitions
filterByStatus('all');