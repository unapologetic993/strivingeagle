// Admin Dashboard JavaScript
let products = [];
let orders = [];

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadOrders();
    initializeEventListeners();
});

// Load products from JSON file and merge with localStorage admin products
async function loadProducts() {
    try {
        // Load base products from JSON file first
        let baseProducts = [];
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            baseProducts = data.products || [];
        } catch (fetchError) {
            console.warn('Could not load base products:', fetchError.message);
            baseProducts = [];
        }
        
        // Get admin-added products from centralized file or localStorage
        let adminAddedProducts = [];
        try {
            const adminResponse = await fetch('data/admin-products.json');
            const adminData = await adminResponse.json();
            adminAddedProducts = adminData.adminProducts || [];
        } catch (adminError) {
            console.warn('Could not load admin products file, using localStorage fallback:', adminError.message);
            const localStorageAdminProducts = localStorage.getItem('adminProducts');
            if (localStorageAdminProducts) {
                adminAddedProducts = JSON.parse(localStorageAdminProducts);
            }
        }
        
        // Merge base products with admin products, avoiding duplicates
        const existingIds = new Set(baseProducts.map(p => p.id));
        const newAdminProducts = adminAddedProducts.filter(p => !existingIds.has(p.id));
        
        products = [...baseProducts, ...newAdminProducts];
        console.log('Loaded products:', baseProducts.length, 'base +', newAdminProducts.length, 'admin =', products.length, 'total');
        
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }
    displayProducts();
}

// Load orders from localStorage
function loadOrders() {
    const savedOrders = localStorage.getItem('customerOrders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
        displayOrders();
    }
}

// Save products to centralized system and automatically sync to GitHub
async function saveProducts() {
    // Load base products to identify which ones are admin-added
    let baseProducts = [];
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        baseProducts = data.products || [];
    } catch (error) {
        console.warn('Could not load base products for comparison');
    }
    
    // Identify admin-added products (those not in base products)
    const baseIds = new Set(baseProducts.map(p => p.id));
    const adminAddedProducts = products.filter(p => !baseIds.has(p.id));
    
    // Save to localStorage as backup
    localStorage.setItem('adminProducts', JSON.stringify(adminAddedProducts));
    displayProducts();
    
    // Try automatic GitHub sync first
    if (typeof githubSync !== 'undefined') {
        try {
            await githubSync.syncAdminProducts(adminAddedProducts);
            console.log('✅ Automatic GitHub sync completed');
            return; // Success, no need for manual download
        } catch (syncError) {
            console.warn('Automatic sync failed, falling back to manual download:', syncError);
        }
    }
    
    // Fallback: Download files for manual upload
    const adminData = {
        adminProducts: adminAddedProducts,
        lastUpdated: new Date().toISOString(),
        version: "1.0"
    };
    
    // Download admin-products.json for manual upload to GitHub
    const adminJsonStr = JSON.stringify(adminData, null, 2);
    const adminBlob = new Blob([adminJsonStr], { type: 'application/json' });
    const adminUrl = URL.createObjectURL(adminBlob);
    
    const adminLink = document.createElement('a');
    adminLink.href = adminUrl;
    adminLink.download = 'admin-products.json';
    adminLink.click();
    
    // Also download complete products file for backup
    const completeJsonStr = JSON.stringify({ products: products }, null, 2);
    const completeBlob = new Blob([completeJsonStr], { type: 'application/json' });
    const completeUrl = URL.createObjectURL(completeBlob);
    
    const completeLink = document.createElement('a');
    completeLink.href = completeUrl;
    completeLink.download = 'products-backup.json';
    completeLink.click();
    
    // Show notification about file update
    showNotification(`⚠️ Auto-sync unavailable. ${adminAddedProducts.length} admin products downloaded. Upload admin-products.json to GitHub manually.`);
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('customerOrders', JSON.stringify(orders));
    displayOrders();
    showNotification('Order saved successfully!');
}

// Initialize event listeners
function initializeEventListeners() {
    // Add product form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Customer order form
    const orderForm = document.getElementById('customer-order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleCustomerOrder);
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

// Handle adding new product
function handleAddProduct(e) {
    e.preventDefault();
    
    console.log('Form submitted'); // Debug log
    
    // Get form values directly from DOM elements
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-category').value;
    const gender = document.getElementById('product-gender').value;
    const ageGroup = document.getElementById('product-age').value;
    const sizes = document.getElementById('product-sizes').value;
    const description = document.getElementById('product-description').value;
    const imageFile = document.getElementById('product-image').files[0];
    
    console.log('Form values:', { name, price, category, gender, ageGroup, sizes, description, imageFile }); // Debug log
    
    // Convert image to base64 if uploaded
    if (imageFile && imageFile.size > 0) {
        console.log('Processing image file'); // Debug log
        const reader = new FileReader();
        reader.onload = function(event) {
            console.log('FileReader loaded'); // Debug log
            const newProduct = {
                id: 'p' + Date.now(),
                name: name,
                price: parseInt(price),
                category: category,
                gender: gender,
                ageGroup: ageGroup,
                sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(s => s) : [],
                image: event.target.result, // Use base64 image
                description: description,
                isNew: document.getElementById('product-is-new').checked,
                inStock: document.getElementById('product-in-stock').checked,
                images: [event.target.result] // Single image for now
            };
            
            console.log('New product:', newProduct); // Debug log
            products.push(newProduct);
            saveProducts();
            e.target.reset();
            
            // Clear preview
            const preview = document.getElementById('preview-img');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        };
        reader.readAsDataURL(imageFile);
    } else {
        console.log('No image file, using fallback'); // Debug log
        // Fallback to placeholder image if no image
        const newProduct = {
            id: 'p' + Date.now(),
            name: name,
            price: parseInt(price),
            category: category,
            gender: gender,
            ageGroup: ageGroup,
            sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(s => s) : [],
            image: 'https://via.placeholder.com/300x300?text=No+Image',
            description: description,
            isNew: document.getElementById('product-is-new').checked,
            inStock: document.getElementById('product-in-stock').checked,
            images: ['https://via.placeholder.com/300x300?text=No+Image']
        };
        
        console.log('Fallback product:', newProduct); // Debug log
        products.push(newProduct);
        saveProducts();
        e.target.reset();
    }
}

// Handle customer order submission
function handleCustomerOrder(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newOrder = {
        id: 'o' + Date.now(),
        customerName: formData.get('customer-name'),
        customerPhone: formData.get('customer-phone'),
        customerEmail: formData.get('customer-email'),
        deliveryLocation: formData.get('delivery-location'),
        orderDetails: formData.get('order-details'),
        orderNotes: formData.get('order-notes'),
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    orders.push(newOrder);
    saveOrders();
    e.target.reset();
}

// Display products in admin panel
function displayProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>No products added yet.</p>';
        return;
    }
    
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
        <div class="product-item">
            <img src="${imageSrc}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-meta">
                    ${product.category} | ${product.gender} | ${product.ageGroup}
                    ${product.isNew ? '| <span style="color: var(--secondary-color);">NEW</span>' : ''}
                </div>
                <div class="product-price">MWK ${product.price.toLocaleString()}</div>
            </div>
            <button class="btn-admin btn-danger" onclick="deleteProduct('${product.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    }).join('');
}

// Display orders in admin panel
function displayOrders() {
    // This would typically show in a separate section
    // For now, orders are just saved to localStorage
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
    }
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

// Export products to JSON (for manual backup)
function exportProducts() {
    const dataStr = JSON.stringify({ products: products }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.json';
    link.click();
}

// Add export button to admin panel
document.addEventListener('DOMContentLoaded', function() {
    const adminSection = document.querySelector('.admin-section h2');
    if (adminSection && adminSection.textContent.includes('Current Products')) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-admin';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Products';
        exportBtn.onclick = exportProducts;
        exportBtn.style.marginTop = '1rem';
        adminSection.parentNode.appendChild(exportBtn);
    }
});

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
