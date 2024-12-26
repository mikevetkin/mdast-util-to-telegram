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
      type: 'list',
      ordered: false,
      start: null,
      spread: false,
      children: [
        {
          type: 'listItem',
          spread: false,
          checked: null,
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '[x] wasd',
                  position: {
                    start: {
                      line: 1,
                      column: 3,
                      offset: 2
                    },
                    end: {
                      line: 1,
                      column: 11,
                      offset: 10
                    }
                  }
                }
              ],
              position: {
                start: {
                  line: 1,
                  column: 3,
                  offset: 2
                },
                end: {
                  line: 1,
                  column: 11,
                  offset: 10
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
              column: 11,
              offset: 10
            }
          }
        },
        {
          type: 'listItem',
          spread: false,
          checked: null,
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '[ ] [[solid]]',
                  position: {
                    start: {
                      line: 2,
                      column: 3,
                      offset: 13
                    },
                    end: {
                      line: 2,
                      column: 16,
                      offset: 26
                    }
                  }
                }
              ],
              position: {
                start: {
                  line: 2,
                  column: 3,
                  offset: 13
                },
                end: {
                  line: 2,
                  column: 16,
                  offset: 26
                }
              }
            }
          ],
          position: {
            start: {
              line: 2,
              column: 1,
              offset: 11
            },
            end: {
              line: 2,
              column: 16,
              offset: 26
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
          line: 2,
          column: 16,
          offset: 26
        }
      }
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '[[00 Свойства - знание]] ',
          position: {
            start: {
              line: 4,
              column: 1,
              offset: 28
            },
            end: {
              line: 4,
              column: 26,
              offset: 53
            }
          }
        },
        {
          type: 'strong',
          children: [
            {
              type: 'text',
              value: 'awd',
              position: {
                start: {
                  line: 4,
                  column: 28,
                  offset: 55
                },
                end: {
                  line: 4,
                  column: 31,
                  offset: 58
                }
              }
            }
          ],
          position: {
            start: {
              line: 4,
              column: 26,
              offset: 53
            },
            end: {
              line: 4,
              column: 33,
              offset: 60
            }
          }
        }
      ],
      position: {
        start: {
          line: 4,
          column: 1,
          offset: 28
        },
        end: {
          line: 4,
          column: 33,
          offset: 60
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
      line: 7,
      column: 1,
      offset: 63
    }
  }
})

console.log('otvet :>> ', result)
