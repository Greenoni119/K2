// Function to load products
async function loadProducts() {
    console.log('Loading products...');
    try {
        // First, get all products
        const { data: products, error } = await publicSupabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('All products:', products);
        console.log('Query error:', error);

        if (error) {
            console.error('Error loading products:', error);
            document.getElementById('debug').innerHTML = `Error: ${error.message}`;
            document.getElementById('debug').style.display = 'block';
            return;
        }

        // Filter for objects category
        const objectProducts = products ? products.filter(p => p.category === 'objects') : [];
        console.log('Filtered products for objects category:', objectProducts);

        if (!objectProducts || objectProducts.length === 0) {
            console.log('No products found in objects category');
            document.querySelector('.sort-section span:last-child').textContent = '0 products';
            const productsGrid = document.getElementById('productsGrid');
            productsGrid.innerHTML = '<div class="no-products">No products found in Objects category</div>';
            return;
        }

        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';

        objectProducts.forEach(product => {
            console.log('Processing product:', product);
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}">
                    <img src="${product.image_url}" alt="${product.name}" />
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price}</p>
                </a>
            `;
            productsGrid.appendChild(productCard);
        });

        // Update product count
        document.querySelector('.sort-section span:last-child').textContent = `${objectProducts.length} products`;
    } catch (err) {
        console.error('Unexpected error:', err);
        document.getElementById('debug').innerHTML = `Error: ${err.message}`;
        document.getElementById('debug').style.display = 'block';
        document.querySelector('.sort-section span:last-child').textContent = '0 products';
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '<div class="error-message">Error loading products</div>';
    }
}

// Function to switch views
function switchView(view) {
    const viewButtons = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');
    
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
    localStorage.setItem('objectsViewPreference', view);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    console.log('Checking publicSupabase:', typeof publicSupabase);
    
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // Add click handlers to view buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.textContent.toLowerCase();
            switchView(view);
        });
    });
    
    // Set initial view from stored preference or default to grid
    const storedView = localStorage.getItem('objectsViewPreference') || 'grid';
    switchView(storedView);

    // Load products
    console.log('Calling loadProducts()');
    loadProducts();
});
