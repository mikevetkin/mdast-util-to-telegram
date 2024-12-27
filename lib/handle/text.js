/**
 * @import {Info, State} from 'mdast-util-to-markdown'
 * @import {Parents, Text} from 'mdast'
 */

/**
 * @param {Text} node
 * @param {Parents | undefined} _
 * @param {State} state
 * @param {Info} info
 * @returns {string}
 */

function removeBrackets(str) {
  while (str?.includes('[[') && str?.includes(']]')) {
    const startIndex = str?.indexOf('[[')
    const endIndex = str?.indexOf(']]', startIndex)
    if (endIndex !== -1) {
      str =
        str.slice(0, startIndex) +
        str.slice(startIndex + 2, endIndex) +
        str.slice(endIndex + 2)
    } else {
      break
    }
  }
  return str
}

function modifyBlockquote(str) {
  if (str?.startsWith('[!') && str?.includes('\n')) {
    const parts = str.split('\n')
    const content = parts[0].slice(2, -1) // Extract the content between '[!' and ']'.

    if (content.length > 0) {
      return parts.slice(1).join('\n') // Return everything after '[!x]\n'.
    }
  }
  return str
}

export function text(node, _, state, info) {
  return state.safe(removeBrackets(modifyBlockquote(node.value)), info)
}
