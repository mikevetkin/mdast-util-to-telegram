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

function removeBracketsIfClosed(str) {
  const openBrackets = str.indexOf('[[')
  const closeBrackets = str.indexOf(']]')

  if (
    openBrackets !== -1 &&
    closeBrackets !== -1 &&
    closeBrackets > openBrackets
  ) {
    return (
      str.slice(0, openBrackets) +
      str.slice(openBrackets + 2, closeBrackets) +
      str.slice(closeBrackets + 2)
    )
  }
  return str
}

export function text(node, _, state, info) {
  return state.safe(removeBracketsIfClosed(node.value), info)
}
