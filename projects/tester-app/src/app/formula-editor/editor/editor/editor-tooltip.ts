import { Component, ElementRef, inject, signal } from '@angular/core';
import { eiInfo, EtcIcon } from '@datanumia/etincelle-icons';

@Component({
  selector: 'app-editor-tooltip',
  template: `
    <b>{{ _data()?.label }}</b>
    <div style="display: flex; align-items: center; gap: 4px">
      <etc-icon [icon]="eiInfo" style="color: var(--etc-sem-color-brand)" size="xs" />
      Fluide: Exemple
    </div>
  `,
  host: {
    class: 'token-tooltip',
    '[class.visible]': '_visible()',
  },
  imports: [EtcIcon],
})
export class EditorTooltip {
  private readonly _elementRef = inject(ElementRef);
  protected readonly eiInfo = eiInfo;

  protected _visible = signal(false);
  protected _data = signal<Partial<{ label: string } | undefined>>(undefined);

  open(target: HTMLElement, data: Partial<{ label: string }>) {
    this._data.set(data);
    this._visible.set(true);

    // Wait for browser to paint the new content
    requestAnimationFrame(() => {
      this._positionTooltip(target);
    });
  }

  close() {
    this._data.set(undefined);
    this._visible.set(false);
  }

  private _positionTooltip(target: HTMLElement) {
    const tooltip = this._elementRef.nativeElement;
    const targetRect = target.getBoundingClientRect();
    const parentRect = this._elementRef.nativeElement.parentElement.getBoundingClientRect();

    // Position above the token
    const top = targetRect.top - parentRect.top - tooltip.offsetHeight - 8;
    const left = targetRect.left - parentRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }
}
