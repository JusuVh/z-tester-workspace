export function pasteHandler(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData('text/plain');
  if (!text) throw new Error('exit');

  // Remove all newlines and carriage returns
  const cleanText = text.replaceAll(/[\r\n]+/g, ' ');

  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) throw new Error('exit');

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const textNode = document.createTextNode(cleanText);
  range.insertNode(textNode);

  // Move cursor to end of inserted text
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function keydownHandler(event: KeyboardEvent) {
  // Prevent Enter key from creating new lines
  if (event.key === 'Enter') {
    event.preventDefault();
  }
}
