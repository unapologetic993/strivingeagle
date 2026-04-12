// GitHub Automatic Sync System for Admin Products
// This handles automatic repository updates when products are added

class GitHubSync {
    constructor() {
        this.repoOwner = 'unapologetic993';
        this.repoName = 'strivingeagle';
        this.filePath = 'data/admin-products.json';
        this.apiBaseUrl = 'https://api.github.com';
    }

    // Get GitHub token from localStorage or prompt user
    getAuthToken() {
        let token = localStorage.getItem('github_token');
        if (!token) {
            token = prompt('Enter your GitHub Personal Access Token:\n\nGet one from: https://github.com/settings/tokens\n\nRequired scopes: repo, public_repo');
            if (token) {
                localStorage.setItem('github_token', token);
            }
        }
        return token;
    }

    // Get current file content and SHA from GitHub
    async getCurrentFile() {
        const token = this.getAuthToken();
        if (!token) throw new Error('GitHub token required');

        const url = `${this.apiBaseUrl}/repos/${this.repoOwner}/${this.repoName}/contents/${this.filePath}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // File doesn't exist, create new one
                    return { content: '', sha: null };
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                content: atob(data.content),
                sha: data.sha
            };
        } catch (error) {
            console.error('Error getting current file:', error);
            throw error;
        }
    }

    // Update or create file in GitHub repository
    async updateFile(content, commitMessage) {
        const token = this.getAuthToken();
        if (!token) throw new Error('GitHub token required');

        const currentFile = await this.getCurrentFile();
        const encodedContent = btoa(unescape(encodeURIComponent(content)));

        const url = `${this.apiBaseUrl}/repos/${this.repoOwner}/${this.repoName}/contents/${this.filePath}`;
        
        const body = {
            message: commitMessage,
            content: encodedContent
        };

        if (currentFile.sha) {
            body.sha = currentFile.sha;
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
            }

            const result = await response.json();
            console.log('✅ File updated successfully:', result.content.html_url);
            return result;
        } catch (error) {
            console.error('Error updating file:', error);
            throw error;
        }
    }

    // Sync admin products to GitHub automatically
    async syncAdminProducts(adminProducts) {
        try {
            const adminData = {
                adminProducts: adminProducts,
                lastUpdated: new Date().toISOString(),
                version: "1.0",
                syncMethod: "automatic"
            };

            const content = JSON.stringify(adminData, null, 2);
            const commitMessage = `🛍️ Auto-sync: ${adminProducts.length} admin products updated (${new Date().toLocaleString()})`;

            const result = await this.updateFile(content, commitMessage);
            
            // Show success notification
            this.showNotification('✅ Products automatically synced to GitHub! All devices will see updates within 1-2 minutes.', 'success');
            
            return result;
        } catch (error) {
            console.error('Auto-sync failed:', error);
            this.showNotification(`❌ Auto-sync failed: ${error.message}. Please download and upload manually.`, 'error');
            throw error;
        }
    }

    // Show notification to user
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `sync-notification ${type}`;
        notification.innerHTML = `
            <div class="sync-notification-content">
                <span class="sync-notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="sync-notification-message">${message}</span>
                <button class="sync-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles if not already added
        if (!document.getElementById('sync-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'sync-notification-styles';
            styles.textContent = `
                .sync-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
                    animation: slideIn 0.3s ease-out;
                }
                .sync-notification-content {
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .sync-notification-icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }
                .sync-notification-message {
                    flex: 1;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .sync-notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    color: #666;
                    flex-shrink: 0;
                }
                .sync-notification-close:hover {
                    color: #333;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    // Setup GitHub token for user
    setupToken() {
        const token = prompt('Enter your GitHub Personal Access Token:\n\n' +
            '1. Go to: https://github.com/settings/tokens\n' +
            '2. Click "Generate new token (classic)"\n' +
            '3. Select scopes: repo, public_repo\n' +
            '4. Copy and paste the token below');
        
        if (token && token.trim()) {
            localStorage.setItem('github_token', token.trim());
            this.showNotification('✅ GitHub token saved! Auto-sync is now enabled.', 'success');
            return true;
        }
        return false;
    }

    // Clear stored token
    clearToken() {
        localStorage.removeItem('github_token');
        this.showNotification('🔑 GitHub token cleared. You will need to re-enter it for auto-sync.', 'info');
    }
}

// Create global instance
window.githubSync = new GitHubSync();

// Auto-setup helper function
window.setupGitHubSync = function() {
    return window.githubSync.setupToken();
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubSync;
}
