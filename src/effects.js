/**
 * HrafnJS - Effects System
 * Run side effects when reactive dependencies change
 */

// Import the effect tracking system from reactive module
let currentEffect = null
const effectsStack = []

// We'll need to make currentEffect accessible to reactive.js track()
// So we export a getter
export function getCurrentEffect() {
    return currentEffect
}

/**
 * Create an effect that re-runs when its dependencies change
 * @param {Function} fn - The effect function to run
 * @returns {Function} Cleanup function to stop the effect
 */
export function createEffect(fn) {
    const effect = function effect(...args) {
        // Prevent infinite loops from circular dependencies
        if (effectsStack.indexOf(effect) === -1) {
            try {
                // Set this as the current effect for tracking
                currentEffect = effect
                effectsStack.push(effect)
                return fn(...args)
            } finally {
                effectsStack.pop()
                currentEffect = effectsStack[effectsStack.length - 1]
            }
        }
    }
    
    // Run the effect immediately
    effect()
    
    // Return cleanup function
    return () => {
        // TODO: Implement cleanup - remove effect from all dependencies
        console.warn('HrafnJS: Effect cleanup not yet implemented')
    }
}

/**
 * Create a computed value that updates when dependencies change
 * @param {Function} getter - Function that computes the value
 * @returns {Object} Object with .value property
 */
export function computed(getter) {
    let value
    let dirty = true
    
    createEffect(() => {
        if (dirty) {
            value = getter()
            dirty = false
        }
    })
    
    return {
        get value() {
            if (dirty) {
                value = getter()
                dirty = false
            }
            return value
        }
    }
}

/**
 * Watch a reactive value and run a callback when it changes
 * @param {Function} getter - Function that returns the value to watch
 * @param {Function} callback - Callback (newValue, oldValue) => {}
 */
export function watch(getter, callback) {
    let oldValue
    
    createEffect(() => {
        const newValue = getter()
        
        if (oldValue !== undefined) {
            callback(newValue, oldValue)
        }
        
        oldValue = newValue
    })
}
