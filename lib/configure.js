/**
 * @import {Options, State} from './types.js'
 */

const own = {}.hasOwnProperty

/**
 * @param {State} state
 * @param {Options} options
 * @returns {State}
 */
export function configure(state, options) {
  let index = -1
  /** @type {keyof Options} */
  let key

  // First do subextensions.
  if (options.extensions) {
    while (++index < options.extensions.length) {
      configure(state, options.extensions[index])
    }
  }

  for (key in options) {
    if (own.call(options, key)) {
      switch (key) {
        case 'extensions': {
          // Empty.
          break
        }

        /* c8 ignore next 4 */
        case 'unsafe': {
          list(state[key], options[key])
          break
        }

        case 'join': {
          list(state[key], options[key])
          break
        }

        case 'handlers': {
          map(state[key], options[key])
          break
        }

        default: {
          // @ts-expect-error: matches.
          state.options[key] = options[key]
        }
      }
    }
  }

  return state
}

/**
 * @template T
 * @param {Array<T>} left
 * @param {Array<T> | null | undefined} right
 */
function list(left, right) {
  if (right) {
    left.push(...right)
  }
}

/**
 * @template T
 * @param {Record<string, T>} left
 * @param {Record<string, T> | null | undefined} right
 */
function map(left, right) {
  if (right) {
    Object.assign(left, right)
  }
}
