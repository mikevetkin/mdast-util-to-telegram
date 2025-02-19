/**
  * @param {object} content
  * @param {string} content.text
  * @param {string} content.html
  */
export const getTextAndHtmlForTelegram = ({ text, html }) => {
  const processedText = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    /**
     * @param {string} match
     * @param {string} label
     * @param {string} url
     */
    (match, label, url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return label;
      }
      return url ? `${label} (${url})` : label;
    }
  );

  const processedHtml = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, label, url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return label;
      }
      return url
        ? `<a class="text-entity-link" href="${url}" data-entity-type="MessageEntityTextUrl" dir="auto">${label}</a>`
        : label;
    }
  );

  return { text: processedText, html: processedHtml };
};
