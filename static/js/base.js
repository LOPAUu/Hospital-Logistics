// Toggle the dropdown visibility
function toggleDropdown() {
  const dropdown = document.querySelector('.user-dropdown .dropdown-content');
  dropdown.classList.toggle('show');  // Toggle the 'show' class
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  const dropdown = document.querySelector('.user-dropdown .dropdown-content');

  // Check if the clicked element is not part of the dropdown or user icon
  if (!event.target.closest('.user-dropdown')) {
      dropdown.classList.remove('show');  // Hide the dropdown
  }
}