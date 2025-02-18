/**
 * @import {Handle} from 'mdast-util-to-markdown'
 * @import {BlockContent, List, PhrasingContent, Root} from 'mdast'
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {removePosition} from 'unist-util-remove-position'
import {fromMarkdown as from} from 'mdast-util-from-markdown'
import {toTelegram as to} from '../lib/index.js'

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('mdast-util-to-markdown')).sort(),
      ['defaultHandlers', 'toMarkdown']
    )
  })

  /**
   * TODO: Добавить позже
   */
  await t.test('SKIP: should support a `root`', { skip: true }, async function () {
    assert.deepEqual(
      to({
        type: 'root',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
          {type: 'thematicBreak'},
          {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
        ]
      }),
      {text: 'a\n\n***\n\nb', html: 'a\n\n***\n\nb'}
    )
  })

  await t.test(
    'should not use blank lines between nodes when given phrasing',
    async function () {
      assert.deepEqual(
        to({
          type: 'root',
          children: [
            {type: 'text', value: 'a'},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        }),
        {text: 'a\\\nb', html: 'a\\\nb'}
      )
    }
  )

  await t.test('should support adjacent definitions', async function () {
    assert.deepEqual(
      to({
        type: 'root',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
          {type: 'definition', identifier: 'b', url: ''},
          {type: 'definition', identifier: 'c', url: ''},
          {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
        ]
      }),
      {
        text: 'a\n\n[b]: <>\n\n[c]: <>\n\nd',
        html: 'a\n\n[b]: <>\n\n[c]: <>\n\nd'
      }
    )
  })

  await t.test(
    'should support tight adjacent definitions when `tightDefinitions: true`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          text: 'a\n\n[b]: <>\n[c]: <>\n\nd',
          html: 'a\n\n[b]: <>\n[c]: <>\n\nd'
        }
      )
    }
  )

  await t.test(
    'should use a different marker for adjacent lists',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        {
          text: 'a\n\n•\n\n•\n\n1.\n\n1)\n\nd',
          html: 'a\n\n•\n\n•\n\n1.\n\n1)\n\nd'
        }
      )
    }
  )

  await t.test(
    'should inject HTML comments between lists and an indented code',
    async function () {
      assert.deepEqual(
        to(
          {
            type: 'root',
            children: [
              {type: 'code', value: 'a'},
              {type: 'list', children: [{type: 'listItem', children: []}]},
              {type: 'code', value: 'b'}
            ]
          },
          {fences: false}
        ),
        {
          text: '    a\n\n•\n\n<!---->\n\n    b',
          html: '    a\n\n•\n\n<!---->\n\n    b'
        }
      )
    }
  )

  await t.test(
    'should inject HTML comments between adjacent indented code',
    async function () {
      assert.deepEqual(
        to(
          {
            type: 'root',
            children: [
              {type: 'code', value: 'a'},
              {type: 'code', value: 'b'}
            ]
          },
          {fences: false}
        ),
        {
          text: '    a\n\n<!---->\n\n    b',
          html: '    a\n\n<!---->\n\n    b'
        }
      )
    }
  )

  await t.test(
    'should not honour `spread: false` for two paragraphs',
    async function () {
      assert.deepEqual(
        to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
          ]
        }),
        {text: '• a\n\n  b', html: '• a\n\n  b'}
      )
    }
  )

  await t.test(
    'should not honour `spread: false` for a paragraph and a definition',
    async function () {
      assert.deepEqual(
        to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'definition', identifier: 'b', label: 'c', url: 'd'}
          ]
        }),
        {text: '• a\n\n  [c]: d', html: '• a\n\n  [c]: d'}
      )
    }
  )

  await t.test(
    'should honour `spread: false` for a paragraph and a heading',
    async function () {
      assert.deepEqual(
        to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'heading', depth: 1, children: [{type: 'text', value: 'b'}]}
          ]
        }),
        {text: '• a\n  **b**', html: '• a\n  **b**'}
      )
    }
  )

  await t.test(
    'should not honour `spread: false` for a paragraph and a setext heading',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {text: '• a\n\n  **b**', html: '• a\n\n  **b**'}
      )
    }
  )

  await t.test('should throw on a non-node', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a non-object.
      to(false)
    }, /Cannot handle value `false`, expected node/)
  })

  await t.test('should throw on an unknown node', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles an unknown node.
      to({type: 'unknown'})
    }, /Cannot handle unknown node `unknown`/)
  })

  await t.test('should throw on an unknown node in a tree', async function () {
    assert.throws(function () {
      to({
        type: 'paragraph',
        // @ts-expect-error: check how the runtime handles an unknown child.
        children: [{type: 'text', value: 'a'}, {type: 'unknown'}]
      })
    }, /Cannot handle unknown node `unknown`/)
  })
})

test('blockquote', { skip: true }, async function (t) {
  /**
   * NOTE: This case is not relevant
   */
  await t.test('SKIP: should support a block quote', { skip: true}, async function () {
    // @ts-expect-error: check how the runtime handles `children` missing.
    assert.deepEqual(to({type: 'blockquote'}), { text: '>', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote"></blockquote>' })
  })

  await t.test('should support a block quote w/ a child', async function () {
    assert.deepEqual(
      to({
        type: 'blockquote',
        children: [{type: 'paragraph', children: [{type: 'text', value: 'a'}]}]
      }),
      { text: '> a', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a</blockquote>' }
    )
  })

  await t.test('should support a block quote w/ children', async function () {
    assert.deepEqual(
      to({
        type: 'blockquote',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
          {type: 'thematicBreak'},
          {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
        ]
      }),
      { text: '> a\n>\n> ***\n>\n> b', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a  ***  b</blockquote>' }
    )
  })

  await t.test(
    'should support text w/ a line ending in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}
          ]
        }),
        { text: '> a\n> b', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a b</blockquote>' }
      )
    }
  )

  await t.test(
    'should support adjacent texts in a block quote',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        { text: '> ab', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">ab</blockquote>' }
      )
    }
  )

  await t.test('should support a break in a block quote', async function () {
    assert.deepEqual(
      to({
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
      }),
      { text: '> a\\\n> b', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a\\ b</blockquote>' }
    )
  })

  await t.test(
    'should support code (flow, indented) in a block quote',
    async function () {
      assert.deepEqual(
        to(
          {
            type: 'blockquote',
            children: [{type: 'code', value: 'a\nb\n\nc'}]
          },
          {fences: false}
        ),
        { text: '>     a\n>     b\n>\n>     c', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a b  c</blockquote>' }
      )
    }
  )

  await t.test(
    'should support code (flow, fenced) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [{type: 'code', lang: 'a\nb', value: 'c\nd\n\ne'}]
        }),
        { text: '> ```a\n> b\n> c\n> d\n>\n> e\n> ```', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">```a b c d  e ```</blockquote>' }
      )
    }
  )

  await t.test(
    'should support code (text) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
                {type: 'inlineCode', value: 'b\nc'},
                {type: 'text', value: '\nd'}
              ]
            }
          ]
        }),
        { text: '> a\n> `b\n> c`\n> d', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a `b c` d</blockquote>' }
      )
    }
  )

  await t.test(
    'should support padded code (text) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
                {type: 'inlineCode', value: ' b\nc '},
                {type: 'text', value: '\nd'}
              ]
            }
          ]
        }),
        { text: '> a\n> `  b\n> c  `\n> d', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a `  b c  ` d</blockquote>' }
      )
    }
  )

  await t.test(
    'should support an emphasis in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
                {type: 'emphasis', children: [{type: 'text', value: 'c\nd'}]},
                {type: 'text', value: '\nd'}
              ]
            }
          ]
        }),
        { text: '> a\n> *c\n> d*\n> d', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a *c d* d</blockquote>' }
      )
    }
  )

  await t.test(
    'should support a heading (atx) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'heading',
              depth: 3,
              children: [{type: 'text', value: 'a\nb'}]
            }
          ]
        }),
        { text: '> **a\n> b**', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">**a b**</blockquote>' }
      )
    }
  )

  await t.test(
    'should support a heading (setext) in a block quote',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        { text: '> **a\n> b**', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">**a b**</blockquote>' }
      )
    }
  )

  await t.test(
    'should support html (flow) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [{type: 'html', value: '<div\nhidden>'}]
        }),
        { text: '> <div\n> hidden>', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote"><div hidden></blockquote>' }
      )
    }
  )

  await t.test(
    'should support html (text) in a block quote',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        { text: '> a <span\n> hidden>\n> b', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a <span hidden> b</blockquote>' }
      )
    }
  )

  await t.test(
    'should support an image (resource) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
                {type: 'image', url: 'b\nc', alt: 'd\ne', title: 'f\ng'},
                {type: 'text', value: '\nh'}
              ]
            }
          ]
        }),
        { text: '> a\n> ![d\n> e](<b\n> c> "f\n> g")\n> h', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a ![d e](<b c> "f g") h</blockquote>' }
      )
    }
  )

  await t.test(
    'should support an image (reference) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
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
        }),
        { text: '> a\n> ![b\n> c][d\n> e]\n> g', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a ![b c][d e] g</blockquote>' }
      )
    }
  )

  await t.test(
    'should support a link (resource) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
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
        }),
        { text: '> a\n> [d\n> e](<b\n> c> "f\n> g")\n> h', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a [d e](<b c> "f g") h</blockquote>' }
      )
    }
  )

  await t.test(
    'should support a link (reference) in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
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
        }),
        { text: '> a\n> [b\n> c][d\n> e]\n> g', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a [b c][d e] g</blockquote>' }
      )
    }
  )

  await t.test('should support a list in a block quote', async function () {
    assert.deepEqual(
      to({
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
      }),
      { text: '> a\n> b\n>\n> • c\n>   d\n>\n> • ***\n>\n> • e\n>   f', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a b  • c d  • ***  • e f</blockquote>' }
    )
  })

  await t.test('should support a strong in a block quote', async function () {
    assert.deepEqual(
      to({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [
              {type: 'text', value: 'a'},
              {type: 'strong', children: [{type: 'text', value: 'c\nd'}]},
              {type: 'text', value: '\nd'}
            ]
          }
        ]
      }),
      { text: '> a\n> **c\n> d**\n> d', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a **c d** d</blockquote>' }
    )
  })

  await t.test(
    'should support a thematic break in a block quote',
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
        }),
        { text: '>', html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote"></blockquote>' }
      )
    }
  )
})

test('break', async function (t) {
  await t.test('should support a break', async function () {
    assert.deepEqual(to({type: 'break'}), { text: '\\\n', html: '\\\n' })
  })

  await t.test(
    'should serialize breaks in heading (atx) as a space 1 ',
    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 3,
          children: [
            {type: 'text', value: 'a'},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        }),
        { text: '**a b**', html: '**a b**' }
      )
    }
  )

  await t.test(
    'should serialize breaks in heading (atx) as a space 2',
    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 3,
          children: [
            {type: 'text', value: 'a '},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        }),
        { text: '**a  b**', html: '**a  b**' }
      )
    }
  )

  await t.test(
    'should serialize breaks in heading (setext)',
    async function () {
      assert.deepEqual(to(from('a  \nb\n='), {setext: true}), { text: '**a b**', html: '**a b**' })
    }
  )
})

test('code (flow)', async function (t) {
  await t.test('should support empty code', async function () {
    // @ts-expect-error: check how the runtime handles `value` missing.
    assert.deepEqual(to({type: 'code'}), { text: '```\n```', html: '```\n```' })
  })

  await t.test(
    'should throw on when given an incorrect `fence`',

    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles an incorrect `fence` marker.
        to({type: 'code', value: ''}, {fence: '+'})
      }, /Cannot serialize code with `\+` for `options\.fence`, expected `` ` `` or `~`/)
    }
  )

  await t.test(
    'should support code w/ a value (indent)',

    async function () {
      assert.deepEqual(to({type: 'code', value: 'a'}, {fences: false}), { text: '    a', html: '    a' })
    }
  )

  await t.test(
    'should support code w/ a value (fences)',

    async function () {
      assert.deepEqual(to({type: 'code', value: 'a'}), { text: '```\na\n```', html: '```\na\n```' })
    }
  )

  await t.test(
    'should support code w/ a lang',

    async function () {
      assert.deepEqual(to({type: 'code', lang: 'a', value: ''}), { text: '```a\n```', html: '```a\n```' })
    }
  )

  await t.test(
    'should support (ignore) code w/ only a meta',

    async function () {
      assert.deepEqual(to({type: 'code', meta: 'a', value: ''}), { text: '```\n```', html: '```\n```' })
    }
  )

  await t.test(
    'should support code w/ lang and meta',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'a', meta: 'b', value: ''}),
        { text: '```a\n```', html: '```a\n```' }
      )
    }
  )

  await t.test(
    'should encode a space in `lang`',

    async function () {
      assert.deepEqual(to({type: 'code', lang: 'a b', value: ''}), { text: '```a b\n```', html: '```a b\n```' })
    }
  )

  await t.test(
    'should encode a line ending in `lang`',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'a\nb', value: ''}),
        { text: '```a\nb\n```', html: '```a\nb\n```' }
      )
    }
  )

  await t.test(
    'should encode a grave accent in `lang`',

    async function () {
      assert.deepEqual(to({type: 'code', lang: 'a`b', value: ''}), { text: '```a`b\n```', html: '```a`b\n```' })
    }
  )

  await t.test(
    'should escape a backslash in `lang`',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'a\\-b', value: ''}),
        { text: '```a\\\\-b\n```', html: '```a\\\\-b\n```' }
      )
    }
  )

  await t.test(
    'should not encode a space in `meta`',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'x', meta: 'a b', value: ''}),
        { text: '```x\n```', html: '```x\n```' }
      )
    }
  )

  await t.test(
    'should encode a line ending in `meta`',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'x', meta: 'a\nb', value: ''}),
        { text: '```x\n```', html: '```x\n```' }
      )
    }
  )

  await t.test(
    'should encode a grave accent in `meta`',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'x', meta: 'a`b', value: ''}),
        { text: '```x\n```', html: '```x\n```' }
      )
    }
  )

  await t.test(
    'should escape a backslash in `meta`',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'x', meta: 'a\\-b', value: ''}),
        { text: '```x\n```', html: '```x\n```' }
      )
    }
  )

  await t.test(
    'should support fenced code w/ tildes when `fence: "~"`',

    async function () {
      assert.deepEqual(to({type: 'code', value: ''}, {fence: '~'}), { text: '~~~\n~~~', html: '~~~\n~~~' })
    }
  )

  await t.test(
    'should not encode a grave accent when using tildes for fences',

    async function () {
      assert.deepEqual(
        to({type: 'code', lang: 'a`b', value: ''}, {fence: '~'}),
        { text: '~~~a`b\n~~~', html: '~~~a`b\n~~~' }
      )
    }
  )

  await t.test(
    'should use more grave accents for fences if there are streaks of grave accents in the value (fences)',

    async function () {
      assert.deepEqual(
        to({type: 'code', value: '```\nasd\n```'}),
        { text: '````\n```\nasd\n```\n````', html: '````\n```\nasd\n```\n````' }
      )
    }
  )

  await t.test(
    'should use more tildes for fences if there are streaks of tildes in the value (fences)',

    async function () {
      assert.deepEqual(
        to({type: 'code', value: '~~~\nasd\n~~~'}, {fence: '~'}),
        { text: '~~~~\n~~~\nasd\n~~~\n~~~~', html: '~~~~\n~~~\nasd\n~~~\n~~~~' }
      )
    }
  )

  await t.test(
    'should use a fence if there is an info',

    async function () {
      assert.deepEqual(to({type: 'code', lang: 'a', value: 'b'}), { text: '```a\nb\n```', html: '```a\nb\n```' })
    }
  )

  await t.test(
    'should use a fence if there is only whitespace',

    async function () {
      assert.deepEqual(to({type: 'code', value: ' '}), { text: '```\n \n```', html: '```\n \n```' })
    }
  )

  await t.test(
    'should use a fence if there first line is blank (void)',

    async function () {
      assert.deepEqual(to({type: 'code', value: '\na'}), { text: '```\n\na\n```', html: '```\n\na\n```' })
    }
  )

  await t.test(
    'should use a fence if there first line is blank (filled)',

    async function () {
      assert.deepEqual(to({type: 'code', value: ' \na'}), { text: '```\n \na\n```', html: '```\n \na\n```' })
    }
  )

  await t.test(
    'should use a fence if there last line is blank (void)',

    async function () {
      assert.deepEqual(to({type: 'code', value: 'a'}), { text: '```\na\n```', html: '```\na\n```' })
    }
  )

  await t.test(
    'should use a fence if there last line is blank (filled)',

    async function () {
      assert.deepEqual(to({type: 'code', value: 'a\n '}), { text: '```\na\n \n```', html: '```\na\n \n```' })
    }
  )

  await t.test(
    'should use an indent if the value is indented',

    async function () {
      assert.deepEqual(
        to({type: 'code', value: '  a\n\n b'}, {fences: false}),
        { text: '      a\n\n     b', html: '      a\n\n     b' }
      )
    }
  )
})

/**
 * NOTE: Useless in tg cases
 */
test('SKIP: definition', {skip: true}, async function (t) {
  await t.test('should support a definition w/o label', async function () {
    assert.equal(
      // @ts-expect-error: check how the runtime handles `identifier`, `url` missing.
      to({type: 'definition'}),
      '[]: <>'
    )
  })

  await t.test('should support a definition w/ label', async function () {
    assert.equal(
      // @ts-expect-error: check how the runtime handles `identifier` missing.
      to({type: 'definition', label: 'a', url: ''}),
      '[a]: <>'
    )
  })

  await t.test('should escape a backslash in `label`', async function () {
    assert.equal(
      // @ts-expect-error: check how the runtime handles `identifier` missing.
      to({type: 'definition', label: '\\', url: ''}),
      '[\\\\]: <>'
    )
  })

  await t.test(
    'should escape an opening bracket in `label`',
    async function () {
      assert.equal(
        // @ts-expect-error: check how the runtime handles `identifier` missing.
        to({type: 'definition', label: '[', url: ''}),
        '[[]: <>'
      )
    }
  )

  await t.test('should escape a closing bracket in `label`', async function () {
    assert.equal(
      // @ts-expect-error: check how the runtime handles `identifier` missing.
      to({type: 'definition', label: ']', url: ''}),
      '[]]: <>'
    )
  })

  await t.test('should support a definition w/ identifier', async function () {
    assert.equal(
      to({type: 'definition', identifier: 'a', url: ''}),
      '[a]: <>'
    )
  })

  await t.test('should escape a backslash in `identifier`', async function () {
    assert.equal(
      to({type: 'definition', identifier: '\\', url: ''}),
      '[\\\\]: <>'
    )
  })

  await t.test(
    'should escape an opening bracket in `identifier`',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: '[', url: ''}),
        '[[]: <>'
      )
    }
  )

  await t.test(
    'should escape a closing bracket in `identifier`',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: ']', url: ''}),
        '[]]: <>'
      )
    }
  )

  await t.test('should support a definition w/ url', async function () {
    assert.equal(
      to({type: 'definition', identifier: 'a', url: 'b'}),
      '[a]: b'
    )
  })

  await t.test(
    'should support a definition w/ enclosed url w/ whitespace in url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b c'}),
        '[a]: <b c>'
      )
    }
  )

  await t.test(
    'should escape an opening angle bracket in `url` in an enclosed url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b <c'}),
        '[a]: <b <c>'
      )
    }
  )

  await t.test(
    'should escape a closing angle bracket in `url` in an enclosed url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b >c'}),
        '[a]: <b >c>'
      )
    }
  )

  await t.test(
    'should escape a backslash in `url` in an enclosed url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b \\.c'}),
        '[a]: <b \\\\.c>'
      )
    }
  )

  await t.test(
    'should encode a line ending in `url` in an enclosed url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b\nc'}),
        '[a]: <b\nc>'
      )
    }
  )

  await t.test(
    'should encode a line ending in `url` in an enclosed url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: '\f'}),
        '[a]: <\f>'
      )
    }
  )

  await t.test(
    'should escape an opening paren in `url` in a raw url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b(c'}),
        '[a]: b(c'
      )
    }
  )

  await t.test(
    'should escape a closing paren in `url` in a raw url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b)c'}),
        '[a]: b)c'
      )
    }
  )

  await t.test(
    'should escape a backslash in `url` in a raw url',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: 'b\\?c'}),
        '[a]: b\\\\?c'
      )
    }
  )

  await t.test('should support a definition w/ title', async function () {
    assert.equal(
      to({type: 'definition', identifier: 'a', url: '', title: 'b'}),
      '[a]: <> "b"'
    )
  })

  await t.test('should support a definition w/ url & title', async function () {
    assert.equal(
      to({type: 'definition', identifier: 'a', url: 'b', title: 'c'}),
      '[a]: b "c"'
    )
  })

  await t.test(
    'should escape a quote in `title` in a title',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: '', title: '"'}),
        '[a]: <> """'
      )
    }
  )

  await t.test(
    'should escape a backslash in `title` in a title',
    async function () {
      assert.equal(
        to({type: 'definition', identifier: 'a', url: '', title: '\\'}),
        '[a]: <> "\\\\"'
      )
    }
  )

  await t.test(
    'should support a definition w/ title when `quote: "\'"`',
    async function () {
      assert.equal(
        to(
          {type: 'definition', identifier: 'a', url: '', title: 'b'},
          {quote: "'"}
        ),
        "[a]: <> 'b'\n"
      )
    }
  )

  await t.test(
    'should escape a quote in `title` in a title when `quote: "\'"`',
    async function () {
      assert.equal(
        to(
          {type: 'definition', identifier: 'a', url: '', title: "'"},
          {quote: "'"}
        ),
        "[a]: <> '''"
      )
    }
  )

  await t.test(
    'should throw on when given an incorrect `quote`',
    async function () {
      assert.throws(function () {
        to(
          {type: 'definition', identifier: 'a', url: '', title: 'b'},
          // @ts-expect-error: check how the runtime handles an incorrect `quote`.
          {quote: '.'}
        )
      }, /Cannot serialize title with `\.` for `options\.quote`, expected `"`, or `'`/)
    }
  )
})

test('emphasis', async function (t) {
  await t.test('should support an empty emphasis', async function () {
    assert.deepEqual(
      // @ts-expect-error: check how the runtime handles `children` missing.
      to({type: 'emphasis'}),
      { text: '**', html: '**' }
    )
  })

  await t.test(
    'should throw on when given an incorrect `emphasis`',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles incorrect `emphasis`.
        to({type: 'emphasis'}, {emphasis: '?'})
      }, /Cannot serialize emphasis with `\?` for `options\.emphasis`, expected `\*`, or `_`/)
    }
  )

  await t.test('should support an emphasis w/ children', async function () {
    assert.deepEqual(
      to({type: 'emphasis', children: [{type: 'text', value: 'a'}]}),
      { text: '*a*', html: '*a*' }
    )
  })

  await t.test(
    'should support an emphasis w/ underscores when `emphasis: "_"`',
    async function () {
      assert.deepEqual(
        to(
          {type: 'emphasis', children: [{type: 'text', value: 'a'}]},
          {emphasis: '_'}
        ),
        { text: '_a_', html: '_a_' }
      )
    }
  )
})

test('heading', async function (t) {
  await t.test(
    'should serialize a heading w/o rank as a heading of rank 1',

    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `children` missing.
        to({type: 'heading'}),
        { text: '****', html: '****' }
      )
    }
  )

  await t.test(
    'should serialize a heading w/ rank 1',

    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `children` missing.
        to({type: 'heading', depth: 1}),
        { text: '****', html: '****' }
      )
    }
  )

  await t.test(
    'should serialize a heading w/ rank 6',

    async function () {
      assert.deepEqual(to({type: 'heading', depth: 6, children: []}), { text: '****', html: '****' })
    }
  )

  await t.test(
    'should serialize a heading w/ rank 7 as 6',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          // @ts-expect-error: check how the runtime handles `depth` being too high.
          depth: 7,
          children: []
        }),
        { text: '****', html: '****' }
      )
    }
  )

  await t.test(
    'should serialize a heading w/ rank 0 as 1',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          // @ts-expect-error: check how the runtime handles `depth` being too low.
          depth: 0,
          children: []
        }),
        { text: '****', html: '****' }
      )
    }
  )

  await t.test(
    'should serialize a heading w/ content',

    async function () {
      assert.deepEqual(
        to({type: 'heading', depth: 1, children: [{type: 'text', value: 'a'}]}),
        { text: '**a**', html: '**a**' }
      )
    }
  )

  await t.test(
    'should serialize a heading w/ rank 1 as setext when `setext: true`',

    async function () {
      assert.deepEqual(
        to(
          {type: 'heading', depth: 1, children: [{type: 'text', value: 'a'}]},
          {setext: true}
        ),
        { text: '**a**', html: '**a**' }
      )
    }
  )

  await t.test(
    'should serialize a heading w/ rank 2 as setext when `setext: true`',

    async function () {
      assert.deepEqual(
        to(
          {type: 'heading', depth: 2, children: [{type: 'text', value: 'a'}]},
          {setext: true}
        ),
        { text: '**a**', html: '**a**' }
      )
    }
  )

  await t.test(
    'should serialize a heading w/ rank 3 as atx when `setext: true`',

    async function () {
      assert.deepEqual(
        to(
          {type: 'heading', depth: 3, children: [{type: 'text', value: 'a'}]},
          {setext: true}
        ),
        { text: '**a**', html: '**a**' }
      )
    }
  )

  await t.test(
    'should serialize an empty heading w/ rank 1 as atx when `setext: true`',

    async function () {
      assert.deepEqual(
        to({type: 'heading', depth: 1, children: []}, {setext: true}),
        { text: '****', html: '****' }
      )
    }
  )

  await t.test(
    'should serialize an empty heading w/ rank 2 as atx when `setext: true`',

    async function () {
      assert.deepEqual(
        to({type: 'heading', depth: 2, children: []}, {setext: true}),
        { text: '****', html: '****' }
      )
    }
  )

  await t.test(
    'should serialize an heading w/ rank 1 and code w/ a line ending as setext',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'inlineCode', value: ''}]
        }),
        { text: '**``**', html: '**``**' }
      )
    }
  )

  await t.test(
    'should serialize an heading w/ rank 1 and html w/ a line ending as setext',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'html', value: '<a\n/>'}]
        }),
        { text: '**<a\n/>**', html: '**<a\n/>**' }
      )
    }
  )

  await t.test(
    'should serialize an heading w/ rank 1 and text w/ a line ending as setext',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a\nb'}]
        }),
        { text: '**a\nb**', html: '**a\nb**' }
      )
    }
  )

  await t.test(
    'should serialize an heading w/ rank 1 and a break as setext',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [
            {type: 'text', value: 'a'},
            {type: 'break'},
            {type: 'text', value: 'b'}
          ]
        }),
        { text: '**a b**', html: '**a b**' }
      )
    }
  )

  await t.test(
    'should serialize a heading with a closing sequence when `closeAtx` (empty)',

    async function () {
      assert.deepEqual(
        to({type: 'heading', depth: 1, children: []}, {closeAtx: true}),
        { text: '****', html: '****' }
      )
    }
  )

  await t.test(
    'should serialize a with a closing sequence when `closeAtx` (content)',

    async function () {
      assert.deepEqual(
        to(
          {type: 'heading', depth: 3, children: [{type: 'text', value: 'a'}]},
          {closeAtx: true}
        ),
        { text: '**a**', html: '**a**' }
      )
    }
  )

  await t.test(
    'should not escape a `#` at the start of phrasing in a heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '# a'}]
        }),
        { text: '**# a**', html: '**# a**' }
      )
    }
  )

  await t.test(
    'should not escape a `1)` at the start of phrasing in a heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '1) a'}]
        }),
        { text: '**1) a**', html: '**1) a**' }
      )
    }
  )

  await t.test(
    'should not escape a `+` at the start of phrasing in a heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '+ a'}]
        }),
        { text: '**+ a**', html: '**+ a**' }
      )
    }
  )

  await t.test(
    'should not escape a `-` at the start of phrasing in a heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '- a'}]
        }),
        { text: '**- a**', html: '**- a**' }
      )
    }
  )

  await t.test(
    'should not escape a `=` at the start of phrasing in a heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '= a'}]
        }),
        { text: '**= a**', html: '**= a**' }
      )
    }
  )

  await t.test(
    'should not escape a `>` at the start of phrasing in a heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 2,
          children: [{type: 'text', value: '> a'}]
        }),
        { text: '**> a**', html: '**> a**' }
      )
    }
  )

  await t.test(
    'should escape a `#` at the end of a heading (1)',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a #'}]
        }),
        { text: '**a #**', html: '**a #**' }
      )
    }
  )

  await t.test(
    'should escape a `#` at the end of a heading (2)',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a ##'}]
        }),
        { text: '**a ##**', html: '**a ##**' }
      )
    }
  )

  await t.test(
    'should not escape a `#` in a heading (2)',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a # b'}]
        }),
        { text: '**a # b**', html: '**a # b**' }
      )
    }
  )

  await t.test(
    'should encode a space at the start of an atx heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: '  a'}]
        }),
        { text: '**&#x20; a**', html: '**&#x20; a**' }
      )
    }
  )

  await t.test(
    'should encode a tab at the start of an atx heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: '\t\ta'}]
        }),
        { text: '**&#x9;\ta**', html: '**&#x9;\ta**' }
      )
    }
  )

  await t.test(
    'should encode a space at the end of an atx heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a  '}]
        }),
        { text: '**a  **', html: '**a  **' }
      )
    }
  )

  await t.test(
    'should encode a tab at the end of an atx heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a\t\t'}]
        }),
        { text: '**a\t\t**', html: '**a\t\t**' }
      )
    }
  )

  await t.test(
    'should encode spaces around a line ending in a setext heading',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'a \n b'}]
        }),
        { text: '**a \n b**', html: '**a \n b**' }
      )
    }
  )

  await t.test(
    'should not need to encode spaces around a line ending in an atx heading (because the line ending is encoded)',

    async function () {
      assert.deepEqual(
        to({
          type: 'heading',
          depth: 3,
          children: [{type: 'text', value: 'a \n b'}]
        }),
        { text: '**a \n b**', html: '**a \n b**' }
      )
    }
  )
})

/**
 * NOTE: At the moment we not support html from markdown
 */
test('SKIP: html', {skip: true}, async function (t) {
  await t.test('should support a void html', async function () {
    // @ts-expect-error: check how the runtime handles `value` missing
    assert.equal(to({type: 'html'}), '')
  })

  await t.test('should support an empty html', async function () {
    assert.equal(to({type: 'html', value: ''}), '')
  })

  await t.test('should support html', async function () {
    assert.equal(to({type: 'html', value: 'a\nb'}), 'a\nb')
  })

  await t.test(
    'should prevent html (text) from becoming html (flow) (1)',
    async function () {
      assert.equal(
        to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a'},
            {type: 'html', value: '<div>'}
          ]
        }),
        'a\n<div>'
      )
    }
  )

  await t.test(
    'should prevent html (text) from becoming html (flow) (2)',
    async function () {
      assert.equal(
        to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a\r'},
            {type: 'html', value: '<div>'}
          ]
        }),
        'a\r<div>'
      )
    }
  )

  await t.test(
    'should prevent html (text) from becoming html (flow) (3)',
    async function () {
      assert.equal(
        to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a\r'},
            {type: 'html', value: '<div>'}
          ]
        }),
        'a\r\n<div>'
      )
    }
  )

  await t.test('should serialize html (text)', async function () {
    assert.equal(
      to({
        type: 'paragraph',
        children: [
          {type: 'html', value: '<x>'},
          {type: 'text', value: 'a'}
        ]
      }),
      '<x>a'
    )
  })
})

/**
 * NOTE: Work in progress
 */
test('SKIP: image', {skip: true}, async function (t) {
  await t.test('should support an image', async function () {
    // @ts-expect-error: check how the runtime handles `alt`, `url` missing.
    assert.equal(to({type: 'image'}), '![]()')
  })

  await t.test('should support `alt`', async function () {
    assert.equal(
      // @ts-expect-error: check how the runtime handles `url` missing.
      to({type: 'image', alt: 'a'}),
      '![a]()'
    )
  })

  await t.test('should support a url', async function () {
    assert.equal(to({type: 'image', url: 'a'}), '![](a)')
  })

  await t.test('should support a title', async function () {
    assert.equal(to({type: 'image', url: '', title: 'a'}), '![](<> "a")')
  })

  await t.test('should support a url and title', async function () {
    assert.equal(to({type: 'image', url: 'a', title: 'b'}), '![](a "b")')
  })

  await t.test(
    'should support an image w/ enclosed url w/ whitespace in url',
    async function () {
      assert.equal(to({type: 'image', url: 'b c'}), '![](<b c>)')
    }
  )

  await t.test(
    'should escape an opening angle bracket in `url` in an enclosed url',
    async function () {
      assert.equal(to({type: 'image', url: 'b <c'}), '![](<b <c>)')
    }
  )

  await t.test(
    'should escape a closing angle bracket in `url` in an enclosed url',
    async function () {
      assert.equal(to({type: 'image', url: 'b >c'}), '![](<b >c>)')
    }
  )

  await t.test(
    'should escape a backslash in `url` in an enclosed url',
    async function () {
      assert.equal(to({type: 'image', url: 'b \\+c'}), '![](<b \\\\+c>)')
    }
  )

  await t.test(
    'should encode a line ending in `url` in an enclosed url 1',
    async function () {
      assert.equal(to({type: 'image', url: 'b\nc'}), '![](<b\nc>)')
    }
  )

  await t.test(
    'should escape an opening paren in `url` in a raw url',
    async function () {
      assert.equal(to({type: 'image', url: 'b(c'}), '![](b(c)')
    }
  )

  await t.test(
    'should escape a closing paren in `url` in a raw url',
    async function () {
      assert.equal(to({type: 'image', url: 'b)c'}), '![](b)c)')
    }
  )

  await t.test(
    'should escape a backslash in `url` in a raw url',
    async function () {
      assert.equal(to({type: 'image', url: 'b\\+c'}), '![](b\\\\+c)')
    }
  )

  await t.test(
    'should support control characters in images',
    async function () {
      assert.equal(to({type: 'image', url: '\f'}), '![](<\f>)')
    }
  )

  await t.test('should escape a double quote in `title`', async function () {
    assert.equal(to({type: 'image', url: '', title: 'b"c'}), '![](<> "b"c")')
  })

  await t.test('should escape a backslash in `title`', async function () {
    assert.equal(
      to({type: 'image', url: '', title: 'b\\.c'}),
      '![](<> "b\\\\.c")'
    )
  })

  await t.test(
    'should support an image w/ title when `quote: "\'"`',
    async function () {
      assert.equal(
        to({type: 'image', url: '', title: 'b'}, {quote: "'"}),
        "![](<> 'b')\n"
      )
    }
  )

  await t.test(
    'should escape a quote in `title` in a title when `quote: "\'"` 1 ',
    async function () {
      assert.equal(
        to({type: 'image', url: '', title: "'"}, {quote: "'"}),
        "![](<> ''')\n"
      )
    }
  )

  await t.test(
    'should throw on when given an incorrect `quote`',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles `quote` being wrong.
        to({type: 'image', title: 'a'}, {quote: '.'})
      }, /Cannot serialize title with `\.` for `options\.quote`, expected `"`, or `'`/)
    }
  )
})

/**
 * NOTE: Work in progress
 */
test('SKIP: imageReference', {skip: true}, async function (t) {
  await t.test(
    'should support a link reference (nonsensical)',
    async function () {
      assert.equal(
        // @ts-expect-error: check how the runtime handles `alt`, `referenceType`, `identifier` missing.
        to({type: 'imageReference'}),
        '![][]'
      )
    }
  )

  await t.test('should support `alt`', async function () {
    assert.equal(
      // @ts-expect-error: check how the runtime handles `referenceType`, `identifier` missing.
      to({type: 'imageReference', alt: 'a'}),
      '![a][]'
    )
  })

  await t.test(
    'should support an `identifier` (nonsensical)',
    async function () {
      assert.equal(
        // @ts-expect-error: check how the runtime handles `alt`, `referenceType` missing.
        to({type: 'imageReference', identifier: 'a'}),
        '![][a]'
      )
    }
  )

  await t.test('should support a `label` (nonsensical)', async function () {
    assert.equal(
      // @ts-expect-error: check how the runtime handles `referenceType`, `identifier` missing.
      to({type: 'imageReference', label: 'a'}),
      '![][a]'
    )
  })

  await t.test('should support `referenceType: "shortcut"`', async function () {
    assert.equal(
      to({
        type: 'imageReference',
        alt: 'A',
        identifier: 'A',
        referenceType: 'shortcut'
      }),
      '![A]'
    )
  })

  await t.test(
    'should support `referenceType: "collapsed"`',
    async function () {
      assert.equal(
        to({
          type: 'imageReference',
          alt: 'A',
          identifier: 'A',
          referenceType: 'collapsed'
        }),
        '![A][]'
      )
    }
  )

  await t.test(
    'should support `referenceType: "full"` (default)',
    async function () {
      assert.equal(
        to({
          type: 'imageReference',
          alt: 'A',
          identifier: 'A',
          referenceType: 'full'
        }),
        '![A][A]'
      )
    }
  )

  await t.test('should prefer label over identifier', async function () {
    assert.equal(
      to({
        type: 'imageReference',
        alt: '&',
        label: '&',
        identifier: '&amp;',
        referenceType: 'full'
      }),
      '![&][&]'
    )
  })

  await t.test('should decode `identifier` if w/o `label`', async function () {
    assert.equal(
      to({
        type: 'imageReference',
        alt: '&',
        identifier: '&amp;',
        referenceType: 'full'
      }),
      '![&][&]'
    )
  })

  await t.test(
    'should support incorrect character references 2',
    async function () {
      assert.equal(
        to({
          type: 'paragraph',
          children: [
            {
              type: 'imageReference',
              alt: '&a;',
              identifier: '&b;',
              referenceType: 'full'
            }
          ]
        }),
        '![&a;][&b;]'
      )
    }
  )

  await t.test(
    'should unescape `identifier` if w/o `label`',
    async function () {
      assert.equal(
        to({
          type: 'imageReference',
          alt: '+',
          identifier: '\\+',
          referenceType: 'full'
        }),
        '![+][+]'
      )
    }
  )

  await t.test(
    'should use a collapsed reference if w/o `referenceType` and the label matches the reference',
    async function () {
      assert.equal(
        // @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({type: 'imageReference', alt: 'a', identifier: 'a'}),
        '![a][]'
      )
    }
  )

  await t.test(
    'should use a full reference if w/o `referenceType` and the label does not match the reference 1',
    async function () {
      assert.equal(
        // @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({type: 'imageReference', alt: 'a', identifier: 'b'}),
        '![a][b]'
      )
    }
  )
})

test('code (text)', async function (t) {
  await t.test(
    'should support an empty code text',

    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `value` missing.
        to({type: 'inlineCode'}),
        { text: '``', html: '``' }
      )
    }
  )

  await t.test('should support a code text', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: 'a'}), { text: '`a`', html: '`a`' })
  })

  await t.test('should support a space', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: ' '}), { text: '` `', html: '` `' })
  })

  await t.test('should support an eol', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: ''}), { text: '``', html: '``' })
  })

  await t.test('should support several spaces', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: '  '}), { text: '`  `', html: '`  `' })
  })

  await t.test(
    'should use a fence of two grave accents if the value contains one',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: 'a`b'}), { text: '``a`b``', html: '``a`b``' })
    }
  )

  await t.test(
    'should use a fence of one grave accent if the value contains two',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: 'a``b'}), { text: '`a``b`', html: '`a``b`' })
    }
  )

  await t.test(
    'should use a fence of three grave accents if the value contains two and one',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: 'a``b`c'}), { text: '```a``b`c```', html: '```a``b`c```' })
    }
  )

  await t.test(
    'should pad w/ a space if the value starts w/ a grave accent',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: '`a'}), { text: '`` `a ``', html: '`` `a ``' })
    }
  )

  await t.test(
    'should pad w/ a space if the value ends w/ a grave accent',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: 'a`'}), { text: '`` a` ``', html: '`` a` ``' })
    }
  )

  await t.test(
    'should pad w/ a space if the value starts and ends w/ a space',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: ' a '}), { text: '`  a  `', html: '`  a  `' })
    }
  )

  await t.test(
    'should not pad w/ spaces if the value ends w/ a non-space',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: ' a'}), { text: '` a`', html: '` a`' })
    }
  )

  await t.test(
    'should not pad w/ spaces if the value starts w/ a non-space',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: 'a '}), { text: '`a `', html: '`a `' })
    }
  )

  await t.test('should prevent breaking out of code (-)', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: 'a\n- b'}), { text: '`a - b`', html: '`a - b`' })
  })

  await t.test('should prevent breaking out of code (#)', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: 'a\n#'}), { text: '`a #`', html: '`a #`' })
  })

  await t.test(
    'should prevent breaking out of code (\\d\\.)',
    async function () {
      assert.deepEqual(to({type: 'inlineCode', value: 'a\n1. '}), { text: '`a 1. `', html: '`a 1. `' })
    }
  )

  await t.test('should prevent breaking out of code (cr)', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: 'a\r- b'}), { text: '`a - b`', html: '`a - b`' })
  })

  await t.test('should prevent breaking out of code (crlf)', async function () {
    assert.deepEqual(to({type: 'inlineCode', value: 'a\r\n- b'}), { text: '`a - b`', html: '`a - b`' })
  })
})

test('link', { skip: true }, async function (t) {
  await t.test('should support a relevant https link', async function () {
    assert.deepEqual(
      to({type: 'link', url: 'https://vk.com/post/la2sdf3lhl32', children: [{type: 'text', value: 'link'}]}),
      { text: 'link (https://vk.com/post/la2sdf3lhl32)', html: '<a class="text-entity-link" href="https://vk.com/post/la2sdf3lhl32" data-entity-type="MessageEntityTextUrl" dir="auto">link</a>' }
    )
  })

  await t.test('should support a relevant http link', async function () {
    assert.deepEqual(
      to({type: 'link', url: 'http://vk.com/post/la2sdf3lhl32', children: [{type: 'text', value: 'link'}]}),
      { text: 'link (http://vk.com/post/la2sdf3lhl32)', html: '<a class="text-entity-link" href="http://vk.com/post/la2sdf3lhl32" data-entity-type="MessageEntityTextUrl" dir="auto">link</a>' }
    )
  })

  await t.test('should not support app deep link', async function () {
    assert.deepEqual(
      to({type: 'link', url: 'obsidian://show-plugin?id=tengwar', children: [{type: 'text', value: 'link'}]}),
      { text: 'link', html: 'link' }
    )
  })

  await t.test('should support a link', { only: true }, async function () {
    // @ts-expect-error: check how the runtime handles `children`, `url` missing.
    assert.deepEqual(to({type: 'link'}), { text: '[]()', html: '[]()' })
  })

  await t.test('should support children', async function () {
    assert.deepEqual(
      // @ts-expect-error: check how the runtime handles `url` missing.
      to({type: 'link', children: [{type: 'text', value: 'a'}]}),
      { text: 'a', html: 'a' }
    )
  })

  await t.test('should support a url', async function () {
    assert.deepEqual(to({type: 'link', url: 'a', children: []}), { text: '[](a)', html: '[](a)' })
  })

  await t.test('should support a title', async function () {
    assert.deepEqual(
      to({type: 'link', url: '', title: 'a', children: []}),
      { text: '[](<> "a")', html: '[](<> "a")' }
    )
  })

  await t.test('should support a url and title', async function () {
    assert.deepEqual(
      to({type: 'link', url: 'a', title: 'b', children: []}),
      { text: '[](a "b")', html: '[](a "b")' }
    )
  })

  await t.test(
    'd',
    async function () {
      assert.deepEqual(to({type: 'link', url: 'b c', children: []}), { text: '[](<b c>)', html: '[](<b c>)' })
    }
  )

  await t.test(
    'should escape an opening angle bracket in `url` in an enclosed url',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: 'b <c', children: []}),
        { text: '[](<b <c>)', html: '[](<b <c>)' }
      )
    }
  )

  await t.test(
    'should escape a closing angle bracket in `url` in an enclosed url',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: 'b >c', children: []}),
        { text: '[](<b >c>)', html: '[](<b >c>)' }
      )
    }
  )

  await t.test(
    'should escape a backslash in `url` in an enclosed url',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: 'b \\+c', children: []}),
        { text: '[](<b \\\\+c>)', html: '[](<b \\\\+c>)' }
      )
    }
  )

  await t.test(
    'should encode a line ending in `url` in an enclosed url 2',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: 'b\nc', children: []}),
        { text: '[](<b\nc>)', html: '[](<b\nc>)' }
      )
    }
  )

  await t.test(
    'should escape an opening paren in `url` in a raw url',
    async function () {
      assert.deepEqual(to({type: 'link', url: 'b(c', children: []}), { text: '[](b(c)', html: '[](b(c)' })
    }
  )

  await t.test(
    'should escape a closing paren in `url` in a raw url',
    async function () {
      assert.deepEqual(to({type: 'link', url: 'b)c', children: []}), { text: '[](b)c)', html: '[](b)c)' })
    }
  )

  await t.test(
    'should escape a backslash in `url` in a raw url',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: 'b\\.c', children: []}),
        { text: '[](b\\\\.c)', html: '[](b\\\\.c)' }
      )
    }
  )

  await t.test('should support control characters in links', async function () {
    assert.deepEqual(to({type: 'link', url: '\f', children: []}), { text: '[](<\f>)', html: '[](<\f>)' })
  })

  await t.test('should escape a double quote in `title`', async function () {
    assert.deepEqual(
      to({type: 'link', url: '', title: 'b"c', children: []}),
      { text: '[](<> "b"c")', html: '[](<> "b"c")' }
    )
  })

  await t.test('should escape a backslash in `title`', async function () {
    assert.deepEqual(
      to({type: 'link', url: '', title: 'b\\-c', children: []}),
      { text: '[](<> "b\\\\-c")', html: '[](<> "b\\\\-c")' }
    )
  })

  await t.test(
    'should use an autolink for nodes w/ a value similar to the url and a protocol',
    async function () {
      assert.deepEqual(
        to({
          type: 'link',
          url: 'tel:123',
          children: [{type: 'text', value: 'tel:123'}]
        }),
        { text: '<tel:123>', html: '<tel:123>' }
      )
    }
  )

  await t.test(
    'should use a resource link (`resourceLink: true`)',
    async function () {
      assert.deepEqual(
        to(
          {
            type: 'link',
            url: 'tel:123',
            children: [{type: 'text', value: 'tel:123'}]
          },
          {resourceLink: true}
        ),
        { text: '[tel:123](tel:123)', html: '[tel:123](tel:123)' }
      )
    }
  )

  await t.test(
    'should use a normal link for nodes w/ a value similar to the url w/o a protocol',
    async function () {
      assert.deepEqual(
        to({
          type: 'link',
          url: 'a',
          children: [{type: 'text', value: 'a'}]
        }),
        { text: '[a](a)', html: '[a](a)' }
      )
    }
  )

  await t.test(
    'should use an autolink for nodes w/ a value similar to the url and a protocol',
    async function () {
      assert.deepEqual(
        to({
          type: 'link',
          url: 'tel:123',
          children: [{type: 'text', value: 'tel:123'}]
        }),
        { text: '<tel:123>', html: '<tel:123>' }
      )
    }
  )

  await t.test(
    'should use a normal link for nodes w/ a value similar to the url w/ a title',
    async function () {
      assert.deepEqual(
        to({
          type: 'link',
          url: 'tel:123',
          title: 'a',
          children: [{type: 'text', value: 'tel:123'}]
        }),
        { text: '[tel:123](tel:123 "a")', html: '[tel:123](tel:123 "a")' }
      )
    }
  )

  await t.test(
    'should use an autolink for nodes w/ a value similar to the url and a protocol (email)',
    async function () {
      assert.deepEqual(
        to({
          type: 'link',
          url: 'mailto:a@b.c',
          children: [{type: 'text', value: 'a@b.c'}]
        }),
        { text: '<a@b.c>', html: '<a@b.c>' }
      )
    }
  )

  await t.test('should not escape in autolinks', async function () {
    assert.deepEqual(
      to({
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'mailto:a.b-c_d@a.b',
            children: [{type: 'text', value: 'a.b-c_d@a.b'}]
          }
        ]
      }),
      { text: '<a.b-c_d@a.b>', html: '<a.b-c_d@a.b>' }
    )
  })

  await t.test(
    'should support a link w/ title when `quote: "\'"`',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: '', title: 'b', children: []}, {quote: "'"}),
        { text: "[](<> 'b')\n", html: "[](<> 'b')\n" }
      )
    }
  )

  await t.test(
    'should escape a quote in `title` in a title when `quote: "\'"` 2',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: '', title: "'", children: []}, {quote: "'"}),
        { text: "[](<> ''')\n", html: "[](<> ''')\n" }
      )
    }
  )

  await t.test(
    'should not escape unneeded characters in a `destinationLiteral`',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: 'a b![c](d*e_f[g_h`i', children: []}),
        { text: '[](<a b![c](d*e_f[g_h`i>)', html: '[](<a b![c](d*e_f[g_h`i>)' }
      )
    }
  )

  await t.test(
    'should not escape unneeded characters in a `destinationRaw`',
    async function () {
      assert.deepEqual(
        to({type: 'link', url: 'a![b](c*d_e[f_g`h<i</j', children: []}),
        { text: '[](a![b](c*d_e[f_g`h<i</j)', html: '[](a![b](c*d_e[f_g`h<i</j)' }
      )
    }
  )

  await t.test(
    'should not escape unneeded characters in a `title` (double quotes)',
    async function () {
      assert.deepEqual(
        to({
          type: 'link',
          url: '#',
          title: 'a![b](c*d_e[f_g`h<i</j',
          children: []
        }),
        { text: '[](# "a![b](c*d_e[f_g`h<i</j")', html: '[](# "a![b](c*d_e[f_g`h<i</j")' }
      )
    }
  )

  await t.test(
    'should not escape unneeded characters in a `title` (single quotes)',
    async function () {
      assert.deepEqual(
        to(
          {
            type: 'link',
            url: '#',
            title: 'a![b](c*d_e[f_g`h<i</j',
            children: []
          },
          {quote: "'"}
        ),
        { text: "[](# 'a![b](c*d_e[f_g`h<i</j')\n", html: "[](# 'a![b](c*d_e[f_g`h<i</j')\n" }
      )
    }
  )

  await t.test(
    'should throw on when given an incorrect `quote`',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles `quote` being wrong.
        to({type: 'link', title: 'b'}, {quote: '.'})
      }, /Cannot serialize title with `\.` for `options\.quote`, expected `"`, or `'`/)
    }
  )
})

test('linkReference', async function (t) {
  await t.test(
    'should support a link reference (nonsensical)',
    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `children`, `referenceType`, `identifier` missing.
        to({type: 'linkReference'}),

        {
          html: '[][]',
          text: '[][]'
        }
      )
    }
  )

  await t.test('should support `children`', async function () {
    assert.deepEqual(
      // @ts-expect-error: check how the runtime handles `referenceType`, `identifier` missing.
      to({type: 'linkReference', children: [{type: 'text', value: 'a'}]}),
      {
        html: '[a][]',
        text: '[a][]'
      }
    )
  })

  await t.test(
    'should support an `identifier` (nonsensical)',
    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({type: 'linkReference', identifier: 'a', children: []}),
        {
          html: '[][a]',
          text: '[][a]'
        }
      )
    }
  )

  await t.test('should support a `label` (nonsensical)', async function () {
    assert.deepEqual(
      // @ts-expect-error: check how the runtime handles `children`, `referenceType`, `identifier` missing.
      to({type: 'linkReference', label: 'a'}),
      {
        html: '[][a]',
        text: '[][a]'
      }
    )
  })

  await t.test('should support `referenceType: "shortcut"`', async function () {
    assert.deepEqual(
      to({
        type: 'linkReference',
        children: [{type: 'text', value: 'A'}],
        identifier: 'A',
        referenceType: 'shortcut'
      }),
      {
        html: '[A]',
        text: '[A]'
      }
    )
  })

  await t.test(
    'should support `referenceType: "collapsed"`',
    async function () {
      assert.deepEqual(
        to({
          type: 'linkReference',
          children: [{type: 'text', value: 'A'}],
          label: 'A',
          identifier: 'a',
          referenceType: 'collapsed'
        }),
        {
          html: '[A][]',
          text: '[A][]'
        }
      )
    }
  )

  await t.test(
    'should support `referenceType: "full"` (default)',
    async function () {
      assert.deepEqual(
        to({
          type: 'linkReference',
          children: [{type: 'text', value: 'A'}],
          label: 'A',
          identifier: 'a',
          referenceType: 'full'
        }),
        {
          html: '[A][A]',
          text: '[A][A]'
        }
      )
    }
  )

  await t.test('should prefer label over identifier', async function () {
    assert.deepEqual(
      to({
        type: 'linkReference',
        children: [{type: 'text', value: '&'}],
        label: '&',
        identifier: '&amp;',
        referenceType: 'full'
      }),
      {
        html: '[&][&]',
        text: '[&][&]'
      }
    )
  })

  await t.test('should decode `identifier` if w/o `label`', async function () {
    assert.deepEqual(
      to({
        type: 'linkReference',
        children: [{type: 'text', value: '&'}],
        identifier: '&amp;',
        referenceType: 'full'
      }),
      {
        html: '[&][&]',
        text: '[&][&]'
      }
    )
  })

  await t.test(
    'should support incorrect character references 1 ',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [
            {
              type: 'linkReference',
              children: [{type: 'text', value: '&a;'}],
              identifier: '&b;',
              referenceType: 'full'
            }
          ]
        }),
        {
          html: '[&a;][&b;]',
          text: '[&a;][&b;]'
        }
      )
    }
  )

  await t.test(
    'should not escape unneeded characters in a `reference`',
    async function () {
      assert.deepEqual(
        to({
          type: 'linkReference',
          identifier: 'a![b](c*d_e[f_g`h<i</j',
          referenceType: 'full',
          children: []
        }),
        {
          html: '[][a![b](c*d_e[f_g`h<i</j]',
          text: '[][a![b](c*d_e[f_g`h<i</j]'
        }
      )
    }
  )

  await t.test(
    'should unescape `identifier` if w/o `label`',
    async function () {
      assert.deepEqual(
        to({
          type: 'linkReference',
          children: [{type: 'text', value: '+'}],
          identifier: '\\+',
          referenceType: 'full'
        }),
        {
          html: '[+][+]',
          text: '[+][+]'
        }
      )
    }
  )

  await t.test(
    'should use a collapsed reference if w/o `referenceType` and the label matches the reference',
    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({
          type: 'linkReference',
          children: [{type: 'text', value: 'a'}],
          label: 'a',
          identifier: 'a'
        }),
        {
          html: '[a][]',
          text: '[a][]'
        }
      )
    }
  )

  await t.test(
    'should use a full reference if w/o `referenceType` and the label does not match the reference 2',
    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `referenceType` missing.
        to({
          type: 'linkReference',
          children: [{type: 'text', value: 'a'}],
          label: 'b',
          identifier: 'b'
        }),
        {
          html: '[a][b]',
          text: '[a][b]'
        }
      )
    }
  )

  await t.test(
    'should use a full reference if w/o `referenceType` and the label does not match the reference 3',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        {
          html: '[a][](b)',
          text: '[a][](b)'
        }
      )
    }
  )
})

test('list', async function (t) {
  await t.test('should support an empty list', async function () {
    // @ts-expect-error: check how the runtime handles `children` missing.
    assert.deepEqual(to({type: 'list'}), {
      html: '',
      text: ''
    })
  })

  await t.test('should support a list w/ an item', async function () {
    assert.deepEqual(
      // @ts-expect-error: check how the runtime handles `children` in item missing.
      to({type: 'list', children: [{type: 'listItem'}]}),
      {
        html: '•',
        text: '•'
      }
    )
  })

  await t.test('should support a list w/ items', async function () {
    assert.deepEqual(
      to({
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
      }),
      {
        html: '• a\n\n• ***\n\n• b',
        text: '• a\n\n• ***\n\n• b'
      }
    )
  })

  await t.test(
    'should not use blank lines between items for lists w/ `spread: false`',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        {
          html: '• a\n• ***',
          text: '• a\n• ***'
        }
      )
    }
  )

  await t.test(
    'should support a list w/ `spread: false`, w/ a spread item',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        {
          html: '• a\n\n  b\n• ***',
          text: '• a\n\n  b\n• ***'
        }
      )
    }
  )

  await t.test(
    'should support a list w/ `ordered` and an empty item',
    async function () {
      assert.deepEqual(
        to({
          type: 'list',
          ordered: true,
          children: [{type: 'listItem', children: []}]
        }),
        {
          html: '1.',
          text: '1.'
        }
      )
    }
  )

  await t.test('should support a list w/ `ordered`', async function () {
    assert.deepEqual(
      to({
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
      }),
      {
        html: '1. a\n\n2. ***\n\n3. b',
        text: '1. a\n\n2. ***\n\n3. b'
      }
    )
  })

  await t.test(
    'should support a list w/ `ordered` and `spread: false`',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        {
          html: '1. a\n2. ***\n3. b',
          text: '1. a\n2. ***\n3. b'
        }
      )
    }
  )

  await t.test(
    'should support a list w/ `ordered` when `incrementListMarker: false`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '1. a\n1. ***\n1. b',
          text: '1. a\n1. ***\n1. b'
        }
      )
    }
  )

  await t.test(
    'should support a list w/ `ordered` and `start`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '0. a\n\n1. ***',
          text: '0. a\n\n1. ***'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent `listItemIndent: "mixed"` and a tight list (1)',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '• a\n  b\n• c\n  d',
          text: '• a\n  b\n• c\n  d'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent `listItemIndent: "mixed"` and a tight list (2)',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '•   a\n    b\n\n•   c\n    d',
          text: '•   a\n    b\n\n•   c\n    d'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent for items 9 and 10 when `listItemIndent: "one"`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '9. a\n   b\n10. c\n    d',
          text: '9. a\n   b\n10. c\n    d'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent for items 99 and 100 when `listItemIndent: "one"`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '99. a\n    b\n100. c\n     d',
          text: '99. a\n    b\n100. c\n     d'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent for items 999 and 1000 when `listItemIndent: "one"`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '999. a\n     b\n1000. c\n      d',
          text: '999. a\n     b\n1000. c\n      d'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent for items 9 and 10 when `listItemIndent: "tab"`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '9.  a\n    b\n10. c\n    d',
          text: '9.  a\n    b\n10. c\n    d'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent for items 99 and 100 when `listItemIndent: "tab"`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '99. a\n    b\n100.    c\n        d',
          text: '99. a\n    b\n100.    c\n        d'
        }
      )
    }
  )

  await t.test(
    'should support a correct prefix and indent for items 999 and 1000 when `listItemIndent: "tab"`',
    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '999.    a\n        b\n1000.   c\n        d',
          text: '999.    a\n        b\n1000.   c\n        d'
        }
      )
    }
  )
})

test('listItem', async function (t) {
  await t.test('should support a list item', async function () {
    // @ts-expect-error: check how the runtime handles `children` missing.
    assert.deepEqual(to({type: 'listItem'}), {
      html: '•',
      text: '•'
    })
  })

  await t.test(
    'should serialize an item w/ a plus as bullet when `bullet: "+"`',

    async function () {
      assert.deepEqual(
        to({type: 'listItem', children: []}, {bullet: '+'}),

        {
          html: '+',
          text: '+'
        }
      )
    }
  )

  await t.test(
    'should throw on an incorrect bullet',

    async function () {
      assert.throws(function () {
        to(
          {type: 'listItem', children: []},
          {
            // @ts-expect-error: check how the runtime handles `bullet` being wrong.
            bullet: '.'
          }
        )
      }, /Cannot serialize items with `\.` for `options\.bullet`, expected `\*`, `\•`, `\+`, or `-`/)
    }
  )

  await t.test(
    'should support a list item w/ a child',

    async function () {
      assert.deepEqual(
        to({
          type: 'listItem',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
          ]
        }),

        {
          html: '• a',
          text: '• a'
        }
      )
    }
  )

  await t.test(
    'should support a list item w/ children',

    async function () {
      assert.deepEqual(
        to({
          type: 'listItem',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'thematicBreak'},
            {type: 'paragraph', children: [{type: 'text', value: 'b'}]}
          ]
        }),
        {
          html: '• a\n\n  ***\n\n  b',
          text: '• a\n\n  ***\n\n  b'
        }
      )
    }
  )

  await t.test(
    'should use one space after the bullet for `listItemIndent: "one"`',

    async function () {
      assert.deepEqual(
        to(
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
              {type: 'thematicBreak'}
            ]
          },
          {listItemIndent: 'one'}
        ),
        {
          html: '• a\n\n  ***',
          text: '• a\n\n  ***'
        }
      )
    }
  )

  await t.test(
    'should use one space after the bullet for `listItemIndent: "mixed"`, when the item is not spread',

    async function () {
      assert.deepEqual(
        to(
          {
            type: 'listItem',
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]}
            ]
          },
          {listItemIndent: 'mixed'}
        ),

        {
          html: '• a',
          text: '• a'
        }
      )
    }
  )

  await t.test(
    'should use a tab stop of spaces after the bullet for `listItemIndent: "mixed"`, when the item is spread',

    async function () {
      assert.deepEqual(
        to(
          {
            type: 'listItem',
            spread: true,
            children: [
              {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
              {type: 'thematicBreak'}
            ]
          },
          {listItemIndent: 'mixed'}
        ),
        {
          html: '•   a\n\n    ***',
          text: '•   a\n\n    ***'
        }
      )
    }
  )

  await t.test(
    'should throw on an incorrect `listItemIndent`',

    async function () {
      assert.throws(function () {
        to(
          {type: 'listItem', children: []},
          {
            // @ts-expect-error: check how the runtime handles `listItemIndent` being wrong.
            listItemIndent: 'x'
          }
        )
      }, /Cannot serialize items with `x` for `options\.listItemIndent`, expected `tab`, `one`, or `mixed`/)
    }
  )

  await t.test(
    'should not use blank lines between child blocks for items w/ `spread: false`',

    async function () {
      assert.deepEqual(
        to({
          type: 'listItem',
          spread: false,
          children: [
            {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
            {type: 'thematicBreak'}
          ]
        }),

        {
          html: '• a\n  ***',
          text: '• a\n  ***'
        }
      )
    }
  )

  await t.test('should support `bulletOther`', async function () {
    assert.deepEqual(
      to(createList(createList(createList())), {bulletOther: '+'}),

      {
        html: '• • •',
        text: '• • •'
      }
    )
  })

  await t.test(
    'should default to an `bulletOther` different from `bullet` (1)',

    async function () {
      assert.deepEqual(
        to(createList(createList(createList())), {bullet: '-'}),

        {
          html: '- - •',
          text: '- - •'
        }
      )
    }
  )

  await t.test(
    'should default to an `bulletOther` different from `bullet` (2)',

    async function () {
      assert.deepEqual(
        to(createList(createList(createList())), {bullet: '*'}),

        {
          html: '* * -',
          text: '* * -'
        }
      )
    }
  )

  await t.test(
    'should throw when given an incorrect `bulletOther`',

    async function () {
      assert.throws(function () {
        to(createList(createList(createList())), {
          // @ts-expect-error: check how the runtime handles `bulletOther` being wrong.
          bulletOther: '?'
        })
      }, /Cannot serialize items with `\?` for `options\.bulletOther`, expected/)
    }
  )

  await t.test(
    'should throw when an `bulletOther` is given deepEqual to `bullet`',

    async function () {
      assert.throws(function () {
        to(createList(createList(createList())), {
          bullet: '-',
          bulletOther: '-'
        })
      }, /Expected `bullet` \(`-`\) and `bulletOther` \(`-`\) to be different/)
    }
  )

  await t.test(
    'should use a different bullet than a thematic rule marker, if the first child of a list item is a thematic break (1)',

    async function () {
      assert.deepEqual(
        to({
          type: 'list',
          children: [{type: 'listItem', children: [{type: 'thematicBreak'}]}]
        }),
        {
          html: '• ***',
          text: '• ***'
        }
      )
    }
  )

  await t.test(
    'should use a different bullet than a thematic rule marker, if the first child of a list item is a thematic break (2)',

    async function () {
      assert.deepEqual(
        to({
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
        }),
        {
          html: '• a\n\n• ***',
          text: '• a\n\n• ***'
        }
      )
    }
  )

  await t.test(
    'should *not* use a different bullet for an empty list item in two lists',

    async function () {
      assert.deepEqual(to(createList(createList())), {
        html: '• •',
        text: '• •'
      })
    }
  )

  await t.test(
    'should use a different bullet for an empty list item in three lists (1)',

    async function () {
      assert.deepEqual(to(createList(createList(createList()))), {
        html: '• • •',
        text: '• • •'
      })
    }
  )

  await t.test(
    'should use a different bullet for an empty list item in three lists (2)',

    async function () {
      assert.deepEqual(
        to({
          type: 'list',
          children: [
            {type: 'listItem', children: []},
            {type: 'listItem', children: [createList(createList())]}
          ]
        }),
        {
          html: '•\n\n• • •',
          text: '•\n\n• • •'
        }
      )
    }
  )

  await t.test(
    'should not use a different bullet for an empty list item in three lists if `bullet` isn’t a thematic rule marker',

    async function () {
      assert.deepEqual(
        to(createList(createList(createList())), {bullet: '+'}),
        {
          html: '+ + +',
          text: '+ + +'
        }
      )
    }
  )

  await t.test(
    'should use a different bullet for an empty list item in four lists',

    async function () {
      assert.deepEqual(to(createList(createList(createList(createList())))), {
        html: '• • • •',
        text: '• • • •'
      })
    }
  )

  await t.test(
    'should use a different bullet for an empty list item in five lists',

    async function () {
      assert.deepEqual(
        to(createList(createList(createList(createList(createList()))))),
        {
          html: '• • • • •',
          text: '• • • • •'
        }
      )
    }
  )

  await t.test(
    'should not use a different bullet for an empty list item at non-head in two lists',

    async function () {
      assert.deepEqual(
        to(
          createList(
            createList([
              createList({
                type: 'paragraph',
                children: [{type: 'text', value: 'a'}]
              }),
              createList()
            ])
          )
        ),
        {
          html: '• • • a\n\n    •',
          text: '• • • a\n\n    •'
        }
      )
    }
  )

  await t.test(
    'should support `bulletOrdered`',

    async function () {
      assert.deepEqual(
        to(
          {
            type: 'list',
            ordered: true,
            children: [{type: 'listItem', children: []}]
          },
          {bulletOrdered: ')'}
        ),
        {
          html: '1)',
          text: '1)'
        }
      )
    }
  )

  await t.test(
    'should throw on a `bulletOrdered` that is invalid',

    async function () {
      assert.throws(function () {
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
      }, /Cannot serialize items with `~` for `options.bulletOrdered`/)
    }
  )

  await t.test(
    'should use a different bullet for adjacent ordered lists',

    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '1)\n\n1.',
          text: '1)\n\n1.'
        }
      )
    }
  )
})

test('paragraph', async function (t) {
  await t.test('should support an empty paragraph', async function () {
    assert.deepEqual(
      // @ts-expect-error: check how the runtime handles `children` missing.
      to({type: 'paragraph'}),
      {
        html: '',
        text: ''
      }
    )
  })

  await t.test('should support a paragraph', async function () {
    assert.deepEqual(
      to({type: 'paragraph', children: [{type: 'text', value: 'a\nb'}]}),

      {
        html: 'a\nb',
        text: 'a\nb'
      }
    )
  })

  await t.test(
    'should encode spaces at the start of paragraphs',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '  a'}]}),

        {
          html: '  a',
          text: '  a'
        }
      )
    }
  )

  await t.test(
    'should encode spaces at the end of paragraphs',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: 'a  '}]}),

        {
          html: 'a  ',
          text: 'a  '
        }
      )
    }
  )

  await t.test(
    'should encode tabs at the start of paragraphs',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '\t\ta'}]}),

        {
          html: '\t\ta',
          text: '\t\ta'
        }
      )
    }
  )

  await t.test(
    'should encode tabs at the end of paragraphs',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: 'a\t\t'}]}),
        {
          html: 'a\t\t',
          text: 'a\t\t'
        }
      )
    }
  )

  await t.test(
    'should encode spaces around line endings in paragraphs (1)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: 'a  \n  b'}]}),
        {
          html: 'a  \n  b',
          text: 'a  \n  b'
        }
      )
    }
  )

  await t.test(
    'should encode spaces around line endings in paragraphs (2)',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: 'a\t\t\n\t\tb'}]
        }),
        {
          html: 'a\t\t\n\t\tb',
          text: 'a\t\t\n\t\tb'
        }
      )
    }
  )
})

test('strong', async function (t) {
  await t.test(
    'should support an empty strong',

    async function () {
      assert.deepEqual(
        // @ts-expect-error: check how the runtime handles `children` missing.
        to({type: 'strong'}),
        {
          html: '****',
          text: '****'
        }
      )
    }
  )

  await t.test(
    'should throw on when given an incorrect `strong`',
    async function () {
      assert.throws(function () {
        to(
          {type: 'strong', children: []},
          {
            // @ts-expect-error: check how the runtime handles `strong` being wrong.
            strong: '?'
          }
        )
      }, /Cannot serialize strong with `\?` for `options\.strong`, expected `\*`, or `_`/)
    }
  )

  await t.test('should support a strong w/ children', async function () {
    assert.deepEqual(
      to({type: 'strong', children: [{type: 'text', value: 'a'}]}),

      {
        html: '**a**',
        text: '**a**'
      }
    )
  })

  await t.test(
    'should support a strong w/ underscores when `emphasis: "_"`',
    async function () {
      assert.deepEqual(
        to(
          {type: 'strong', children: [{type: 'text', value: 'a'}]},
          {strong: '_'}
        ),

        {
          html: '__a__',
          text: '__a__'
        }
      )
    }
  )
})

test('text', async function (t) {
  await t.test('should not be first slash', async function () {
    assert.deepEqual(
      to({
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: '[[00 Свойства - знание]] '
          }
        ]
      }),
      {
        html: '00 Свойства - знание ',
        text: '00 Свойства - знание '
      }
    )
  })
  await t.test('should support a void text', async function () {
    // @ts-expect-error: check how the runtime handles `value` missing.
    assert.deepEqual(to({type: 'text'}), {
      html: '',
      text: ''
    })
  })

  await t.test('should support an empty text', async function () {
    assert.deepEqual(to({type: 'text', value: ''}), {
      html: '',
      text: ''
    })
  })

  await t.test('should support text', async function () {
    assert.deepEqual(to({type: 'text', value: 'a\nb'}), {
      html: 'a\nb',
      text: 'a\nb'
    })
  })
})

test('thematic break', async function (t) {
  await t.test('should support a thematic break', async function () {
    assert.deepEqual(to({type: 'thematicBreak'}), {
      html: '***',
      text: '***'
    })
  })

  await t.test(
    'should support a thematic break w/ dashes when `rule: "-"`',
    async function () {
      assert.deepEqual(to({type: 'thematicBreak'}, {rule: '-'}), {
        html: '---',
        text: '---'
      })
    }
  )

  await t.test(
    'should support a thematic break w/ underscores when `rule: "_"`',
    async function () {
      assert.deepEqual(to({type: 'thematicBreak'}, {rule: '_'}), {
        html: '___',
        text: '___'
      })
    }
  )

  await t.test(
    'should throw on when given an incorrect `rule`',
    async function () {
      assert.throws(function () {
        to(
          {type: 'thematicBreak'},
          {
            // @ts-expect-error: check how the runtime handles `rule` being wrong.
            rule: '.'
          }
        )
      }, /Cannot serialize rules with `.` for `options\.rule`, expected `\*`, `-`, or `_`/)
    }
  )

  await t.test(
    'should support a thematic break w/ more repetitions w/ `ruleRepetition`',
    async function () {
      assert.deepEqual(to({type: 'thematicBreak'}, {ruleRepetition: 5}), {
        html: '*****',
        text: '*****'
      })
    }
  )

  await t.test(
    'should throw on when given an incorrect `ruleRepetition`',
    async function () {
      assert.throws(function () {
        to({type: 'thematicBreak'}, {ruleRepetition: 2})
      }, /Cannot serialize rules with repetition `2` for `options\.ruleRepetition`, expected `3` or more/)
    }
  )

  await t.test(
    'should support a thematic break w/ spaces w/ `ruleSpaces`',
    async function () {
      assert.deepEqual(to({type: 'thematicBreak'}, {ruleSpaces: true}), {
        html: '* * *',
        text: '* * *'
      })
    }
  )
})

/**
 * FIXME: Цитаты
 */
test('escape', { skip: true }, async function (t) {
  await t.test(
    'should escape what would otherwise be a block quote in a paragraph',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: '> a\n> b\nc >'}]
        }),
        {
          html:
            '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a b</blockquote>' +
            'c >',
          text: '> a\n> b\nc >'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a block quote in a list item',
    async function () {
      assert.deepEqual(
        to({
          type: 'listItem',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: '> a\n> b'}]}
          ]
        }),
        {
          html: '• > a\n  > b',
          text: '• > a\n  > b'
        }
      )
    }
  )

  /**
   * FIXME: Цитаты
   */
  await t.test(
    'should escape what would otherwise be a block quote in a block quote',
    { skip: true },
    async function () {
      assert.deepEqual(
        to({
          type: 'blockquote',
          children: [
            {type: 'paragraph', children: [{type: 'text', value: '> a\n> b'}]}
          ]
        }),
        {
          html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">> a > b</blockquote>',
          text: '> > a\n> > b'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a break',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: 'a\\\nb'}]}),
        {
          html: 'a\\\nb',
          text: 'a\\\nb'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a named character reference',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '&amp'}]}),
        {
          html: '&amp',
          text: '&amp'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a numeric character reference',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '&#9;'}]}),
        {
          html: '&#9;',
          text: '&#9;'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a character escape',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: 'a\\+b'}]}),
        {
          html: 'a\\\\+b',
          text: 'a\\\\+b'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a character escape of an autolink',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a\\'},
            {
              type: 'link',
              children: [{type: 'text', value: 'https://a.b'}],
              url: 'https://a.b'
            }
          ]
        }),
        {
          html: 'a\\<https://a.b>',
          text: 'a\\<https://a.b>'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be code (flow)',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: '```js\n```'}]
        }),
        {
          html: '```js\n```',
          text: '```js\n```'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a definition',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '[a]: b'}]}),
        {
          html: '[a]: b',
          text: '[a]: b'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be emphasis (asterisk)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '*a*'}]}),
        {
          html: '*a*',
          text: '*a*'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be emphasis (underscore)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '_a_'}]}),
        {
          html: '_a_',
          text: '_a_'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a heading (atx)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '# a'}]}),
        {
          html: '# a',
          text: '# a'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a heading (setext, equals)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: 'a\n='}]}),
        {
          html: 'a\n=',
          text: 'a\n='
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a heading (setext, dash)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: 'a\n-'}]}),
        {
          html: 'a\n-',
          text: 'a\n-'
        }
      )
    }
  )

  await t.test('should escape what would otherwise be html', async function () {
    assert.deepEqual(
      to({type: 'paragraph', children: [{type: 'text', value: '<a\nb>'}]}),
      {
        html: '<a\nb>',
        text: '<a\nb>'
      }
    )
  })

  await t.test(
    'should escape what would otherwise be code (text)',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: 'a `b`\n`c` d'}]
        }),
        {
          html: 'a `b`\n`c` d',
          text: 'a `b`\n`c` d'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise turn a link into an image',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [
            {type: 'text', value: '!'},
            {
              type: 'link',
              children: [{type: 'text', value: 'a'}],
              url: 'b'
            }
          ]
        }),
        {
          html: '![a](b)',
          text: '![a](b)'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise turn a link reference into an image reference',
    async function () {
      assert.deepEqual(
        to({
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
        }),
        {
          html: '![a][b]',
          text: '![a][b]'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be an image (reference)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '![a][b]'}]}),
        {
          html: '![a][b]',
          text: '![a][b]'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be an image (resource)',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: '![](a.jpg)'}]
        }),
        {
          html: '![](a.jpg)',
          text: '![](a.jpg)'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a link (reference)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '[a][b]'}]}),
        {
          html: '[a][b]',
          text: '[a][b]'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a link (resource)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '[](a.jpg)'}]}),
        {
          html: '[](a.jpg)',
          text: '[](a.jpg)'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a list item (plus)',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '+ a\n+ b'}]}),
        {
          html: '+ a\n+ b',
          text: '+ a\n+ b'
        }
      )
    }
  )

  await t.test(
    'should not escape `+` when not followed by whitespace',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '+a'}]}),
        {
          html: '+a',
          text: '+a'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a list item (dash)',

    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '- a\n- b'}]}),
        {
          html: '- a\n- b',
          text: '- a\n- b'
        }
      )
    }
  )

  await t.test(
    'should not escape `-` when not followed by whitespace',
    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '-a'}]}),
        {
          html: '-a',
          text: '-a'
        }
      )
    }
  )

  await t.test(
    'should escape `-` when followed by another `-` (as it looks like a thematic break, setext underline)',

    async function () {
      assert.deepEqual(
        to({type: 'paragraph', children: [{type: 'text', value: '--a'}]}),
        {
          html: '--a',
          text: '--a'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a list item (asterisk)',

    async function () {
      // Note: these are in titles, because the `*` case here is about flow nodes,
      // not phrasing (emphasis).
      assert.deepEqual(
        to({
          type: 'definition',
          identifier: 'x',
          url: 'y',
          title: 'a\n* b\n* c'
        }),
        {
          html: '[x]: y "a\n* b\n* c"',
          text: '[x]: y "a\n* b\n* c"'
        }
      )
    }
  )

  await t.test(
    'should not escape `*` when not followed by whitespace',
    async function () {
      assert.deepEqual(
        to({type: 'definition', identifier: 'x', url: 'y', title: 'a\n*b'}),
        {
          html: '[x]: y "a\n*b"',
          text: '[x]: y "a\n*b"'
        }
      )
    }
  )

  await t.test(
    'should escape `*` when followed by another `*` (as it looks like a thematic break)',

    async function () {
      assert.deepEqual(
        to({type: 'definition', identifier: 'x', url: 'y', title: 'a\n**b'}),
        {
          html: '[x]: y "a\n**b"',
          text: '[x]: y "a\n**b"'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a list item (dot)',

    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: '1. a\n2. b'}]
        }),
        {
          html: '1. a\n2. b',
          text: '1. a\n2. b'
        }
      )
    }
  )

  await t.test(
    'should escape what would otherwise be a list item (paren)',

    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: '1) a\n2) b'}]
        }),
        {
          html: '1) a\n2) b',
          text: '1) a\n2) b'
        }
      )
    }
  )

  await t.test(
    'should not escape what can’t be a list (dot)',
    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [{type: 'text', value: '1.2.3. asd'}]
        }),
        {
          html: '1.2.3. asd',
          text: '1.2.3. asd'
        }
      )
    }
  )

  await t.test('should support options in extensions', async function () {
    assert.deepEqual(
      to(
        {
          type: 'root',
          children: [
            {type: 'definition', url: '', label: 'a', identifier: 'a'},
            {type: 'definition', url: '', label: 'b', identifier: 'b'}
          ]
        },
        {extensions: [{tightDefinitions: true}]}
      ),
      {
        html: '[a]: <>\n[b]: <>',
        text: '[a]: <>\n[b]: <>'
      }
    )
  })

  await t.test(
    'should support empty `join`, `handlers`, `extensions` in an extension (coverage)',

    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '__&#x61;__',
          text: '__&#x61;__'
        }
      )
    }
  )

  await t.test(
    'should make `join` from options highest priority',

    async function () {
      assert.deepEqual(
        to(
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
        ),
        {
          html: '1. foo\n   • bar',
          text: '1. foo\n   • bar'
        }
      )
    }
  )

  await t.test(
    'should prefer main options over extension options',
    async function () {
      assert.deepEqual(
        to(
          {
            type: 'root',
            children: [{type: 'strong', children: [{type: 'text', value: 'a'}]}]
          },
          {strong: '*', extensions: [{strong: '_'}]}
        ),
        {
          html: '**a**',
          text: '**a**'
        }
      )
    }
  )

  await t.test(
    'should prefer extension options over subextension options',
    async function () {
      assert.deepEqual(
        to(
          {
            type: 'root',
            children: [{type: 'strong', children: [{type: 'text', value: 'a'}]}]
          },
          {extensions: [{strong: '*', extensions: [{strong: '_'}]}]}
        ),
        {
          html: '**a**',
          text: '**a**'
        }
      )
    }
  )

  await t.test(
    'should handle literal backslashes properly when before constructs (1)',

    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [
            {type: 'text', value: '\\'},
            {type: 'emphasis', children: [{type: 'text', value: 'a'}]}
          ]
        }),
        {
          html: '\\*a*',
          text: '\\*a*'
        }
      )
    }
  )

  await t.test(
    'should handle literal backslashes properly when before constructs (2)',

    async function () {
      assert.deepEqual(
        to({
          type: 'paragraph',
          children: [
            {type: 'text', value: '\\\\'},
            {type: 'emphasis', children: [{type: 'text', value: 'a'}]}
          ]
        }),
        {
          html: '\\\\\\*a*',
          text: '\\\\\\*a*'
        }
      )
    }
  )
})

/**
 * NOTE: Irrelevant case for telegram
 */
test('position (output)', async function (t) {
  await t.test('should track output positions (1)', { skip: true }, async function () {
    assert.deepEqual(
      to(
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
              assert.deepEqual(
                {now, lineShift},
                {now: {line: 3, column: 3}, lineShift: 2}
              )
              return 'x'
            }
          }
        }
      ),
      {
        html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a  x</blockquote>',
        text: '> a\n>\n> x'
      }
    )
  })

  /**
   * NOTE: Irrelevant case for telegram
   */
  await t.test('should track output positions (2)', { skip: true }, async function () {
    assert.deepEqual(
      to(
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'a'},
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
              assert.deepEqual(
                {now, lineShift},
                {now: {line: 2, column: 4}, lineShift: 2}
              )
              return 'b'
            }
          }
        }
      ),
      {
        html: '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">a *b*</blockquote>',
        text: '> a\n> *b*'
      }
    )
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
