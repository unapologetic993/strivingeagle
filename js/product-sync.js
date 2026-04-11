// Product Synchronization System
// This handles syncing admin products across all devices

// Save admin products to centralized file
async function saveAdminProductsToServer(adminProducts) {
    try {
        // Create the admin products data structure
        const adminData = {
            adminProducts: adminProducts,
            lastUpdated: new Date().toISOString(),
            version: "1.0"
        };
        
        // For GitHub Pages deployment, we need to download the file
        // The admin will need to manually upload it to the repository
        const jsonStr = JSON.stringify(adminData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = 'admin-products.json';
        link.click();
        
        // Also save to localStorage as backup
        localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
        
        return true;
    } catch (error) {
        console.error('Error saving admin products:', error);
        return false;
    }
}

// Load admin products from centralized file
async function loadAdminProductsFromServer() {
    try {
        const response = await fetch('data/admin-products.json');
        const data = await response.json();
        return data.adminProducts || [];
    } catch (error) {
        console.warn('Could not load admin products from server:', error);
        // Fallback to localStorage
        const localStorageProducts = localStorage.getItem('adminProducts');
        return localStorageProducts ? JSON.parse(localStorageProducts) : [];
    }
}

// Sync products between localStorage and server
async function syncAdminProducts() {
    try {
        const serverProducts = await loadAdminProductsFromServer();
        const localProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        
        // Merge products, keeping the most recent ones
        const mergedProducts = [...serverProducts, ...localProducts];
        const uniqueProducts = mergedProducts.filter((product, index, self) =>
            index === self.findIndex((p) => p.id === product.id)
        );
        
        return uniqueProducts;
    } catch (error) {
        console.error('Error syncing admin products:', error);
        return [];
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveAdminProductsToServer,
        loadAdminProductsFromServer,
        syncAdminProducts
    };
}
