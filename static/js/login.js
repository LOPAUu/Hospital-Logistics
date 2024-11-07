// Toggle password visibility
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // Change the icon or text for visibility
    this.textContent = this.textContent === '👁️' ? '👁️‍🗨️' : '👁️';
});

// Show loading overlay on form submit
const loginForm = document.getElementById('loginForm');
const loadingOverlay = document.getElementById('loadingOverlay');

loginForm.addEventListener('submit', function(event) {
    // Perform validation (e.g., ensure fields are filled out)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please fill out both username and password.');
        event.preventDefault(); // Prevent submission if validation fails
        return;
    }

    loadingOverlay.style.display = 'flex'; // Show the loading overlay

    // Optionally, disable the form elements while processing
    document.querySelectorAll('input, button').forEach(el => el.disabled = true);
});
