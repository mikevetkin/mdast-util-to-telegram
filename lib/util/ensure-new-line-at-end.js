/**
 * Ensures that a string ends with a newline character (`\n`). If the string does not
 * already end with a newline (`\n`, code 10) or carriage return (`\r`, code 13),
 * a newline character is appended to the end.
 *
 * @param {string} str - The input string to check and modify.
 * @returns {string} - Returns the string guaranteed to end with a newline character.
 */
export function ensureNewlineAtEnd(str) {
  if (
    str &&
    str.charCodeAt(str.length - 1) !== 10 && // \n
    str.charCodeAt(str.length - 1) !== 13   // \r
  ) {
    str += '\n';
  }
  return str;
}
