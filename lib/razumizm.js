/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toTelegram} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toTelegram({
  type: 'heading',
  depth: 6,
  children: [{type: 'text', value: 'Vladkuzator'}]
})

console.log('otvet :>> ', result)
