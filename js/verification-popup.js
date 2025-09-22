/**
 * Verification popup module - Simplified version
 */

class VerificationPopup {
    constructor() {
        this.overlay = null;
        this.currentVideoId = null;
        this.affiliateUrls = {
            'instabang': 'https://t.mbsrv2.com/388143/5380?aff_sub5=SF_006OG000004lmDN',
            'bootycallz': 'https://t.mbsrv2.com/388143/7411?bo=2753,2754,2755,2756&popUnder=true&aff_sub5=SF_006OG000004lmDN'
        };
        
        this.init();
    }

    init() {
        this.overlay = document.getElementById('verificationOverlay');
        this.setupEventListeners();
        console.log('VerificationPopup: Initialized');
    }

    /**
     * Check if verification is completed
     */
    isVerified() {
        return localStorage.getItem('verificationCompleted') === 'true';
    }

    /**
     * Show verification popup
     */
    show(videoId) {
        console.log('VerificationPopup: Showing popup for video:', videoId);
        
        if (this.isVerified()) {
            console.log('VerificationPopup: Already verified, skipping popup');
            return false;
        }

        this.currentVideoId = videoId;
        
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
            this.overlay.classList.add('flex');
            document.body.style.overflow = 'hidden';
            
            // Track popup show
            if (typeof analytics !== 'undefined') {
                analytics.trackPopupShow(videoId);
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Hide verification popup
     */
    hide() {
        console.log('VerificationPopup: Hiding popup');
        
        if (this.overlay) {
            this.overlay.classList.add('hidden');
            this.overlay.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Handle affiliate option click
     */
    handleOptionClick(optionId) {
        console.log('VerificationPopup: Option clicked:', optionId);
        
        const url = this.affiliateUrls[optionId];
        if (!url) {
            console.error('VerificationPopup: No URL found for option:', optionId);
            return;
        }

        // Track click
        if (typeof analytics !== 'undefined') {
            analytics.trackAffiliateClick(optionId, this.currentVideoId);
        }

        // Mark as verified
        this.markVerified();
        
        // Show loading overlay and redirect
        this.showRedirectOverlay();
        
        // Small delay to ensure overlay renders
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    }

    /**
     * Mark verification as completed
     */
    markVerified() {
        localStorage.setItem('verificationCompleted', 'true');
        console.log('VerificationPopup: Verification marked as complete');
    }

    /**
     * Show redirect loading overlay
     */
    showRedirectOverlay() {
        // Hide verification popup first
        this.hide();
        
        const overlay = document.createElement('div');
        overlay.id = 'redirectOverlay';
        overlay.style.cssText = `
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
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 3px solid #333; border-top: 3px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <div style="font-size: 18px; margin-bottom: 10px;">Redirecting...</div>
                <div style="font-size: 14px; opacity: 0.8;">Please wait</div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('VerificationPopup: Setting up event listeners');
        
        // Prevent closing popup by clicking outside
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                // Only close if clicking the overlay itself, not its contents
                if (e.target === this.overlay) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Don't allow closing - user must complete verification
                    console.log('VerificationPopup: Attempted to close popup - prevented');
                }
            });
        }

        // Handle affiliate option clicks
        document.addEventListener('click', (e) => {
            const affiliateOption = e.target.closest('.affiliate-option');
            if (affiliateOption) {
                e.preventDefault();
                e.stopPropagation();
                
                const optionId = affiliateOption.getAttribute('data-option-id');
                if (optionId) {
                    console.log('VerificationPopup: Affiliate option clicked:', optionId);
                    this.handleOptionClick(optionId);
                }
            }
        });

        // Prevent escape key from closing popup
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay && !this.overlay.classList.contains('hidden')) {
                e.preventDefault();
                console.log('VerificationPopup: Escape key blocked');
            }
        });
    }

    /**
     * Reset verification (for testing)
     */
    reset() {
        localStorage.removeItem('verificationCompleted');
        console.log('VerificationPopup: Verification reset');
    }

    /**
     * Get current video ID
     */
    getCurrentVideoId() {
        return this.currentVideoId;
    }
}

// Global function for backwards compatibility
window.handleVerification = function(optionId) {
    console.log('Global handleVerification called:', optionId);
    if (window.verificationPopup) {
        window.verificationPopup.handleOptionClick(optionId);
    } else {
        console.error('VerificationPopup instance not found');
    }
};