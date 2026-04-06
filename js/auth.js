// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.init();
    }

    init() {
        // Check for existing session
        const session = this.getSession();
        if (session && this.isSessionValid(session)) {
            this.currentUser = session.user;
            // Only redirect if not already on the correct page
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage !== 'dashboard.html' && currentPage !== 'orders.html') {
                this.redirectBasedOnRole();
            }
        }
    }

    // Password hashing using Web Crypto API
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Verify password
    async verifyPassword(password, hashedPassword) {
        const inputHash = await this.hashPassword(password);
        return inputHash === hashedPassword;
    }

    // Create session
    createSession(user) {
        const session = {
            user: user,
            timestamp: Date.now(),
            expires: Date.now() + this.sessionTimeout
        };
        
        localStorage.setItem('userSession', JSON.stringify(session));
        this.currentUser = user;
        return session;
    }

    // Get session
    getSession() {
        const sessionData = localStorage.getItem('userSession');
        return sessionData ? JSON.parse(sessionData) : null;
    }

    // Check if session is valid
    isSessionValid(session) {
        return session && session.expires > Date.now();
    }

    // Clear session
    clearSession() {
        localStorage.removeItem('userSession');
        this.currentUser = null;
    }

    // Check if user is logged in
    isLoggedIn() {
        const session = this.getSession();
        return session && this.isSessionValid(session);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Redirect based on role
    redirectBasedOnRole() {
        if (this.isAdmin()) {
            // Check if we're already in admin folder
            if (window.location.pathname.includes('/admin/')) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'admin/dashboard.html';
            }
        } else {
            window.location.href = 'account/orders.html';
        }
    }

    // Protect admin routes
    protectAdminRoute() {
        console.log('Checking admin route protection...');
        console.log('Is logged in:', this.isLoggedIn());
        console.log('Is admin:', this.isAdmin());
        
        if (!this.isLoggedIn() || !this.isAdmin()) {
            console.log('Access denied - redirecting...');
            this.showAccessDenied();
            return false;
        }
        console.log('Access granted');
        return true;
    }

    // Protect customer routes
    protectCustomerRoute() {
        if (!this.isLoggedIn()) {
            window.location.href = '../login.html';
            return false;
        }
        return true;
    }

    // Show access denied
    showAccessDenied() {
        // Check if we're in admin folder
        if (window.location.pathname.includes('/admin/')) {
            window.location.href = '../access-denied.html';
        } else {
            window.location.href = 'access-denied.html';
        }
    }

    // Login function
    async login(email, password) {
        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find user by email
            const user = users.find(u => u.email === email);
            
            if (!user) {
                throw new Error('INCORRECT');
            }

            // Verify password
            const isValidPassword = await this.verifyPassword(password, user.password);
            
            if (!isValidPassword) {
                throw new Error('INCORRECT');
            }

            // Create session
            this.createSession(user);
            
            // Force admin redirect for admin users
            if (user.role === 'admin') {
                console.log('🔐 Admin login detected, redirecting to dashboard...');
                if (window.location.pathname.includes('/admin/')) {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'admin/dashboard.html';
                }
            }
            
            return { success: true, user };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Register function
    async register(userData) {
        try {
            // Get existing users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.find(u => u.email === userData.email)) {
                throw new Error('Email already registered');
            }

            // Hash password
            const hashedPassword = await this.hashPassword(userData.password);

            // Create new user
            const newUser = {
                id: 'user_' + Date.now(),
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: hashedPassword,
                role: 'customer', // Default role
                createdAt: new Date().toISOString()
            };

            // Add to users array
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            return { success: true, user: newUser };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Logout
    logout() {
        this.clearSession();
        // Check if we're in admin folder
        if (window.location.pathname.includes('/admin/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    }

    // Initialize default admin user if not exists
    async initializeAdmin() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if admin exists
        if (!users.find(u => u.role === 'admin')) {
            const adminPassword = await this.hashPassword('ChisomoXCharles08');
            const adminUser = {
                id: 'admin_001',
                name: 'Admin User',
                email: 'Charles',
                password: adminPassword,
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('Default admin user created:');
            console.log('Username: Charles');
            console.log('Password: ChisomoXCharles08');
        }
    }

    // Send verification code to email
    async sendVerificationCode(email) {
        try {
            // Check if admin exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const adminUser = users.find(u => u.email === email && u.role === 'admin');
            
            if (!adminUser) {
                return { success: false, error: 'Admin email not found' };
            }
            
            // Generate 6-digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Store code with expiration (10 minutes)
            const verificationData = {
                email: email,
                code: code,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
            };
            localStorage.setItem('verificationCode', JSON.stringify(verificationData));
            
            // Simulate sending email (in production, this would use an email service)
            console.log('Verification code for', email, ':', code);
            
            // Show code in console for testing (remove in production)
            alert(`DEVELOPMENT MODE: Your verification code is: ${code}\n\nIn production, this would be sent to your email.`);
            
            return { success: true };
        } catch (error) {
            console.error('Error sending verification code:', error);
            return { success: false, error: 'Failed to send verification code' };
        }
    }

    // Verify code and login
    async verifyCodeAndLogin(code) {
        try {
            // Get stored verification data
            const verificationData = JSON.parse(localStorage.getItem('verificationCode') || '{}');
            
            // Check if code exists and hasn't expired
            if (!verificationData.code || !verificationData.expiresAt) {
                return { success: false, error: 'No verification code found' };
            }
            
            if (new Date() > new Date(verificationData.expiresAt)) {
                localStorage.removeItem('verificationCode');
                return { success: false, error: 'Verification code expired' };
            }
            
            // Check if code matches
            if (code !== verificationData.code) {
                return { success: false, error: 'Invalid verification code' };
            }
            
            // Get admin user
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const adminUser = users.find(u => u.email === verificationData.email && u.role === 'admin');
            
            if (!adminUser) {
                return { success: false, error: 'Admin user not found' };
            }
            
            // Create session
            const session = {
                user: adminUser,
                loginTime: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            
            localStorage.setItem('userSession', JSON.stringify(session));
            
            // Clear verification code
            localStorage.removeItem('verificationCode');
            
            return { success: true };
        } catch (error) {
            console.error('Error verifying code:', error);
            return { success: false, error: 'Failed to verify code' };
        }
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Initialize default admin on page load
document.addEventListener('DOMContentLoaded', function() {
    auth.initializeAdmin();
    
    // Handle login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    submitBtn.disabled = true;
    
    // Attempt login
    const result = await auth.login(email, password);
    
    if (result.success) {
        showMessage('success-message', 'Login successful! Redirecting...');
        setTimeout(() => {
            // Check if we're already in admin folder
            if (window.location.pathname.includes('/admin/')) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'admin/dashboard.html';
            }
        }, 1500);
    } else {
        showMessage('error-message', result.error);
    }
    
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('error-message', 'Passwords do not match');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showMessage('error-message', 'Password must be at least 6 characters');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    // Attempt registration
    const result = await auth.register({
        name,
        email,
        phone,
        password
    });
    
    if (result.success) {
        showMessage('success-message', 'Account created successfully! Please login.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        showMessage('error-message', result.error);
    }
    
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}

// Show message (error or success)
function showMessage(elementId, message) {
    const errorElement = document.getElementById('error-message');
    const successElement = document.getElementById('success-message');
    
    // Hide both messages first
    if (errorElement) errorElement.style.display = 'none';
    if (successElement) successElement.style.display = 'none';
    
    // Show the appropriate message
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
        targetElement.textContent = message;
        targetElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            targetElement.style.display = 'none';
        }, 5000);
    }
}

// Export for use in other files
window.auth = auth;
