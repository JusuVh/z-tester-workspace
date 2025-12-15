import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, signal, WritableSignal } from '@angular/core';
import { explicitEffect } from '@datanumia/etincelle/shared';

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

@Component({
  selector: 'app-editor-token',
  template: ` {{ token() + (label() ? ': ' + label() : '') }} `,
  host: {
    class: 'editor-token id-token',
    '[attr.contenteditable]': 'true',
  },
})
export class EditorToken {
  token = input.required();
  label = input('');

  constructor() {
    effect(() => {
      console.log(this.token(), this.label());
    });
  }
}

@Component({
  selector: 'app-editor',
  template: `
    @for (content of contentArray(); let i = $index; track i) {
      @if (content.startsWith('#')) {
        <app-editor-token [token]="content" [label]="idLabels[content]()" />
      } @else {
        {{ content.trim() }}
      }
    }
  `,
  styleUrl: './editor.scss',
  host: {
    class: 'formula-editor',
    '[attr.contenteditable]': 'true',
    '(input)': 'onInput()',
    '(paste)': 'onPaste($event)',
    '(keydown)': 'onKeyDown($event)',
    '(click)': 'onClick($event)',
    '(drop)': 'onDrop($event)',
    '(dragover)': 'onDragOver($event)',
    '[attr.data-placeholder]': '"Type a formula like: #1 + #2 * 2"',
  },
  exportAs: 'AppEditor',
  imports: [EditorToken],
})
export class Editor implements AfterViewInit {
  _elementRef = inject(ElementRef);

  plainText = signal('#1 + #2 * 2 - #3');
  contentArray = computed(() =>
    this.plainText()
      .split(/(#\d+)/g)
      .map(part => part.trim())
      .filter(part => part.length > 0),
  );
  detectedIds = computed<Array<string>>(() => this.plainText().match(/#\d+/g) || []);

  idLabels: Record<string, WritableSignal<string>> = {};

  cursorPosition = signal(0);

  constructor() {
    effect(() => {
      console.log(this.contentArray());
    });
    effect(() => {
      console.log(this.plainText());
    });

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

  ngAfterViewInit() {
    this.cursorPosition.set(this.plainText().length);
    this.updateContent();
    this.restoreCursorPosition();
  }

  onInput() {
    this.saveCursorPosition();
    this.updateContent();
    this.restoreCursorPosition();
  }

  onPaste(event: ClipboardEvent) {
    try {
      pasteHandler(event);

      // Trigger input event manually
      this.onInput();
    } finally {
      /* empty */
    }
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

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Allow drop
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    const droppedText = event.dataTransfer?.getData('text/plain');
    if (!droppedText) return;

    // Calculate where the drop occurred
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!range) return;

    const walker = document.createTreeWalker(this._elementRef.nativeElement, NodeFilter.SHOW_TEXT);

    let dropPosition = 0;
    let node = walker.nextNode();

    while (node) {
      if (node === range.startContainer) {
        dropPosition += range.startOffset;
        break;
      }
      dropPosition += node.textContent?.length || 0;
      node = walker.nextNode();
    }

    // Get current text and manipulate it
    let currentText = this.extractPlainText();

    // Remove dragged text from original position
    const draggedIndex = currentText.indexOf(droppedText);
    if (draggedIndex !== -1 && draggedIndex < dropPosition) {
      currentText = currentText.slice(0, draggedIndex) + currentText.slice(draggedIndex + droppedText.length);
      dropPosition -= droppedText.length;
    } else if (draggedIndex !== -1) {
      currentText = currentText.slice(0, draggedIndex) + currentText.slice(draggedIndex + droppedText.length);
    }

    // Insert at drop position
    this._elementRef.nativeElement.textContent = currentText.slice(0, dropPosition) + droppedText + currentText.slice(dropPosition);
    this.cursorPosition.set(dropPosition + droppedText.length);
    this.updateContent();
    this.restoreCursorPosition();
  }

  private updateContent() {
    this.plainText.set(this.extractPlainText());
  }

  private extractPlainText(): string {
    return this._elementRef.nativeElement.textContent || '';
  }

  private saveCursorPosition() {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Calculate absolute position in plain text
    this.cursorPosition.set(0);
    const walker = document.createTreeWalker(this._elementRef.nativeElement, NodeFilter.SHOW_TEXT);

    let node = walker.nextNode();
    while (node) {
      if (node === range.startContainer) {
        this.cursorPosition.set(this.cursorPosition() + range.startOffset);
        break;
      }
      this.cursorPosition.set(this.cursorPosition() + (node.textContent?.length || 0));
      node = walker.nextNode();
    }
  }

  private restoreCursorPosition() {
    // Use setTimeout to wait for DOM update
    setTimeout(() => {
      const selection = globalThis.getSelection();
      if (!selection) return;

      const walker = document.createTreeWalker(this._elementRef.nativeElement, NodeFilter.SHOW_TEXT);

      let currentPos = 0;
      let node = walker.nextNode();

      while (node) {
        const nodeLength = node.textContent?.length || 0;

        if (currentPos + nodeLength >= this.cursorPosition()) {
          const offset = this.cursorPosition() - currentPos;
          const range = document.createRange();

          try {
            range.setStart(node, offset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
          } catch (e) {
            console.error('Error restoring cursor:', e);
          }
        }

        currentPos += nodeLength;
        node = walker.nextNode();
      }

      // Fallback: place cursor at end
      const range = document.createRange();
      range.selectNodeContents(this._elementRef.nativeElement);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 0);
  }
}
