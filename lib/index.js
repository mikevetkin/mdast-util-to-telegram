/**
 * @import {Info, Join, SafeConfig, State} from 'mdast-util-to-markdown'
 * @import {Nodes} from 'mdast'
 * @import {Enter, FlowParents, Options, PhrasingParents, ReturnTypeToTelegramFunction, TrackFields} from './types.js'
 */

import {zwitch} from 'zwitch'
import {configure} from './configure.js'
import {handle as handlers} from './handle/index.js'
import {join} from './join.js'
import {unsafe} from './unsafe.js'
import {association} from './util/association.js'
import {compilePattern} from './util/compile-pattern.js'
import {containerPhrasing} from './util/container-phrasing.js'
import {containerFlow} from './util/container-flow.js'
import {indentLines} from './util/indent-lines.js'
import {safe} from './util/safe.js'
import {track} from './util/track.js'

/**
 * @param {string} text
 */

const replaceBlockquotesWithTelegramStyle = (text) => {
  const lines = text.split(/\r?\n/) // Разбиваем текст на строки
  const result = []
  let quoteBuffer = [] // Буфер для текущей цитаты

  for (const line of lines) {
    if (line.startsWith('>')) {
      // Убираем символ '>' и пробел, добавляем строку в буфер
      quoteBuffer.push(line.slice(1).trim())
    } else {
      if (quoteBuffer.length > 0) {
        // Если буфер заполнен, обрабатываем цитату
        result.push(
          `<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">${quoteBuffer.join(' ')}</blockquote>`
        )
        quoteBuffer = [] // Очищаем буфер
      }
      result.push(line) // Добавляем текущую строку (не цитату)
    }
  }

  // Если текст заканчивается цитатой, обрабатываем оставшийся буфер
  if (quoteBuffer.length > 0) {
    result.push(`<div>${quoteBuffer.join(' ')}</div>`)
  }

  const resultHTML = result.join('\n')

  return {
    htmlContent: resultHTML,
    plainText: text
  }
}

/**
 * @param {string} telegramMessage
 */

const getTextAndHtmlForTelegram = (telegramMessage) => {
  const {plainText, htmlContent} =
    replaceBlockquotesWithTelegramStyle(telegramMessage)

  const text = plainText.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)?\)/g,
    /**
     * @param {string} match
     * @param {string} label
     * @param {string} url
     */
    (match, label, url) => (url ? `${label} (${url})` : label)
  )

  const html = htmlContent.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)?\)/g,
    (match, label, url) =>
      url
        ? `<a class="text-entity-link" href="${url}" data-entity-type="MessageEntityTextUrl" dir="auto">${label}</a>`
        : label
  )

  return {text, html}
}

/**
 *
 * @param {*} tree
 * @returns
 */

const deletingProperties = (tree) => {
  if (!tree) return tree

  const childrenTree = tree.children

  if (
    childrenTree?.[0]?.type === 'thematicBreak' &&
    childrenTree?.[1]?.type === 'heading' &&
    childrenTree?.[1]?.depth === 2
  ) {
    return {...tree, children: childrenTree.slice(2)}
  }

  if (childrenTree?.[0]?.type === 'thematicBreak') {
    let firstThematicBreakIndex = -1
    let secondThematicBreakIndex = -1

    for (let i = 0; i < childrenTree.length; i++) {
      if (childrenTree?.[i]?.type === 'thematicBreak') {
        if (firstThematicBreakIndex === -1) {
          firstThematicBreakIndex = i
        } else {
          secondThematicBreakIndex = i
          break
        }
      }
    }

    if (firstThematicBreakIndex !== -1 && secondThematicBreakIndex !== -1) {
      const distance = secondThematicBreakIndex - firstThematicBreakIndex + 1

      return {...tree, children: childrenTree.slice(distance)}
    } else {
      console.log('Not found two thematicBreak in the array.')
    }
  }

  return tree
}

/**
 * Turn an mdast syntax tree into telegram message.
 *
 * @param {Nodes} tree
 *   Tree to serialize.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {ReturnTypeToTelegramFunction | string}
 *   Serialized markdown representing `tree`.
 */

export function toTelegram(tree, options) {
  const preparedTree = deletingProperties(tree)

  const settings = options || {}
  /** @type {State} */
  const state = {
    associationId: association,
    containerPhrasing: containerPhrasingBound,
    containerFlow: containerFlowBound,
    createTracker: track,
    compilePattern,
    enter,
    // @ts-expect-error: GFM / frontmatter are typed in `mdast` but not defined
    // here.
    handlers: {...handlers},
    // @ts-expect-error: add `handle` in a second.
    handle: undefined,
    indentLines,
    indexStack: [],
    join: [...join],
    options: {},
    safe: safeBound,
    stack: [],
    unsafe: [...unsafe]
  }

  configure(state, settings)

  if (state.options.tightDefinitions) {
    state.join.push(joinDefinition)
  }

  state.handle = zwitch('type', {
    invalid,
    unknown,
    handlers: state.handlers
  })

  let result = state.handle(preparedTree, undefined, state, {
    before: '\n',
    after: '\n',
    now: {line: 1, column: 1},
    lineShift: 0
  })

  if (
    result &&
    result.charCodeAt(result.length - 1) !== 10 &&
    result.charCodeAt(result.length - 1) !== 13
  ) {
    result += '\n'
  }

  if (options && options.filename) {
    result = `**${options.filename}**\n\n${result}`
  }

  let returnValue =
    options && options.isNeedReturnTextHtml
      ? getTextAndHtmlForTelegram(result)
      : result

  return returnValue

  /** @type {Enter} */
  function enter(name) {
    state.stack.push(name)
    return exit

    /**
     * @returns {undefined}
     */
    function exit() {
      state.stack.pop()
    }
  }
}

/**
 * @param {unknown} value
 * @returns {never}
 */
function invalid(value) {
  throw new Error('Cannot handle value `' + value + '`, expected node')
}

/**
 * @param {unknown} value
 * @returns {never}
 */
function unknown(value) {
  // Always a node.
  const node = /** @type {Nodes} */ (value)
  throw new Error('Cannot handle unknown node `' + node.type + '`')
}

/** @type {Join} */
function joinDefinition(left, right) {
  // No blank line between adjacent definitions.
  if (left.type === 'definition' && left.type === right.type) {
    return 0
  }
}

/**
 * Serialize the children of a parent that contains phrasing children.
 *
 * These children will be joined flush together.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {PhrasingParents} parent
 *   Parent of flow nodes.
 * @param {Info} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined together.
 */
function containerPhrasingBound(parent, info) {
  return containerPhrasing(parent, this, info)
}

/**
 * Serialize the children of a parent that contains flow children.
 *
 * These children will typically be joined by blank lines.
 * What they are joined by exactly is defined by `Join` functions.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {FlowParents} parent
 *   Parent of flow nodes.
 * @param {TrackFields} info
 *   Info on where we are in the document we are generating.
 * @returns {string}
 *   Serialized children, joined by (blank) lines.
 */
function containerFlowBound(parent, info) {
  return containerFlow(parent, this, info)
}

/**
 * Make a string safe for embedding in markdown constructs.
 *
 * In markdown, almost all punctuation characters can, in certain cases,
 * result in something.
 * Whether they do is highly subjective to where they happen and in what
 * they happen.
 *
 * To solve this, `mdast-util-to-markdown` tracks:
 *
 * * Characters before and after something;
 * * What “constructs” we are in.
 *
 * This information is then used by this function to escape or encode
 * special characters.
 *
 * @this {State}
 *   Info passed around about the current state.
 * @param {string | null | undefined} value
 *   Raw value to make safe.
 * @param {SafeConfig} config
 *   Configuration.
 * @returns {string}
 *   Serialized markdown safe for embedding.
 */
function safeBound(value, config) {
  return safe(this, value, config)
}
