/**
 * Main application entry point - Fixed version
 */

class App {
    constructor() {
        this.videoManager = null;
        this.verificationPopup = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            console.log('App: Starting initialization...');

            // Initialize analytics if available
            if (typeof analytics !== 'undefined') {
                analytics.trackPageView('Video Hub Home');
            } else {
                console.warn('Analytics not available');
            }

            // Initialize verification popup first
            console.log('App: Initializing verification popup...');
            this.verificationPopup = new VerificationPopup();
            
            // Initialize video manager
            console.log('App: Initializing video manager...');
            this.videoManager = new VideoManager();
            
            // Make instances globally available
            window.verificationPopup = this.verificationPopup;
            window.videoManager = this.videoManager;

            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            this.isInitialized = true;
            console.log('App: Initialized successfully');
            
        } catch (error) {
            console.error('App: Failed to initialize:', error);
            this.showInitializationError(error.message);
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        console.log('App: Setting up global event listeners');

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (typeof analytics !== 'undefined') {
                analytics.track('error', {
                    type: 'unhandled_promise',
                    message: event.reason?.message || 'Unknown error'
                });
            }
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            if (typeof analytics !== 'undefined') {
                analytics.track('error', {
                    type: 'javascript_error',
                    message: event.error?.message || 'Unknown error',
                    filename: event.filename,
                    lineno: event.lineno
                });
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (typeof analytics !== 'undefined') {
                analytics.track('visibility_change', {
                    visible: !document.hidden
                });
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (typeof analytics !== 'undefined') {
                analytics.track('page_unload');
            }
        });
    }

    /**
     * Show initialization error
     */
    showInitializationError(errorMessage = 'Unknown error occurred') {
        console.error('App: Showing initialization error:', errorMessage);
        
        const errorHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                <div class="text-center max-w-md">
                    <h1 class="text-2xl font-bold mb-4 text-red-400">Failed to Load</h1>
                    <p class="text-gray-300 mb-2">Something went wrong while loading the application.</p>
                    <p class="text-sm text-gray-400 mb-6">Error: ${errorMessage}</p>
                    <button onclick="location.reload()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Reload Page
                    </button>
                    <button onclick="console.clear(); localStorage.clear(); location.reload()" class="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Clear Cache & Reload
                    </button>
                </div>
            </div>
        `;
        document.body.innerHTML = errorHTML;
    }

    /**
     * Get app instance (singleton pattern)
     */
    static getInstance() {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }
}

// Global app instance
let app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM loaded, initializing app...');
        app = App.getInstance();
        await app.init();
    } catch (error) {
        console.error('Critical error during app initialization:', error);
        
        // Fallback error display
        const errorHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                <div class="text-center max-w-md">
                    <h1 class="text-2xl font-bold mb-4 text-red-400">Critical Error</h1>
                    <p class="text-gray-300 mb-2">The application failed to start.</p>
                    <p class="text-sm text-gray-400 mb-6">${error.message}</p>
                    <button onclick="location.reload()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
        document.body.innerHTML = errorHTML;
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}