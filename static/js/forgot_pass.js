document.getElementById('send-reset-link-button').addEventListener('click', function() {
    const emailInput = document.querySelector('input[type="email"]');
    
    // Check if the email input field is empty
    if (emailInput.value.trim() === "") {
        alert("Please enter your email address.");
    } else {
        document.getElementById('popup').style.display = 'flex';
    }
});

function closePopup() {
    window.location.href = "HR Log .html"; // Redirect to the login page
}
