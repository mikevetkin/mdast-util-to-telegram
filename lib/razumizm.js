/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toTelegram} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toTelegram({
  type: 'root',
  children: [
    {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: '[!absract]\ntest\n[[test2]]',
              position: {
                start: {
                  line: 3,
                  column: 2,
                  offset: 3
                },
                end: {
                  line: 5,
                  column: 11,
                  offset: 30
                }
              }
            }
          ],
          position: {
            start: {
              line: 3,
              column: 2,
              offset: 3
            },
            end: {
              line: 5,
              column: 11,
              offset: 30
            }
          }
        }
      ],
      position: {
        start: {
          line: 3,
          column: 1,
          offset: 2
        },
        end: {
          line: 5,
          column: 11,
          offset: 30
        }
      }
    }
  ],
  position: {
    start: {
      line: 1,
      column: 1,
      offset: 0
    },
    end: {
      line: 6,
      column: 1,
      offset: 31
    }
  }
})

console.log('otvet :>> ', result)
