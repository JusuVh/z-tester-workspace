import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { eiInfo, EtcIcon } from '@datanumia/etincelle-icons';
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

@Component({
  selector: 'app-editor',
  template: `
    <div
      class="formula-editor-content"
      #editorContent
      contenteditable
      (input)="_onInput()"
      (paste)="_onPaste($event)"
      (keydown)="_onKeyDown($event)"
      (dragstart)="_preventAction($event)"
      (drop)="_preventAction($event)"
      [attr.data-placeholder]="'Entrez votre formule... (ex. #1 + #2 * 0.5)'"
    ></div>
    <div class="token-tooltip" #tooltip [class.visible]="tooltipVisible()">
      <b>{{ tooltipContent() }}</b>
      <div style="display: flex; align-items: center; gap: 4px">
        <etc-icon [icon]="eiInfo" style="color: var(--etc-sem-color-brand)" size="xs" />
        Fluide: Exemple
      </div>
    </div>
  `,
  styleUrl: './editor.scss',
  host: {
    '(mouseover)': '_onMouseOver($event)',
    '(mouseout)': '_onMouseOut($event)',
  },
  exportAs: 'AppEditor',
  imports: [EtcIcon],
})
export class Editor {
  private readonly _elementRef = inject(ElementRef);
  private readonly _cursorPosition = signal(0);
  protected readonly eiInfo = eiInfo;

  private readonly _editorContent = viewChild.required<ElementRef<HTMLElement>>('editorContent');
  private readonly _tooltip = viewChild.required<ElementRef<HTMLElement>>('tooltip');

  /**
   * Input formula if already present
   */
  formula = input<string>();

  plainText = signal('');

  detectedIds = computed<Set<string>>(() => new Set(this.plainText().match(/#\d+/g) || []));

  channelsInfo: Record<string, Partial<{ label: string }>> = {};

  // Tooltip state
  tooltipVisible = signal(false);
  tooltipContent = signal('');

  constructor() {
    explicitEffect([this.detectedIds], ([ids]) => {
      ids.forEach(id => {
        if (!this.channelsInfo[id]) {
          this.channelsInfo[id] = {};
        }
      });

      // Remove labels from IDs that are not detected anymore
      Object.keys(this.channelsInfo).forEach(key => {
        if (!ids.has(key)) delete this.channelsInfo[key];
      });
    });

    explicitEffect([this.formula, this._editorContent], ([inputFormula, viewReady]) => {
      if (inputFormula && viewReady) {
        this._editorContent().nativeElement.textContent = inputFormula;
        this._cursorPosition.set(inputFormula.length);
        this._updateContent();
        this._restoreCursorPosition();
      }
    });
  }

  /**
   * Public API to update token labels
   */
  updateLabel(token: string, label: string) {
    this.channelsInfo[token].label = label;
    this._updateContent();
  }

  protected _onInput() {
    this._saveCursorPosition();
    this._updateContent();
    this._restoreCursorPosition();
  }

  protected _onPaste(event: ClipboardEvent) {
    pasteHandler(event);
    this._onInput();
  }

  protected _onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this._cursorPosition.set(event.key === 'Home' ? 0 : Infinity);
      this._restoreCursorPosition();
      return;
    }

    keydownHandler(event);
  }

  protected _preventAction(event: Event) {
    event.preventDefault();
  }

  protected _onMouseOver(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.classList.contains('id-token')) {
      const token = target.dataset['token'];
      const label = token ? this.channelsInfo[token].label : '';

      if (label) {
        this.tooltipContent.set(label);
        this.tooltipVisible.set(true);

        // Wait for browser to paint the new content
        requestAnimationFrame(() => {
          this._positionTooltip(target);
        });
      }
    }
  }

  protected _onMouseOut(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.classList.contains('id-token')) {
      this.tooltipVisible.set(false);
    }
  }

  private _positionTooltip(target: HTMLElement) {
    if (!this._tooltip()) return;

    const tooltip = this._tooltip().nativeElement;
    const targetRect = target.getBoundingClientRect();
    const parentRect = this._elementRef.nativeElement.getBoundingClientRect();

    // Position above the token
    const top = targetRect.top - parentRect.top - tooltip.offsetHeight - 8;
    const left = targetRect.left - parentRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  /**
   * Re-render all content after any update to formula or labels
   */
  private _updateContent() {
    const text = (this._editorContent().nativeElement.textContent || '').replaceAll(/\s+/g, ' ');
    this._editorContent().nativeElement.innerHTML = this._insertTokens(text);
    this.plainText.set(text);
  }

  /**
   * Parse input text and insert <span> in place of each found token
   */
  private _insertTokens(text: string): string {
    if (!text) return '';

    // Replace trailing space with nbsp before highlighting
    const textWithNbsp = text.replace(/ $/, '\u00A0');

    return textWithNbsp.replaceAll(/#(\d+)/g, (_, id) => {
      const token = `#${id}`;
      const label = this.channelsInfo[token]?.label || '';
      const labelAttr = label ? ` data-label=" : ${label}"` : '';
      return `<span class="id-token" contenteditable data-token="${token}"${labelAttr}>${token}</span>`;
    });
  }

  /**
   * Calculate cursor position as character offset from start
   */
  private _saveCursorPosition() {
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textNodes = extractTextNodes(this._editorContent().nativeElement);

    let position = 0;
    for (const node of textNodes) {
      if (node === range.startContainer) {
        position += range.startOffset;
        // Position found, exit for loop and save
        break;
      }
      position += node.textContent?.length || 0;
    }

    this._cursorPosition.set(position);
  }

  /**
   * Restore cursor to saved character position
   */
  private _restoreCursorPosition() {
    setTimeout(() => {
      const selection = globalThis.getSelection();
      if (!selection) return;

      const targetPosition = this._cursorPosition();
      const textNodes = extractTextNodes(this._editorContent().nativeElement);

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
      this._placeCursorAtEnd(selection);
    });
  }

  /**
   * Place cursor at the end of the editor
   */
  private _placeCursorAtEnd(selection: Selection) {
    const range = document.createRange();
    range.selectNodeContents(this._editorContent().nativeElement);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
