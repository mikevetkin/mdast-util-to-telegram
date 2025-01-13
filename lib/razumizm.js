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
      type: 'thematicBreak',
      position: {
        start: {
          line: 1,
          column: 1,
          offset: 0
        },
        end: {
          line: 1,
          column: 4,
          offset: 3
        }
      }
    },
    {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'text',
          value: 'type: "123"\ntext: "444"\narsenni: "1488"',
          position: {
            start: {
              line: 2,
              column: 1,
              offset: 4
            },
            end: {
              line: 4,
              column: 16,
              offset: 43
            }
          }
        }
      ],
      position: {
        start: {
          line: 2,
          column: 1,
          offset: 4
        },
        end: {
          line: 5,
          column: 4,
          offset: 47
        }
      }
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '123',
          position: {
            start: {
              line: 6,
              column: 1,
              offset: 48
            },
            end: {
              line: 6,
              column: 4,
              offset: 51
            }
          }
        }
      ],
      position: {
        start: {
          line: 6,
          column: 1,
          offset: 48
        },
        end: {
          line: 6,
          column: 4,
          offset: 51
        }
      }
    },
    {
      type: 'thematicBreak',
      position: {
        start: {
          line: 8,
          column: 1,
          offset: 53
        },
        end: {
          line: 8,
          column: 5,
          offset: 57
        }
      }
    },
    {
      type: 'heading',
      depth: 1,
      children: [
        {
          type: 'text',
          value: 'awdff we',
          position: {
            start: {
              line: 9,
              column: 3,
              offset: 60
            },
            end: {
              line: 9,
              column: 11,
              offset: 68
            }
          }
        }
      ],
      position: {
        start: {
          line: 9,
          column: 1,
          offset: 58
        },
        end: {
          line: 9,
          column: 11,
          offset: 68
        }
      }
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'awd',
          position: {
            start: {
              line: 11,
              column: 1,
              offset: 70
            },
            end: {
              line: 11,
              column: 4,
              offset: 73
            }
          }
        }
      ],
      position: {
        start: {
          line: 11,
          column: 1,
          offset: 70
        },
        end: {
          line: 11,
          column: 4,
          offset: 73
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
      line: 11,
      column: 4,
      offset: 73
    }
  }
})

console.log('otvet :>> ', result)
