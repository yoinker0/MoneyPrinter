/**
 * Video management module
 */

class VideoManager {
    constructor() {
        this.videos = [];
        this.currentVideo = null;
        this.videoGrid = null;
        this.videoModal = null;
        this.videoPlayer = null;
        this.loadingIndicator = null;
        
        this.init();
    }

    async init() {
        this.videoGrid = Utils.dom.$('#videoGrid');
        this.videoModal = Utils.dom.$('#videoModal');
        this.videoPlayer = Utils.dom.$('#videoPlayer');
        this.loadingIndicator = Utils.dom.$('#loadingIndicator');

        await this.loadVideos();
        this.setupEventListeners();
        this.setupIntersectionObserver();
    }

    /**
     * Load videos from JSON file
     */
    async loadVideos() {
        try {
            const response = await fetch('videos.json');
            const data = await response.json();
            this.videos = data.videos || [];
            
            // Simulate loading delay for better UX
            setTimeout(() => {
                this.renderVideos();
                this.hideLoading();
                analytics.track('videos_loaded', { count: this.videos.length });
            }, 1000);
            
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showError('Failed to load videos. Please check your connection and try again.');
        }
    }

    /**
     * Render videos in grid
     */
    renderVideos() {
        if (!this.videoGrid) return;
        
        this.videoGrid.innerHTML = '';
        
        if (this.videos.length === 0) {
            this.showError('No videos available at the moment.');
            return;
        }
        
        this.videos.forEach((video, index) => {
            const videoCard = this.createVideoCard(video, index);
            this.videoGrid.appendChild(videoCard);
        });

        // Track successful render
        analytics.track('videos_rendered', {
            count: this.videos.length
        });
    }

    /**
     * Create video card element
     */
    createVideoCard(video, index) {
        console.log('VideoManager: Creating card for:', video.id, video.title);
        
        const card = Utils.dom.create('div', 'video-card');
        card.setAttribute('data-video-id', video.id);
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" 
                     alt="${video.title}" 
                     class="w-full h-full object-cover"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+VklERU88L3RleHQ+Cjwvc3ZnPg=='">
                
                <div class="play-button">
                    <div class="play-icon"></div>
                </div>
                
                ${video.duration ? `<div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">${video.duration}</div>` : ''}
            </div>
            
            <div class="p-3 md:p-4">
                <h3 class="text-white font-medium text-sm md:text-base text-center">${video.title}</h3>
            </div>
        `;
        
        // FIXED: Use addEventListener instead of onclick and add proper event handling
        card.addEventListener('click', (e) => {
            // Make sure the click isn't from inside a popup
            if (e.target.closest('.verification-popup')) {
                console.log('VideoManager: Click inside popup ignored');
                return; // Don't handle video clicks if inside popup
            }
            
            // Prevent default action and stop propagation
            e.preventDefault();
            e.stopPropagation();
            
            console.log('VideoManager: Video clicked:', video.id);
            this.handleVideoClick(video);
        });
        
        return card;
    }

    /**
     * Handle video card click
     */
    h/**
 * Handle video card click
 */
handleVideoClick(video) {
    console.log('VideoManager: Redirecting to:', video.embedUrl);

    // Track click
    analytics.trackVideoClick(video.id, video.title);

    // Redirect user to external site (coomer.su / etc.)
    window.open(video.embedUrl, '_blank');
}

    /**
     * Play video in modal
     */
    playVideo(video) {
        if (!video || !this.videoModal || !this.videoPlayer) return;
        
        // CRITICAL: Check if affiliate redirect is happening
        if (document.getElementById('affiliateLoadingOverlay')) {
            console.log('VideoManager: Affiliate redirect in progress, not playing video');
            return;
        }
        
        // Check if body interactions are disabled (redirect happening)
        if (document.body.style.pointerEvents === 'none') {
            console.log('VideoManager: Body interactions disabled, not playing video');
            return;
        }
        
        console.log('VideoManager: Playing video:', video.id);
        
        // Set video source with autoplay
        this.videoPlayer.src = `${video.embedUrl}?autoplay=1&rel=0`;
        
        // Show modal
        this.videoModal.classList.remove('hidden');
        this.videoModal.classList.add('flex');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Track video play
        analytics.trackVideoPlay(video.id, video.title);
    }

    /**
     * Close video modal
     */
    closeVideo() {
        if (!this.videoModal || !this.videoPlayer) return;
        
        console.log('VideoManager: Closing video');
        
        // Stop video
        this.videoPlayer.src = '';
        
        // Hide modal
        this.videoModal.classList.add('hidden');
        this.videoModal.classList.remove('flex');
        
        // Restore body scroll
        document.body.style.overflow = 'auto';
        
        // Track video close
        if (this.currentVideo) {
            analytics.trackVideoClose(this.currentVideo.id);
        }
        
        this.currentVideo = null;
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (!this.videoGrid) return;
        
        const errorElement = Utils.dom.create('div', 'text-center py-8 text-red-400');
        errorElement.innerHTML = `
            <p class="text-lg font-medium">${message}</p>
            <button onclick="location.reload()" class="mt-4 bg-brand-pink hover:bg-brand-pink-dark text-white px-6 py-2 rounded-lg transition-colors">
                Retry
            </button>
        `;
        
        this.videoGrid.innerHTML = '';
        this.videoGrid.appendChild(errorElement);
        this.hideLoading();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('VideoManager: Setting up event listeners');
        
        // Close modal when clicking outside
        if (this.videoModal) {
            this.videoModal.addEventListener('click', (e) => {
                if (e.target === this.videoModal) {
                    this.closeVideo();
                }
            });
        }

        // Close button - FIXED: Added proper event handling
        const closeBtn = Utils.dom.$('#closeVideoBtn');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeVideo();
            };
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.videoModal && !this.videoModal.classList.contains('hidden')) {
                this.closeVideo();
            }
        });
    }

    /**
     * Setup intersection observer for lazy loading
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img[data-src]');
                    if (img && img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, options);

        // Observe all video cards after they're rendered
        setTimeout(() => {
            const videoCards = Utils.dom.$$('.video-card');
            videoCards.forEach(card => observer.observe(card));
        }, 100);
    }

    /**
     * Get video by ID
     */
    getVideoById(id) {
        return this.videos.find(video => video.id === id);
    }

    /**
     * Refresh videos
     */
    async refresh() {
        this.showLoading();
        await this.loadVideos();
    }
}