/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toTelegram} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toTelegram({
  type: 'listItem',
  spread: false,
  children: [
    {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
    {type: 'thematicBreak'}
  ]
})

console.log('otvet :>> ', result)
