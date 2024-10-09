// Toggle the dropdown visibility
function toggleDropdown() {
  const dropdown = document.querySelector('.user-dropdown .dropdown-content');
  dropdown.classList.toggle('show');  // Toggle the 'show' class

  // Show or hide the overlay
  const overlay = document.querySelector('.dim-overlay');
  if (dropdown.classList.contains('show')) {
      overlay.style.display = 'block';  // Show overlay when dropdown is visible
  } else {
      overlay.style.display = 'none';   // Hide overlay when dropdown is hidden
  }
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  const dropdown = document.querySelector('.user-dropdown .dropdown-content');
  const overlay = document.querySelector('.dim-overlay');

  // Check if the clicked element is not part of the dropdown or user icon
  if (!event.target.closest('.user-dropdown')) {
      if (dropdown.classList.contains('show')) {
          dropdown.classList.remove('show');  // Hide the dropdown
          overlay.style.display = 'none';     // Hide the overlay
      }
  }
}
