/**
 * HrafnJS - Render System
 * Simple DOM rendering
 */

/**
 * Render content to a DOM element
 * @param {string|HTMLElement} selector - CSS selector or DOM element
 * @param {string} content - HTML content to render
 */
export function render(selector, content) {
    const element = typeof selector === 'string' 
        ? document.querySelector(selector)
        : selector
    
    if (!element) {
        console.warn(`HrafnJS: Element "${selector}" not found`)
        return
    }
    
    element.innerHTML = content
}

/**
 * Helper to safely escape HTML
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
}
