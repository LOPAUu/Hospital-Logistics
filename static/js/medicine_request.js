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

            fetch(`/medicine_request/${medicineRequestId}/approve`, {
                method: 'PUT',
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




// Deny a medicine request
function denyRequest(medicineRequestId) {
    // Show confirmation alert
    Swal.fire({
        title: 'Are you certain you want to deny the request?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Deny it!',
        cancelButtonText: 'No, Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Proceed with the denial if the user confirms
            const data = {
                medicine_request_id: medicineRequestId,
                action: 'deny'
            };

            fetch(`/medicine_request/${medicineRequestId}/deny`, {
                method: 'PUT',
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
                    
                    // Update status to 'Denied'
                    statusCell.textContent = 'Denied';
                    statusCell.className = 'status-denied'; // Add class for denied status

                    // Store the status in localStorage
                    localStorage.setItem(`status-${medicineRequestId}`, 'denied');

                    actionsCell.innerHTML = '<span class="denied-label">No further actions available</span>';
                    
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
                    text: 'An error occurred while denying the request.',
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                });
            });
        } else {
            // If the user cancels, show a message or do nothing
            Swal.fire({
                title: 'Cancelled',
                text: 'The denial action was not performed.',
                icon: 'info',
                confirmButtonText: 'OK',
            });
        }
    });
}





