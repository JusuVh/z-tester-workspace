export function pasteHandler(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData('text/plain');
  if (!text) return;

  // Remove all newlines and carriage returns
  const cleanText = text.replaceAll(/[\r\n]+/g, ' ');

  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return;

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

  // Allow navigation and editing keys
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Escape'];

  // Allow Ctrl/Cmd shortcuts (copy, paste, select all, etc.)
  if (event.ctrlKey || event.metaKey || allowedKeys.includes(event.key)) {
    return;
  }

  // Allow: digits, #, math operators, parentheses, and space
  const allowedChars = /^[0-9#+\-*/()., ]$/;

  if (event.key.length === 1 && !allowedChars.test(event.key)) {
    event.preventDefault();
  }
}

/**
 * Extract only the text nodes in the root Node, in order
 */
export function extractTextNodes(rootNode: Node): Array<Node> {
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);

  const nodes: Array<Node> = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }
  return nodes;
}

/**
 * Calculate cursor position as character offset from start in the HTML tree
 */
export function getCursorPosition(element: HTMLElement): number {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const textNodes = extractTextNodes(element);

  let position = 0;
  for (const node of textNodes) {
    if (node === range.startContainer) {
      position += range.startOffset;
      // Position found, exit for loop and save
      break;
    }
    position += node.textContent?.length || 0;
  }

  return position;
}

/**
 * Set cursor to target character position (used when the content changes)
 */
export function restoreCursorPosition(element: HTMLElement, targetPosition: number) {
  // Wait for browser to paint the new content before restoring cursor position
  requestAnimationFrame(() => {
    const selection = globalThis.getSelection();
    if (!selection) return;

    const textNodes = extractTextNodes(element);

    let position = 0;
    for (const node of textNodes) {
      const nodeLength = node.textContent?.length || 0;

      // Check if cursor belongs in this node
      if (position + nodeLength >= targetPosition) {
        const offset = Math.min(targetPosition - position, nodeLength);

        const range = document.createRange();
        range.setStart(node, offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        // Node found, exit for loop and retur
        return;
      }

      position += nodeLength;
    }

    // Fallback, no Node match target position
    placeCursorAtEnd(element, selection);
  });
}

/**
 * Place cursor at the end of the editor
 */
export function placeCursorAtEnd(element: HTMLElement, selection: Selection) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}
