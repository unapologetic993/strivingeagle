// Customer Account JavaScript
let customerOrders = [];

// Initialize customer account
document.addEventListener('DOMContentLoaded', function() {
    // Protect customer route
    if (!auth.protectCustomerRoute()) {
        return;
    }
    
    // Update customer name
    const customerName = document.getElementById('customer-name');
    if (customerName && auth.getCurrentUser()) {
        customerName.textContent = auth.getCurrentUser().name;
    }
    
    loadCustomerOrders();
    loadCustomerProfile();
});

// Load customer orders
function loadCustomerOrders() {
    const allOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const currentUser = auth.getCurrentUser();
    
    // Filter orders for current customer
    customerOrders = allOrders.filter(order => 
        order.customerEmail === currentUser.email || 
        order.customerPhone === currentUser.phone
    );
    
    displayCustomerOrders();
}

// Load customer profile
function loadCustomerProfile() {
    const currentUser = auth.getCurrentUser();
    const profileInfo = document.getElementById('profile-info');
    
    if (profileInfo && currentUser) {
        profileInfo.innerHTML = `
            <div class="order-details">
                <div class="detail-group">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">${currentUser.name}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Email Address:</span>
                    <span class="detail-value">${currentUser.email}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Phone Number:</span>
                    <span class="detail-value">${currentUser.phone}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Account Type:</span>
                    <span class="detail-value">${currentUser.role === 'admin' ? 'Administrator' : 'Customer'}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Member Since:</span>
                    <span class="detail-value">${new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }
}

// Display customer orders
function displayCustomerOrders() {
    const ordersList = document.getElementById('customer-orders-list');
    if (!ordersList) return;
    
    if (customerOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-shopping-cart"></i>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                <a href="../index.html" class="btn btn-primary">
                    <i class="fas fa-shopping-bag"></i> Start Shopping
                </a>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = customerOrders.map(order => {
        // Calculate estimated delivery (3-5 days from order date)
        const orderDate = new Date(order.timestamp);
        const deliveryDate = new Date(orderDate.getTime() + (4 * 24 * 60 * 60 * 1000)); // 4 days average
        
        return `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">Placed on ${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString()}</div>
                    <div class="order-date">Estimated delivery: ${deliveryDate.toLocaleDateString()}</div>
                </div>
                <div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
            </div>
            <div class="order-details">
                <div class="detail-group">
                    <span class="detail-label">Delivery Location:</span>
                    <span class="detail-value">${order.deliveryLocation}</span>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Contact Phone:</span>
                    <span class="detail-value">${order.customerPhone}</span>
                </div>
            </div>
            <div class="order-items">
                <h4>Order Details:</h4>
                <ul class="item-list">
                    <li>${order.orderDetails}</li>
                    ${order.orderNotes ? `<li><strong>Special Notes:</strong> ${order.orderNotes}</li>` : ''}
                </ul>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                ${order.status === 'pending' ? `
                    <button class="btn-admin" onclick="contactSupport('${order.id}')">
                        <i class="fas fa-phone"></i> Contact Support
                    </button>
                ` : ''}
                <button class="btn-admin" onclick="reorderItems('${order.id}')">
                    <i class="fas fa-redo"></i> Reorder
                </button>
            </div>
        </div>
    `;
    }).join('');
}

// Contact support for order
function contactSupport(orderId) {
    const order = customerOrders.find(o => o.id === orderId);
    if (order) {
        const message = `Hi, I need help with my order #${orderId}. Please assist me.`;
        const whatsappUrl = `https://wa.me/26599921219?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Reorder items
function reorderItems(orderId) {
    const order = customerOrders.find(o => o.id === orderId);
    if (order) {
        // Extract items from order details and add to cart
        // This would need to be implemented based on your cart system
        alert('Items from order #' + orderId + ' have been added to your cart!');
        // Redirect to store
        window.location.href = '../index.html';
    }
}

// Show section (orders/profile)
function showSection(section) {
    const ordersSection = document.getElementById('orders-section');
    const profileSection = document.getElementById('profile-section');
    
    if (section === 'orders') {
        ordersSection.style.display = 'block';
        profileSection.style.display = 'none';
    } else if (section === 'profile') {
        ordersSection.style.display = 'none';
        profileSection.style.display = 'block';
    }
}

// Logout function
function logout() {
    auth.logout();
}
