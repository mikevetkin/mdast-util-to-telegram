/**
  * @param {object} content
  * @param {string} content.text
  * @param {string} content.html
  */
export const replaceBlockquotesWithTelegramStyle = ({ text, html }) => {
  const lines = text.split('\n');
  let result = '';
  let inQuote = false;

  lines.forEach(line => {
      if (line.startsWith('>')) {
          if (!inQuote) {
              result += '<blockquote class="blockquote" data-entity-type="MessageEntityBlockquote">\n';
              inQuote = true;
          }
          result += line.slice(1).trim() + '\n';
      } else {
          if (inQuote) {
              result += '</blockquote>\n';
              inQuote = false;
          }
          result += line + '\n';
      }
  });

  if (inQuote) {
      result += '</blockquote>\n';
  }

  return {
    text,
    html: result,
  };
};
