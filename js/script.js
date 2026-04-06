// Global variables
let products = [];
let cart = [];
let currentProduct = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dropdown menu
    initializeDropdown();
    
    // Initialize auth system first
    if (typeof auth !== 'undefined') {
        // Auth is already loaded via auth.js
        console.log('Auth system available');
    } else {
        console.warn('Auth system not loaded');
    }
    
    // Load products first, then initialize other things
    loadProducts().then(() => {
        console.log('Products loaded, initializing rest of app...');
        initializeEventListeners();
        
        // Check current page and initialize accordingly
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'index.html') {
            displayLatestProducts();
            initializeTheme();
        } else if (currentPage === 'male.html') {
            displayMaleProducts();
        } else if (currentPage === 'female.html') {
            displayFemaleProducts();
        } else if (currentPage === 'latest.html') {
            displayLatestProducts();
        } else if (currentPage === 'product.html') {
            loadProductDetails();
        } else if (currentPage === 'contact.html') {
            initializeContactForm();
        }
        
        // Update navigation after page load
        setTimeout(updateNavigation, 100);
    });
});

// Load products from JSON file
async function loadProducts() {
    try {
        console.log('Starting to load products...');
        
        // Check if products have been cleared
        const productsCleared = localStorage.getItem('productsCleared');
        if (productsCleared === 'true') {
            console.log('🗑️ Products have been cleared, using empty array');
            products = [];
            return;
        }
        
        // Check for empty products override
        const emptyOverride = localStorage.getItem('emptyProductsOverride');
        if (emptyOverride) {
            console.log('📝 Empty products override found, using empty arrays');
            products = [];
            return;
        }
        
        // First check if there are admin updates in localStorage
        const adminProducts = localStorage.getItem('adminProducts');
        console.log('Admin products in localStorage:', adminProducts ? 'Found' : 'Not found');
        
        if (adminProducts) {
            const parsedProducts = JSON.parse(adminProducts);
            if (parsedProducts.length === 0) {
                console.log('🗑️ Admin products is empty, using empty array');
                products = [];
            } else {
                products = parsedProducts;
                console.log('✅ Loaded products from admin localStorage:', products.length, 'products');
                console.log('Product sample:', products[0]);
            }
        } else {
            console.log('No admin products found, checking other sources...');
            
            // Try to load from products.json file (server environment)
            try {
                const response = await fetch('data/products.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                products = data.products || [];
                console.log('✅ Loaded products from JSON file:', products.length, 'products');
            } catch (fetchError) {
                console.warn('⚠️ Fetch error, using empty products due to clear flag:', fetchError.message);
                // Use empty products instead of hardcoded fallback
                products = [];
                console.log('🗑️ Using empty products array');
            }
        }
        
        console.log('🎯 Final products loaded:', products.length, 'products');
        return Promise.resolve(products);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        products = [];
        return Promise.resolve([]);
    }
}

// Product display functions
function displayProducts(productsToDisplay, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (productsToDisplay.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }
    
    container.innerHTML = productsToDisplay.map(product => `
        <div class="product-card" onclick="viewProduct('${product.id}')">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.isNew ? '<span class="product-badge">New</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">MWK ${product.price.toLocaleString()}</div>
                <div class="product-meta">
                    <span>${product.category}</span>
                    <span>${product.ageGroup}</span>
                </div>
                <div class="product-rating" id="rating-${product.id}">
                    ${displayProductRating(product)}
                    <div class="rating-input">
                        <button onclick="rateProduct('${product.id}', 1)">⭐</button>
                        <button onclick="rateProduct('${product.id}', 2)">⭐</button>
                        <button onclick="rateProduct('${product.id}', 3)">⭐</button>
                        <button onclick="rateProduct('${product.id}', 4)">⭐</button>
                        <button onclick="rateProduct('${product.id}', 5)">⭐</button>
                    </div>
                </div>
                <button class="add-to-cart" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function displayMaleProducts() {
    console.log('👨 Displaying male products...');
    const allProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    
    console.log('Total admin products:', allProducts.length);
    
    // Get products that are male OR unisex (from admin storage only)
    const validMaleProducts = allProducts.filter(product => 
        product.gender === 'male' || product.gender === 'unisex'
    );
    
    console.log('Valid male+unisex products:', validMaleProducts.length);
    console.log('Products:', validMaleProducts.map(p => `${p.name} (${p.gender})`));
    
    displayProducts(validMaleProducts, 'male-products-grid');
}

function displayFemaleProducts() {
    console.log('👩 Displaying female products...');
    const allProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    
    console.log('Total admin products:', allProducts.length);
    
    // Get products that are female OR unisex (from admin storage only)
    const validFemaleProducts = allProducts.filter(product => 
        product.gender === 'female' || product.gender === 'unisex'
    );
    
    console.log('Valid female+unisex products:', validFemaleProducts.length);
    console.log('Products:', validFemaleProducts.map(p => `${p.name} (${p.gender})`));
    
    displayProducts(validFemaleProducts, 'female-products-grid');
}

function displayLatestProducts() {
    const latestProducts = JSON.parse(localStorage.getItem('latestProducts') || '[]');
    
    // Filter products to show only those within 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const validLatestProducts = latestProducts.filter(product => {
        const addedDate = new Date(product.addedToLatest || product.createdAt);
        return addedDate > fifteenDaysAgo;
    });
    
    console.log(`📅 Displaying ${validLatestProducts.length} latest products (15-day window)`);
    console.log('Latest products:', validLatestProducts.map(p => p.name));
    
    // Use correct grid ID from latest.html
    displayProducts(validLatestProducts, 'latest-products-grid');
}

function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'index.html';
        return;
    }
    
    currentProduct = product;
    displayProductDetails(product);
}

function displayProductDetails(product) {
    // Implementation for product details page
    console.log('Displaying product details for:', product.name);
    
    // Set basic product information
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = product.price.toLocaleString();
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-gender').textContent = product.gender;
    document.getElementById('product-age').textContent = product.ageGroup;
    document.getElementById('product-description').textContent = product.description;
    
    // Set product image with fallback
    const mainImage = document.getElementById('main-product-image');
    if (product.image && product.image !== '') {
        mainImage.src = product.image;
        mainImage.onerror = function() {
            this.src = 'https://via.placeholder.com/400x400?text=No+Image';
        };
    } else {
        mainImage.src = 'https://via.placeholder.com/400x400?text=No+Image';
    }
    
    // Set product badges
    const badgesContainer = document.getElementById('product-badges');
    badgesContainer.innerHTML = '';
    
    if (product.isNew) {
        badgesContainer.innerHTML += '<span class="badge new">New</span>';
    }
    
    if (product.gender === 'unisex') {
        badgesContainer.innerHTML += '<span class="badge unisex">Unisex</span>';
    }
    
    // Set size options
    const sizeSelect = document.getElementById('size-select');
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    
    if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size.toUpperCase();
            sizeSelect.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = 'one-size';
        option.textContent = 'ONE SIZE';
        sizeSelect.appendChild(option);
    }
    
    // Set page title
    document.title = `${product.name} - Striving Eagle`;
    
    console.log('✅ Product details displayed successfully');
}

// Cart functions
function quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const size = product.sizes.includes('one-size') ? 'one-size' : product.sizes[0];
    addToCart(productId, size, 1);
}

function addToCart(productId, size, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            quantity: quantity
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification('Product added to cart!');
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCartToStorage();
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Theme functions
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
}

function loadTheme() {
    initializeTheme();
}

// Navigation functions
function initializeDropdown() {
    const adminDropdown = document.getElementById('admin-dropdown');
    const adminMenu = document.getElementById('admin-menu');
    
    if (adminDropdown && adminMenu) {
        // Toggle dropdown on click
        adminDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            adminMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!adminDropdown.contains(e.target) && !adminMenu.contains(e.target)) {
                adminMenu.classList.remove('show');
            }
        });
        
        // Close dropdown when clicking on a menu item
        const dropdownItems = adminMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                adminMenu.classList.remove('show');
            });
        });
    }
}

// Event listeners
function initializeEventListeners() {
    loadCartFromStorage();
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Utility functions
function showNotification(message) {
    // Implementation for showing notifications
    console.log('Notification:', message);
}

// Update navigation based on authentication status
function updateNavigation() {
    const adminLink = document.getElementById('admin-link');
    
    if (typeof auth !== 'undefined' && auth.isLoggedIn() && auth.isAdmin()) {
        // Admin is logged in
        if (adminLink) {
            adminLink.textContent = 'Dashboard';
            adminLink.href = 'admin/dashboard.html';
        }
    } else {
        // No one is logged in or customer
        if (adminLink) {
            adminLink.textContent = 'Admin';
            adminLink.href = 'login.html';
        }
    }
}

// Rating functions
function displayProductRating(product) {
    const ratings = JSON.parse(localStorage.getItem('productRatings') || '{}');
    const productRatings = ratings[product.id] || [];
    const averageRating = productRatings.length > 0 
        ? (productRatings.reduce((sum, r) => sum + r.rating, 0) / productRatings.length).toFixed(1)
        : 'Not rated';
    
    const starCount = averageRating !== 'Not rated' ? Math.round(parseFloat(averageRating)) : 0;
    const fullStars = 5;
    const emptyStars = fullStars - starCount;
    
    return `
        <div class="rating-display">
            <div class="rating-stars">
                ${'⭐'.repeat(starCount)}${'☆'.repeat(emptyStars)}
            </div>
            <div class="rating-text">
                ${averageRating !== 'Not rated' ? averageRating + '/5' : 'Not rated'}
                <span class="rating-count">(${productRatings.length} ${productRatings.length === 1 ? 'rating' : 'ratings'})</span>
            </div>
        </div>
    `;
}

function rateProduct(productId, rating) {
    // Check if user is logged in
    if (typeof auth !== 'undefined' && auth.isLoggedIn()) {
        // Get existing ratings
        const ratings = JSON.parse(localStorage.getItem('productRatings') || '{}');
        const productRatings = ratings[productId] || [];
        
        // Check if user already rated this product
        const userId = auth.getCurrentUser().id;
        const existingRating = productRatings.find(r => r.userId === userId);
        
        if (existingRating) {
            showNotification('You have already rated this product!');
            return;
        }
        
        // Add new rating
        const newRating = {
            userId: userId,
            rating: rating,
            timestamp: new Date().toISOString()
        };
        
        productRatings.push(newRating);
        ratings[productId] = productRatings;
        
        // Save to localStorage
        localStorage.setItem('productRatings', JSON.stringify(ratings));
        
        // Update display
        updateProductRatingDisplay(productId);
        
        // Notify admin dashboard
        notifyAdminOfRating(productId, rating);
        
        showNotification(`Thank you! You rated this product ${rating} out of 5 stars`);
    } else {
        showNotification('Please login to rate products');
    }
}

function notifyAdminOfRating(productId, rating) {
    // Get product details
    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Get current user info
        const currentUser = auth.getCurrentUser();
        
        // Create admin notification
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        
        const notification = {
            id: 'rating_' + Date.now(),
            type: 'rating',
            requestId: 'rating_' + Date.now(),
            message: `Customer "${currentUser.name}" rated "${product.name}" ${rating}/5 stars`,
            customerId: currentUser.id,
            customerName: currentUser.name,
            productName: product.name,
            rating: rating,
            status: 'unread',
            createdAt: new Date().toISOString()
        };
        
        adminNotifications.unshift(notification);
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
        
        // Update admin badge if they're on admin dashboard
        if (typeof window.updateAdminBadge === 'function') {
            updateAdminBadge();
        }
    }
}

function updateProductRatingDisplay(productId) {
    const ratingElement = document.getElementById(`rating-${productId}`);
    if (ratingElement) {
        const ratings = JSON.parse(localStorage.getItem('productRatings') || '{}');
        const productRatings = ratings[productId] || [];
        const averageRating = productRatings.length > 0 
            ? (productRatings.reduce((sum, r) => sum + r.rating, 0) / productRatings.length).toFixed(1)
            : 'Not rated';
        
        ratingElement.innerHTML = displayProductRating({ id: productId });
    }
}

// Load theme on page load
loadTheme();
