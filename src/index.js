/**
 * HrafnJS - Main Entry Point
 * Lightweight, Adaptable, Clever
 * 
 * A reactive JavaScript framework inspired by Vue and Solid
 */

// Core reactivity
export { reactive, track, trigger } from './reactive.js'

// Effects system
export { createEffect, computed, watch, getCurrentEffect } from './effects.js'

// Rendering
export { render, escapeHtml } from './render.js'

// Version
export const version = '0.1.0'
