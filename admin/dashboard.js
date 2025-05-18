// Initialize Supabase client
const supabaseUrl = 'https://shnlxniahrcfszwrvbno.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmx4bmlhaHJjZnN6d3J2Ym5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU3MTk3MjQsImV4cCI6MjAyMTI5NTcyNH0.hO_qrZz-Qkh9QTLPeHi0O6MxGPHgAhLAKqGC2qIYY2I'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Check authentication status
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        window.location.href = 'login.html'
    }
}

// Handle logout
async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Error signing out:', error.message)
        return
    }
    window.location.href = 'login.html'
}

// Load categories from Supabase
async function loadCategories() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error:', error.message)
        return
    }

    const categoriesGrid = document.querySelector('.categories-grid')
    categoriesGrid.innerHTML = ''

    if (categories && categories.length > 0) {
        categories.forEach(category => {
            const categoryCard = document.createElement('div')
            categoryCard.className = 'category-card'
            categoryCard.innerHTML = `
                <div class="category-image-container">
                    <img src="${category.image_url || '/images/placeholder.jpg'}" alt="${category.name}" class="category-image">
                    <div class="category-overlay">
                        <h3 class="category-title">${category.name}</h3>
                    </div>
                </div>
                <div class="category-details">
                    <div class="category-info">
                        <p class="category-name">${category.name}</p>
                        <p class="category-slug">${category.slug}</p>
                    </div>
                    <div class="category-actions">
                        <button data-id="${category.id}" class="edit-btn">Edit</button>
                        <button data-id="${category.id}" class="delete-btn">Delete</button>
                    </div>
                </div>
            `
            categoriesGrid.appendChild(categoryCard)

            // Add event listeners
            const editBtn = categoryCard.querySelector('.edit-btn')
            const deleteBtn = categoryCard.querySelector('.delete-btn')
            
            editBtn.addEventListener('click', () => editCategory(category.id))
            deleteBtn.addEventListener('click', () => deleteCategory(category.id))
        })
    }

    // Update category select in product form
    const categorySelect = document.getElementById('productCategory')
    categorySelect.innerHTML = ''
    categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.slug
        option.textContent = category.name
        categorySelect.appendChild(option)
    })
}

// Load products from Supabase
async function loadProducts() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error:', error.message)
        return
    }

    const productsGrid = document.querySelector('.products-grid')
    productsGrid.innerHTML = ''; // Clear existing products

    if (products && products.length > 0) {
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price}</p>
                    <div class="product-actions">
                        <button class="primary-btn edit-btn" data-id="${product.id}">Edit</button>
                        <button class="primary-btn delete-btn" data-id="${product.id}">Delete</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }
}

// Handle product submission (new or edit)
async function handleProductSubmit(e) {
    e.preventDefault(); // Prevent form submission
    const modal = document.getElementById('productModal');
    const errorMessages = document.getElementById('errorMessages');
    errorMessages.textContent = ''; // Clear previous errors
    console.log('Form submission started');
    
    try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            errorMessages.textContent = 'You must be logged in to add products';
            console.error('Auth error:', authError);
            return;
        }
        console.log('Authenticated user:', user.email)
        // Get form data
        const form = document.getElementById('productForm')
        if (!form) {
            errorMessages.textContent = 'Form not found';
            console.error('Form not found');
            return;
        }
        const formData = new FormData(form)
        const imageFile = formData.get('productImage')
        console.log('Image file:', imageFile)

        let imageUrl;
        const existingImageUrl = formData.get('existingImageUrl');
        const formProductId = formData.get('productId');
        const isNewProduct = !formProductId;

        // For new products, image is required
        if (isNewProduct && (!imageFile || imageFile.size === 0)) {
            errorMessages.textContent = 'Please select an image';
            console.error('No image selected for new product');
            return;
        }

        // Handle image upload if a new image is selected
        if (imageFile && imageFile.size > 0) {
            console.log('Attempting to upload new image...')
            const { data: imageData, error: imageError } = await supabase.storage
                .from('product-images')
                .upload(`${Date.now()}-${imageFile.name}`, imageFile)
            
            console.log('Upload response:', { imageData, imageError })

            if (imageError) {
                errorMessages.textContent = 'Error uploading image: ' + imageError.message;
                console.error('Error uploading image:', imageError.message);
                return;
            }

            // Get public URL for the uploaded image
            imageUrl = supabase.storage
                .from('product-images')
                .getPublicUrl(imageData.path).data.publicUrl;
        } else if (!isNewProduct) {
            // For existing products, use the existing image URL
            imageUrl = existingImageUrl;
        }

        // Save product data to Supabase
        const sizeType = formData.get('sizeType');
        const selectedSizes = [];
        if (sizeType) {
            document.querySelectorAll('input[name="sizes"]:checked').forEach(checkbox => {
                selectedSizes.push(checkbox.value);
            });
        }

        const productName = formData.get('productName');
        const productPrice = formData.get('productPrice');
        const productCategory = formData.get('productCategory');
        const productDescription = formData.get('productDescription');
        const productId = formData.get('productId');

        let supabaseQuery;
        const productData = {
            name: productName,
            price: productPrice,
            category: productCategory,
            description: productDescription,
            sizes: selectedSizes.length > 0 ? selectedSizes : null
        };

        // Set image URL - either new upload or existing
        productData.image_url = imageUrl || existingImageUrl;

        // For new products, ensure we have an image URL
        if (isNewProduct && !productData.image_url) {
            errorMessages.textContent = 'Error: No image URL available';
            return;
        }

        // If we have a productId, update existing product, otherwise insert new one
        if (formProductId) {
            supabaseQuery = supabase
                .from('products')
                .update(productData)
                .eq('id', formProductId);
        } else {
            supabaseQuery = supabase
                .from('products')
                .insert([productData]);
        }

        const { data, error } = await supabaseQuery;

        if (error) {
            errorMessage.textContent = 'Error saving product: ' + error.message
            console.error('Error:', error.message)
            return
        }

        // Reload products and close modal
        await loadProducts();
        closeModal('productModal');
        console.log('Form submitted successfully, modal closed');
    } catch (error) {
        errorMessages.textContent = 'Error: ' + error.message;
        console.error('Error submitting form:', error);
    }
}

// Edit product
async function editProduct(id) {
    console.log('Editing product:', id);
    // Get the modal
    const modal = document.getElementById('productModal');
    if (!modal) {
        console.error('Product modal not found');
        return;
    }

    // Change modal title to Edit Product
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Product';
    }

    // Fetch product data
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error.message);
        return;
    }

    console.log('Product data:', product);

    // Populate form with product data
    const form = document.getElementById('productForm');
    if (!form) {
        console.error('Product form not found');
        return;
    }

    // Set form values
    form.querySelector('[name="productName"]').value = product.name;
    form.querySelector('[name="productPrice"]').value = product.price;
    form.querySelector('[name="productCategory"]').value = product.category;
    form.querySelector('[name="productDescription"]').value = product.description;

    // Add hidden field for existing image URL
    let existingImageField = form.querySelector('[name="existingImageUrl"]');
    if (!existingImageField) {
        existingImageField = document.createElement('input');
        existingImageField.type = 'hidden';
        existingImageField.name = 'existingImageUrl';
        form.appendChild(existingImageField);
    }
    existingImageField.value = product.image_url;

    // Set the product ID in a hidden field for reference
    let hiddenIdField = form.querySelector('[name="productId"]');
    if (!hiddenIdField) {
        hiddenIdField = document.createElement('input');
        hiddenIdField.type = 'hidden';
        hiddenIdField.name = 'productId';
        form.appendChild(hiddenIdField);
    }
    hiddenIdField.value = id;

    // If product has sizes, set the size type and check the appropriate boxes
    if (product.sizes && product.sizes.length > 0) {
        // Determine size type based on the first size
        const firstSize = product.sizes[0];
        let sizeType = '';
        if (firstSize.includes('.')) sizeType = 'shoes';
        else if (firstSize.match(/^[0-9]+$/)) sizeType = 'pants';
        else sizeType = 'clothing';

        // Set size type and trigger change event
        const sizeTypeSelect = document.getElementById('sizeType');
        if (sizeTypeSelect) {
            sizeTypeSelect.value = sizeType;
            sizeTypeSelect.dispatchEvent(new Event('change'));

            // Wait for size options to be displayed
            setTimeout(() => {
                // Check the appropriate size boxes
                product.sizes.forEach(size => {
                    const sizeCheckbox = document.querySelector(`input[name="sizes"][value="${size}"]`);
                    if (sizeCheckbox) {
                        sizeCheckbox.checked = true;
                    }
                });
            }, 100); // Small delay to ensure size options are displayed
        }
    }

    // Show modal
    modal.style.display = 'block';
    // Use setTimeout to ensure display: block is processed before adding active class
    setTimeout(() => {
        modal.classList.add('active');
        console.log('Modal opened');
    }, 0);

}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error:', error.message)
        return
    }

    loadProducts()
}

// Size type handler
document.getElementById('sizeType').addEventListener('change', function() {
    const sizesContainer = document.getElementById('sizesContainer');
    const shoesSizes = document.getElementById('shoesSizes');
    const clothingSizes = document.getElementById('clothingSizes');
    const pantsSizes = document.getElementById('pantsSizes');

    if (this.value === '') {
        sizesContainer.style.display = 'none';
    } else {
        sizesContainer.style.display = 'block';
        shoesSizes.style.display = this.value === 'shoes' ? 'flex' : 'none';
        clothingSizes.style.display = this.value === 'clothing' ? 'flex' : 'none';
        pantsSizes.style.display = this.value === 'pants' ? 'flex' : 'none';

        // Uncheck all checkboxes when switching size type
        document.querySelectorAll('input[name="sizes"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
});

// Modal handlers
function closeModal(modalId = 'productModal') {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal not found:', modalId);
        return;
    }

    // Hide the modal
    modal.style.display = 'none';
    modal.classList.remove('active');

    // Reset the form immediately
    const form = modal.querySelector('form');
    if (form) {
        console.log('Resetting form');
        form.reset();

        // Remove any hidden ID field
        const hiddenIdField = form.querySelector('[name$="Id"]');
        if (hiddenIdField) {
            hiddenIdField.remove();
        }

        // Reset all size checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset size type
        const sizeType = form.querySelector('#sizeType');
        if (sizeType) {
            sizeType.value = '';
            sizeType.dispatchEvent(new Event('change'));
        }

        // Clear file input if it exists
        const fileInput = form.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    // Reset error messages
    const errorMessages = modal.querySelector('#errorMessages');
    if (errorMessages) {
        errorMessages.textContent = '';
    }

    // Reset modal title based on modal type
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = modal.id === 'productModal' ? 'Add New Product' : 'Add New Category';
    }
}

// No need to create static HTML files anymore - using dynamic category.html template
async function createCategoryPage(categoryName, categorySlug) {
    // Nothing to do here - we're using a dynamic template now
    console.log(`Category ${categoryName} will use the dynamic template`);
    return true;
}

// Track if category submission is in progress
let isCategorySubmitting = false;

// Handle category submission
async function handleCategorySubmit(e) {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isCategorySubmitting) {
        return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
        isCategorySubmitting = true;
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';
        document.getElementById('categoryErrorMessages').textContent = '';

        const form = e.target;
        const formData = new FormData(form);
        const categoryId = formData.get('categoryId');
        const categoryName = formData.get('categoryName');
        const categorySlug = formData.get('categorySlug');
        const categoryImage = formData.get('categoryImage');

        if (!categoryName || !categorySlug || !categoryImage) {
            document.getElementById('categoryErrorMessages').textContent = 'Please fill in all fields and upload an image';
            return;
        }

        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(categoryImage);

        const imageBase64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Error reading file'));
        });

        // Try to insert with original slug
        let finalSlug = categorySlug;
        let retryCount = 0;
        let insertSuccess = false;

        while (!insertSuccess && retryCount < 10) {
            const categoryData = {
                name: categoryName,
                slug: finalSlug,
                image_url: imageBase64
            };

            const { error: insertError } = await supabase
                .from('categories')
                .insert([categoryData]);

            if (!insertError) {
                insertSuccess = true;
            } else if (insertError.code === '23505') { // Unique violation
                retryCount++;
                finalSlug = `${categorySlug}-${retryCount}`;
            } else {
                document.getElementById('categoryErrorMessages').textContent = 'Error: ' + insertError.message;
                return;
            }
        }

        if (!insertSuccess) {
            document.getElementById('categoryErrorMessages').textContent = 'Failed to create category after multiple attempts';
            return;
        }

        // Handle category update if needed
        if (categoryId) {
            const categoryData = {
                name: categoryName,
                slug: finalSlug,
                image_url: imageBase64
            };

            const { error: updateError } = await supabase
                .from('categories')
                .update(categoryData)
                .eq('id', categoryId);

            if (updateError) {
                document.getElementById('categoryErrorMessages').textContent = 'Error updating category: ' + updateError.message;
                return;
            }
        }

        // Create the category page
        if (!categoryId) { // Only create page for new categories
            try {
                await createCategoryPage(categoryName, categorySlug);
            } catch (error) {
                console.error('Error creating category page:', error);
                // Don't block category creation if page creation fails
            }
        }

        // Update the navigation
        await updateIndexHtml();
        await loadCategories();
        closeModal('categoryModal');
    } catch (error) {
        console.error('Error creating category:', error);
        document.getElementById('categoryErrorMessages').textContent = 'Error: ' + error.message;
    } finally {
        // Re-enable submit button and restore original text
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        isCategorySubmitting = false;
    }
}

// Edit category
async function editCategory(id) {
    console.log('Editing category:', id);
    const modal = document.getElementById('categoryModal');
    if (!modal) {
        console.error('Category modal not found');
        return;
    }

    // Show the modal
    modal.style.display = 'flex';
    modal.classList.add('active');

    // Update modal title
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Category';
    }

    // Fetch category data
    const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching category:', error.message);
        return;
    }

    console.log('Category data:', category);

    // Populate form with category data
    const form = document.getElementById('categoryForm');
    if (!form) {
        console.error('Category form not found');
        return;
    }

    // Set form values
    form.querySelector('[name="categoryName"]').value = category.name;
    form.querySelector('[name="categorySlug"]').value = category.slug;

    // Set the category ID in a hidden field
    let hiddenIdField = form.querySelector('[name="categoryId"]');
    if (!hiddenIdField) {
        hiddenIdField = document.createElement('input');
        hiddenIdField.type = 'hidden';
        hiddenIdField.name = 'categoryId';
        form.appendChild(hiddenIdField);
    }
    hiddenIdField.value = id;
    console.log('Category form populated');
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error:', error.message)
        return
    }

    await loadCategories()
}

// Navigation handler
function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1); // Remove #

            // Update active link
            document.querySelector('.nav-menu li.active').classList.remove('active');
            link.parentElement.classList.add('active');

            // Hide all sections and show target
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${targetId}Section`).classList.add('active');
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize navigation
    handleNavigation();

    // Add category form submission handler
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCategorySubmit(e);
        });
    }

    // Load initial data
    await loadProducts();
    await loadCategories();

    // Add Product button click handler
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            const modal = document.getElementById('productModal');
            if (modal) {
                modal.style.display = 'block';
            }
        });
    }

    // Add Category button click handler
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            const modal = document.getElementById('categoryModal');
            if (modal) {
                // Reset the form
                const form = modal.querySelector('form');
                if (form) form.reset();

                // Reset the title
                const modalTitle = modal.querySelector('.modal-header h2');
                if (modalTitle) modalTitle.textContent = 'Add New Category';

                // Show the modal
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        });
    }

    // Close buttons
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Add logout button handler
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }



    // Add event delegation for product actions
    document.querySelector('.products-grid').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-btn')) {
            const productId = target.dataset.id;
            console.log('Edit button clicked for product:', productId);
            editProduct(productId);
        } else if (target.classList.contains('delete-btn')) {
            const productId = target.dataset.id;
            deleteProduct(productId);
        }
    })

    // Add event delegation for category actions
    document.querySelector('.categories-grid').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-category')) {
            const categoryId = target.dataset.id;
            console.log('Edit button clicked for category:', categoryId);
            editCategory(categoryId);
        } else if (target.classList.contains('delete-category')) {
            const categoryId = target.dataset.id;
            deleteCategory(categoryId);
        }
    })

    // Handle modal interactions
    document.addEventListener('click', (e) => {
        // Handle close button
        if (e.target.classList.contains('close-btn')) {
            e.stopPropagation();
            console.log('Close button clicked');
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        }
        
        // Handle clicking outside modal
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Handle form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (form.id === 'productForm') {
                await handleProductSubmit(e);
            } else if (form.id === 'categoryForm') {
                await handleCategorySubmit(e);
            }
        });
    });

    handleNavigation();






});

// Update index.html categories
async function updateIndexHtml() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        return
    }

    // Get index.html content
    const response = await fetch('/index.html')
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Find the categories container
    const categoriesContainer = doc.querySelector('.categories-container') || doc.createElement('div')
    categoriesContainer.className = 'categories-container'
    categoriesContainer.innerHTML = ''

    // Add each category
    categories.forEach(category => {
        const categoryElement = doc.createElement('div')
        categoryElement.className = 'category-item'
        categoryElement.innerHTML = `
            <a href="/${category.slug}.html" class="category-link">
                <div class="category-image" style="background-image: url('${category.image_url}');">
                    <h2 class="category-title">${category.name}</h2>
                </div>
            </a>
        `
        categoriesContainer.appendChild(categoryElement)
    })

    // Update the DOM
    const mainContent = doc.querySelector('main') || doc.body
    if (!doc.querySelector('.categories-container')) {
        mainContent.appendChild(categoriesContainer)
    }

    // Save the updated HTML
    const updatedHtml = doc.documentElement.outerHTML
    const blob = new Blob([updatedHtml], { type: 'text/html' })
    const formData = new FormData()
    formData.append('file', blob, 'index.html')

    // Upload to server
    await fetch('/update-index', {
        method: 'POST',
        body: formData
    })
}

// Make handlers available globally
window.handleProductSubmit = handleProductSubmit
window.handleCategorySubmit = handleCategorySubmit
window.editCategory = editCategory
window.deleteCategory = deleteCategory
window.editProduct = editProduct
window.deleteProduct = deleteProduct
