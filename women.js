document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // Function to switch views
    function switchView(view) {
        // Remove active class from all buttons
        viewButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        const activeButton = Array.from(viewButtons).find(btn => btn.textContent.toLowerCase() === view);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Update grid class
        productsGrid.classList.remove('grid-view', 'collage-view');
        productsGrid.classList.add(`${view}-view`);
        
        // Store the current view preference
        localStorage.setItem('womenViewPreference', view);
    }
    
    // Add click handlers to view buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.textContent.toLowerCase();
            switchView(view);
        });
    });
    
    // Set initial view from stored preference or default to grid
    const storedView = localStorage.getItem('womenViewPreference') || 'grid';
    switchView(storedView);
});
