/** 转译 html */
export function escapeHTMLTags(str: string) {
  if (!str) return '';
  return str

    .replace(/(?!\\)&/g, '&amp;')
    .replace(/(?!\\)</g, '&lt;')
    .replace(/(?!\\)>/g, '&gt;')
    .replace(/(?!\\)"/g, '&quot;')
    .replace(/(?!\\)'/g, '&#39;');
}
