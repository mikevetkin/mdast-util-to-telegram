/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import { toMarkdown } from "./index.js";

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toMarkdown({type: 'heading'})

console.log('otvet :>> ', result);
