// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.updateCartContents();
        this.setupCartEvents();
    }

    setupCartEvents() {
        // Handle all cart-related clicks
        document.addEventListener('click', (e) => {
            // Open cart when cart button is clicked
            const cartButton = e.target.closest('.cart-button');
            if (cartButton) {
                e.preventDefault();
                const overlay = document.querySelector('.cart-overlay');
                if (overlay) {
                    overlay.classList.add('active');
                }
            }
            
            // Close cart when close button is clicked
            const closeButton = e.target.closest('.cart-close');
            if (closeButton) {
                const overlay = document.querySelector('.cart-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
            }

            // Close cart when clicking outside
            if (e.target.classList.contains('cart-overlay')) {
                e.target.classList.remove('active');
            }
        });

        // Prevent clicks inside cart from closing it
        const cartItems = document.querySelector('.cart-items');
        if (cartItems) {
            cartItems.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    addItem(item) {
        const existingItem = this.items.find(i => 
            i.id === item.id && 
            (item.size === null ? i.size === null : i.size === item.size)
        );
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            this.items.push(item);
        }
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.updateCartContents();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.updateCartContents();
    }

    updateQuantity(index, change) {
        const item = this.items[index];
        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            this.removeItem(index);
            return;
        }
        
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.updateCartContents();
    }

    updateCartCount() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCounts.forEach(count => {
            count.textContent = `(${totalQuantity})`;
            count.style.display = totalQuantity > 0 ? 'inline' : 'none';
        });
    }

    updateCartContents() {
        const cartItems = document.querySelector('.cart-items');
        const subtotalElement = document.querySelector('.subtotal-amount');
        if (!cartItems || !subtotalElement) return;

        cartItems.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-main">
                    <a href="product.html?id=${item.id}" class="cart-item-link">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="item-title-price">
                            <h3>${item.title}</h3>
                            ${item.size ? `<p class="item-size">SIZE: ${item.size}</p>` : ''}
                            <p class="price">${item.price}</p>
                        </div>
                    </a>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="event.preventDefault(); window.cart.updateQuantity(${index}, -1)">-</button>
                            <input type="text" class="quantity" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus" onclick="event.preventDefault(); window.cart.updateQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="window.cart.removeItem(${index})">REMOVE</button>
                    </div>
                </div>
            </div>
        `).join('');

        const subtotal = this.items.reduce((sum, item) => {
            // Handle both string prices (with $) and number prices
            const price = typeof item.price === 'string' ? 
                parseFloat(item.price.replace('$', '')) : 
                item.price;
            return sum + (price * item.quantity);
        }, 0);
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
});

