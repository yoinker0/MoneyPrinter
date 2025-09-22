/**
 * Main application entry point
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
            // Initialize analytics
            analytics.trackPageView('Video Hub Home');

            // Initialize verification popup
            this.verificationPopup = new VerificationPopup();
            
            // Initialize video manager
            this.videoManager = new VideoManager();
            
            // Connect verification popup to video manager
            this.verificationPopup.setCompletionCallback((videoId) => {
                const video = this.videoManager.getVideoById(videoId);
                if (video) {
                    this.videoManager.playVideo(video);
                }
            });

            // Make instances globally available
            window.verificationPopup = this.verificationPopup;
            window.videoManager = this.videoManager;

            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            this.isInitialized = true;
            console.log('App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showInitializationError();
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            analytics.track('error', {
                type: 'unhandled_promise',
                message: event.reason?.message || 'Unknown error'
            });
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            analytics.track('error', {
                type: 'javascript_error',
                message: event.error?.message || 'Unknown error',
                filename: event.filename,
                lineno: event.lineno
            });
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            analytics.track('visibility_change', {
                visible: !document.hidden
            });
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            analytics.track('page_unload');
        });
    }

    /**
     * Show initialization error
     */
    showInitializationError() {
        const errorHTML = `
            <div class="min-h-screen flex items-center justify-center bg-dark-bg text-white p-4">
                <div class="text-center max-w-md">
                    <h1 class="text-2xl font-bold mb-4 text-red-400">Failed to Load</h1>
                    <p class="text-light-text mb-6">Something went wrong while loading the application.</p>
                    <button onclick="location.reload()" class="bg-brand-pink hover:bg-brand-pink-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Reload Page
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
    app = App.getInstance();
    await app.init();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}