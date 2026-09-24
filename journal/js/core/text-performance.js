function isWhitespaceCode(code) {
  return code <= 0x20 ||
    code === 0x00a0 ||
    code === 0x1680 ||
    (code >= 0x2000 && code <= 0x200a) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000 ||
    code === 0xfeff;
}

export function hasNonEmptyText(value) {
  const text = String(value ?? "");
  for (let index = 0; index < text.length; index += 1) {
    if (!isWhitespaceCode(text.charCodeAt(index))) return true;
  }
  return false;
}

// Count words without String.match(), which allocates an array containing one
// item for every word. Large pasted documents can otherwise create substantial
// short-lived garbage twice for every counter update.
export function analyzeTextForCounter(value) {
  const text = String(value ?? "");
  if (!text.length) return { words: 0, tokens: 0 };

  let words = 0;
  let inWord = false;
  for (let index = 0; index < text.length; index += 1) {
    const whitespace = isWhitespaceCode(text.charCodeAt(index));
    if (whitespace) {
      inWord = false;
    } else if (!inWord) {
      words += 1;
      inWord = true;
    }
  }

  const roughByChars = Math.ceil(text.length / 4);
  const roughByWords = Math.ceil(words * 1.33);
  return {
    words,
    tokens: Math.max(1, Math.max(roughByChars, roughByWords)),
  };
}
