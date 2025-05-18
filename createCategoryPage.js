// Function to create category page
async function createCategoryPage(categoryName, categorySlug) {
    const pageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="objects.css">
    <link rel="stylesheet" href="cart.css">
    <title>${categoryName} - K2</title>
</head>
<body class="subpage">
    <div class="announcement-bar"></div>
    <nav class="navbar">
        <div class="nav-logo">
            <a href="Index.html"><img src="Images/logo.png" alt="K2" /></a>
        </div>
        <div class="nav-center">
            <a href="about.html">About</a>
            <a href="objects.html">Object</a>
            <a href="women.html">Women</a>
            <a href="${categorySlug}.html" class="active">${categoryName}</a>
        </div>
        <div class="nav-right">
            <a href="/cart">cart<span class="cart-count"></span></a>
        </div>
    </nav>

    <main class="products-page">
        <header class="products-header">
            <div class="products-filters">
                <h1>${categoryName.toUpperCase()}</h1>
                <div class="sort-section">
                    <span>Featured:</span>
                    <span>0 products</span>
                </div>
                <div class="view-options">
                    <button class="view-btn">collage</button>
                    <button class="view-btn active">grid</button>
                </div>
            </div>
        </header>

        <div class="products-grid grid-view" id="productsGrid">
            <!-- Products will be loaded here -->
        </div>
    </main>

    <div class="cart-overlay">
        <div class="cart-header">
            <h2>my cart</h2>
            <button class="cart-close">×</button>
        </div>
        <div class="cart-items">
            <!-- Cart items will be inserted here -->
        </div>
        <div class="cart-footer">
            <div class="cart-subtotal">
                <span>subtotal</span>
                <span class="subtotal-amount">$0.00</span>
            </div>
            <button class="checkout-button">CHECKOUT</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/dist/umd/supabase.min.js"></script>
    <script>
        // Initialize Supabase client
        const supabase = window.supabase.createClient(
            'https://shnlxniahrcfszwrvbno.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmx4bmlhaHJjZnN6d3J2Ym5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU3MTk3MjQsImV4cCI6MjAyMTI5NTcyNH0.hO_qrZz-Qkh9QTLPeHi0O6MxGPHgAhLAKqGC2qIYY2I'
        );

        // Function to load products
        async function loadProducts() {
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', '${categorySlug}');

            if (error) {
                console.error('Error loading products:', error);
                return;
            }

            const productsGrid = document.getElementById('productsGrid');
            productsGrid.innerHTML = '';

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = \`
                    <a href="product.html?id=\${product.id}">
                        <img src="\${product.image_url}" alt="\${product.name}" />
                        <h3>\${product.name}</h3>
                        <p class="price">$\${product.price}</p>
                    </a>
                \`;
                productsGrid.appendChild(productCard);
            });

            // Update product count
            document.querySelector('.sort-section span:last-child').textContent = \`\${products.length} products\`;
        }

        // Load products when page loads
        loadProducts();
    </script>
    <script src="cart.js"></script>
</body>
</html>`;

    // Write the new category page
    try {
        const response = await fetch(`/${categorySlug}.html`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'text/html'
            },
            body: pageContent
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`Created category page: ${categorySlug}.html`);
        return true;
    } catch (error) {
        console.error('Error creating category page:', error);
        return false;
    }
}

module.exports = createCategoryPage;
