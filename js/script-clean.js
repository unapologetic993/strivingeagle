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
            displayProducts(products.filter(p => p.gender === 'male'), 'male-products-grid');
        } else if (currentPage === 'female.html') {
            displayProducts(products.filter(p => p.gender === 'female'), 'female-products-grid');
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
                <button class="add-to-cart" onclick="event.stopPropagation(); quickAddToCart('${product.id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function displayLatestProducts() {
    const latestContainer = document.getElementById('latest-products');
    if (!latestContainer) return;
    
    const latestProducts = products.filter(p => p.isNew).slice(0, 8);
    displayProducts(latestProducts, 'latest-products');
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

// Load theme on page load
loadTheme();
