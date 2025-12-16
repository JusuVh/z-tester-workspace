import { AfterViewInit, Component, computed, ElementRef, inject, signal, WritableSignal } from '@angular/core';
import { explicitEffect } from '@datanumia/etincelle/shared';

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
}

@Component({
  selector: 'app-editor',
  template: ``,
  styleUrl: './editor.scss',
  host: {
    class: 'formula-editor',
    '[attr.contenteditable]': '""',
    '(input)': 'onInput()',
    '(paste)': 'onPaste($event)',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeyDown($event)',
    '[attr.data-placeholder]': '"Type a formula like: #1 + #2 * 2"',
  },
  exportAs: 'AppEditor',
  imports: [],
})
export class Editor implements AfterViewInit {
  private readonly _elementRef = inject(ElementRef);

  plainText = signal('');

  contentArray = computed(() =>
    this.plainText()
      .replaceAll(/\s+/g, ' ')
      .split(/(#\d+)/g)
      .filter(part => part.length > 0),
  );
  detectedIds = computed<Array<string>>(() => this.plainText().match(/#\d+/g) || []);

  idLabels: Record<string, WritableSignal<string>> = {};

  private readonly _cursorPosition = signal(0);

  constructor() {
    explicitEffect([this.detectedIds], ([ids]) => {
      ids.forEach(id => {
        if (!this.idLabels[id]) {
          this.idLabels[id] = signal('');
        }
      });

      Object.keys(this.idLabels).forEach(key => {
        if (!ids.includes(key)) delete this.idLabels[key];
      });
    });
  }

  updateLabel(token: string, label: string) {
    this.idLabels[token].set(label);
    this._elementRef.nativeElement.querySelectorAll(`[data-token="${token}"]`).forEach((el: HTMLElement) => {
      el.dataset['label'] = ` : ${label}`;
    });
  }

  ngAfterViewInit() {
    // Initialize with some content
    //const initialText = '#123 + #456 * 2 - #789';
    //this._elementRef.nativeElement.textContent = initialText;
    // this._cursorPosition.set(initialText.length);
    this._updateContent();
    this._restoreCursorPosition();
  }

  onInput() {
    this._saveCursorPosition();
    this._updateContent();
    this._restoreCursorPosition();
  }

  onPaste(event: ClipboardEvent) {
    pasteHandler(event);
    this.onInput();
  }

  onKeyDown(event: KeyboardEvent) {
    keydownHandler(event);
  }

  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('id-token')) {
      const selection = globalThis.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  private _updateContent() {
    const text = this._extractPlainText();
    // Update DOM directly instead of using innerHTML binding
    this._elementRef.nativeElement.innerHTML = this.highlightFormula(text);

    // Update signals
    this.plainText.set(text);
  }

  private highlightFormula(text: string): string {
    if (!text) return '';
    return text.replaceAll(/#(\d+)/g, `<span class="id-token" contenteditable data-token="#$1">#$1</span>`);
  }

  private _extractPlainText(): string {
    return (this._elementRef.nativeElement.textContent || '').replaceAll(/\s+/g, ' ');
  }

  private _saveCursorPosition() {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Count characters up to cursor
    let position = 0;
    const walker = document.createTreeWalker(this._elementRef.nativeElement, NodeFilter.SHOW_TEXT);

    let node = walker.nextNode();
    while (node) {
      if (node === range.startContainer) {
        position += range.startOffset;
        break;
      }
      position += node.textContent?.length || 0;
      node = walker.nextNode();
    }

    this._cursorPosition.set(position);
  }

  private _restoreCursorPosition() {
    setTimeout(() => {
      const selection = globalThis.getSelection();
      if (!selection) return;

      let position = 0;
      const targetPosition = this._cursorPosition();

      const walker = document.createTreeWalker(this._elementRef.nativeElement, NodeFilter.SHOW_TEXT);

      let node = walker.nextNode();
      while (node) {
        const nodeLength = node.textContent?.length || 0;

        if (position + nodeLength >= targetPosition) {
          const offset = targetPosition - position;
          try {
            const range = document.createRange();
            const safeOffset = Math.min(offset, nodeLength);
            range.setStart(node, safeOffset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
          } catch (e) {
            console.error('Error restoring cursor:', e);
          }
        }

        position += nodeLength;
        node = walker.nextNode();
      }

      // Fallback: end of content
      const range = document.createRange();
      range.selectNodeContents(this._elementRef.nativeElement);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 0);
  }
}
