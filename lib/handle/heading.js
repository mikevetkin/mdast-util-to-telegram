/**
 * @import {Info, State} from 'mdast-util-to-markdown'
 * @import {Heading, Parents} from 'mdast'
 */

import {encodeCharacterReference} from '../util/encode-character-reference.js'

/**
 * @param {Heading} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */
export function heading(node, _, state, info) {
  const tracker = state.createTracker(info)

  const sequence = '****'
  const exit = state.enter('headingAtx')
  const subexit = state.enter('phrasing')

  // Note: for proper tracking, we should reset the output positions when there
  // is no content returned, because then the space is not output.
  // Practically, in that case, there is no content, so it doesn’t matter that
  // we’ve tracked one too many characters.
  tracker.move(sequence + '')

  let value = state.containerPhrasing(node, {
    before: '**',
    after: '**\n',
    ...tracker.current()
  })

  if (/^[\t ]/.test(value)) {
    // To do: what effect has the character reference on tracking?
    value = encodeCharacterReference(value.charCodeAt(0)) + value.slice(1)
  }

  value = value ? `**${value}**\n` : sequence

  // if (state.options.closeAtx) {
  //   value += ' ' + sequence
  // }

  subexit()
  exit()

  return value
}
