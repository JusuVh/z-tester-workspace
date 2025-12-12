import { Component, computed, inject } from '@angular/core';
import { outputToObservable, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LoadingFromHostDirective, LoadingInputDirective, LoadingOnCLickDirective } from './loading.directive';

/* ************************ */
/**
 * On click
 */
/* ************************ */
@Component({
  selector: 'app-host-on-click',
  template: ` <ng-content /> `,
  styles: `
    :host {
      cursor: pointer;
    }
  `,
  host: {
    class: 'component-host',
  },
  hostDirectives: [
    LoadingOnCLickDirective,
    // TooltipDirective
  ],
})
export class HostOnClickComponent {
  hostDir = inject(LoadingOnCLickDirective);

  // tooltip = inject(TooltipDirective);
  //
  // constructor() {
  //   this.tooltip.appTooltip.set('This button uses hostDirectives!');
  //   this.tooltip.tooltipPosition.set('top');
  // }
}

/* ************************ */
/**
 * Exposing Inputs/Outputs
 */
/* ************************ */
@Component({
  selector: 'app-host-input',
  template: ` <ng-content /> `,
  host: {
    class: 'component-host',
  },
  hostDirectives: [{ directive: LoadingInputDirective, inputs: ['loading'], outputs: ['loadingChange'] }],
  // hostDirectives: [{ directive: LoadingInputDirective, inputs: ['loading: loadingAlias'], outputs: ['loadingChange'] }],
})
export class HostInputComponent {
  hostDir = inject(LoadingInputDirective);

  isLoading = toSignal(outputToObservable(this.hostDir.loadingChange).pipe(map(loading => loading.charAt(0))));
}

/* ************************ */
/**
 * Through host inject()
 */
/* ************************ */
@Component({
  selector: 'app-host-injection',
  template: ` <ng-content /> `,
  styles: `
    :host {
      cursor: pointer;
    }
  `,
  host: {
    class: 'component-host',
    '(click)': 'componentToggle()',
  },
  hostDirectives: [LoadingFromHostDirective],
})
export class HostFromHostComponent {
  hostDir = inject(LoadingFromHostDirective);

  isLoading = computed<string>(() => (this.hostDir.loading() ? '✅' : '❌'));

  componentToggle() {
    this.hostDir.directiveToggle();
  }
}
