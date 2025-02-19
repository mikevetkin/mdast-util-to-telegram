/**
 *
 * @param {*} tree
 * @returns
 */

export const deletingProperties = (tree) => {
  if (!tree) return tree

  const childrenTree = tree.children

  if (
    childrenTree?.[0]?.type === 'thematicBreak' &&
    childrenTree?.[1]?.type === 'heading' &&
    childrenTree?.[1]?.depth === 2
  ) {
    return {...tree, children: childrenTree.slice(2)}
  }

  if (childrenTree?.[0]?.type === 'thematicBreak') {
    let firstThematicBreakIndex = -1
    let secondThematicBreakIndex = -1

    for (let i = 0; i < childrenTree.length; i++) {
      if (childrenTree?.[i]?.type === 'thematicBreak') {
        if (firstThematicBreakIndex === -1) {
          firstThematicBreakIndex = i
        } else {
          secondThematicBreakIndex = i
          break
        }
      }
    }

    if (firstThematicBreakIndex !== -1 && secondThematicBreakIndex !== -1) {
      const distance = secondThematicBreakIndex - firstThematicBreakIndex + 1

      return {...tree, children: childrenTree.slice(distance)}
    } else {
      console.log('Not found two thematicBreak in the array.')
    }
  }

  return tree
}
