/**
 * Verification popup module
 */

class VerificationPopup {
    constructor() {
        this.isCompleted = Utils.storage.get('verificationCompleted') || false;
        this.currentVideoId = null;
        this.overlay = null;
        this.affiliateOptions = [];
        
        this.init();
    }

    async init() {
        this.overlay = Utils.dom.$('#verificationOverlay');
        await this.loadAffiliateOptions();
        this.setupEventListeners();
    }

    /**
     * Load affiliate options from JSON
     */
    async loadAffiliateOptions() {
        try {
            const response = await fetch('videos.json');
            const data = await response.json();
            this.affiliateOptions = data.affiliateOptions || [];
        } catch (error) {
            console.error('Failed to load affiliate options:', error);
            // Fallback options
            this.affiliateOptions = [
                {
                    id: 'instabang',
                    title: 'Continue with Instabang',
                    subtitle: 'Quick verification process',
                    type: 'dating',
                    color: 'blue',
                    url: 'https://t.mbsrv2.com/388143/5380?aff_sub5=SF_006OG000004lmDN'
                },
                {
                    id: 'bootycallz',
                    title: 'Continue with BootyCallz',
                    subtitle: 'Fast verification method',
                    type: 'dating',
                    color: 'green',
                    url: 'https://t.mbsrv2.com/388143/7411?bo=2753,2754,2755,2756&popUnder=true&aff_sub5=SF_006OG000004lmDN'
                }
            ];
        }
    }

    /**
     * Check if verification is needed
     */
    needsVerification() {
        return !this.isCompleted;
    }

    /**
     * Show popup for specific video
     */
    show(videoId) {
        if (!this.needsVerification()) {
            return false;
        }

        this.currentVideoId = videoId;
        this.overlay.classList.remove('hidden');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Track popup show
        analytics.trackPopupShow(videoId);
        
        return true;
    }

    /**
     * Hide popup
     */
    hide() {
        this.overlay.classList.add('hidden');
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
    }

    /**
     * Handle affiliate option click
     */
    handleOptionClick(optionId) {
        const option = this.affiliateOptions.find(opt => opt.id === optionId);
        if (!option) return;

        // Track affiliate click
        analytics.trackAffiliateClick(optionId, this.currentVideoId);

        // Open affiliate link in same tab for better conversion
        window.location.href = option.url;
        
        // Mark verification as completed
        this.markCompleted(optionId);
    }

    /**
     * Mark verification as completed
     */
    markCompleted(optionId) {
        this.isCompleted = true;
        Utils.storage.set('verificationCompleted', true);
        
        // Track completion
        analytics.trackVerificationComplete(optionId, this.currentVideoId);
        
        // Hide popup
        this.hide();
        
        // Trigger completion callback if set
        if (typeof this.completionCallback === 'function') {
            this.completionCallback(this.currentVideoId);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Prevent closing popup by clicking outside
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    // Don't allow closing - user must complete verification
                    e.stopPropagation();
                }
            });
        }

        // Setup click handlers for affiliate options
        document.addEventListener('click', (e) => {
            if (e.target.closest('.affiliate-option')) {
                const option = e.target.closest('.affiliate-option');
                const optionId = option.dataset.optionId;
                if (optionId) {
                    this.handleOptionClick(optionId);
                }
            }
        });
    }

    /**
     * Set completion callback
     */
    setCompletionCallback(callback) {
        this.completionCallback = callback;
    }

    /**
     * Reset verification (for testing)
     */
    reset() {
        this.isCompleted = false;
        Utils.storage.remove('verificationCompleted');
    }
}

// Global functions for onclick handlers
function handleVerification(optionId) {
    if (window.verificationPopup) {
        window.verificationPopup.handleOptionClick(optionId);
    }
}