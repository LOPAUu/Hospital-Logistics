// Open Add Supplier Modal
function openAddModal() {
    $('#supplier-id').val(''); // Clear hidden ID field
    $('#supplier-form')[0].reset(); // Clear the form
    $('#modal-title').text('Add Supplier');
    $('#supplier-modal').show(); // Show modal
}

// Open Edit Supplier Modal
function openEditModal(supplierId) {
    // Fetch supplier details using the supplierId (use Ajax or similar)
    // For now, we'll just simulate fetching data
    let supplier = {
        id: supplierId,
        name: 'Example Supplier',
        type: 'Manufacturer',
        contact_person: 'John Doe',
        contact_number: '+639123456789',
        email: 'supplier@example.com',
        address: '123 Supplier St.',
        products: 'Bandages, Syringes',
        pricing: 'Competitive'
    };

    // Populate the form with supplier data
    $('#supplier-id').val(supplier.id);
    $('#supplier-name').val(supplier.name);
    $('#supplier-type').val(supplier.type);
    $('#contact-person').val(supplier.contact_person);
    $('#contact-number').val(supplier.contact_number);
    $('#email').val(supplier.email);
    $('#address').val(supplier.address);
    $('#products').val(supplier.products);
    $('#pricing').val(supplier.pricing);

    $('#modal-title').text('Edit Supplier');
    $('#supplier-modal').show(); // Show modal
}

// Close Modal
function closeModal() {
    $('#supplier-modal').hide(); // Hide modal
}

// Delete Supplier
function deleteSupplier(supplierId) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        // Perform delete operation (Ajax, form submission, etc.)
        alert('Supplier ' + supplierId + ' has been deleted.');
        // Remove the supplier row from the table (simulate)
        $('#supplier-list tr').filter(function () {
            return $(this).find('td').first().text() === supplierId;
        }).remove();
    }
}
