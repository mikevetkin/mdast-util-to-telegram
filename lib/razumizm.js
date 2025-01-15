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
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '1',
          position: {
            start: {
              line: 1,
              column: 1,
              offset: 0
            },
            end: {
              line: 1,
              column: 2,
              offset: 1
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
          line: 1,
          column: 2,
          offset: 1
        }
      }
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '2',
          position: {
            start: {
              line: 5,
              column: 1,
              offset: 5
            },
            end: {
              line: 5,
              column: 2,
              offset: 6
            }
          }
        }
      ],
      position: {
        start: {
          line: 5,
          column: 1,
          offset: 5
        },
        end: {
          line: 5,
          column: 2,
          offset: 6
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
      line: 5,
      column: 2,
      offset: 6
    }
  }
})

console.log('otvet :>> ', result)
