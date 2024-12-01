document.addEventListener('DOMContentLoaded', fetchMedicineRequests);

// Fetch and render medicine requests
function fetchMedicineRequests() {
    fetch('/medicine-requests') // Adjust the endpoint based on your backend route
        .then(response => response.json())
        .then(data => renderMedicineRequests(data))
        .catch(error => console.error('Error fetching medicine requests:', error));
}

// Render medicine requests
function renderMedicineRequests(requests) {
    const requestList = document.querySelector('#medicine-request-list tbody');
    requestList.innerHTML = ''; // Clear existing rows

    requests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.medicine_request_id}</td>
            <td>${request.request_status}</td>
            <td>${request.medicine_id}</td>
            <td>${request.quantity}</td>
            <td>${request.request_date}</td>
            <td>${request.approved_by || 'N/A'}</td>
            <td>${request.approval_date || 'N/A'}</td>
            <td>
                <button onclick="approveRequest(${request.medicine_request_id})">Approve</button>
                <button onclick="rejectRequest(${request.medicine_request_id})">Reject</button>
            </td>
        `;
        requestList.appendChild(row);
    });
}

// Approve a medicine request
function approveRequest(requestId) {
    fetch(`/medicine-requests/${requestId}/approve`, {
        method: 'PUT'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to approve request');
            return response.json();
        })
        .then(() => {
            alert('Request approved successfully');
            fetchMedicineRequests(); // Refresh the list
        })
        .catch(error => {
            console.error('Error approving request:', error);
            alert('Failed to approve request.');
        });
}

// Reject a medicine request
function rejectRequest(requestId) {
    fetch(`/medicine-requests/${requestId}/reject`, {
        method: 'PUT'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to reject request');
            return response.json();
        })
        .then(() => {
            alert('Request rejected successfully');
            fetchMedicineRequests(); // Refresh the list
        })
        .catch(error => {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request.');
        });
}
