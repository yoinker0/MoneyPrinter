/**
 * Video management module - Simplified for external video links
 */

class VideoManager {
    constructor() {
        this.videos = [];
        this.videoGrid = null;
        this.loadingIndicator = null;
        
        this.init();
    }

    async init() {
        this.videoGrid = Utils.dom.$('#videoGrid');
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
                if (typeof analytics !== 'undefined') {
                    analytics.track('videos_loaded', { count: this.videos.length });
                }
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
        if (typeof analytics !== 'undefined') {
            analytics.track('videos_rendered', { count: this.videos.length });
        }
    }

    /**
     * Create video card element
     */
    createVideoCard(video, index) {
        console.log('VideoManager: Creating card for:', video.id, video.title);
        
        const card = Utils.dom.create('div', 'video-card cursor-pointer transform transition-transform hover:scale-105');
        card.setAttribute('data-video-id', video.id);
        
        card.innerHTML = `
            <div class="video-thumbnail relative overflow-hidden rounded-lg bg-gray-800">
                <img src="${video.thumbnail}" 
                     alt="${video.title}" 
                     class="w-full h-full object-cover"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYTFhIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+VklERU88L3RleHQ+Cjwvc3ZnPg=='">
                
                <div class="play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                    <div class="play-icon w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                
                ${video.duration ? `<div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">${video.duration}</div>` : ''}
            </div>
            
            <div class="p-3 md:p-4">
                <h3 class="text-white font-medium text-sm md:text-base text-center line-clamp-2">${video.title}</h3>
                ${video.views ? `<p class="text-gray-400 text-xs text-center mt-1">${video.views} views</p>` : ''}
            </div>
        `;
        
        // Add click handler
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('VideoManager: Video clicked:', video.id);
            this.handleVideoClick(video);
        });
        
        return card;
    }

    /**
     * Handle video card click - Check verification first
     */
    handleVideoClick(video) {
        console.log('VideoManager: Handling video click for:', video.id);

        // Track click
        if (typeof analytics !== 'undefined') {
            analytics.trackVideoClick(video.id, video.title);
        }

        // Check if verification is needed
        const isVerified = localStorage.getItem('verificationCompleted') === 'true';
        
        if (!isVerified) {
            console.log('VideoManager: Verification required, showing popup');
            this.showVerificationPopup(video.id);
        } else {
            console.log('VideoManager: User verified, redirecting to:', video.embedUrl);
            // User is verified, redirect directly
            window.open(video.embedUrl, '_blank');
        }
    }

    /**
     * Show verification popup
     */
    showVerificationPopup(videoId) {
        console.log('VideoManager: Showing verification popup for video:', videoId);
        
        const overlay = document.getElementById('verificationOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            
            // Store which video was clicked
            overlay.setAttribute('data-video-id', videoId);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
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
            <p class="text-lg font-medium mb-4">${message}</p>
            <button onclick="location.reload()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
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
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const overlay = document.getElementById('verificationOverlay');
                if (overlay && !overlay.classList.contains('hidden')) {
                    // Don't allow closing verification popup with escape
                    e.preventDefault();
                }
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

    /**
     * Reset verification (for testing)
     */
    resetVerification() {
        localStorage.removeItem('verificationCompleted');
        console.log('VideoManager: Verification reset');
    }
}