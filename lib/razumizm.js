/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toTelegram} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toTelegram({type: 'code', value: '  a\n\n b'})

console.log('otvet :>> ', result)
