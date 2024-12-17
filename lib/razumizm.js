/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toMarkdown} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toMarkdown({
  type: 'heading',
  depth: 6,
  children: [{type: 'text', value: 'Vladkuzator'}]
})

console.log('otvet :>> ', result)
