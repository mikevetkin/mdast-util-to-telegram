/**
 * @typedef {import('mdast').ListItem} ListItem
 * @typedef {import('../util/indent-lines.js').Map} Map
 * @typedef {import('../types.js').Parent} Parent
 * @typedef {import('../types.js').Context} Context
 * @typedef {import('../types.js').Info} Info
 */

import {checkBullet} from '../util/check-bullet.js'
import {checkListItemIndent} from '../util/check-list-item-indent.js'
import {containerFlow} from '../util/container-flow.js'
import {indentLines} from '../util/indent-lines.js'
import {track} from '../util/track.js'

/**
 * @param {ListItem} node
 * @param {Parent | undefined} parent
 * @param {Context} context
 * @param {Info} info
 * @returns {string}
 */
export function listItem(node, parent, context, info) {
  const listItemIndent = checkListItemIndent(context)
  let bullet = context.bulletCurrent || checkBullet(context)

  // Add the marker value for ordered lists.
  if (parent && parent.type === 'list' && parent.ordered) {
    bullet =
      (typeof parent.start === 'number' && parent.start > -1
        ? parent.start
        : 1) +
      (context.options.incrementListMarker === false
        ? 0
        : parent.children.indexOf(node)) +
      bullet
  }

  let size = bullet.length + 1

  if (
    listItemIndent === 'tab' ||
    (listItemIndent === 'mixed' &&
      ((parent && parent.type === 'list' && parent.spread) || node.spread))
  ) {
    size = Math.ceil(size / 4) * 4
  }

  const tracker = track(info)
  tracker.move(bullet + ' '.repeat(size - bullet.length))
  tracker.shift(size)
  const exit = context.enter('listItem')
  const value = indentLines(
    containerFlow(node, context, tracker.current()),
    map
  )
  exit()

  return value

  /** @type {Map} */
  function map(line, index, blank) {
    if (index) {
      return (blank ? '' : ' '.repeat(size)) + line
    }

    return (blank ? bullet : bullet + ' '.repeat(size - bullet.length)) + line
  }
}
