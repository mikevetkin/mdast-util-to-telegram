/**
 * Turn an mdast syntax tree into telegram message.
 *
 * @param {Nodes} tree
 *   Tree to serialize.
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {ReturnTypeToTelegramFunction}
 *   Serialized markdown representing `tree`.
 */
export function toTelegram(tree: Nodes, options?: Options | null | undefined): ReturnTypeToTelegramFunction;
import type { Nodes } from 'mdast';
import type { Options } from './types.js';
import type { ReturnTypeToTelegramFunction } from './types.js';
//# sourceMappingURL=index.d.ts.map