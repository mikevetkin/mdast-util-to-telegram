/**
 * @import {State} from '../types.js'
 */

/**
 * @param {State} state
 * @returns {'*' | '•' | '+' | '-' | null | undefined}
 */
export function checkBullet(state) {
  const marker = state.options.bullet || '•'

  if (marker !== `*` && marker !== '•' && marker !== '+' && marker !== '-') {
    throw new Error(
      'Cannot serialize items with `' +
        marker +
        '` for `options.bullet`, expected `*`, `•`, `+`, or `-`'
    )
  }

  return marker
}
