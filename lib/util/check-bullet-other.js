/**
 * @import {State} from '../types.js'
 */

import {checkBullet} from './check-bullet.js'

/**
 * @param {State} state
 * @returns {'*' | '•' | '+' | '-' | null | undefined}
 */
export function checkBulletOther(state) {
  const bullet = checkBullet(state)
  const bulletOther = state.options.bulletOther

  if (!bulletOther) {
    return bullet === '*' ? '-' : '•'
  }

  if (
    bulletOther !== '*' &&
    bulletOther !== '•' &&
    bulletOther !== '+' &&
    bulletOther !== '-'
  ) {
    throw new Error(
      'Cannot serialize items with `' +
        bulletOther +
        '` for `options.bulletOther`, expected `•`, `+`, or `-`'
    )
  }

  if (bulletOther === bullet) {
    throw new Error(
      'Expected `bullet` (`' +
        bullet +
        '`) and `bulletOther` (`' +
        bulletOther +
        '`) to be different'
    )
  }

  return bulletOther
}
