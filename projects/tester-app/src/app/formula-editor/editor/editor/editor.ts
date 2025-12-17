import { Component, computed, ElementRef, input, signal, viewChild } from '@angular/core';
import { explicitEffect } from '@datanumia/etincelle/shared';
import { EditorTooltip } from './editor-tooltip';
import { getCursorPosition, keydownHandler, pasteHandler, restoreCursorPosition } from './editor.utils';

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
    <app-editor-tooltip />
  `,
  styleUrl: './editor.scss',
  host: {
    '(mouseover)': '_onMouseOver($event)',
    '(mouseout)': '_onMouseOut($event)',
  },
  imports: [EditorTooltip],
})
export class Editor {
  private readonly _editorContent = viewChild.required<ElementRef<HTMLElement>>('editorContent');
  private readonly _editorElement = computed(() => this._editorContent().nativeElement);
  private readonly _tooltip = viewChild.required(EditorTooltip);
  private readonly _cursorPosition = signal(0);

  plainText = signal('');
  detectedIds = computed<Set<string>>(() => new Set(this.plainText().match(/#\d+/g) || []));
  channelsInfo = new Map<string, Partial<{ label: string }>>();

  /**
   * Input formula if already present
   */
  formula = input<string>();

  constructor() {
    explicitEffect([this.detectedIds], ([ids]) => {
      ids.forEach(id => {
        if (!this.channelsInfo.has(id)) {
          this.channelsInfo.set(id, {});
        }
      });

      // Remove labels from IDs that are not detected anymore
      Object.keys(this.channelsInfo).forEach(key => {
        if (!ids.has(key)) this.channelsInfo.delete(key);
      });
    });

    explicitEffect([this.formula, this._editorContent], ([inputFormula, viewReady]) => {
      if (inputFormula && viewReady) {
        this._editorContent().nativeElement.textContent = inputFormula;
        this._cursorPosition.set(inputFormula.length);
        this._renderContent();
        restoreCursorPosition(this._editorElement(), this._cursorPosition());
      }
    });
  }

  /**
   * Public API to update token labels
   */
  updateLabel(token: string, channel: Partial<{ label: string }>) {
    this.channelsInfo.set(token, channel);
    this._renderContent();
  }

  /**
   * On input, we need to get the cursor position before re-rendering
   * Then, after content is re-rendered with eventuel token elements,
   * Restore the cursor position to the previous saved one
   */
  protected _onInput() {
    this._cursorPosition.set(getCursorPosition(this._editorElement()));
    this._renderContent();
    restoreCursorPosition(this._editorElement(), this._cursorPosition());
  }

  protected _onPaste(event: ClipboardEvent) {
    pasteHandler(event);
    this._onInput();
  }

  protected _onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this._cursorPosition.set(event.key === 'Home' ? 0 : Infinity);
      restoreCursorPosition(this._editorElement(), this._cursorPosition());
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
      const channel = this.channelsInfo.get(token ?? '');

      if (channel?.label) {
        this._tooltip().open(target, channel);
      }
    }
  }

  protected _onMouseOut(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.classList.contains('id-token')) {
      this._tooltip().close();
    }
  }

  /**
   * Re-render all content after any update to formula or labels
   */
  private _renderContent() {
    const text = (this._editorElement().textContent || '').replaceAll(/\s+/g, ' ');
    this._editorElement().innerHTML = this._insertTokens(text);
    this.plainText.set(text);

    this._tooltip().close();
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
      const label = this.channelsInfo.get(token)?.label || '';
      const labelAttr = label ? ` data-label=" : ${label}"` : '';
      // This data-label is used in the ::after CSS pseudo-element as content
      return `<span class="id-token" contenteditable data-token="${token}"${labelAttr}>${token}</span>`;
    });
  }
}
