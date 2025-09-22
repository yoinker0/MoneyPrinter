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

        console.log('VerificationPopup: Showing popup for video:', videoId);
        this.currentVideoId = videoId;
        this.overlay.classList.remove('hidden');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // CRITICAL: Disable all video interactions while popup is open
        this.disableVideoInteractions();
        
        // Track popup show
        if (typeof analytics !== 'undefined') {
            analytics.trackPopupShow(videoId);
        }
        
        return true;
    }

    /**
     * Hide popup
     */
    hide() {
        console.log('VerificationPopup: Hiding popup');
        this.overlay.classList.add('hidden');
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
        
        // CRITICAL: Re-enable video interactions
        this.enableVideoInteractions();
    }

    /**
     * Disable video interactions while popup is open
     */
    disableVideoInteractions() {
        console.log('VerificationPopup: Disabling video interactions');
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            card.style.pointerEvents = 'none';
            card.classList.add('popup-active');
        });
    }

    /**
     * Re-enable video interactions
     */
    enableVideoInteractions() {
        console.log('VerificationPopup: Re-enabling video interactions');
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            card.style.pointerEvents = 'auto';
            card.classList.remove('popup-active');
        });
    }

    /**
     * Handle affiliate option click - FIXED VERSION WITH LOADING STATE
     */
    handleOptionClick(optionId) {
        console.log('VerificationPopup: Option clicked:', optionId);
        
        const option = this.affiliateOptions.find(opt => opt.id === optionId);
        if (!option) {
            console.error('VerificationPopup: Option not found:', optionId);
            return;
        }

        // CRITICAL: Immediately show loading state to prevent video from showing
        this.showLoadingState();

        // Track affiliate click
        if (typeof analytics !== 'undefined') {
            analytics.trackAffiliateClick(optionId, this.currentVideoId);
        }

        // Mark verification as completed
        this.markCompleted(optionId);
        
        console.log('VerificationPopup: Redirecting to:', option.url);
        
        // Redirect immediately - no timeout delay
        window.location.href = option.url;
    }

    /**
     * Show loading state immediately when affiliate option is clicked
     */
    showLoadingState() {
        console.log('VerificationPopup: Showing loading state');
        
        // Create or show loading overlay
        let loadingOverlay = document.getElementById('affiliateLoadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'affiliateLoadingOverlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
            `;
            loadingOverlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="width: 50px; height: 50px; border: 3px solid #333; border-top: 3px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <div style="font-size: 18px;">Redirecting...</div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.style.display = 'flex';
        }
        
        // Hide the verification popup immediately
        this.hide();
        
        // Prevent any video loading by disabling all interactions
        document.body.style.pointerEvents = 'none';
    }

    /**
     * Mark verification as completed
     */
    markCompleted(optionId) {
        console.log('VerificationPopup: Marking verification as completed');
        this.isCompleted = true;
        Utils.storage.set('verificationCompleted', true);
        
        // Track completion
        if (typeof analytics !== 'undefined') {
            analytics.trackVerificationComplete(optionId, this.currentVideoId);
        }
        
        // Hide popup (redundant but safe)
        this.hide();
        
        // Trigger completion callback if set
        if (typeof this.completionCallback === 'function') {
            this.completionCallback(this.currentVideoId);
        }
    }

    /**
     * Setup event listeners - FIXED VERSION
     */
    setupEventListeners() {
        console.log('VerificationPopup: Setting up event listeners');
        
        // Prevent closing popup by clicking outside
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    // Don't allow closing - user must complete verification
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
        }

        // Setup click handlers for affiliate options - ENHANCED VERSION
        document.addEventListener('click', (e) => {
            const affiliateOption = e.target.closest('.affiliate-option');
            if (affiliateOption) {
                console.log('VerificationPopup: Affiliate option clicked via event listener');
                
                // Prevent event propagation immediately
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const optionId = affiliateOption.dataset.optionId;
                if (optionId) {
                    this.handleOptionClick(optionId);
                } else {
                    console.error('VerificationPopup: No optionId found on clicked element');
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
        console.log('VerificationPopup: Resetting verification');
        this.isCompleted = false;
        Utils.storage.remove('verificationCompleted');
    }
}

// Global function for onclick handlers - FIXED VERSION WITH IMMEDIATE LOADING
function handleVerification(optionId) {
    console.log('handleVerification called with:', optionId);
    
    // Prevent any event bubbling or default actions
    if (typeof event !== 'undefined' && event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
    
    if (window.verificationPopup) {
        window.verificationPopup.handleOptionClick(optionId);
    } else {
        console.error('verificationPopup not found on window object');
    }
}