// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.updateCartContents();
        this.setupCartToggle();
        this.setupCartClose();
    }

    setupCartToggle() {
        const cartLinks = document.querySelectorAll('.nav-right a');
        cartLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.cart-overlay').classList.add('active');
            });
        });
    }

    setupCartClose() {
        const closeBtn = document.querySelector('.cart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.querySelector('.cart-overlay').classList.remove('active');
            });
        }
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id && i.size === item.size);
        if (existingItem) {
            existingItem.quantity += 1;
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
                            <div class="item-details">
                                <p class="item-size">size: ${item.size}</p>
                                <p class="price">${item.price}</p>
                            </div>
                        </div>
                    </a>
                    <div class="item-controls">
                        <button class="remove-btn" onclick="cart.removeItem(${index})">REMOVE</button>
                        <div class="quantity-controls">
                            <span>QTY: </span>
                            <div class="qty-spinner">
                                <span class="qty-display">${item.quantity}</span>
                                <div class="qty-buttons">
                                    <button class="qty-btn" onclick="cart.updateQuantity(${index}, 1)">∧</button>
                                    <button class="qty-btn" onclick="cart.updateQuantity(${index}, -1)">∨</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        const subtotal = this.items.reduce((sum, item) => sum + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
}

// Initialize cart
const cart = new Cart();

// Add to cart functionality for product pages
document.addEventListener('DOMContentLoaded', () => {
    // Setup size buttons
    const sizeButtons = document.querySelectorAll('.size-btn');
    const sizeError = document.querySelector('.size-error');

    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            sizeButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            if (sizeError) sizeError.style.display = 'none';
        });
    });

    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const selectedSize = document.querySelector('.size-btn.selected');
            const sizeError = document.querySelector('.size-error');
            
            if (!selectedSize) {
                sizeError.style.display = 'block';
                return;
            }
            sizeError.style.display = 'none';

            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            const item = {
                id: productId,
                title: document.querySelector('.product-title').textContent,
                price: document.querySelector('.product-price').textContent,
                image: document.querySelector('.main-image').src,
                size: selectedSize.textContent,
                quantity: 1
            };

            cart.addItem(item);
            document.querySelector('.cart-overlay').classList.add('active');
        });
    }
});
