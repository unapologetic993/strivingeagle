// Admin Dashboard JavaScript
let products = [];
let orders = [];
let editingProduct = null;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loading...');
    
    // Protect admin route
    if (!auth.protectAdminRoute()) {
        console.log('Access denied - not logged in or not admin');
        return;
    }
    
    console.log('Access granted - loading dashboard...');
    
    // Update admin name
    const adminName = document.getElementById('admin-name');
    if (adminName && auth.getCurrentUser()) {
        adminName.textContent = auth.getCurrentUser().name;
    }
    
    loadProducts();
    loadOrders();
    initializeEventListeners();
});

// Load products from localStorage or JSON file
async function loadProducts() {
    try {
        // Try to load from products.json first (for server environment)
        try {
            const response = await fetch('../data/products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            products = data.products || [];
            console.log('Loaded products from JSON file:', products.length, 'products');
        } catch (fetchError) {
            console.warn('Fetch error, using localStorage fallback:', fetchError.message);
            // Fallback to localStorage (for file:// protocol)
            const savedProducts = localStorage.getItem('adminProducts');
            if (savedProducts) {
                products = JSON.parse(savedProducts);
                console.log('Loaded products from localStorage:', products.length, 'products');
            } else {
                // Create empty products array if nothing found
                products = [];
                console.log('No products found, using empty array');
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }
    displayProducts();
}

// Load orders from localStorage
function loadOrders() {
    try {
        const orders = localStorage.getItem('customerOrders');
        if (orders) {
            ordersData = JSON.parse(orders);
            console.log('Loaded orders from localStorage:', ordersData.length, 'orders');
        } else {
            ordersData = [];
            console.log('No orders found in localStorage');
        }
        displayOrders();
        
        // Load and display notifications
        loadNotifications();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersData = [];
    }
}

// Save products to localStorage and update JSON file
async function saveProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(products));
    displayProducts();
    
    // Create a blob and download to simulate updating file
    const jsonStr = JSON.stringify({ products: products }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.json';
    link.click();
    
    // Show notification about file update
    showNotification('Products saved! Download updated products.json file and refresh main store.');
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('customerOrders', JSON.stringify(orders));
    displayOrders();
    showNotification('Order updated successfully!');
}

// Initialize event listeners
function initializeEventListeners() {
    // Add product form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleProductSubmit);
    }

    // Image upload preview
    const imageInput = document.getElementById('product-image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

// Handle image preview
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview-img');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Handle product submission (add/edit)
function handleProductSubmit(e) {
    e.preventDefault();
    
    // Get form values directly from DOM elements
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-category').value;
    const gender = document.getElementById('product-gender').value;
    const ageGroup = document.getElementById('product-age').value;
    const sizes = document.getElementById('product-sizes').value;
    const description = document.getElementById('product-description').value;
    const imageFile = document.getElementById('product-image').files[0];
    const editId = document.getElementById('edit-product-id').value;
    
    if (editId) {
        // Edit existing product
        editProduct(editId, { name, price, category, gender, ageGroup, sizes, description, imageFile });
    } else {
        // Add new product
        addProduct({ name, price, category, gender, ageGroup, sizes, description, imageFile });
    }
}

// Add new product
function addProduct(productData) {
    if (productData.imageFile && productData.imageFile.size > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const newProduct = {
                id: 'p' + Date.now(),
                name: productData.name,
                price: parseInt(productData.price),
                category: productData.category,
                gender: productData.gender,
                ageGroup: productData.ageGroup,
                sizes: productData.sizes ? productData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
                image: event.target.result,
                description: productData.description,
                isNew: document.getElementById('product-is-new').checked,
                inStock: document.getElementById('product-in-stock').checked,
                images: [event.target.result]
            };
            
            products.push(newProduct);
            saveProducts();
            resetForm();
        };
        reader.readAsDataURL(productData.imageFile);
    } else {
        const newProduct = {
            id: 'p' + Date.now(),
            name: productData.name,
            price: parseInt(productData.price),
            category: productData.category,
            gender: productData.gender,
            ageGroup: productData.ageGroup,
            sizes: productData.sizes ? productData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
            image: 'https://via.placeholder.com/300x300?text=No+Image',
            description: productData.description,
            isNew: document.getElementById('product-is-new').checked,
            inStock: document.getElementById('product-in-stock').checked,
            images: ['https://via.placeholder.com/300x300?text=No+Image']
        };
        
        products.push(newProduct);
        saveProducts();
        resetForm();
    }
}

// Edit existing product
function editProduct(productId, productData) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    const product = products[productIndex];
    
    // Update product fields
    product.name = productData.name;
    product.price = parseInt(productData.price);
    product.category = productData.category;
    product.gender = productData.gender;
    product.ageGroup = productData.ageGroup;
    product.sizes = productData.sizes ? productData.sizes.split(',').map(s => s.trim()).filter(s => s) : [];
    product.description = productData.description;
    product.isNew = document.getElementById('product-is-new').checked;
    product.inStock = document.getElementById('product-in-stock').checked;
    
    // Handle image update
    if (productData.imageFile && productData.imageFile.size > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            product.image = event.target.result;
            product.images = [event.target.result];
            saveProducts();
            resetForm();
        };
        reader.readAsDataURL(productData.imageFile);
    } else {
        saveProducts();
        resetForm();
    }
}

// Edit product (populate form)
function startEditProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    editingProduct = product;
    
    // Populate form fields
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-gender').value = product.gender;
    document.getElementById('product-age').value = product.ageGroup;
    document.getElementById('product-sizes').value = product.sizes.join(', ');
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-is-new').checked = product.isNew;
    document.getElementById('product-in-stock').checked = product.inStock;
    
    // Update form title and button
    document.getElementById('product-form-title').textContent = 'Edit Product';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Update Product';
    document.getElementById('cancel-edit-btn').style.display = 'block';
    
    // Show current image
    const preview = document.getElementById('preview-img');
    if (product.image) {
        preview.src = product.image;
        preview.style.display = 'block';
    }
    
    // Scroll to form
    document.getElementById('add-product-form').scrollIntoView({ behavior: 'smooth' });
}

// Cancel edit
function cancelEdit() {
    editingProduct = null;
    resetForm();
}

// Reset form
function resetForm() {
    document.getElementById('add-product-form').reset();
    document.getElementById('edit-product-id').value = '';
    document.getElementById('product-form-title').textContent = 'Add New Product';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-plus"></i> Add Product';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    
    // Clear preview
    const preview = document.getElementById('preview-img');
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    
    editingProduct = null;
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        saveOrders();
    }
}

// Display products in admin panel
function displayProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) {
        console.error('Products list element not found');
        return;
    }
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>No products added yet.</p>';
        console.log('No products to display');
        return;
    }
    
    try {
        productsList.innerHTML = products.map(product => {
            // Handle base64 images vs URLs
            let imageSrc = product.image;
            if (product.image && product.image.startsWith('data:image')) {
                imageSrc = product.image; // Base64 image
            } else if (product.image && product.image.startsWith('http')) {
                imageSrc = product.image; // Regular URL
            } else {
                imageSrc = 'https://via.placeholder.com/60x60?text=No+Image';
            }
            
            return `
            <div class="product-item ${editingProduct && editingProduct.id === product.id ? 'edit-mode' : ''}">
                <img src="${imageSrc}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-meta">
                        ${product.category} | ${product.gender} | ${product.ageGroup}
                        ${product.isNew ? '| <span style="color: var(--secondary-color);">NEW</span>' : ''}
                    </div>
                    <div class="product-price">MWK ${product.price.toLocaleString()}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-admin" onclick="startEditProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-admin btn-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');
        
        console.log('Successfully displayed', products.length, 'products');
    } catch (error) {
        console.error('Error displaying products:', error);
        productsList.innerHTML = '<p>Error loading products. Please refresh the page.</p>';
    }
}

// Display orders in admin panel
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No customer orders yet.</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">${new Date(order.timestamp).toLocaleDateString()}</div>
                </div>
                <div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
            </div>
            <div class="order-details">
                <div class="detail-group">
                    <span class="detail-label">Customer:</span>
                    <span class="detail-value">${order.customerName}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${order.customerPhone}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${order.customerEmail || 'N/A'}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Delivery:</span>
                    <span class="detail-value">${order.deliveryLocation}</span>
                </div>
            </div>
            <div class="order-items">
                <h4>Order Details:</h4>
                <ul class="item-list">
                    <li>${order.orderDetails}</li>
                    ${order.orderNotes ? `<li><strong>Notes:</strong> ${order.orderNotes}</li>` : ''}
                </ul>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn-admin btn-success" onclick="updateOrderStatus('${order.id}', 'completed')">
                    <i class="fas fa-check"></i> Mark Complete
                </button>
                <button class="btn-admin" onclick="updateOrderStatus('${order.id}', 'processing')">
                    <i class="fas fa-clock"></i> Processing
                </button>
            </div>
        </div>
    `).join('');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Show section (products/orders/notifications)
function showSection(section) {
    const productsSection = document.getElementById('products-section');
    const ordersSection = document.getElementById('orders-section');
    const notificationsSection = document.getElementById('notifications-section');
    
    // Hide all sections first
    if (productsSection) productsSection.style.display = 'none';
    if (ordersSection) ordersSection.style.display = 'none';
    if (notificationsSection) notificationsSection.style.display = 'none';
    
    if (section === 'products') {
        productsSection.style.display = 'grid';
    } else if (section === 'orders') {
        ordersSection.style.display = 'block';
    } else if (section === 'notifications') {
        notificationsSection.style.display = 'block';
    }
}

// Logout function
function logout() {
    auth.logout();
}

// View Store function
function viewStore() {
    console.log('Navigating to store...');
    window.location.href = '../index.html';
}

// Add CSS for slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
