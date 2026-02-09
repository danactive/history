import '@testing-library/jest-dom/vitest'

// Test setup for DOM matchers and browser-only APIs (ResizeObserver) in Vitest.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
