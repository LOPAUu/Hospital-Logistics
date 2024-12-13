// JavaScript for opening and closing the "Add New User" modal
function showUserForm() {
    document.getElementById('userFormModal').style.display = 'block';
}

function closeUserForm() {
    document.getElementById('userFormModal').style.display = 'none';
}

// Event listener to close the modal if clicked outside the modal content
window.onclick = function(event) {
    var modal = document.getElementById('userFormModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Optionally add form validation or AJAX logic here if needed


document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();

    document.querySelector("#userFormModal form").addEventListener("submit", (e) => {
        e.preventDefault();
        addUser();
    });
});

function fetchUsers() {
    fetch("/get_users")
        .then(response => response.json())
        .then(users => {
            const tbody = document.querySelector(".user-table tbody");
            tbody.innerHTML = "";
            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user[0]}</td>
                        <td>${user[1]}</td>
                        <td>${user[2]}</td>
                        <td>${user[3]}</td>
                        <td>${user[4]}</td>
                        <td>
                            <button onclick="editUser('${user[0]}')" class="btn btn-secondary">Edit</button>
                            <button onclick="deleteUser('${user[0]}')" class="btn btn-danger">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        });
}

function addUser() {
    const formData = new FormData(document.querySelector("#userFormModal form"));
    const data = Object.fromEntries(formData.entries());
    fetch("/add_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(() => {
        fetchUsers();
        closeUserForm();
    });
}

function deleteUser(staffId) {
    fetch(`/delete_user/${staffId}`, { method: "DELETE" })
        .then(() => fetchUsers());
}

function showUserForm() {
    document.getElementById("userFormModal").style.display = "block";
}

// Function to show the modal
function openUserForm() {
    document.getElementById("userFormModal").style.display = "block";
}

// Function to close the modal
function closeUserForm() {
    document.getElementById("userFormModal").style.display = "none";
}

// Close modal when clicking outside of the modal content
window.onclick = function(event) {
    const modal = document.getElementById("userFormModal");
    if (event.target == modal) {
        closeUserForm();
    }
};

// Function to handle form submission
document.querySelector('form').addEventListener('submit', function(event) {
    const password = document.getElementById('password').value;
    const staffId = document.getElementById('staff-id').value;

    // Password is required only for new users (when staff-id is not set)
    if (!staffId && !password) {
        event.preventDefault();  // Prevent form submission
        alert("Password is required for new users!");
    }
});

// Function to handle form validation
function validateForm() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const status = document.getElementById("status").value;
    const phone = document.getElementById("phone").value;

    if (!username || !email || !role || !status) {
        alert("Please fill all required fields.");
        return false;
    }

    if (password && password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return false;
    }

    return true;
}

// Add event listener for form submit (before actual submission)
document.querySelector('form').addEventListener('submit', function(event) {
    if (!validateForm()) {
        event.preventDefault(); // Prevent form submission if validation fails
    }
});

// Optionally add form validation or AJAX logic here if needed
