// Function to show the modal form for adding or editing a user
function showUserForm(user = null) {
    const modal = document.getElementById("userFormModal");
    const form = modal.querySelector("form");

    // Reset the form for new user or populate it for editing an existing user
    if (user) {
        // Set form values for editing existing user
        document.getElementById("employee-id").value = user.user_id;
        document.getElementById("full-name").value = user.full_name;
        document.getElementById("username").value = user.username;
        document.getElementById("role").value = user.role_id; // Set selected role
        document.getElementById("email").value = user.email_address;
        document.getElementById("phone").value = user.phone_number || ''; // Allow empty phone number
        document.getElementById("date-added").value = user.date_added.split('T')[0]; // Format date for input
    } else {
        // Reset form for creating a new user
        form.reset();
    }

    modal.style.display = "block";  // Show the modal
}

// Function to close the modal
function closeUserForm() {
    const modal = document.getElementById("userFormModal");
    modal.style.display = "none";  // Hide the modal
}

// Function to delete user with confirmation
function confirmDeleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        // Create a form dynamically to submit the delete request
        const form = document.createElement("form");
        form.action = "/delete_user/" + userId;
        form.method = "POST";
        document.body.appendChild(form);
        form.submit();
    }
}

// Function to populate the user data in the user information form
function populateUserData(userId) {
    fetch('/get_user_data/' + userId)
        .then(response => response.json())
        .then(data => {
            document.getElementById("employee-id").value = data.user_id;
            document.getElementById("full-name").value = data.full_name;
            document.getElementById("username").value = data.username;
            document.getElementById("role").value = data.role_id;
            document.getElementById("email").value = data.email_address;
            document.getElementById("phone").value = data.phone_number;
            document.getElementById("date-added").value = data.date_added.split('T')[0];
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

// Example usage on page load
document.addEventListener("DOMContentLoaded", function() {
    // Attach event listeners for editing and deleting users
    const editButtons = document.querySelectorAll('.btn-secondary');
    editButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const userId = this.closest('tr').querySelector('td').innerText; // Assuming the first cell contains the user ID
            fetch('/get_user_data/' + userId)
                .then(response => response.json())
                .then(data => showUserForm(data)); // Open the form with the user's data
        });
    });

    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const userId = this.closest('tr').querySelector('td').innerText; // Assuming the first cell contains the user ID
            confirmDeleteUser(userId); // Call delete function
        });
    });
});



function submitNewUserForm(event) {
    event.preventDefault();  // Prevent the default form submission

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Gather the form data
    const formData = new FormData(document.querySelector("#userFormModal form"));

    // Send the data to the Flask server using Fetch API
    fetch('/create_or_edit_user', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User saved successfully!');
                window.location.reload();  // Refresh the page to show updates
            } else {
                alert('Error saving user: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving user. Please try again.');
        });
}


// Attach the submit event listener to the form
document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("#userFormModal form");
    form.addEventListener("submit", submitNewUserForm);
});



// Function to fetch and display user data
function fetchUserData() {
    // Fetch data from the Flask backend using Fetch API
    fetch('/get_user_data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const users = data.users;
                const tableBody = document.querySelector('#user-table tbody');
                tableBody.innerHTML = '';  // Clear any existing rows

                // Loop through each user and create a table row
                users.forEach(user => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${user.user_id}</td>
                        <td>${user.full_name}</td>
                        <td>${user.username}</td>
                        <td>${user.role_name}</td>
                        <td>${user.email_address}</td>
                        <td>${user.phone_number}</td>
                        <td>
                            <a href="/edit_user/${user.user_id}" class="btn btn-secondary">Edit</a>
                            <form action="/delete_user/${user.user_id}" method="POST" style="display:inline;">
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this user?')">Delete</button>
                            </form>
                        </td>
                    `;

                    tableBody.appendChild(row);  // Add the row to the table body
                });
            } else {
                alert('Failed to fetch user data');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching user data');
        });
}

// Call fetchUserData when the page loads
document.addEventListener('DOMContentLoaded', fetchUserData);
