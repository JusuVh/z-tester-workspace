import { Directive, ElementRef, inject, model } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
  },
})
export class TooltipDirective {
  appTooltip = model('');
  tooltipPosition = model<'top' | 'bottom' | 'left' | 'right'>('top');

  private readonly elementRef = inject(ElementRef);
  private tooltipElement?: HTMLElement;

  show() {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.textContent = this.appTooltip();
    this.tooltipElement.className = 'custom-tooltip';
    this.tooltipElement.dataset['position'] = this.tooltipPosition();
    document.body.appendChild(this.tooltipElement);

    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    let top = 0;
    let left = 0;
    switch (this.tooltipPosition()) {
      case 'top':
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 8;
        break;
    }

    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }

  hide() {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = undefined;
    }
  }
}
