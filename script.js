const serversData = [
    {
        name: "تهران تی اس",
        ip: "tehrants.ir",
        maxUsers: 500,
        status: "online",
        description: "قدیمی ترین سرور عمومی کشور"
    },
    {
        name: "تیم اسپیک سرور",
        ip: "tssv.ir",
        maxUsers: 512,
        status: "online",
        description: "یکی از قدیمی ترین سرور های عمومی ایران"
    },
    {
        name: "تکنولوژیست",
        ip: "tcnl.ir",
        maxUsers: 16536,
        status: "online",
        description: "سرور عمومی، پیشرفته ترین سرور تیم اسپیکی جهان"
    },
    {
        name: "تیم اسپیک سرور",
        ip: "tsserver.ir",
        maxUsers: 512,
        status: "online",
        description: "یکی از قدیمی ترین سرور های عمومی ایران"
    },
    {
        name: "سلاطین گیم",
        ip: "tssalatin.ir",
        maxUsers: 1024,
        status: "online",
        description: "یکی از قدیمی ترین سرور های عمومی ایران - فروشنده سرور های تیم اسپیک"
    },
    {
        name: "تیم اسپیک آسمان",
        ip: "tssky.ir",
        maxUsers: 400,
        status: "online",
        description: "یکی از قدیمی ترین سرور های عمومی ایران"
    },
    {
        name: "تهران‌گیمینگ",
        ip: "tgts.ir",
        maxUsers: 256,
        status: "online",
        description: "برترین فروشنده تمامی خدمات تیم‌اسپیک و سرور مجازی گیم"
    },
    {
        name: "ندیکس",
        ip: "nxts.ir",
        maxUsers: 8585,
        status: "online",
        description: "بزرگ ترین فروشنده سرور های تیم اسپیک"
    },
    {
        name: "فالن گیم",
        ip: "fallents.ir",
        maxUsers: 1024,
        status: "online",
        description: "فروش و خدمات سرور های تیم اسپیک و گیمینگ"
    },
    {
        name: "تیم اسپیک زولا بازان - فالن گیم",
        ip: "zulats.ir",
        maxUsers: 1024,
        status: "online",
        description: "فروش و خدمات سرور های تیم اسپیک و گیمینگ"
    },
    {
        name: "تیم اسپیک آی آر",
        ip: "teamspeak.ir",
        maxUsers: 1024,
        status: "offline",
        description: "parsvds.com فروش و خدمات سرور مجازی و اختصاصی"
    }
    
];

// Global variables
let currentServers = [...serversData];
let currentSort = { column: null, direction: 'asc' };

// Theme Management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        this.setTheme(this.theme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        this.themeToggle.setAttribute('aria-label', 
            theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'
        );
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Server Management
class ServerManager {
    constructor() {
        this.serversTableBody = document.getElementById('serversTableBody');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.loadingState = document.getElementById('loadingState');
        this.emptyState = document.getElementById('emptyState');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadServers();
        this.updateStats();
    }

    setupEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchButton.addEventListener('click', () => this.handleSearch(this.searchInput.value));
        
        // Enter key for search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(this.searchInput.value);
            }
        });

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header.dataset.sort));
        });

        // Refresh servers every 5 minutes
        // setInterval(() => this.refreshServers(), 300000);
    }

    handleSearch(query) {
        const filteredServers = serversData.filter(server => 
            server.name.toLowerCase().includes(query.toLowerCase()) ||
            server.ip.toLowerCase().includes(query.toLowerCase()) ||
            server.description.toLowerCase().includes(query.toLowerCase())
        );
        
        currentServers = filteredServers;
        this.renderServers();
        this.updateStats();
    }

    handleSort(column) {
        const header = document.querySelector(`[data-sort="${column}"]`);
        
        // Clear other headers
        document.querySelectorAll('.sortable').forEach(h => {
            if (h !== header) {
                h.classList.remove('sort-asc', 'sort-desc');
            }
        });

        // Determine sort direction
        let direction = 'asc';
        if (currentSort.column === column) {
            direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        }

        currentSort = { column, direction };

        // Update header class
        header.classList.remove('sort-asc', 'sort-desc');
        header.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');

        // Sort servers
        currentServers.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            // Handle different data types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.renderServers();
    }

    async loadServers() {
        this.showLoading();
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        currentServers = [...serversData];
        this.renderServers();
        this.hideLoading();
    }

    async refreshServers() {
        // // Simulate server status updates
        // serversData.forEach(server => {
        //     if (Math.random() < 0.1) { // 10% chance to change status
        //         server.status = server.status === 'online' ? 'offline' : 'online';
        //     } else if (server.status === 'online') {
        //         // Slight variation in user count
        //     }
        // });

        // currentServers = [...serversData];
        // this.renderServers();
        // this.updateStats();
    }

    renderServers() {
        if (currentServers.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        const tbody = this.serversTableBody;
        tbody.innerHTML = '';

        currentServers.forEach((server, index) => {
            const row = this.createServerRow(server, index);
            tbody.appendChild(row);
        });

        // Add animation to new rows
        this.animateRows();
    }

    createServerRow(server, index) {
        const row = document.createElement('tr');
        row.setAttribute('role', 'row');
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';

        const statusClass = this.getStatusClass(server.status);
        const statusText = this.getStatusText(server.status);
        
        row.innerHTML = `
            <td data-label="نام سرور">
                <strong>${this.escapeHtml(server.name)}</strong>
                <br>
                <small style="color: var(--text-muted);">${this.escapeHtml(server.description)}</small>
            </td>
            <td data-label="آدرس سرور">
                <code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">
                    ${this.escapeHtml(server.ip)}
                </code>
            </td>
            <td data-label="حداکثر کاربران">
                <span style="color: var(--text-secondary);">
                    ${server.maxUsers}
                </span>
            </td>
            <td data-label="وضعیت">
                <span class="status-badge ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td data-label="اتصال">
                <a href="ts3server://${server.ip}"
                   class="connect-btn" 
                   title="اتصال به سرور ${this.escapeHtml(server.name)}"
                   ${server.status !== 'online' ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                    اتصال
                </a>
            </td>
        `;

        return row;
    }

    animateRows() {
        const rows = this.serversTableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    getStatusClass(status) {
        switch (status) {
            case 'online': return 'status-online';
            case 'offline': return 'status-offline';
            default: return 'status-unknown';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'online': return 'آنلاین';
            case 'offline': return 'آفلاین';
            default: return 'نامشخص';
        }
    }

    showLoading() {
        this.loadingState.style.display = 'block';
        // this.serversTableBody.parentElement.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    hideLoading() {
        this.loadingState.style.display = 'none';
        // this.serversTableBody.parentElement.style.display = 'block';
    }

    showEmptyState() {
        this.emptyState.style.display = 'block';
        // this.serversTableBody.parentElement.style.display = 'none';
    }

    hideEmptyState() {
        this.emptyState.style.display = 'none';
        // this.serversTableBody.parentElement.style.display = 'block';
    }

    updateStats() {
        const totalServers = serversData.length;
        const onlineServers = serversData.filter(s => s.status === 'online').length;

        this.animateCounter('totalServers', totalServers);
        this.animateCounter('onlineServers', onlineServers);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString('fa-IR');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Utility Functions
class Utils {
    static formatNumber(num) {
        return num.toLocaleString('fa-IR');
    }

    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'absolute';
            textArea.style.opacity = '0';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((resolve, reject) => {
                document.execCommand('copy') ? resolve() : reject();
                textArea.remove();
            });
        }
    }
}

// Performance Monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            searchTime: 0
        };
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.setupPerformanceObserver();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.metrics.loadTime = loadTime;
            console.log(`صفحه در ${Math.round(loadTime)}ms بارگذاری شد`);
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        console.log(`${entry.name}: ${Math.round(entry.duration)}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    startMeasure(name) {
        performance.mark(`${name}-start`);
    }

    endMeasure(name) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
    }
}

// Error Handling
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    }

    logError(type, error) {
        console.error(`${type}:`, error);
        
        // در محیط production می‌توانید این اطلاعات را به سرور ارسال کنید
        if (window.location.hostname !== 'localhost') {
            this.reportError(type, error);
        }
    }

    reportError(type, error) {
        // ارسال خطا به سرور لاگ
        const errorData = {
            type: type,
            message: error.message || error.toString(),
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        // در اینجا می‌توانید خطا را به سرویس لاگ ارسال کنید
        console.log('Error reported:', errorData);
    }
}

// Accessibility Features
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
    }

    setupKeyboardNavigation() {
        // اضافه کردن پشتیبانی از کیبورد برای جدول
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'TR' || e.target.closest('tr')) {
                const currentRow = e.target.closest('tr');
                let targetRow = null;

                switch (e.key) {
                    case 'ArrowDown':
                        targetRow = currentRow.nextElementSibling;
                        break;
                    case 'ArrowUp':
                        targetRow = currentRow.previousElementSibling;
                        break;
                }

                if (targetRow) {
                    e.preventDefault();
                    targetRow.focus();
                }
            }
        });
    }

    setupScreenReaderSupport() {
        // اضافه کردن توضیحات برای screen reader ها
        const table = document.getElementById('serversTable');
        if (table) {
            table.setAttribute('aria-describedby', 'table-description');
            
            const description = document.createElement('div');
            description.id = 'table-description';
            description.className = 'sr-only';
            table.parentNode.insertBefore(description, table);
        }
    }

    setupHighContrastMode() {
        // تشخیص حالت high contrast
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }
}

// SEO and Analytics
class SEOManager {
    constructor() {
        this.init();
    }

    init() {
        // this.updatePageTitle();
        // this.setupStructuredData();
    }

    updatePageTitle() {
        // const onlineCount = serversData.filter(s => s.status === 'online').length;
        // const totalCount = serversData.length;
        
        // document.title = `${onlineCount} سرور آنلاین از ${totalCount} سرور | لیست برترین سرورهای تیم اسپیک ایران`;
    }

    setupStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "لیست برترین سرور های تیم اسپیک ایران",
            "description": "لیست کامل و بروز برترین سرور های تیم اسپیک ایران",
            "url": window.location.href,
            "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": serversData.length,
                "itemListElement": serversData.map((server, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "SoftwareApplication",
                        "name": server.name,
                        "description": server.description,
                        "url": `ts3server://${server.ip}`,
                        "applicationCategory": "CommunicationApplication"
                    }
                }))
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
}

// Main Application
class TeamSpeakApp {
    constructor() {
        this.themeManager = new ThemeManager();
        this.serverManager = new ServerManager();
        this.performanceMonitor = new PerformanceMonitor();
        this.errorHandler = new ErrorHandler();
        this.accessibilityManager = new AccessibilityManager();
        this.seoManager = new SEOManager();
        
        this.init();
    }

    init() {
        this.performanceMonitor.startMeasure('app-initialization');
        
        // اضافه کردن event listener برای copy کردن آدرس سرور
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'CODE' && e.target.textContent.includes(':')) {
                Utils.copyToClipboard(e.target.textContent)
                    .then(() => {
                        this.showNotification('آدرس سرور کپی شد!', 'success');
                    })
                    .catch(() => {
                        this.showNotification('خطا در کپی کردن آدرس', 'error');
                    });
            }
        });

        this.performanceMonitor.endMeasure('app-initialization');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 8px;
            border: 2px solid var(--border-color);
            box-shadow: 0 4px 15px var(--shadow-color);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    const app = new TeamSpeakApp();
    
    // Global app reference for debugging
    window.TeamSpeakApp = app;
});
