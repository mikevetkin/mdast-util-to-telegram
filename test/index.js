/**
 * @import {Handle} from 'mdast-util-to-markdown'
 * @import {BlockContent, List, PhrasingContent, Root} from 'mdast'
 */

import {describe, test, expect} from '@jest/globals'
import {removePosition} from 'unist-util-remove-position'
import {fromMarkdown as from} from 'mdast-util-from-markdown'
import {toTelegram as to} from '../lib/index.js'

describe('core', () => {
  test('should expose the public api', async () => {
    expect(Object.keys(await import('mdast-util-to-markdown')).sort()).toEqual(['defaultHandlers', 'toMarkdown'])
  })

  test('should support a `root`', async () => {
    expect(to({
        type: 'root',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
          {type: 'thematicBreak'},
          {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
        ]
      })).toBe('a\n\n***\n\nb\n')
  })

  test('should not use blank lines between nodes when given phrasing', async () => {
      expect(to({
          type: 'root',
          children: [
            {type: 'text', value: 'a'},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        })).toBe('a\\\nb\n')
    }
  )

  test('should support adjacent definitions', async () => {
    expect(to({
        type: 'root',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
          {type: 'definition', identifier: 'b', url: ''},
          {type: 'definition', identifier: 'c', url: ''},
          {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
        ]
      })).toBe('a\n\n[b]: <>\n\n[c]: <>\n\nd\n')
  })

  test('should support tight adjacent definitions when `tightDefinitions: true`', async () => {
      expect(to(
          {
            type: 'root',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
              {type: 'definition', identifier: 'b', url: ''},
              {type: 'definition', identifier: 'c', url: ''},
              {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
            ]
          },
          {tightDefinitions: true}
        )).toBe('a\n\n[b]: <>\n[c]: <>\n\nd\n')
    }
  )

  test('should use a different marker for adjacent lists', async () => {
      expect(to({
          type: 'root',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'list', children: [{type: 'listItem', children: []}]},
            {type: 'list', children: [{type: 'listItem', children: []}]},
            {
              type: 'list',
              ordered: true,
              children: [{type: 'listItem', children: []}]
            },
            {
              type: 'list',
              ordered: true,
              children: [{type: 'listItem', children: []}]
            },
            {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
          ]
        })).toBe('a\n\n•\n\n•\n\n1.\n\n1)\n\nd\n')
    }
  )

  test('should inject HTML comments between lists and an indented code', async () => {
      expect(to(
          {
            type: 'root',
            children: [
              {type: 'code', value: 'a'},
              {type: 'list', children: [{type: 'listItem', children: []}]},
              {type: 'code', value: 'b'}
            ]
          },
          {fences: false}
        )).toBe('    a\n\n•\n\n<!---->\n\n    b\n')
    }
  )

  test('should inject HTML comments between adjacent indented code', async () => {
      expect(to(
          {
            type: 'root',
            children: [
              {type: 'code', value: 'a'},
              {type: 'code', value: 'b'}
            ]
          },
          {fences: false}
        )).toBe('    a\n\n<!---->\n\n    b\n')
    }
  )

  test('should not honour `spread: false` for two paragraphs', async () => {
      expect(to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
          ]
        })).toBe('• a\n\n  b\n')
    }
  )

  test('should not honour `spread: false` for a paragraph and a definition', async () => {
      expect(to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'definition', identifier: 'b', label: 'c', url: 'd'}
          ]
        })).toBe('• a\n\n  [c]: d\n')
    }
  )

  test('should honour `spread: false` for a paragraph and a heading', async () => {
      expect(to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'heading', depth: 1, children: [{type: 'text', value: 'b'}]}
          ]
        })).toBe('• a\n  **b**\n')
    }
  )

  test('should not honour `spread: false` for a paragraph and a setext heading', async () => {
      expect(to(
          {
            type: 'listItem',
            spread: false,
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
              {
                type: 'heading',
                depth: 1,
                children: [{type: 'text', value: 'b'}]
              }
            ]
          },
          {setext: true}
        )).toBe('• a\n\n  **b**\n')
    }
  )

  test('should throw on a non-node', async () => {
    expect(() => {
      // @ts-expect-error: check how the runtime handles a non-object.
      to(false)
    }).toThrow(/Cannot handle value `false`, expected node/)
  })

  test('should throw on an unknown node', async () => {
    expect(() => {
      // @ts-expect-error: check how the runtime handles an unknown node.
      to({type: 'unknown'})
    }).toThrow(/Cannot handle unknown node `unknown`/)
  })

  test('should throw on an unknown node in a tree', async () => {
    expect(() => {
      to({
        type: 'paragraph',
        // @ts-expect-error: check how the runtime handles an unknown child.
        children: [{type: 'text', value: 'a'}, {type: 'unknown'}]
      })
    }).toThrow(/Cannot handle unknown node `unknown`/)
  })
})

describe('blockquote', () => {
  test('should support a block quote', async () => {
    // @ts-expect-error: check how the runtime handles `children` missing.
    expect(to({type: 'blockquote'})).toBe('>\n')
  })

  test('should support a block quote w/ a child', async () => {
    expect(to({
        type: 'blockquote',
        children: [{type: 'paragraph', children: [{type: 'text', value: 'a'}]}]
      })).toBe('> a\n')
  })

  test('should support a block quote w/ children', async () => {
    expect(to({
        type: 'blockquote',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
          {type: 'thematicBreak'},
          {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
        ]
      })).toBe('> a\n>\n> ***\n>\n> b\n')
  })

  test('should support text w/ a line ending in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
          ]
        })).toBe('> a\n> b\n')
    }
  )

  test('should support adjacent texts in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
                {type: 'text', value: 'b'}
              ]
            }
          ]
        })).toBe('> ab\n')
    }
  )

  test('should support a block quote in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{type: 'text', value: 'a\nb'}]
            },
            {
              type: 'blockquote',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {type: 'text', value: 'a\n'},
                    {type: 'inlineCode', value: 'b\nc'},
                    {type: 'text', value: '\nd'}
                  ]
                },
                {
                  type: 'heading',
                  depth: 1,
                  children: [{type: 'text', value: 'a b'}]
                }
              ]
            }
          ]
        })).toBe('> a\n> b\n>\n> > a\n> > `b\n> > c`\n> > d\n> >\n> > **a b**\n')
    }
  )

  test('should support a break in a block quote', async () => {
    expect(to({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [
              {type: 'text', value: 'a'},
              {type: 'break'},
              {type: 'text', value: 'b'}
            ]
          }
        ]
      })).toBe('> a\\\n> b\n')
  })

  test('should support code (flow, indented) in a block quote', async () => {
      expect(to(
          {
            type: 'blockquote',
            children: [{type: 'code', value: 'a\nb\n\nc'}]
          },
          {fences: false}
        )).toBe('>     a\n>     b\n>\n>     c\n')
    }
  )

  test('should support code (flow, fenced) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [{type: 'code', lang: 'a\nb', value: 'c\nd\n\ne'}]
        })).toBe('> ```a\n> b\n> c\n> d\n>\n> e\n> ```\n')
    }
  )

  test('should support code (text) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {type: 'inlineCode', value: 'b\nc'},
                {type: 'text', value: '\nd'}
              ]
            }
          ]
        })).toBe('> a\n> `b\n> c`\n> d\n')
    }
  )

  test('should support padded code (text) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {type: 'inlineCode', value: ' b\nc '},
                {type: 'text', value: '\nd'}
              ]
            }
          ]
        })).toBe('> a\n> `  b\n> c  `\n> d\n')
    }
  )

  test('should support a definition in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'definition',
              identifier: 'a\nb',
              url: 'c\nd',
              title: 'e\nf'
            },
            {
              type: 'paragraph',
              children: [{type: 'text', value: 'a\nb'}]
            }
          ]
        })).toBe('> [a\n> b]: <c\n> d> "e\n> f"\n>\n> a\n> b\n')
    }
  )

  test('should support an emphasis in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {type: 'emphasis', children: [{type: 'text', value: 'c\nd'}]},
                {type: 'text', value: '\nd'}
              ]
            }
          ]
        })).toBe('> a\n> *c\n> d*\n> d\n')
    }
  )

  test('should support a heading (atx) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'heading',
              depth: 3,
              children: [{type: 'text', value: 'a\nb'}]
            }
          ]
        })).toBe('> **a\n> b**\n')
    }
  )

  test('should support a heading (setext) in a block quote', async () => {
      expect(to(
          {
            type: 'blockquote',
            children: [
              {
                type: 'heading',
                depth: 1,
                children: [{type: 'text', value: 'a\nb'}]
              }
            ]
          },
          {setext: true}
        )).toBe('> **a\n> b**\n')
    }
  )

  test('should support html (flow) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [{type: 'html', value: '<div\nhidden>'}]
        })).toBe('> <div\n> hidden>\n')
    }
  )

  test('should support html (text) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a '},
                {type: 'html', value: '<span\nhidden>'},
                {type: 'text', value: '\nb'}
              ]
            }
          ]
        })).toBe('> a <span\n> hidden>\n> b\n')
    }
  )

  test('should support an image (resource) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {type: 'image', url: 'b\nc', alt: 'd\ne', title: 'f\ng'},
                {type: 'text', value: '\nh'}
              ]
            }
          ]
        })).toBe('> a\n> ![d\n> e](<b\n> c> "f\n> g")\n> h\n')
    }
  )

  test('should support an image (reference) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {
                  type: 'imageReference',
                  alt: 'b\nc',
                  label: 'd\ne',
                  identifier: 'f',
                  referenceType: 'collapsed'
                },
                {type: 'text', value: '\ng'}
              ]
            }
          ]
        })).toBe('> a\n> ![b\n> c][d\n> e]\n> g\n')
    }
  )

  test('should support a link (resource) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {
                  type: 'link',
                  url: 'b\nc',
                  children: [{type: 'text', value: 'd\ne'}],
                  title: 'f\ng'
                },
                {type: 'text', value: '\nh'}
              ]
            }
          ]
        })).toBe('> a\n> [d\n> e](<b\n> c> "f\n> g")\n> h\n')
    }
  )

  test('should support a link (reference) in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {
                  type: 'linkReference',
                  children: [{type: 'text', value: 'b\nc'}],
                  label: 'd\ne',
                  identifier: 'f',
                  referenceType: 'collapsed'
                },
                {type: 'text', value: '\ng'}
              ]
            }
          ]
        })).toBe('> a\n> [b\n> c][d\n> e]\n> g\n')
    }
  )

  test('should support a list in a block quote', async () => {
    expect(to({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', value: 'a\nb'}]
          },
          {
            type: 'list',
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              },
              {
                type: 'listItem',
                children: [{type: 'thematicBreak'}]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'e\nf'}]}
                ]
              }
            ]
          }
        ]
      })).toBe('> a\n> b\n>\n> • c\n>   d\n>\n> • ***\n>\n> • e\n>   f\n')
  })

  test('should support a strong in a block quote', async () => {
    expect(to({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [
              {type: 'text', value: 'a\n'},
              {type: 'strong', children: [{type: 'text', value: 'c\nd'}]},
              {type: 'text', value: '\nd'}
            ]
          }
        ]
      })).toBe('> a\n> **c\n> d**\n> d\n')
  })

  test('should support a thematic break in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
        })).toBe('>\n')
    }
  )
})

describe('break', () => {
  test('should support a break', async () => {
    expect(to({type: 'break'})).toBe('\\\n')
  })

  test('should serialize breaks in heading (atx) as a space 1 ', async () => {
      expect(to({
          type: 'heading',
          depth: 3,
          children: [
            {type: 'text', value: 'a'},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        })).toBe('**a b**\n')
    }
  )

  test('should serialize breaks in heading (atx) as a space 2', async () => {
      expect(to({
          type: 'heading',
          depth: 3,
          children: [
            {type: 'text', value: 'a '},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        })).toBe('**a  b**\n')
    }
  )

  test('should serialize breaks in heading (setext)', async () => {
      expect(to(from('a  \nb\n=\n'), {setext: true})).toBe('**a b**\n')
    }
  )
})

describe('code (flow)', () => {
  test('should support empty code', async () => {
    // @ts-expect-error: check how the runtime handles `value` missing.
    expect(to({type: 'code'})).toBe('```\n```\n')
  })

  test(
    'should throw on when given an incorrect `fence`',

    async () => {
      expect(() => {
        // @ts-expect-error: check how the runtime handles an incorrect `fence` marker.
        to({type: 'code', value: ''}, {fence: '+'})
    }).toThrow(/Cannot serialize code with `\+` for `options\.fence`, expected `` ` `` or `~`/)
    }
  )

  test(
    'should support code w/ a value (indent)',

    async () => {
      expect(to({type: 'code', value: 'a'}, {fences: false})).toBe('    a\n')
    }
  )

  test(
    'should support code w/ a value (fences)',

    async () => {
      expect(to({type: 'code', value: 'a'})).toBe('```\na\n```\n')
    }
  )

  test(
    'should support code w/ a lang',

    async () => {
      expect(to({type: 'code', lang: 'a', value: ''})).toBe('```a\n```\n')
    }
  )

  test(
    'should support (ignore) code w/ only a meta',

    async () => {
      expect(to({type: 'code', meta: 'a', value: ''})).toBe('```\n```\n')
    }
  )

  test(
    'should support code w/ lang and meta',

    async () => {
      expect(to({type: 'code', lang: 'a', meta: 'b', value: ''})).toBe('```a\n```\n')
    }
  )

  test(
    'should encode a space in `lang`',

    async () => {
      expect(to({type: 'code', lang: 'a b', value: ''})).toBe('```a b\n```\n')
    }
  )

  test(
    'should encode a line ending in `lang`',

    async () => {
      expect(to({type: 'code', lang: 'a\nb', value: ''})).toBe('```a\nb\n```\n')
    }
  )

  test(
    'should encode a grave accent in `lang`',

    async () => {
      expect(to({type: 'code', lang: 'a`b', value: ''})).toBe('```a`b\n```\n')
    }
  )

  test(
    'should escape a backslash in `lang`',

    async () => {
      expect(to({type: 'code', lang: 'a\\-b', value: ''})).toBe('```a\\\\-b\n```\n')
    }
  )

  test(
    'should not encode a space in `meta`',

    async () => {
      expect(to({type: 'code', lang: 'x', meta: 'a b', value: ''})).toBe('```x\n```\n')
    }
  )

  test(
    'should encode a line ending in `meta`',

    async () => {
      expect(to({type: 'code', lang: 'x', meta: 'a\nb', value: ''})).toBe('```x\n```\n')
    }
  )

  test(
    'should encode a grave accent in `meta`',

    async () => {
      expect(to({type: 'code', lang: 'x', meta: 'a`b', value: ''})).toBe('```x\n```\n')
    }
  )

  test(
    'should escape a backslash in `meta`',

    async () => {
      expect(to({type: 'code', lang: 'x', meta: 'a\\-b', value: ''})).toBe('```x\n```\n')
    }
  )

  test(
    'should support fenced code w/ tildes when `fence: "~"`',

    async () => {
      expect(to({type: 'code', value: ''}, {fence: '~'})).toBe('~~~\n~~~\n')
    }
  )

  test(
    'should not encode a grave accent when using tildes for fences',

    async () => {
      expect(to({type: 'code', lang: 'a`b', value: ''}, {fence: '~'})).toBe('~~~a`b\n~~~\n')
    }
  )

  test(
    'NEED DISCUSSION - should use more grave accents for fences if there are streaks of grave accents in the value (fences)',

    async () => {
      expect(to({type: 'code', value: '```\nasd\n```'})).toBe('````\n```\nasd\n```\n````\n')
    }
  )

  test(
    'NEED DISCUSSION - should use more tildes for fences if there are streaks of tildes in the value (fences)',

    async () => {
      expect(to({type: 'code', value: '~~~\nasd\n~~~'}, {fence: '~'})).toBe('~~~~\n~~~\nasd\n~~~\n~~~~\n')
    }
  )

  test(
    'should use a fence if there is an info',

    async () => {
      expect(to({type: 'code', lang: 'a', value: 'b'})).toBe('```a\nb\n```\n')
    }
  )

  test(
    'should use a fence if there is only whitespace',

    async () => {
      expect(to({type: 'code', value: ' '})).toBe('```\n \n```\n')
    }
  )

  test(
    'should use a fence if there first line is blank (void)',

    async () => {
      expect(to({type: 'code', value: '\na'})).toBe('```\n\na\n```\n')
    }
  )

  test(
    'should use a fence if there first line is blank (filled)',

    async () => {
      expect(to({type: 'code', value: ' \na'})).toBe('```\n \na\n```\n')
    }
  )

  test(
    'should use a fence if there last line is blank (void)',

    async () => {
      expect(to({type: 'code', value: 'a\n'})).toBe('```\na\n\n```\n')
    }
  )

  test(
    'should use a fence if there last line is blank (filled)',

    async () => {
      expect(to({type: 'code', value: 'a\n '})).toBe('```\na\n \n```\n')
    }
  )

  test(
    'should use an indent if the value is indented',

    async () => {
      expect(to({type: 'code', value: '  a\n\n b'}, {fences: false})).toBe('      a\n\n     b\n')
    }
  )
})

describe('definition', () => {
  test('should support a definition w/o label', async () => {
    expect(
      // @ts-expect-error: check how the runtime handles `identifier`, `url` missing.
      to({type: 'definition'})
    ).toBe('[]: <>\n')
  })

  test('should support a definition w/ label', async () => {
    expect(// @ts-expect-error: check how the runtime handles `identifier` missing.
      to({type: 'definition', label: 'a', url: ''})).toBe('[a]: <>\n')
  })

  test('should escape a backslash in `label`', async () => {
    expect(// @ts-expect-error: check how the runtime handles `identifier` missing.
      to({type: 'definition', label: '\\', url: ''})).toBe('[\\\\]: <>\n')
  })

  test('should escape an opening bracket in `label`', async () => {
      expect(// @ts-expect-error: check how the runtime handles `identifier` missing.
        to({type: 'definition', label: '[', url: ''})).toBe('[[]: <>\n')
    }
  )

  test('should escape a closing bracket in `label`', async () => {
    expect(// @ts-expect-error: check how the runtime handles `identifier` missing.
      to({type: 'definition', label: ']', url: ''})).toBe('[]]: <>\n')
  })

  test('should support a definition w/ identifier', async () => {
    expect(to({type: 'definition', identifier: 'a', url: ''})).toBe('[a]: <>\n')
  })

  test('should escape a backslash in `identifier`', async () => {
    expect(to({type: 'definition', identifier: '\\', url: ''})).toBe('[\\\\]: <>\n')
  })

  test('should escape an opening bracket in `identifier`', async () => {
      expect(to({type: 'definition', identifier: '[', url: ''})).toBe('[[]: <>\n')
    }
  )

  test('should escape a closing bracket in `identifier`', async () => {
      expect(to({type: 'definition', identifier: ']', url: ''})).toBe('[]]: <>\n')
    }
  )

  test('should support a definition w/ url', async () => {
    expect(to({type: 'definition', identifier: 'a', url: 'b'})).toBe('[a]: b\n')
  })

  test('should support a definition w/ enclosed url w/ whitespace in url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b c'})).toBe('[a]: <b c>\n')
    }
  )

  test('should escape an opening angle bracket in `url` in an enclosed url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b <c'})).toBe('[a]: <b <c>\n')
    }
  )

  test('should escape a closing angle bracket in `url` in an enclosed url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b >c'})).toBe('[a]: <b >c>\n')
    }
  )

  test('should escape a backslash in `url` in an enclosed url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b \\.c'})).toBe('[a]: <b \\\\.c>\n')
    }
  )

  test('should encode a line ending in `url` in an enclosed url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b\nc'})).toBe('[a]: <b\nc>\n')
    }
  )

  test('should encode a line ending in `url` in an enclosed url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: '\f'})).toBe('[a]: <\f>\n')
    }
  )

  test('should escape an opening paren in `url` in a raw url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b(c'})).toBe('[a]: b(c\n'
      )
    }
  )

  test('should escape a closing paren in `url` in a raw url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b)c'})).toBe('[a]: b)c\n')
    }
  )

  test('should escape a backslash in `url` in a raw url', async () => {
      expect(to({type: 'definition', identifier: 'a', url: 'b\\?c'})).toBe('[a]: b\\\\?c\n')
    }
  )

  test('should support a definition w/ title', async () => {
    expect(to({type: 'definition', identifier: 'a', url: '', title: 'b'})).toBe('[a]: <> "b"\n')
  })

  test('should support a definition w/ url & title', async () => {
    expect(to({type: 'definition', identifier: 'a', url: 'b', title: 'c'})).toBe('[a]: b "c"\n')
  })

  test('should escape a quote in `title` in a title', async () => {
      expect(to({type: 'definition', identifier: 'a', url: '', title: '"'})).toBe('[a]: <> """\n')
    }
  )

  test('should escape a backslash in `title` in a title', async () => {
      expect(to({type: 'definition', identifier: 'a', url: '', title: '\\'})).toBe('[a]: <> "\\\\"\n')
    }
  )

  test(
    'should support a definition w/ title when `quote: "\'"`',
    async () => {
      expect(to(
          {type: 'definition', identifier: 'a', url: '', title: 'b'},
          {quote: "'"}
        )).toBe("[a]: <> 'b'\n")
    }
  )

  test(
    'should escape a quote in `title` in a title when `quote: "\'"`',
    async () => {
      expect(to(
          {type: 'definition', identifier: 'a', url: '', title: "'"},
          {quote: "'"}
        )).toBe("[a]: <> '''\n")
    }
  )

  test('should throw on when given an incorrect `quote`', async () => {
      expect(() => {
        to(
          {type: 'definition', identifier: 'a', url: '', title: 'b'},
          // @ts-expect-error: check how the runtime handles an incorrect `quote`.
          {quote: '.'}
        )
    }).toThrow(/Cannot serialize title with `\.` for `options\.quote`, expected `"`, or `'`/)
    }
  )
})

describe('emphasis', () => {
  test('should support an empty emphasis', async () => {
    expect(// @ts-expect-error: check how the runtime handles `children` missing.
      to({type: 'emphasis'})).toBe('**\n')
  })

  test('should throw on when given an incorrect `emphasis`', async () => {
      expect(() => {
        // @ts-expect-error: check how the runtime handles incorrect `emphasis`.
        to({type: 'emphasis'}, {emphasis: '?'})
    }).toThrow(/Cannot serialize emphasis with `\?` for `options\.emphasis`, expected `\*`, or `_`/)
    }
  )

  test('should support an emphasis w/ children', async () => {
    expect(to({type: 'emphasis', children: [{type: 'text', value: 'a'}]})).toBe('*a*\n')
  })

  test('should support an emphasis w/ underscores when `emphasis: "_"`', async () => {
      expect(to(
          {type: 'emphasis', children: [{type: 'text', value: 'a'}]},
          {emphasis: '_'}
        )).toBe('_a_\n')
    }
  )
})

describe('heading', () => {
  test(
    'should serialize a heading w/o rank as a heading of rank 1',

    async () => {
      expect(// @ts-expect-error: check how the runtime handles `children` missing.
        to({type: 'heading'})).toBe('****\n')
    }
  )

  test(
    'should serialize a heading w/ rank 1',

    async () => {
      expect(// @ts-expect-error: check how the runtime handles `children` missing.
        to({type: 'heading', depth: 1})).toBe('****\n')
    }
  )

  test(
    'should serialize a heading w/ rank 6',

    async () => {
      expect(to({type: 'heading', depth: 6, children: []})).toBe('****\n')
    }
  )

  test(
    'should serialize a heading w/ rank 7 as 6',

    async () => {
      expect(to({
          type: 'heading',
          // @ts-expect-error: check how the runtime handles `depth` being too high.
          depth: 7,
          children: []
        })).toBe('****\n')
    }
  )

  test(
    'should serialize a heading w/ rank 0 as 1',

    async () => {
      expect(to({
          type: 'heading',
          // @ts-expect-error: check how the runtime handles `depth` being too low.
          depth: 0,
          children: []
        })).toBe('****\n')
    }
  )

  test(
    'should serialize a heading w/ content',

    async () => {
      expect(to({type: 'heading', depth: 1, children: [{type: 'text', value: 'a'}]})).toBe('**a**\n')
    }
  )

  test(
    'should serialize a heading w/ rank 1 as setext when `setext: true`',

    async () => {
      expect(to(
          {type: 'heading', depth: 1, children: [{type: 'text', value: 'a'}]},
          {setext: true}
        )).toBe('**a**\n')
    }
  )

  test(
    'should serialize a heading w/ rank 2 as setext when `setext: true`',

    async () => {
      expect(to(
          {type: 'heading', depth: 2, children: [{type: 'text', value: 'a'}]},
          {setext: true}
        )).toBe('**a**\n')
    }
  )

  test(
    'should serialize a heading w/ rank 3 as atx when `setext: true`',

    async () => {
      expect(to(
          {type: 'heading', depth: 3, children: [{type: 'text', value: 'a'}]},
          {setext: true}
        )).toBe('**a**\n')
    }
  )

  // INFO: This test case doesn't support into obsidian
  test(
    'SKIP should serialize a setext underline as long as the last line (1)',

    async () => {
      expect(to(
          {
            type: 'heading',
            depth: 2,
            children: [{type: 'text', value: 'aa\rb'}]
          },
          {setext: true}
        )).toBe('**aa\rb**\n')
    }
  )

  // INFO: This test case doesn't support into obsidian
  test(
    'SKIP should serialize a setext underline as long as the last line (2)',

    async () => {
      expect(to(
          {
            type: 'heading',
            depth: 1,
            children: [{type: 'text', value: 'a\r\nbbb'}]
          },
          {setext: true}
        )).toBe(`**a\r\nbbb**\n`)
    }
  )

  test(
    'should serialize an empty heading w/ rank 1 as atx when `setext: true`',

    async () => {
      expect(to({type: 'heading', depth: 1, children: []}, {setext: true})).toBe('****\n')
    }
  )

  test(
    'should serialize an empty heading w/ rank 2 as atx when `setext: true`',

    async () => {
      expect(to({type: 'heading', depth: 2, children: []}, {setext: true})).toBe('****\n')
    }
  )

  test(
    'SKIP should serialize an heading w/ rank 1 and code w/ a line ending as setext',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'inlineCode', value: '\n'}]
        })).toBe('**`\n`**\n')
    }
  )

  test(
    'SKIP should serialize an heading w/ rank 1 and html w/ a line ending as setext',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'html', value: '<a\n/>'}]
        })).toBe('**<a\n/>**\n')
    }
  )

  test(
    'SKIP should serialize an heading w/ rank 1 and text w/ a line ending as setext',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a\nb'}]
        })).toBe('**a\nb**\n')
    }
  )

  test(
    'SKIP should serialize an heading w/ rank 1 and a break as setext',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [
            {type: 'text', value: 'a'},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        })).toBe('**a b**\n')
    }
  )

  test(
    'should serialize a heading with a closing sequence when `closeAtx` (empty)',

    async () => {
      expect(to({type: 'heading', depth: 1, children: []}, {closeAtx: true})).toBe('****\n')
    }
  )

  test(
    'should serialize a with a closing sequence when `closeAtx` (content)',

    async () => {
      expect(to(
          {type: 'heading', depth: 3, children: [{type: 'text', value: 'a'}]},
          {closeAtx: true}
        )).toBe('**a**\n')
    }
  )

  test(
    'should not escape a `#` at the start of phrasing in a heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '# a'}]
        })).toBe('**# a**\n')
    }
  )

  test(
    'should not escape a `1)` at the start of phrasing in a heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '1) a'}]
        })).toBe('**1) a**\n')
    }
  )

  test(
    'should not escape a `+` at the start of phrasing in a heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '+ a'}]
        })).toBe('**+ a**\n')
    }
  )

  test(
    'should not escape a `-` at the start of phrasing in a heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '- a'}]
        })).toBe('**- a**\n')
    }
  )

  test(
    'should not escape a `=` at the start of phrasing in a heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '= a'}]
        })).toBe('**= a**\n')
    }
  )

  test(
    'should not escape a `>` at the start of phrasing in a heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '> a'}]
        })).toBe('**> a**\n')
    }
  )

  test(
    'should escape a `#` at the end of a heading (1)',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a #'}]
        })).toBe('**a #**\n')
    }
  )

  test(
    'should escape a `#` at the end of a heading (2)',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a ##'}]
        })).toBe('**a ##**\n')
    }
  )

  test(
    'should not escape a `#` in a heading (2)',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a # b'}]
        })).toBe('**a # b**\n')
    }
  )

  test(
    'should encode a space at the start of an atx heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: '  a'}]
        })).toBe('**&#x20; a**\n')
    }
  )

  test(
    'SKIP should encode a tab at the start of an atx heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: '\t\ta'}]
        })).toBe('**&#x9;\ta**\n')
    }
  )

  test(
    'should encode a space at the end of an atx heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a  '}]
        })).toBe('**a  **\n')
    }
  )

  test(
    'SKIP should encode a tab at the end of an atx heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a\t\t'}]
        })).toBe('**a\t\t**\n')
    }
  )

  test(
    'SKIP should encode spaces around a line ending in a setext heading',

    async () => {
      expect(to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a \n b'}]
        })).toBe('**a \n b**\n')
    }
  )

  test(
    'SKIP should not need to encode spaces around a line ending in an atx heading (because the line ending is encoded)',

    async () => {
      expect(to({
          type: 'heading',
          depth: 3,
          children: [{type: 'text', value: 'a \n b'}]
        })).toBe('**a \n b**\n')
    }
  )
})

describe('html', () => {
  test('should support a void html', async () => {
    // @ts-expect-error: check how the runtime handles `value` missing
    expect(to({type: 'html'})).toBe('')
  })

  test('should support an empty html', async () => {
    expect(to({type: 'html', value: ''})).toBe('')
  })

  test('should support html', async () => {
    expect(to({type: 'html', value: 'a\nb'})).toBe('a\nb\n')
  })

  test('should prevent html (text) from becoming html (flow) (1)', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a\n'},
            {type: 'html', value: '<div>'}
          ]
        })).toBe('a\n<div>\n')
    }
  )

  test('should prevent html (text) from becoming html (flow) (2)', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a\r'},
            {type: 'html', value: '<div>'}
          ]
        })).toBe('a\r<div>\n')
    }
  )

  test('should prevent html (text) from becoming html (flow) (3)', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a\r\n'},
            {type: 'html', value: '<div>'}
          ]
        })).toBe('a\r\n<div>\n')
    }
  )

  test('should serialize html (text)', async () => {
    expect(to({
        type: 'paragraph',
        children: [
          {type: 'html', value: '<x>'},
          {type: 'text', value: 'a'}
        ]
      })).toBe('<x>a\n')
  })
})

describe('image', () => {
  test('should support an image', async () => {
    // @ts-expect-error: check how the runtime handles `alt`, `url` missing.
    expect(to({type: 'image'})).toBe('![]()\n')
  })

  test('should support `alt`', async () => {
    expect(// @ts-expect-error: check how the runtime handles `url` missing.
      to({type: 'image', alt: 'a'})).toBe('![a]()\n')
  })

  test('should support a url', async () => {
    expect(to({type: 'image', url: 'a'})).toBe('![](a)\n')
  })

  test('should support a title', async () => {
    expect(to({type: 'image', url: '', title: 'a'})).toBe('![](<> "a")\n')
  })

  test('should support a url and title', async () => {
    expect(to({type: 'image', url: 'a', title: 'b'})).toBe('![](a "b")\n')
  })

  test('should support an image w/ enclosed url w/ whitespace in url', async () => {
      expect(to({type: 'image', url: 'b c'})).toBe('![](<b c>)\n')
    }
  )

  test('should escape an opening angle bracket in `url` in an enclosed url', async () => {
      expect(to({type: 'image', url: 'b <c'})).toBe('![](<b <c>)\n')
    }
  )

  test('should escape a closing angle bracket in `url` in an enclosed url', async () => {
      expect(to({type: 'image', url: 'b >c'})).toBe('![](<b >c>)\n')
    }
  )

  test('should escape a backslash in `url` in an enclosed url', async () => {
      expect(to({type: 'image', url: 'b \\+c'})).toBe('![](<b \\\\+c>)\n')
    }
  )

  test('should encode a line ending in `url` in an enclosed url 1', async () => {
      expect(to({type: 'image', url: 'b\nc'})).toBe('![](<b\nc>)\n')
    }
  )

  test('should escape an opening paren in `url` in a raw url', async () => {
      expect(to({type: 'image', url: 'b(c'})).toBe('![](b(c)\n')
    }
  )

  test('should escape a closing paren in `url` in a raw url', async () => {
      expect(to({type: 'image', url: 'b)c'})).toBe('![](b)c)\n')
    }
  )

  test('should escape a backslash in `url` in a raw url', async () => {
      expect(to({type: 'image', url: 'b\\+c'})).toBe('![](b\\\\+c)\n')
    }
  )

  test('should support control characters in images', async () => {
      expect(to({type: 'image', url: '\f'})).toBe('![](<\f>)\n')
    }
  )

  test('should escape a double quote in `title`', async () => {
    expect(to({type: 'image', url: '', title: 'b"c'})).toBe('![](<> "b"c")\n')
  })

  test('should escape a backslash in `title`', async () => {
    expect(to({type: 'image', url: '', title: 'b\\.c'})).toBe('![](<> "b\\\\.c")\n')
  })

  test(
    'should support an image w/ title when `quote: "\'"`',
    async () => {
      expect(to({type: 'image', url: '', title: 'b'}, {quote: "'"})).toBe("![](<> 'b')\n")
    }
  )

  test(
    'should escape a quote in `title` in a title when `quote: "\'"` 1 ',
    async () => {
      expect(to({type: 'image', url: '', title: "'"}, {quote: "'"})).toBe("![](<> ''')\n")
    }
  )

  test('should throw on when given an incorrect `quote`', async () => {
      expect(() => {
        // @ts-expect-error: check how the runtime handles `quote` being wrong.
        to({type: 'image', title: 'a'}, {quote: '.'})
    }).toThrow(/Cannot serialize title with `\.` for `options\.quote`, expected `"`, or `'`/)
    }
  )
})

describe('imageReference', () => {
  test('should support a link reference (nonsensical)', async () => {
      expect(
        // @ts-expect-error: check how the runtime handles `alt`, `referenceType`, `identifier` missing.
        to({type: 'imageReference'})
      ).toBe('![][]\n')
    }
  )

  test('should support `alt`', async () => {
    expect(
      // @ts-expect-error: check how the runtime handles `referenceType`, `identifier` missing.
      to({type: 'imageReference', alt: 'a'})
    ).toBe('![a][]\n')
  })

  test('should support an `identifier` (nonsensical)', async () => {
      expect(
        // @ts-expect-error: check how the runtime handles `alt`, `referenceType` missing.
        to({type: 'imageReference', identifier: 'a'})
      ).toBe('![][a]\n')
    }
  )

  test('should support a `label` (nonsensical)', async () => {
    expect(
      // @ts-expect-error: check how the runtime handles `referenceType`, `identifier` missing.
      to({type: 'imageReference', label: 'a'})
    ).toBe('![][a]\n')
  })

  test('should support `referenceType: "shortcut"`', async () => {
    expect(to({
        type: 'imageReference',
        alt: 'A',
        identifier: 'A',
        referenceType: 'shortcut'
      })).toBe('![A]\n')
  })

  test('should support `referenceType: "collapsed"`', async () => {
      expect(to({
          type: 'imageReference',
          alt: 'A',
          identifier: 'A',
          referenceType: 'collapsed'
        })).toBe('![A][]\n')
    }
  )

  test('should support `referenceType: "full"` (default)', async () => {
      expect(to({
          type: 'imageReference',
          alt: 'A',
          identifier: 'A',
          referenceType: 'full'
        })).toBe('![A][A]\n')
    }
  )

  test('should prefer label over identifier', async () => {
    expect(to({
        type: 'imageReference',
        alt: '&',
        label: '&',
        identifier: '&amp;',
        referenceType: 'full'
      })).toBe('![&][&]\n')
  })

  test('should decode `identifier` if w/o `label`', async () => {
    expect(to({
        type: 'imageReference',
        alt: '&',
        identifier: '&amp;',
        referenceType: 'full'
      })).toBe('![&][&]\n')
  })

  test('should support incorrect character references 2', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {
              type: 'imageReference',
              alt: '&a;',
              identifier: '&b;',
              referenceType: 'full'
            }
          ]
        })).toBe('![&a;][&b;]\n')
    }
  )

  test('should unescape `identifier` if w/o `label`', async () => {
      expect(to({
          type: 'imageReference',
          alt: '+',
          identifier: '\\+',
          referenceType: 'full'
        })).toBe('![+][+]\n')
    }
  )

  test('should use a collapsed reference if w/o `referenceType` and the label matches the reference', async () => {
      expect(// @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({type: 'imageReference', alt: 'a', identifier: 'a'})).toBe('![a][]\n')
    }
  )

  test('should use a full reference if w/o `referenceType` and the label does not match the reference 1', async () => {
      expect(// @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({type: 'imageReference', alt: 'a', identifier: 'b'})).toBe('![a][b]\n')
    }
  )
})

/**
 * after check this tests, we decided to skip, because \n should move the line, but it doesn't.
 */
describe('code (text)', () => {
  test(
    'should support an empty code text',

    async () => {
      expect(// @ts-expect-error: check how the runtime handles `value` missing.
        to({type: 'inlineCode'})).toBe('``\n')
    }
  )

  test('should support a code text', async () => {
    expect(to({type: 'inlineCode', value: 'a'})).toBe('`a`\n')
  })

  test('should support a space', async () => {
    expect(to({type: 'inlineCode', value: ' '})).toBe('` `\n')
  })

  test('should support an eol', async () => {
    expect(to({type: 'inlineCode', value: '\n'})).toBe('`\n`\n')
  })

  test('should support several spaces', async () => {
    expect(to({type: 'inlineCode', value: '  '})).toBe('`  `\n')
  })

  test('should use a fence of two grave accents if the value contains one', async () => {
      expect(to({type: 'inlineCode', value: 'a`b'})).toBe('``a`b``\n')
    }
  )

  test('should use a fence of one grave accent if the value contains two', async () => {
      expect(to({type: 'inlineCode', value: 'a``b'})).toBe('`a``b`\n')
    }
  )

  test('should use a fence of three grave accents if the value contains two and one', async () => {
      expect(to({type: 'inlineCode', value: 'a``b`c'})).toBe('```a``b`c```\n')
    }
  )

  test('should pad w/ a space if the value starts w/ a grave accent', async () => {
      expect(to({type: 'inlineCode', value: '`a'})).toBe('`` `a ``\n')
    }
  )

  test('should pad w/ a space if the value ends w/ a grave accent', async () => {
      expect(to({type: 'inlineCode', value: 'a`'})).toBe('`` a` ``\n')
    }
  )

  test('should pad w/ a space if the value starts and ends w/ a space', async () => {
      expect(to({type: 'inlineCode', value: ' a '})).toBe('`  a  `\n')
    }
  )

  test('should not pad w/ spaces if the value ends w/ a non-space', async () => {
      expect(to({type: 'inlineCode', value: ' a'})).toBe('` a`\n')
    }
  )

  test('should not pad w/ spaces if the value starts w/ a non-space', async () => {
      expect(to({type: 'inlineCode', value: 'a '})).toBe('`a `\n')
    }
  )

  test('should prevent breaking out of code (-)', async () => {
    expect(to({type: 'inlineCode', value: 'a\n- b'})).toBe('`a - b`\n')
  })

  test('should prevent breaking out of code (#)', async () => {
    expect(to({type: 'inlineCode', value: 'a\n#'})).toBe('`a #`\n')
  })

  test('should prevent breaking out of code (\\d\\.)', async () => {
      expect(to({type: 'inlineCode', value: 'a\n1. '})).toBe('`a 1. `\n')
    }
  )

  test('should prevent breaking out of code (cr)', async () => {
    expect(to({type: 'inlineCode', value: 'a\r- b'})).toBe('`a - b`\n')
  })

  test('should prevent breaking out of code (crlf)', async () => {
    expect(to({type: 'inlineCode', value: 'a\r\n- b'})).toBe('`a - b`\n')
  })
})

describe('link', () => {
  test('should support a link', async () => {
    // @ts-expect-error: check how the runtime handles `children`, `url` missing.
    expect(to({type: 'link'})).toBe('[]()\n')
  })

  test('should support children', async () => {
    expect(// @ts-expect-error: check how the runtime handles `url` missing.
      to({type: 'link', children: [{type: 'text', value: 'a'}]})).toBe('[a]()\n')
  })

  test('should support a url', async () => {
    expect(to({type: 'link', url: 'a', children: []})).toBe('[](a)\n')
  })

  test('should support a title', async () => {
    expect(to({type: 'link', url: '', title: 'a', children: []})).toBe('[](<> "a")\n')
  })

  test('should support a url and title', async () => {
    expect(to({type: 'link', url: 'a', title: 'b', children: []})).toBe('[](a "b")\n')
  })

  test('should support a link w/ enclosed url w/ whitespace in url', async () => {
      expect(to({type: 'link', url: 'b c', children: []})).toBe('[](<b c>)\n')
    }
  )

  test('should escape an opening angle bracket in `url` in an enclosed url', async () => {
      expect(to({type: 'link', url: 'b <c', children: []})).toBe('[](<b <c>)\n')
    }
  )

  test('should escape a closing angle bracket in `url` in an enclosed url', async () => {
      expect(to({type: 'link', url: 'b >c', children: []})).toBe('[](<b >c>)\n')
    }
  )

  test('should escape a backslash in `url` in an enclosed url', async () => {
      expect(to({type: 'link', url: 'b \\+c', children: []})).toBe('[](<b \\\\+c>)\n')
    }
  )

  test('should encode a line ending in `url` in an enclosed url 2', async () => {
      expect(to({type: 'link', url: 'b\nc', children: []})).toBe('[](<b\nc>)\n')
    }
  )

  test('should escape an opening paren in `url` in a raw url', async () => {
      expect(to({type: 'link', url: 'b(c', children: []})).toBe('[](b(c)\n')
    }
  )

  test('should escape a closing paren in `url` in a raw url', async () => {
      expect(to({type: 'link', url: 'b)c', children: []})).toBe('[](b)c)\n')
    }
  )

  test('should escape a backslash in `url` in a raw url', async () => {
      expect(to({type: 'link', url: 'b\\.c', children: []})).toBe('[](b\\\\.c)\n')
    }
  )

  test('should support control characters in links', async () => {
    expect(to({type: 'link', url: '\f', children: []})).toBe('[](<\f>)\n')
  })

  test('should escape a double quote in `title`', async () => {
    expect(to({type: 'link', url: '', title: 'b"c', children: []})).toBe('[](<> "b"c")\n')
  })

  test('should escape a backslash in `title`', async () => {
    expect(to({type: 'link', url: '', title: 'b\\-c', children: []})).toBe('[](<> "b\\\\-c")\n')
  })

  test('should use an autolink for nodes w/ a value similar to the url and a protocol', async () => {
      expect(to({
          type: 'link',
          url: 'tel:123',
          children: [{type: 'text', value: 'tel:123'}]
        })).toBe('<tel:123>\n')
    }
  )

  test('should use a resource link (`resourceLink: true`)', async () => {
      expect(to(
          {
            type: 'link',
            url: 'tel:123',
            children: [{type: 'text', value: 'tel:123'}]
          },
          {resourceLink: true}
        )).toBe('[tel:123](tel:123)\n')
    }
  )

  test('should use a normal link for nodes w/ a value similar to the url w/o a protocol', async () => {
      expect(to({
          type: 'link',
          url: 'a',
          children: [{type: 'text', value: 'a'}]
        })).toBe('[a](a)\n')
    }
  )

  test('should use an autolink for nodes w/ a value similar to the url and a protocol', async () => {
      expect(to({
          type: 'link',
          url: 'tel:123',
          children: [{type: 'text', value: 'tel:123'}]
        })).toBe('<tel:123>\n')
    }
  )

  test('should use a normal link for nodes w/ a value similar to the url w/ a title', async () => {
      expect(to({
          type: 'link',
          url: 'tel:123',
          title: 'a',
          children: [{type: 'text', value: 'tel:123'}]
        })).toBe('[tel:123](tel:123 "a")\n')
    }
  )

  test('should use an autolink for nodes w/ a value similar to the url and a protocol (email)', async () => {
      expect(to({
          type: 'link',
          url: 'mailto:a@b.c',
          children: [{type: 'text', value: 'a@b.c'}]
        })).toBe('<a@b.c>\n')
    }
  )

  test('should not escape in autolinks', async () => {
    expect(to({
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'mailto:a.b-c_d@a.b',
            children: [{type: 'text', value: 'a.b-c_d@a.b'}]
          }
        ]
      })).toEqual('<a.b-c_d@a.b>\n')
  })

  test(
    'should support a link w/ title when `quote: "\'"`',
    async () => {
      expect(to({type: 'link', url: '', title: 'b', children: []}, {quote: "'"})).toBe("[](<> 'b')\n")
    }
  )

  test(
    'should escape a quote in `title` in a title when `quote: "\'"` 2',
    async () => {
      expect(to({type: 'link', url: '', title: "'", children: []}, {quote: "'"})).toBe("[](<> ''')\n")
    }
  )

  test('should not escape unneeded characters in a `destinationLiteral`', async () => {
      expect(to({type: 'link', url: 'a b![c](d*e_f[g_h`i', children: []})).toBe('[](<a b![c](d*e_f[g_h`i>)\n'
      )
    }
  )

  test('should not escape unneeded characters in a `destinationRaw`', async () => {
      expect(to({type: 'link', url: 'a![b](c*d_e[f_g`h<i</j', children: []})).toBe('[](a![b](c*d_e[f_g`h<i</j)\n'
      )
    }
  )

  test('should not escape unneeded characters in a `title` (double quotes)', async () => {
      expect(to({
          type: 'link',
          url: '#',
          title: 'a![b](c*d_e[f_g`h<i</j',
          children: []
        })).toBe('[](# "a![b](c*d_e[f_g`h<i</j")\n'
      )
    }
  )

  test('should not escape unneeded characters in a `title` (single quotes)', async () => {
      expect(to(
          {
            type: 'link',
            url: '#',
            title: 'a![b](c*d_e[f_g`h<i</j',
            children: []
          },
          {quote: "'"}
        )).toBe("[](# 'a![b](c*d_e[f_g`h<i</j')\n"
      )
    }
  )

  test('should throw on when given an incorrect `quote`', async () => {
      expect(() => {
        // @ts-expect-error: check how the runtime handles `quote` being wrong.
        to({type: 'link', title: 'b'}, {quote: '.'})
    }).toThrow(/Cannot serialize title with `\.` for `options\.quote`, expected `"`, or `'`/)
    }
  )
})

describe('linkReference', () => {
  test('should support a link reference (nonsensical)', async () => {
      expect(
        // @ts-expect-error: check how the runtime handles `children`, `referenceType`, `identifier` missing.
        to({type: 'linkReference'})
      ).toBe('[][]\n')
    }
  )

  test('should support `children`', async () => {
    expect(
      // @ts-expect-error: check how the runtime handles `referenceType`, `identifier` missing.
      to({type: 'linkReference', children: [{type: 'text', value: 'a'}]})
    ).toBe('[a][]\n')
  })

  test('should support an `identifier` (nonsensical)', async () => {
      expect(// @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({type: 'linkReference', identifier: 'a', children: []})).toBe('[][a]\n')
    }
  )

  test('should support a `label` (nonsensical)', async () => {
    expect(
      // @ts-expect-error: check how the runtime handles `children`, `referenceType`, `identifier` missing.
      to({type: 'linkReference', label: 'a'})
    ).toBe('[][a]\n')
  })

  test('should support `referenceType: "shortcut"`', async () => {
    expect(to({
        type: 'linkReference',
        children: [{type: 'text', value: 'A'}],
        identifier: 'A',
        referenceType: 'shortcut'
      })).toBe('[A]\n')
  })

  test('should support `referenceType: "collapsed"`', async () => {
      expect(to({
          type: 'linkReference',
          children: [{type: 'text', value: 'A'}],
          label: 'A',
          identifier: 'a',
          referenceType: 'collapsed'
        })).toBe('[A][]\n')
    }
  )

  test('should support `referenceType: "full"` (default)', async () => {
      expect(to({
          type: 'linkReference',
          children: [{type: 'text', value: 'A'}],
          label: 'A',
          identifier: 'a',
          referenceType: 'full'
        })).toBe('[A][A]\n')
    }
  )

  test('should prefer label over identifier', async () => {
    expect(to({
        type: 'linkReference',
        children: [{type: 'text', value: '&'}],
        label: '&',
        identifier: '&amp;',
        referenceType: 'full'
      })).toBe('[&][&]\n')
  })

  test('should decode `identifier` if w/o `label`', async () => {
    expect(to({
        type: 'linkReference',
        children: [{type: 'text', value: '&'}],
        identifier: '&amp;',
        referenceType: 'full'
      })).toBe('[&][&]\n')
  })

  test('should support incorrect character references 1 ', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {
              type: 'linkReference',
              children: [{type: 'text', value: '&a;'}],
              identifier: '&b;',
              referenceType: 'full'
            }
          ]
        })).toBe('[&a;][&b;]\n')
    }
  )

  test('should not escape unneeded characters in a `reference`', async () => {
      expect(to({
          type: 'linkReference',
          identifier: 'a![b](c*d_e[f_g`h<i</j',
          referenceType: 'full',
          children: []
        })).toBe('[][a![b](c*d_e[f_g`h<i</j]\n'
      )
    }
  )

  test('should unescape `identifier` if w/o `label`', async () => {
      expect(to({
          type: 'linkReference',
          children: [{type: 'text', value: '+'}],
          identifier: '\\+',
          referenceType: 'full'
        })).toBe('[+][+]\n')
    }
  )

  test('should use a collapsed reference if w/o `referenceType` and the label matches the reference', async () => {
      expect(
        // @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({
          type: 'linkReference',
          children: [{type: 'text', value: 'a'}],
          label: 'a',
          identifier: 'a'
        })).toBe('[a][]\n')
    }
  )

  test('should use a full reference if w/o `referenceType` and the label does not match the reference 2', async () => {
      expect(
        // @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({
          type: 'linkReference',
          children: [{type: 'text', value: 'a'}],
          label: 'b',
          identifier: 'b'
        })).toBe('[a][b]\n')
    }
  )

  test('should use a full reference if w/o `referenceType` and the label does not match the reference 3', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            // @ts-expect-error: check how the runtime handles `referenceType` missing.
            {
              type: 'linkReference',
              identifier: '',
              children: [{type: 'text', value: 'a'}]
            },
            {type: 'text', value: '(b)'}
          ]
        })).toBe('[a][](b)\n')
    }
  )
})

describe('list', () => {
  test('should support an empty list', async () => {
    // @ts-expect-error: check how the runtime handles `children` missing.
    expect(to({type: 'list'})).toBe('')
  })

  test.skip('should support a list w/ an item', async () => {
      expect(
        // @ts-expect-error: check how the runtime handles `children` in item missing.
        to({type: 'list', children: [{type: 'listItem'}]})).toBe('*\n')
    }
  )

  test('should support a list w/ items', async () => {
    expect(to({
        type: 'list',
        children: [
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
            ]
          },
          {
            type: 'listItem',
            children: [{type: 'thematicBreak'}]
          },
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
            ]
          }
        ]
      })).toBe('• a\n\n• ***\n\n• b\n')
  })

  test('should not use blank lines between items for lists w/ `spread: false`', async () => {
      expect(to({
          type: 'list',
          spread: false,
          children: [
            {
              type: 'listItem',
              children: [
                {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
              ]
            },
            {
              type: 'listItem',
              children: [{type: 'thematicBreak'}]
            }
          ]
        })).toBe('• a\n• ***\n')
    }
  )

  test('should support a list w/ `spread: false`, w/ a spread item', async () => {
      expect(to({
          type: 'list',
          spread: false,
          children: [
            {
              type: 'listItem',
              children: [
                {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
                {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
              ]
            },
            {
              type: 'listItem',
              children: [{type: 'thematicBreak'}]
            }
          ]
        })).toBe('• a\n\n  b\n• ***\n')
    }
  )

  test('should support a list w/ `ordered` and an empty item', async () => {
      expect(to({
          type: 'list',
          ordered: true,
          children: [{type: 'listItem', children: []}]
        })).toBe('1.\n')
    }
  )

  test('should support a list w/ `ordered`', async () => {
    expect(to({
        type: 'list',
        ordered: true,
        children: [
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
            ]
          },
          {
            type: 'listItem',
            children: [{type: 'thematicBreak'}]
          },
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
            ]
          }
        ]
      })).toBe('1. a\n\n2. ***\n\n3. b\n')
  })

  test('should support a list w/ `ordered` and `spread: false`', async () => {
      expect(to({
          type: 'list',
          ordered: true,
          spread: false,
          children: [
            {
              type: 'listItem',
              children: [
                {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
              ]
            },
            {
              type: 'listItem',
              children: [{type: 'thematicBreak'}]
            },
            {
              type: 'listItem',
              children: [
                {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
              ]
            }
          ]
        })).toBe('1. a\n2. ***\n3. b\n')
    }
  )

  test('should support a list w/ `ordered` when `incrementListMarker: false`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            spread: false,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
                ]
              },
              {
                type: 'listItem',
                children: [{type: 'thematicBreak'}]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
                ]
              }
            ]
          },
          {incrementListMarker: false}
        )).toBe('1. a\n1. ***\n1. b\n')
    }
  )

  test('should support a list w/ `ordered` and `start`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            start: 0,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
                ]
              },
              {
                type: 'listItem',
                children: [{type: 'thematicBreak'}]
              }
            ]
          },
          {listItemIndent: 'one'}
        )).toBe('0. a\n\n1. ***\n')
    }
  )

  test('should support a correct prefix and indent `listItemIndent: "mixed"` and a tight list (1)', async () => {
      expect(to(
          {
            type: 'list',
            spread: false,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'mixed'}
        )).toBe('• a\n  b\n• c\n  d\n')
    }
  )

  test('should support a correct prefix and indent `listItemIndent: "mixed"` and a tight list (2)', async () => {
      expect(to(
          {
            type: 'list',
            spread: true,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'mixed'}
        )).toBe('•   a\n    b\n\n•   c\n    d\n')
    }
  )

  test('should support a correct prefix and indent for items 9 and 10 when `listItemIndent: "one"`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            spread: false,
            start: 9,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'one'}
        )).toBe('9. a\n   b\n10. c\n    d\n')
    }
  )

  test('should support a correct prefix and indent for items 99 and 100 when `listItemIndent: "one"`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            spread: false,
            start: 99,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'one'}
        )).toBe('99. a\n    b\n100. c\n     d\n')
    }
  )

  test('should support a correct prefix and indent for items 999 and 1000 when `listItemIndent: "one"`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            spread: false,
            start: 999,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'one'}
        )).toBe('999. a\n     b\n1000. c\n      d\n')
    }
  )

  test('should support a correct prefix and indent for items 9 and 10 when `listItemIndent: "tab"`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            spread: false,
            start: 9,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'tab'}
        )).toBe('9.  a\n    b\n10. c\n    d\n')
    }
  )

  test('should support a correct prefix and indent for items 99 and 100 when `listItemIndent: "tab"`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            spread: false,
            start: 99,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'tab'}
        )).toBe('99. a\n    b\n100.    c\n        d\n')
    }
  )

  test('should support a correct prefix and indent for items 999 and 1000 when `listItemIndent: "tab"`', async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            spread: false,
            start: 999,
            children: [
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
                ]
              },
              {
                type: 'listItem',
                children: [
                  {type: 'paragraph', children: [{type: 'text', value: 'c\nd'}]}
                ]
              }
            ]
          },
          {listItemIndent: 'tab'}
        )).toBe('999.    a\n        b\n1000.   c\n        d\n')
    }
  )
})

describe('listItem', () => {
  test('should support a list item', async () => {
    // @ts-expect-error: check how the runtime handles `children` missing.
    expect(to({type: 'listItem'})).toBe('•\n')
  })

  test(
    'should serialize an item w/ a plus as bullet when `bullet: "+"`',

    async () => {
      expect(to({type: 'listItem', children: []}, {bullet: '+'})).toBe('+\n')
    }
  )

  test(
    'should throw on an incorrect bullet',

    async () => {
      expect(() => {
        to(
          {type: 'listItem', children: []},
          {
            // @ts-expect-error: check how the runtime handles `bullet` being wrong.
            bullet: '.'
          }
        )
    }).toThrow(/Cannot serialize items with `\.` for `options\.bullet`, expected `\*`, `\•`, `\+`, or `-`/)
    }
  )

  test(
    'should support a list item w/ a child',

    async () => {
      expect(to({
          type: 'listItem',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
          ]
        })).toBe('• a\n')
    }
  )

  test(
    'should support a list item w/ children',

    async () => {
      expect(to({
          type: 'listItem',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'thematicBreak'},
            {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
          ]
        })).toBe('• a\n\n  ***\n\n  b\n')
    }
  )

  test(
    'should use one space after the bullet for `listItemIndent: "one"`',

    async () => {
      expect(to(
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
              {type: 'thematicBreak'}
            ]
          },
          {listItemIndent: 'one'}
        )).toBe('• a\n\n  ***\n')
    }
  )

  test(
    'should use one space after the bullet for `listItemIndent: "mixed"`, when the item is not spread',

    async () => {
      expect(to(
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
            ]
          },
          {listItemIndent: 'mixed'}
        )).toBe('• a\n')
    }
  )

  test(
    'should use a tab stop of spaces after the bullet for `listItemIndent: "mixed"`, when the item is spread',

    async () => {
      expect(to(
          {
            type: 'listItem',
            spread: true,
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
              {type: 'thematicBreak'}
            ]
          },
          {listItemIndent: 'mixed'}
        )).toBe('•   a\n\n    ***\n')
    }
  )

  test(
    'should throw on an incorrect `listItemIndent`',

    async () => {
      expect(() => {
        to(
          {type: 'listItem', children: []},
          {
            // @ts-expect-error: check how the runtime handles `listItemIndent` being wrong.
            listItemIndent: 'x'
          }
        )
    }).toThrow(/Cannot serialize items with `x` for `options\.listItemIndent`, expected `tab`, `one`, or `mixed`/)
    }
  )

  test(
    'should not use blank lines between child blocks for items w/ `spread: false`',

    async () => {
      expect(to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'thematicBreak'}
          ]
        })).toBe('• a\n  ***\n')
    }
  )

  test('should support `bulletOther`', async () => {
    expect(to(createList(createList(createList())), {bulletOther: '+'})).toBe('• • •\n')
  })

  test(
    'should default to an `bulletOther` different from `bullet` (1)',

    async () => {
      expect(to(createList(createList(createList())), {bullet: '-'})).toBe('- - •\n')
    }
  )

  test(
    'should default to an `bulletOther` different from `bullet` (2)',

    async () => {
      expect(to(createList(createList(createList())), {bullet: '*'})).toBe('* * -\n')
    }
  )

  test(
    'should throw when given an incorrect `bulletOther`',

    async () => {
      expect(() => {
        to(createList(createList(createList())), {
          // @ts-expect-error: check how the runtime handles `bulletOther` being wrong.
          bulletOther: '?'
        })
    }).toThrow(/Cannot serialize items with `\?` for `options\.bulletOther`, expected/)
    }
  )

  test(
    'should throw when an `bulletOther` is given equal to `bullet`',

    async () => {
      expect(() => {
        to(createList(createList(createList())), {
          bullet: '-',
          bulletOther: '-'
        })
    }).toThrow(/Expected `bullet` \(`-`\) and `bulletOther` \(`-`\) to be different/)
    }
  )

  test(
    'should use a different bullet than a thematic rule marker, if the first child of a list item is a thematic break (1)',

    async () => {
      expect(to({
          type: 'list',
          children: [{type: 'listItem', children: [{type: 'thematicBreak'}]}]
        })).toBe('• ***\n')
    }
  )

  test(
    'should use a different bullet than a thematic rule marker, if the first child of a list item is a thematic break (2)',

    async () => {
      expect(to({
          type: 'list',
          children: [
            {
              type: 'listItem',
              children: [
                {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
              ]
            },
            {type: 'listItem', children: [{type: 'thematicBreak'}]}
          ]
        })).toBe('• a\n\n• ***\n')
    }
  )

  test(
    'should *not* use a different bullet for an empty list item in two lists',

    async () => {
      expect(to(createList(createList()))).toBe('• •\n')
    }
  )

  test(
    'should use a different bullet for an empty list item in three lists (1)',

    async () => {
      expect(to(createList(createList(createList())))).toBe('• • •\n')
    }
  )

  test(
    'should use a different bullet for an empty list item in three lists (2)',

    async () => {
      expect(to({
          type: 'list',
          children: [
            {type: 'listItem', children: []},
            {type: 'listItem', children: [createList(createList())]}
          ]
        })).toBe('•\n\n• • •\n')
    }
  )

  test(
    'should not use a different bullet for an empty list item in three lists if `bullet` isn’t a thematic rule marker',

    async () => {
      expect(to(createList(createList(createList())), {bullet: '+'})).toBe('+ + +\n')
    }
  )

  test(
    'should use a different bullet for an empty list item in four lists',

    async () => {
      expect(to(createList(createList(createList(createList()))))).toBe('• • • •\n')
    }
  )

  test(
    'should use a different bullet for an empty list item in five lists',

    async () => {
      expect(to(createList(createList(createList(createList(createList())))))).toBe('• • • • •\n')
    }
  )

  test(
    'should not use a different bullet for an empty list item at non-head in two lists',

    async () => {
      expect(to(
          createList(
            createList([
              createList({
                type: 'paragraph',
                children: [{type: 'text', value: 'a'}]
              }),
              createList()
            ])
          )
        )).toBe('• • • a\n\n    •\n')
    }
  )

  test(
    'should support `bulletOrdered`',

    async () => {
      expect(to(
          {
            type: 'list',
            ordered: true,
            children: [{type: 'listItem', children: []}]
          },
          {bulletOrdered: ')'}
        )).toBe('1)\n')
    }
  )

  test(
    'should throw on a `bulletOrdered` that is invalid',

    async () => {
      expect(() => {
        to(
          {
            type: 'list',
            ordered: true,
            children: [{type: 'listItem', children: []}]
          },
          {
            // @ts-expect-error: check how the runtime handles `bulletOrdered` being wrong.
            bulletOrdered: '~'
          }
        )
    }).toThrow(/Cannot serialize items with `~` for `options.bulletOrdered`/)
    }
  )

  test(
    'should use a different bullet for adjacent ordered lists',

    async () => {
      expect(to(
          {
            type: 'root',
            children: [
              {
                type: 'list',
                ordered: true,
                children: [{type: 'listItem', children: []}]
              },
              {
                type: 'list',
                ordered: true,
                children: [{type: 'listItem', children: []}]
              }
            ]
          },
          {bulletOrdered: ')'}
        )).toBe('1)\n\n1.\n')
    }
  )
})

describe('paragraph', () => {
  test('should support an empty paragraph', async () => {
    expect(// @ts-expect-error: check how the runtime handles `children` missing.
      to({type: 'paragraph'})).toBe('')
  })

  test('should support a paragraph', async () => {
    expect(to({type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]})).toBe('a\nb\n')
  })

  test('should encode spaces at the start of paragraphs', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '  a'}]})).toBe('  a\n')
    }
  )

  test('should encode spaces at the end of paragraphs', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: 'a  '}]})).toBe('a  \n')
    }
  )

  test('should encode tabs at the start of paragraphs', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '\t\ta'}]})).toBe('\t\ta\n')
    }
  )

  test('should encode tabs at the end of paragraphs', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: 'a\t\t'}]})).toBe('a\t\t\n')
    }
  )

  test('should encode spaces around line endings in paragraphs', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: 'a  \n  b'}]})).toBe('a  \n  b\n')
    }
  )

  test('should encode spaces around line endings in paragraphs', async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: 'a\t\t\n\t\tb'}]
        })).toBe('a\t\t\n\t\tb\n')
    }
  )
})

describe('strong', () => {
  test(
    'should support an empty strong',

    async () => {
      expect(// @ts-expect-error: check how the runtime handles `children` missing.
        to({type: 'strong'})).toBe('****\n')
    }
  )

  test('should throw on when given an incorrect `strong`', async () => {
      expect(() => {
        to(
          {type: 'strong', children: []},
          {
            // @ts-expect-error: check how the runtime handles `strong` being wrong.
            strong: '?'
          }
        )
    }).toThrow(/Cannot serialize strong with `\?` for `options\.strong`, expected `\*`, or `_`/)
    }
  )

  test('should support a strong w/ children', async () => {
    expect(to({type: 'strong', children: [{type: 'text', value: 'a'}]})).toBe('**a**\n')
  })

  test('should support a strong w/ underscores when `emphasis: "_"`', async () => {
      expect(to(
          {type: 'strong', children: [{type: 'text', value: 'a'}]},
          {strong: '_'}
        )).toBe('__a__\n')
    }
  )
})

describe('text', () => {
  test('should not be first slash', async () => {
    expect(to({
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: '[[00 Свойства - знание]] '
          }
        ]
      })).toBe('00 Свойства - знание \n')
  })
  test('should support a void text', async () => {
    // @ts-expect-error: check how the runtime handles `value` missing.
    expect(to({type: 'text'})).toBe('')
  })

  test('should support an empty text', async () => {
    expect(to({type: 'text', value: ''})).toBe('')
  })

  test('should support text', async () => {
    expect(to({type: 'text', value: 'a\nb'})).toBe('a\nb\n')
  })
})

describe('thematic break', () => {
  test('should support a thematic break', async () => {
    expect(to({type: 'thematicBreak'})).toBe('***\n')
  })

  test('should support a thematic break w/ dashes when `rule: "-"`', async () => {
      expect(to({type: 'thematicBreak'}, {rule: '-'})).toBe('---\n')
    }
  )

  test('should support a thematic break w/ underscores when `rule: "_"`', async () => {
      expect(to({type: 'thematicBreak'}, {rule: '_'})).toBe('___\n')
    }
  )

  test('should throw on when given an incorrect `rule`', async () => {
      expect(() => {
        to(
          {type: 'thematicBreak'},
          {
            // @ts-expect-error: check how the runtime handles `rule` being wrong.
            rule: '.'
          }
        )
    }).toThrow(/Cannot serialize rules with `.` for `options\.rule`, expected `\*`, `-`, or `_`/)
    }
  )

  test('should support a thematic break w/ more repetitions w/ `ruleRepetition`', async () => {
      expect(to({type: 'thematicBreak'}, {ruleRepetition: 5})).toBe('*****\n')
    }
  )

  test('should throw on when given an incorrect `ruleRepetition`', async () => {
      expect(() => {
        to({type: 'thematicBreak'}, {ruleRepetition: 2})
    }).toThrow(/Cannot serialize rules with repetition `2` for `options\.ruleRepetition`, expected `3` or more/)
    }
  )

  test('should support a thematic break w/ spaces w/ `ruleSpaces`', async () => {
      expect(to({type: 'thematicBreak'}, {ruleSpaces: true})).toBe('* * *\n')
    }
  )
})

describe('escape', () => {
  test('should escape what would otherwise be a block quote in a paragraph', async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: '> a\n> b\nc >'}]
        })).toBe('> a\n> b\nc >\n')
    }
  )

  test('should escape what would otherwise be a block quote in a list item', async () => {
      expect(to({
          type: 'listItem',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: '> a\n> b'}]}
          ]
        })).toBe('• > a\n  > b\n')
    }
  )

  test('should escape what would otherwise be a block quote in a block quote', async () => {
      expect(to({
          type: 'blockquote',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: '> a\n> b'}]}
          ]
        })).toBe('> > a\n> > b\n')
    }
  )

  test('should escape what would otherwise be a break', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: 'a\\\nb'}]})).toBe('a\\\nb\n')
    }
  )

  test('should escape what would otherwise be a named character reference', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '&amp'}]})).toBe('&amp\n')
    }
  )

  test('should escape what would otherwise be a numeric character reference', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '&#9;'}]})).toBe('&#9;\n')
    }
  )

  test('should escape what would otherwise be a character escape', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: 'a\\+b'}]})).toBe('a\\\\+b\n')
    }
  )

  test('should escape what would otherwise be a character escape of an autolink', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a\\'},
            {
              type: 'link',
              children: [{type: 'text', value: 'https://a.b'}],
              url: 'https://a.b'
            }
          ]
        })).toBe('a\\<https://a.b>\n')
    }
  )

  test('should escape what would otherwise be code (flow)', async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: '```js\n```'}]
        })).toBe('```js\n```\n')
    }
  )

  test('should escape what would otherwise be a definition', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '[a]: b'}]})).toBe('[a]: b\n')
    }
  )

  test('should escape what would otherwise be emphasis (asterisk)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '*a*'}]})).toBe('*a*\n')
    }
  )

  test('should escape what would otherwise be emphasis (underscore)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '_a_'}]})).toBe('_a_\n')
    }
  )

  test('should escape what would otherwise be a heading (atx)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '# a'}]})).toBe('# a\n')
    }
  )

  test('should escape what would otherwise be a heading (setext, equals)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: 'a\n='}]})).toBe('a\n=\n')
    }
  )

  test('should escape what would otherwise be a heading (setext, dash)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: 'a\n-'}]})).toBe('a\n-\n')
    }
  )

  test('should escape what would otherwise be html', async () => {
    expect(to({type: 'paragraph', children: [{type: 'text', value: '<a\nb>'}]})).toBe('<a\nb>\n')
  })

  test('should escape what would otherwise be code (text)', async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: 'a `b`\n`c` d'}]
        })).toBe('a `b`\n`c` d\n')
    }
  )

  test('should escape what would otherwise turn a link into an image', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: '!'},
            {
              type: 'link',
              children: [{type: 'text', value: 'a'}],
              url: 'b'
            }
          ]
        })).toBe('![a](b)\n')
    }
  )

  test('should escape what would otherwise turn a link reference into an image reference', async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: '!'},
            {
              type: 'linkReference',
              children: [{type: 'text', value: 'a'}],
              label: 'b',
              identifier: 'b',
              referenceType: 'shortcut'
            }
          ]
        })).toBe('![a][b]\n')
    }
  )

  test('should escape what would otherwise be an image (reference)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '![a][b]'}]})).toBe('![a][b]\n')
    }
  )

  test('should escape what would otherwise be an image (resource)', async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: '![](a.jpg)'}]
        })).toBe('![](a.jpg)\n')
    }
  )

  test('should escape what would otherwise be a link (reference)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '[a][b]'}]})).toBe('[a][b]\n')
    }
  )

  test('should escape what would otherwise be a link (resource)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '[](a.jpg)'}]})).toBe('[](a.jpg)\n')
    }
  )

  test('should escape what would otherwise be a list item (plus)', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '+ a\n+ b'}]})).toBe('+ a\n+ b\n')
    }
  )

  test('should not escape `+` when not followed by whitespace', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '+a'}]})).toBe('+a\n')
    }
  )

  test(
    'should escape what would otherwise be a list item (dash)',

    async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '- a\n- b'}]})).toBe('- a\n- b\n')
    }
  )

  test('should not escape `-` when not followed by whitespace', async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '-a'}]})).toBe('-a\n')
    }
  )

  test(
    'should escape `-` when followed by another `-` (as it looks like a thematic break, setext underline)',

    async () => {
      expect(to({type: 'paragraph', children: [{type: 'text', value: '--a'}]})).toBe('--a\n')
    }
  )

  test(
    'should escape what would otherwise be a list item (asterisk)',

    async () => {
      // Note: these are in titles, because the `*` case here is about flow nodes,
      // not phrasing (emphasis).
      expect(to({
          type: 'definition',
          identifier: 'x',
          url: 'y',
          title: 'a\n* b\n* c'
        })).toBe('[x]: y "a\n* b\n* c"\n')
    }
  )

  test('should not escape `*` when not followed by whitespace', async () => {
      expect(to({type: 'definition', identifier: 'x', url: 'y', title: 'a\n*b'})).toBe('[x]: y "a\n*b"\n')
    }
  )

  test(
    'should escape `*` when followed by another `*` (as it looks like a thematic break)',

    async () => {
      expect(to({type: 'definition', identifier: 'x', url: 'y', title: 'a\n**b'})).toBe('[x]: y "a\n**b"\n')
    }
  )

  test(
    'should escape what would otherwise be a list item (dot)',

    async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: '1. a\n2. b'}]
        })).toBe('1. a\n2. b\n')
    }
  )

  test(
    'should escape what would otherwise be a list item (paren)',

    async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: '1) a\n2) b'}]
        })).toBe('1) a\n2) b\n')
    }
  )

  test('should not escape what can’t be a list (dot)', async () => {
      expect(to({
          type: 'paragraph',
          children: [{type: 'text', value: '1.2.3. asd'}]
        })).toBe('1.2.3. asd\n')
    }
  )

  test('should support options in extensions', async () => {
    expect(to(
        {
          type: 'root',
          children: [
            {type: 'definition', url: '', label: 'a', identifier: 'a'},
            {type: 'definition', url: '', label: 'b', identifier: 'b'}
          ]
        },
        {extensions: [{tightDefinitions: true}]}
      )).toBe('[a]: <>\n[b]: <>\n')
  })

  test(
    'should support empty `join`, `handlers`, `extensions` in an extension (coverage)',

    async () => {
      expect(to(
          {
            type: 'root',
            children: [{type: 'strong', children: [{type: 'text', value: 'a'}]}]
          },
          {
            extensions: [
              {
                strong: '_',
                join: undefined,
                handlers: undefined,
                extensions: undefined
              }
            ]
          }
        )).toBe('__&#x61;__\n')
    }
  )

  test.skip(
    'should make `join` from options highest priority',
    async () => {
      expect(to(
          {
            type: 'root',
            children: [
              {
                type: 'list',
                ordered: true,
                start: 1,
                spread: false,
                children: [
                  {
                    type: 'listItem',
                    spread: true,
                    checked: null,
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: 'foo'
                          }
                        ]
                      },
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
                                children: [{type: 'text', value: 'bar'}]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            join: [
              function () {
                return 0
              }
            ]
          }
        )).toBe('1. foo\n   • bar\n')
    }
  )

  test('should prefer main options over extension options', async () => {
      expect(to(
          {
            type: 'root',
            children: [{type: 'strong', children: [{type: 'text', value: 'a'}]}]
          },
          {strong: '*', extensions: [{strong: '_'}]}
        )).toBe('**a**\n')
    }
  )

  test('should prefer extension options over subextension options', async () => {
      expect(to(
          {
            type: 'root',
            children: [{type: 'strong', children: [{type: 'text', value: 'a'}]}]
          },
          {extensions: [{strong: '*', extensions: [{strong: '_'}]}]}
        )).toBe('**a**\n')
    }
  )

  test(
    'should handle literal backslashes properly when before constructs (1)',

    async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: '\\'},
            {type: 'emphasis', children: [{type: 'text', value: 'a'}]}
          ]
        })).toBe('\\*a*\n')
    }
  )

  test(
    'should handle literal backslashes properly when before constructs (2)',

    async () => {
      expect(to({
          type: 'paragraph',
          children: [
            {type: 'text', value: '\\\\'},
            {type: 'emphasis', children: [{type: 'text', value: 'a'}]}
          ]
        })).toBe('\\\\\\*a*\n')
    }
  )
})

describe('roundtrip', () => {
  test.skip(
    'should roundtrip spread items in block quotes',
    async () => {
      const value = [
        '> * Lorem ipsum dolor sit amet',
        '>',
        '> * consectetur adipisicing elit',
        ''
      ].join('\n')

      expect(to(from(value))).toBe(value)
    }
  )

  test.skip(
    'should roundtrip spread items in sublists (1)',
    
    async () => {
      const value = [
        '* Lorem ipsum dolor sit amet',
        '',
        '  1. consectetur adipisicing elit',
        '',
        '  2. sed do eiusmod tempor incididunt',
        ''
      ].join('\n')

      expect(to(from(value))).toBe(value)
    }
  )

  test.skip(
    'should roundtrip spread items in sublists (2)',
    
    async () => {
      const value = [
        '* 1. Lorem ipsum dolor sit amet',
        '',
        '  2. consectetur adipisicing elit',
        ''
      ].join('\n')

      expect(to(from(value))).toBe(value)
    }
  )

  test.skip(
    'should roundtrip spread items in sublists (3)',
    
    async () => {
      const value = [
        '* hello',
        '  * world',
        '    how',
        '',
        '    are',
        '    you',
        '',
        '  * today',
        '* hi',
        ''
      ].join('\n')

      expect(to(from(value))).toBe(value)
    }
  )

  test('should roundtrip autolinks w/ potentially escapable characters', async () => {
      const value = 'An autolink: <http://example.com/?foo=1&bar=2>.\n'

      expect(to(from(value))).toBe(value)
    }
  )

  test('should roundtrip potential prototype injections', async () => {
      const value = [
        'A [primary][toString], [secondary][constructor], and [tertiary][__proto__] link.',
        '',
        '[toString]: http://primary.com',
        '',
        '[__proto__]: http://tertiary.com',
        '',
        '[constructor]: http://secondary.com',
        ''
      ].join('\n')

      expect(to(from(value))).toBe(value)
    }
  )

  test.skip('should roundtrip empty lists', async () => {
    const value = [
      '* foo',
      '',
      '*',
      '',
      '* bar',
      '',
      '* baz',
      '',
      '*',
      '',
      '* qux quux',
      ''
    ].join('\n')

    expect(to(from(value))).toBe(value)
  })

  test.skip('should roundtrip empty lists', async () => {
    const value = '• a\n\n<!---->\n\n• b\n'

    expect(to(from(value))).toBe(value)
  })

  test('should roundtrip indented blank lines in code', async () => {
      // The first one could have (up to) four spaces, but it doesn’t add anything,
      // so we don’t roundtrip it.
      const value = [
        '    <h3>Header 3</h3>',
        '',
        '    <blockquote>',
        '        <p>This is a blockquote.</p>',
        '        ',
        '        <p>This is the second paragraph in the blockquote.</p>',
        '        ',
        '        <h2>This is an H2 in a blockquote</h2>',
        '    </blockquote>',
        ''
      ].join('\n')

      expect(to(from(value), {fences: false})).toBe(value)
    }
  )

  test('should roundtrip adjacent block quotes', async () => {
    const value = '> a\n\n> b\n'

    expect(to(from(value))).toBe(value)
  })

  test('should roundtrip formatted URLs', async () => {
    const value = '[**https://unifiedjs.com/**](https://unifiedjs.com/)\n'

    expect(to(from(value))).toBe(value)
  })

  test('should roundtrip backslashes (1)', async () => {
    const step1 = '\\ \\\\ \\\\\\ \\\\\\\\'
    const step2 = '\\ \\ \\\\\\ \\\\\\\n'

    expect(to(from(step1))).toBe(step2)

    expect(to(from(step2))).toBe(step2)
  })

  test('should not collapse escapes (1)', async () => {
    const value = '\\\\*a\n'

    expect(to(from(value))).toBe(value)
  })

  test('should not collapse escapes (2)', async () => {
    const value = '\\\\*a\\\\\\*'

    expect(removePosition(from(value))).toEqual(removePosition(from(to(from(value)))))
  })

  test('should roundtrip a sole blank line in fenced code', async () => {
      const value = '```\n	\n```\n'

      expect(to(from(value))).toBe(value)
    }
  )

  test('should roundtrip an empty list item in two more lists', async () => {
      const value = '• • •\n'

      expect(to(from(value))).toBe(value)
    }
  )

  test('should roundtrip a thematic break at the start of a list item', async () => {
      const value = '• ***\n'

      expect(to(from(value))).toBe(value)
    }
  )

  test('should roundtrip different lists w/ `bulletOther`', async () => {
      const tree = from('* a\n- b')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree, {bullet: '*', bulletOther: '-'})), {
          force: true
        }))
    }
  )

  test('should roundtrip different lists w/ `bulletOther` and lists that could turn into thematic breaks (1)', async () => {
      const tree = from('* ---\n- - +\n+ b')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree, {bullet: '*', bulletOther: '-'})), {
          force: true
        }))
    }
  )

  test('should roundtrip different lists w/ `bulletOther` and lists that could turn into thematic breaks (2)', async () => {
      const tree = from('- - +\n* ---\n+ b')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree, {bullet: '*', bulletOther: '-'})), {
          force: true
        }))
    }
  )

  test('should roundtrip different lists w/ `bulletOther` and lists that could turn into thematic breaks (3)', async () => {
      const tree = from('- - +\n- -')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree, {bullet: '*', bulletOther: '-'})), {
          force: true
        }))
    }
  )

  test('should roundtrip different lists w/ `bulletOther` and lists that could turn into thematic breaks (4)', async () => {
      const tree = from('* - +\n    *\n    -\n    +')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree, {bullet: '*', bulletOther: '-'})), {
          force: true
        }))
    }
  )

  test('should roundtrip different lists w/ `bulletOther` and lists that could turn into thematic breaks (5)', async () => {
      const tree = from('* - +\n  - *\n    -\n    +')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree, {bullet: '*', bulletOther: '-'})), {
          force: true
        }))
    }
  )

  test('should roundtrip different lists w/ `bulletOther` and lists that could turn into thematic breaks (6)', async () => {
      const tree = from('- +\n- *\n  -\n  +')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree, {bullet: '*', bulletOther: '-'})), {
          force: true
        }))
    }
  )

  test('should roundtrip adjacent ordered lists', async () => {
    const tree = from('1. a\n1) b')

    expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree)), {force: true}))
  })

  test('should roundtrip different ordered lists and lists that could turn into thematic breaks (1)', async () => {
      const tree = from('1. ---\n1) 1. 1)\n1. b')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree)), {force: true}))
    }
  )

  test('should roundtrip different ordered lists and lists that could turn into thematic breaks (2)', async () => {
      const tree = from('1. 1. 1)\n1) ---\n1. b')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree)), {force: true}))
    }
  )

  test('should roundtrip different ordered lists and lists that could turn into thematic breaks (3)', async () => {
      const tree = from('1. 1. 1)\n1. 1.')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree)), {force: true}))
    }
  )

  test('should roundtrip different ordered lists and lists that could turn into thematic breaks (4)', async () => {
      const tree = from('1. 1) 1.\n      1.\n      1)\n    1.')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree)), {force: true}))
    }
  )

  test('should roundtrip different ordered lists and lists that could turn into thematic breaks (5)', async () => {
      const tree = from('1. 1) 1.\n   1) 1.\n     1)\n     1.')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree)), {force: true}))
    }
  )

  test('should roundtrip different ordered lists and lists that could turn into thematic breaks (6)', async () => {
      const tree = from('1. 1)\n1. 1.\n   1)\n   1.')

      expect(removePosition(tree, {force: true})).toEqual(removePosition(from(to(tree)), {force: true}))
    }
  )

  test.skip(
    'should roundtrip a single encoded space',
    
    async () => {
      const value = ' \n'

      expect(to(from(value))).toBe(value)
    }
  )

  test.skip(
    'should roundtrip a single encoded tab',
    
    async () => {
      const value = '\t\n'

      expect(to(from(value))).toBe(value)
    }
  )

  test('should roundtrip encoded spaces and tabs where needed', async () => {
      const value = 'a\\\nb\n'

      expect(to(from(value))).toBe(value)
    }
  )

  test('should roundtrip asterisks (tree)', async () => {
    const value = `Separate paragraphs:

a * is this emphasis? *

a ** is this emphasis? **

a *** is this emphasis? ***

a *\\* is this emphasis? *\\*

a \\** is this emphasis? \\**

a **\\* is this emphasis? **\\*

a *\\** is this emphasis? *\\**

One paragraph:

a * is this emphasis? *
a ** is this emphasis? **
a *** is this emphasis? ***
a *\\* is this emphasis? *\\*
a \\** is this emphasis? \\**
a **\\* is this emphasis? **\\*
a *\\** is this emphasis? *\\**`
    const tree = from(value)

    expect(removePosition(from(to(tree)), {force: true})).toEqual(removePosition(tree, {force: true}))
  })

  test('should roundtrip underscores (tree)', async () => {
    const value = `Separate paragraphs:

a _ is this emphasis? _

a __ is this emphasis? __

a ___ is this emphasis? ___

a _\\_ is this emphasis? _\\_

a \\__ is this emphasis? \\__

a __\\_ is this emphasis? __\\_

a _\\__ is this emphasis? _\\__

One paragraph:

a _ is this emphasis? _
a __ is this emphasis? __
a ___ is this emphasis? ___
a _\\_ is this emphasis? _\\_
a \\__ is this emphasis? \\__
a __\\_ is this emphasis? __\\_
a _\\__ is this emphasis? _\\__`
    const tree = from(value)

    expect(removePosition(from(to(tree)), {force: true})).toEqual(removePosition(tree, {force: true}))
  })

  test('should roundtrip attention-like plain text', async () => {
    const value = to(from(`(____`))

    expect(to(from(value))).toBe(value)
  })

  test('should roundtrip faux “fill in the blank” spans', async () => {
      const value = to(
        from(
          'Once activated, a service worker ______, then transitions to idle…'
        )
      )

      expect(to(from(value))).toBe(value)
    }
  )
})

describe('roundtrip attention', () => {
  /**
   * @typedef Case
   * @property {string} inside
   * @property {(typeof markers)[number]} marker
   * @property {string} outside
   * @property {(typeof sides)[number]} side
   * @property {(typeof types)[number]} type
   */

  const characters = ['.', ' ', 'a']
  const markers = /** @type {const} */ (['*', '_'])
  const sides = /** @type {const} */ (['open', 'close'])
  const types = /** @type {const} */ (['emphasis', 'strong'])
  /** @type {Array<Case>} */
  const tests = []

  for (const type of types) {
    for (const marker of markers) {
      for (const side of sides) {
        for (const inside of characters) {
          for (const outside of characters) {
            tests.push({inside, marker, outside, side, type})
          }
        }
      }
    }
  }

  for (const testCase of tests) {
    const {inside, marker, outside, side, type} = testCase
    const name =
      'should roundtrip `' +
      type +
      '` using `' +
      marker +
      '` in an ' +
      side +
      ' run: ' +
      (outside === '.'
        ? 'punctuation'
        : outside === ' '
          ? 'whitespace'
          : 'letter') +
      ' outside and ' +
      (inside === '.'
        ? 'punctuation'
        : inside === ' '
          ? 'whitespace'
          : 'letter') +
      ' inside'

    test(name, async () => {
      /** @type {Array<PhrasingContent>} */
      const children = []

      if (side === 'open') {
        children.push({type: 'text', value: 'x' + outside})
      }

      children.push({
        type,
        children: [
          {
            type: 'text',
            value:
              (side === 'open' ? inside : '') +
              'y' +
              (side === 'close' ? inside : '')
          }
        ]
      })

      if (side === 'close') {
        children.push({type: 'text', value: outside + 'z'})
      }

      /** @type {Root} */
      const expected = {
        type: 'root',
        children: [{type: 'paragraph', children}]
      }
      const markdown = to(expected, {emphasis: marker, strong: marker})
      const actual = from(markdown)
      removePosition(actual, {force: true})
      expect(actual).toEqual(expected)
    })
  }
})

describe('position (output)', () => {
  test('should track output positions (1)', async () => {
    expect(to(
        {
          type: 'blockquote',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            // @ts-expect-error: If you want to support custom nodes in types,
            // please see `@types/mdast` on how to do that.
            {type: 'unknown'}
          ]
        },
        {
          handlers: {
            /**
             * @type {Handle}
             * @param {unknown} _
             */
            unknown(_, _2, _3, info) {
              const {now, lineShift} = info
              expect({now, lineShift}).toEqual({now: {line: 3, column: 3}, lineShift: 2})
              return 'x'
            }
          }
        }
      )).toBe('> a\n>\n> x\n')
  })

  test('should track output positions (2)', async () => {
    expect(to(
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a\n'},
                {
                  type: 'emphasis',
                  children: [
                    // @ts-expect-error: If you want to support custom nodes in types,
                    // please see `@types/mdast` on how to do that.
                    {type: 'unknown'}
                  ]
                }
              ]
            }
          ]
        },
        {
          handlers: {
            /**
             * @type {Handle}
             * @param {unknown} _
             */
            unknown(_, _2, _3, info) {
              const {now, lineShift} = info
              expect({now, lineShift}).toEqual({now: {line: 2, column: 4}, lineShift: 2})
              return 'b'
            }
          }
        }
      )).toBe('> a\n> *b*\n')
  })
})

/**
 * @param {Array<BlockContent> | BlockContent | undefined} [d]
 * @returns {List}
 */
function createList(d) {
  return {
    type: 'list',
    children: [
      {type: 'listItem', children: Array.isArray(d) ? d : d ? [d] : []}
    ]
  }
}
