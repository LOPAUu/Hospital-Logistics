// Toggle password visibility
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.textContent = this.textContent === '👁️' ? '👁️‍🗨️' : '👁️';
});
// Show loading overlay on form submit
const loginForm = document.getElementById('loginForm');
const loadingOverlay = document.getElementById('loadingOverlay');

loginForm.addEventListener('submit', function(event) {
    loadingOverlay.style.display = 'flex'; // Show the overlay
});

/* Handle form submission and redirect to Dashboard
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // You can add any form validation or authentication logic here if needed

    // Redirect to the login authentication
    window.location.href = "{{ url_for('login_post') }}";
});*/
