/**
 * HrafnJS - Reactive System
 * Lightweight, Adaptable, Clever
 */

import { getCurrentEffect } from './effects.js'

/**
 * Global dependency map: target -> key -> Set of effects
 */
const depsMap = new Map()

/**
 * Track a dependency between the current effect and a property
 * @param {Object} target - The reactive object
 * @param {string|symbol} key - The property key
 */
export function track(target, key) {
    const currentEffect = getCurrentEffect()
    if (!currentEffect) return
    
    let deps = depsMap.get(target)
    if (!deps) {
        deps = new Map()
        depsMap.set(target, deps)
    }
    
    let dep = deps.get(key)
    if (!dep) {
        dep = new Set()
        deps.set(key, dep)
    }
    
    dep.add(currentEffect)
}

/**
 * Trigger all effects that depend on a property
 * @param {Object} target - The reactive object
 * @param {string|symbol} key - The property key that changed
 */
export function trigger(target, key) {
    const deps = depsMap.get(target)
    if (!deps) return
    
    const dep = deps.get(key)
    if (!dep) return
    
    const effectsToRun = new Set(dep)
    effectsToRun.forEach(effect => {
        effect()
    })
}

/**
 * Make an object reactive using Proxy
 * Supports nested objects and arrays
 * @param {Object|Array} obj - Object or array to make reactive
 * @returns {Proxy} Reactive proxy
 */
export function reactive(obj) {
    if (typeof obj !== 'object' || obj === null) {
        console.warn('HrafnJS: reactive() expects an object or array')
        return obj
    }
    
    // Avoid double-wrapping
    if (obj.__isReactive) {
        return obj
    }
    
    return new Proxy(obj, {
        get(target, key) {
            // Don't track internal flag
            if (key === '__isReactive') return true
            
            track(target, key)
            const value = target[key]
            
            // Recursively make nested objects/arrays reactive
            if (typeof value === 'object' && value !== null) {
                return reactive(value)
            }
            
            return value
        },
        
        set(target, key, value) {
            const oldValue = target[key]
            
            // Only trigger if value actually changed
            if (oldValue !== value) {
                target[key] = value
                trigger(target, key)
            }
            
            return true
        },
        
        deleteProperty(target, key) {
            const hadKey = Object.prototype.hasOwnProperty.call(target, key)
            const result = delete target[key]
            
            if (hadKey) {
                trigger(target, key)
            }
            
            return result
        }
    })
}
