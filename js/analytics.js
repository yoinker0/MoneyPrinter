/**
 * Analytics module for tracking user interactions
 */

class Analytics {
    constructor() {
        this.isGtagAvailable = typeof gtag !== 'undefined';
        this.events = [];
    }

    /**
     * Track custom event
     */
    track(eventName, parameters = {}) {
        const eventData = {
            event: eventName,
            timestamp: Date.now(),
            url: window.location.href,
            ...parameters
        };

        // Store event locally for debugging
        this.events.push(eventData);

        // Send to Google Analytics if available
        if (this.isGtagAvailable) {
            gtag('event', eventName, parameters);
        }

        // Log for development
        console.log('Analytics Event:', eventData);
    }

    /**
     * Track page view
     */
    trackPageView(pageTitle = document.title) {
        this.track('page_view', {
            page_title: pageTitle,
            page_location: window.location.href
        });
    }

    /**
     * Track video interaction
     */
    trackVideoClick(videoId, videoTitle) {
        this.track('video_click', {
            video_id: videoId,
            video_title: videoTitle,
            position: this.getVideoPosition(videoId)
        });
    }

    trackVideoPlay(videoId, videoTitle) {
        this.track('video_play', {
            video_id: videoId,
            video_title: videoTitle
        });
    }

    trackVideoClose(videoId) {
        this.track('video_close', {
            video_id: videoId
        });
    }

    /**
     * Track verification popup
     */
    trackPopupShow(videoId) {
        this.track('verification_popup_show', {
            video_id: videoId,
            trigger_time: Date.now()
        });
    }

    trackAffiliateClick(option, videoId) {
        this.track('affiliate_click', {
            option: option,
            video_id: videoId,
            click_time: Date.now()
        });
    }

    trackVerificationComplete(option, videoId) {
        this.track('verification_completed', {
            option: option,
            video_id: videoId,
            completion_time: Date.now()
        });
    }

    /**
     * Get video position in grid
     */
    getVideoPosition(videoId) {
        const videoElement = Utils.dom.$(`[data-video-id="${videoId}"]`);
        if (!videoElement) return null;

        const allVideos = Utils.dom.$$('.video-card');
        return allVideos.indexOf(videoElement) + 1;
    }

    /**
     * Get all tracked events (for debugging)
     */
    getEvents() {
        return this.events;
    }

    /**
     * Clear event history
     */
    clearEvents() {
        this.events = [];
    }
}

// Create global analytics instance
const analytics = new Analytics();
