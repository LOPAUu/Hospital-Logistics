    <!-- New Top Bar -->
    <div class="top-bar">
        <div class="top-nav">
            <a href="{{ url_for('dashboard') }}">Dashboard</a>
            <a href="{{ url_for('supplier') }}">Supplier</a>
            <a href="{{ url_for('requisition_admin') }}">Requisition</a>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
        <div class="content">
            <!-- Your dynamic content goes here -->
        </div>
    </div>
    <script src="{{ url_for('static', filename='js/base.js') }}"></script>

</body>
</html>


<!-- New Top Bar -->
<div class="top-bar">
    <div class="top-nav">
        <a href="{{ url_for('dashboard') }}">Dashboard</a>
        <a href="{{ url_for('supplier') }}">Supplier</a>
        <a href="{{ url_for('requisition_admin') }}">Requisition</a>
    </div>
</div>