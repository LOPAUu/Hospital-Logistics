document.addEventListener('DOMContentLoaded', fetchMedicineRequests);

// Fetch and render medicine requests
function fetchMedicineRequests() {
    fetch('/medicine-requests') // Adjust the endpoint based on your backend route
        .then(response => response.json())
        .then(data => renderMedicineRequests(data))
        .catch(error => console.error('Error fetching medicine requests:', error));
}



// Approve a medicine request
function approveRequest(medicineRequestId) {
    // Show confirmation alert
    Swal.fire({
        title: 'Are you certain you want to approve the request?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Approve it!',
        cancelButtonText: 'No, Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Proceed with the approval if the user confirms
            const data = {
                medicine_request_id: medicineRequestId,
                action: 'accept'
            };

            fetch('/api/care-plan-request/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    const statusCell = document.getElementById(`status-${medicineRequestId}`);
                    const actionsCell = document.getElementById(`actions-${medicineRequestId}`);
                    
                    // Update status to 'Approved'
                    statusCell.textContent = 'Approved';
                    statusCell.className = 'status-approved'; // Add class for approved status

                    // Store the status in localStorage
                    localStorage.setItem(`status-${medicineRequestId}`, 'approved');

                    actionsCell.innerHTML = '<span class="approved-label">No further actions available</span>';
                    
                    Swal.fire({
                        title: 'Success!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });

                    // Optionally refresh page after success
                    setTimeout(() => location.reload(), 2000);
                } else if (data.error) {
                    Swal.fire({
                        title: 'Error!',
                        text: data.error,
                        icon: 'error',
                        confirmButtonText: 'Try Again',
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while approving the request.',
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                });
            });
        } else {
            // If the user cancels, show a message or do nothing
            Swal.fire({
                title: 'Cancelled',
                text: 'The approval action was not performed.',
                icon: 'info',
                confirmButtonText: 'OK',
            });
        }
    });
}



// Reject a medicine request
function rejectRequest(medicineRequestId) {
    // Show confirmation alert
    Swal.fire({
        title: 'Are you sure you want to decline it?',
        text: "You won't be able to revert this action!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Reject it!',
        cancelButtonText: 'No, Keep it'
    }).then((result) => {
        if (result.isConfirmed) {
            // Proceed with the rejection if the user confirms
            const data = {
                medicine_request_id: medicineRequestId,
                action: 'reject'
            };

            fetch('/api/care-plan-request/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    const statusCell = document.getElementById(`status-${medicineRequestId}`);
                    const actionsCell = document.getElementById(`actions-${medicineRequestId}`);
                    
                    // Update status to 'Rejected'
                    statusCell.textContent = 'Rejected';
                    statusCell.className = 'status-rejected'; // Add class for rejected status

                    // Store the status in localStorage
                    localStorage.setItem(`status-${medicineRequestId}`, 'rejected');

                    actionsCell.innerHTML = '<span class="approved-label">No further actions available</span>';
                    
                    Swal.fire({
                        title: 'Success!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });

                    // Optionally refresh page after success
                    setTimeout(() => location.reload(), 2000);
                } else if (data.error) {
                    Swal.fire({
                        title: 'Error!',
                        text: data.error,
                        icon: 'error',
                        confirmButtonText: 'Try Again',
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while rejecting the request.',
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                });
            });
        } else {
            // If the user cancels, show a message or do nothing
            Swal.fire({
                title: 'Cancelled',
                text: 'The action was not performed.',
                icon: 'info',
                confirmButtonText: 'OK',
            });
        }
    });
}


const apiUrl = 'https://logistics-management-v1.onrender.com/medicine_request'; // Your API endpoint
let lastRequestId = null; // Track the latest request ID

// Function to fetch and render new requests
async function fetchNewRequests() {
    try {
        const response = await fetch(apiUrl);
        const requests = await response.json();

        if (requests && requests.length > 0) {
            const latestRequest = requests[requests.length - 1];

            // Check if this request is new
            if (latestRequest.medicine_request_id !== lastRequestId) {
                lastRequestId = latestRequest.medicine_request_id; // Update the last request ID
                notifyNewRequest(latestRequest); // Notify user with sound and alert
            }
        }
    } catch (error) {
        console.error('Error fetching new requests:', error);
    }
}

// Notification function to show alert and play sound
function notifyNewRequest(request) {
    console.log('Playing alarm and showing notification.');

    // Play the alarm sound
    const alarmSound = document.getElementById('alarm-sound');
    if (alarmSound) {
        alarmSound.play().catch(error => {
            console.error('Error playing alarm:', error);
            alert("Sound failed to play. Please check your browser's settings.");
        });
    }

    // Show the SweetAlert notification
    Swal.fire({
        title: 'New Medicine Request Received!',
        text: `Medicine ID: ${request.medicine_name}\nQuantity: ${request.quantity}\nRequest Date: ${request.request_date}`,
        icon: 'info',
        confirmButtonText: 'OK',
    });
}

// Poll every 5 seconds for new requests
setInterval(fetchNewRequests, 5000);

// Initial fetch when the page loads
fetchNewRequests();

notifyNewRequest({
    medicine_request_id: 123,
    medicine_name: 'paracetamol',
    quantity: '30',
    request_date: '2024-12-03'
});


// Render medicine requests
function renderMedicineRequests(requests) {
    const requestList = document.querySelector('#medicine-request-list tbody');
    requestList.innerHTML = ''; // Clear existing rows

    requests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.medicine_request_id}</td>
            <td id="status-${request.medicine_request_id}" 
                class="${request.request_status === 'Approved' ? 'approved-status' : (request.request_status === 'Rejected' ? 'rejected-status' : '')}">
                ${request.request_status}
            </td>
            <td>${request.medicine_name}</td>
            <td>${request.quantity}</td>
            <td>${request.request_date}</td>
            <td>${request.approved_by || 'N/A'}</td>
            <td>${request.approval_date || 'N/A'}</td>
            <td id="actions-${request.medicine_request_id}">
                ${request.request_status === 'Pending' ? `
                    <button class="accept-button" onclick="approveRequest(${request.medicine_request_id})">
                        <i class="fas fa-check"></i> Approve Request
                    </button>
                    <button class="reject-button" onclick="rejectRequest(${request.medicine_request_id})">
                        <i class="fas fa-times-circle"></i> Reject
                    </button>
                ` : `<span class="approved-label">No further actions available</span>`}
            </td>
        `;
        requestList.appendChild(row);
    });
}

// Simulate sending a new request
setTimeout(() => {
    sendNewRequest(); // Simulate sending the new request after 3 seconds
}, 3000);
