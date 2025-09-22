/**
 * Utility functions for the video platform
 */

const Utils = {
    /**
     * Debounce function to limit API calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function for scroll events
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    /**
     * Format time duration
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Local storage helpers
     */
    storage: {
        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('Session storage not available:', e);
            }
        },

        get(key) {
            try {
                const value = sessionStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            } catch (e) {
                console.warn('Session storage not available:', e);
                return null;
            }
        },

        remove(key) {
            try {
                sessionStorage.removeItem(key);
            } catch (e) {
                console.warn('Session storage not available:', e);
            }
        }
    },

    /**
     * DOM helpers
     */
    dom: {
        $(selector) {
            return document.querySelector(selector);
        },

        $$(selector) {
            return Array.from(document.querySelectorAll(selector));
        },

        create(tag, classes, attributes = {}) {
            const element = document.createElement(tag);
            if (classes) element.className = classes;
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            return element;
        },

        on(element, event, handler) {
            element.addEventListener(event, handler);
        },

        off(element, event, handler) {
            element.removeEventListener(event, handler);
        }
    }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}