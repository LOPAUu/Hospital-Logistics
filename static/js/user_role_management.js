// Display modal for creating/editing a user
function showCreateUserModal(user = null) {
    const modal = document.getElementById("user-modal");
    const form = document.getElementById("user-form");
    const title = document.getElementById("modal-title");

    if (user) {
        title.textContent = "Edit User";
        document.getElementById("username").value = user.username;
        document.getElementById("email").value = user.email;
        document.getElementById("role").value = user.role;
        document.getElementById("user-id").value = user.id;
    } else {
        title.textContent = "Create User";
        form.reset();
        document.getElementById("user-id").value = "";
    }

    modal.style.display = "flex";
}

// Close modal
function closeModal() {
    const modal = document.getElementById("user-modal");
    modal.style.display = "none";
}

// Fetch and populate the user table
function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#user-table tbody");
            tbody.innerHTML = data.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button onclick="showCreateUserModal(${JSON.stringify(user)})">Edit</button>
                        <button onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        });
}

// Handle form submission
document.getElementById("user-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const userId = document.getElementById("user-id").value;
    const method = userId ? "PUT" : "POST";
    const url = userId ? `/api/users/${userId}` : "/api/users";

    fetch(url, {
        method: method,
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { "Content-Type": "application/json" },
    })
    .then(response => {
        if (response.ok) {
            loadUsers();
            closeModal();
        }
    });
});

// Delete user
function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        fetch(`/api/users/${id}`, { method: "DELETE" })
            .then(response => {
                if (response.ok) {
                    loadUsers();
                }
            });
    }
}

// Load users on page load
document.addEventListener("DOMContentLoaded", loadUsers);
