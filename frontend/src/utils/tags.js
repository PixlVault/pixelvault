export const textToTags = (text) => text
    .replace("  ", "")
    .split(" ")
    .filter(v => v.startsWith('#'))
    .map(v => v.substring(1));

export default textToTags;