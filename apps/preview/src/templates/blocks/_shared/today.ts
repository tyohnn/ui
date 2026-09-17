/**
 * "Today" for every block template: 2026-01-14, the date the coverage template uses. Templates render the same
 * on every run, so nothing reads the clock; tooling/snapshot/compare-blocks.mjs freezes the reference app's clock
 * at this date so upstream's `new Date()` agrees.
 */
export const BLOCK_TODAY = new Date(2026, 0, 14)
