/**
 * Специальный файл для тестирования в условиях разумизма
 */
// @ts-nocheck
// @ts-ignore
import {toTelegram} from './index.js'

// @ts-expect-error: check how the runtime handles `children` missing.
const result = toTelegram(
  {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            title: null,
            url: 'https://www.reddit.com/r/ObsidianMD/comments/1idmes8/how_do_you_share_with_normies/?sort=new',
            children: [
              {
                type: 'text',
                value: 'test',
                position: {
                  start: {
                    line: 1,
                    column: 2,
                    offset: 1
                  },
                  end: {
                    line: 1,
                    column: 6,
                    offset: 5
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
                column: 101,
                offset: 100
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
            column: 101,
            offset: 100
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
        column: 101,
        offset: 100
      }
    }
  },
  {filename: 'test'}
)

console.log('otvet :>>', result)
