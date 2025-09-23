/**
 * Verification popup module - Fixed version
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
        // Use sessionStorage instead of localStorage for session-based verification
        return sessionStorage.getItem('verificationCompleted') === 'true';
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

        // Show immediate visual feedback on clicked button
        const clickedButton = document.querySelector(`[data-option-id="${optionId}"]`);
        if (clickedButton) {
            clickedButton.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; border: 2px solid #e0e0e0; border-top: 2px solid #4285f4; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    Redirecting...
                </div>
            `;
            clickedButton.style.pointerEvents = 'none';
            clickedButton.style.opacity = '0.8';
        }

        // Mark as verified
        this.markVerified();
        
        // Hide popup immediately
        this.hide();
        
        // Redirect with minimal delay
        setTimeout(() => {
            window.location.href = url;
        }, 50);
    }

    /**
     * Mark verification as completed
     */
    markVerified() {
        // Use sessionStorage for session-based verification
        sessionStorage.setItem('verificationCompleted', 'true');
        console.log('VerificationPopup: Verification marked as complete');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('VerificationPopup: Setting up event listeners');
        
        // Prevent closing popup by clicking outside
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    e.preventDefault();
                    e.stopPropagation();
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
                e.stopImmediatePropagation();
                
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
        sessionStorage.removeItem('verificationCompleted');
        console.log('VerificationPopup: Verification reset');
    }

    /**
     * Get current video ID
     */
    getCurrentVideoId() {
        return this.currentVideoId;
    }

    /**
     * Set completion callback for compatibility
     */
    setCompletionCallback(callback) {
        this.completionCallback = callback;
    }
}

// Global functions for reCAPTCHA functionality
window.startVerification = function() {
    console.log('startVerification called');
    
    const checkbox = document.getElementById('checkbox');
    const spinner = document.getElementById('loadingSpinner');
    const challengeSection = document.getElementById('challengeSection');
    const mainCheckbox = document.getElementById('mainCheckbox');
    
    if (!checkbox || !spinner || !challengeSection) {
        console.error('Required elements not found for verification');
        return;
    }
    
    // Show loading state
    spinner.style.display = 'block';
    checkbox.classList.add('loading');
    if (mainCheckbox) mainCheckbox.classList.add('loading');
    
    // Simulate loading time
    setTimeout(() => {
        // Hide spinner and show checkmark
        spinner.style.display = 'none';
        checkbox.classList.remove('loading');
        checkbox.classList.add('checked');
        
        // Show challenge after a short delay
        setTimeout(() => {
            challengeSection.classList.add('active');
        }, 500);
    }, 1500);
};

// Global function for backwards compatibility
window.handleVerification = function(optionId) {
    console.log('Global handleVerification called:', optionId);
    
    // Prevent event bubbling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
    
    if (window.verificationPopup) {
        window.verificationPopup.handleOptionClick(optionId);
    } else {
        console.error('VerificationPopup instance not found');
    }
};