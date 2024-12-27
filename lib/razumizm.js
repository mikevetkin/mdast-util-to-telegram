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
      type: 'heading',
      depth: 1,
      children: [
        {
          type: 'text',
          value: 'test1',
          position: {
            start: {
              line: 1,
              column: 3,
              offset: 2
            },
            end: {
              line: 1,
              column: 8,
              offset: 7
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
          column: 8,
          offset: 7
        }
      }
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '1',
          position: {
            start: {
              line: 2,
              column: 1,
              offset: 8
            },
            end: {
              line: 2,
              column: 2,
              offset: 9
            }
          }
        }
      ],
      position: {
        start: {
          line: 2,
          column: 1,
          offset: 8
        },
        end: {
          line: 2,
          column: 2,
          offset: 9
        }
      }
    },
    {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'text',
          value: 'test2',
          position: {
            start: {
              line: 4,
              column: 4,
              offset: 14
            },
            end: {
              line: 4,
              column: 9,
              offset: 19
            }
          }
        }
      ],
      position: {
        start: {
          line: 4,
          column: 1,
          offset: 11
        },
        end: {
          line: 4,
          column: 9,
          offset: 19
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
              offset: 20
            },
            end: {
              line: 5,
              column: 2,
              offset: 21
            }
          }
        }
      ],
      position: {
        start: {
          line: 5,
          column: 1,
          offset: 20
        },
        end: {
          line: 5,
          column: 2,
          offset: 21
        }
      }
    },
    {
      type: 'heading',
      depth: 3,
      children: [
        {
          type: 'text',
          value: 'test3',
          position: {
            start: {
              line: 6,
              column: 5,
              offset: 26
            },
            end: {
              line: 6,
              column: 10,
              offset: 31
            }
          }
        }
      ],
      position: {
        start: {
          line: 6,
          column: 1,
          offset: 22
        },
        end: {
          line: 6,
          column: 10,
          offset: 31
        }
      }
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '3',
          position: {
            start: {
              line: 7,
              column: 1,
              offset: 32
            },
            end: {
              line: 7,
              column: 2,
              offset: 33
            }
          }
        }
      ],
      position: {
        start: {
          line: 7,
          column: 1,
          offset: 32
        },
        end: {
          line: 7,
          column: 2,
          offset: 33
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
      line: 10,
      column: 1,
      offset: 36
    }
  }
})

console.log('otvet :>> ', result)
