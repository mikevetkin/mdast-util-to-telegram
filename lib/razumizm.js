/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toTelegram} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toTelegram({
  type: 'heading',
  depth: 2,
  children: [{type: 'text', value: 'abbb'}]
})

console.log('otvet :>> ', result)
