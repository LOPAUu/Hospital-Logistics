// Toggle the dropdown visibility
function toggleDropdown() {
  const dropdown = document.querySelector('.user-dropdown .dropdown-content');
  dropdown.classList.toggle('show');
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  const dropdown = document.querySelector('.user-dropdown .dropdown-content');
  if (!event.target.closest('.user-dropdown')) {
      dropdown.classList.remove('show');
  }
}

// Open the Profile Modal
function openProfileModal() {
  document.getElementById('profileModal').style.display = 'block';
}

// Close the Profile Modal
function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
  const modal = document.getElementById('profileModal');
  if (event.target === modal) {
      modal.style.display = 'none';
  }
}