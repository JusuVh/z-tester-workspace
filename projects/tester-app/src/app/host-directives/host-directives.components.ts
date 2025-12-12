import { Component, computed, inject } from '@angular/core';
import { outputToObservable, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LoadingFromHostDirective, LoadingInputDirective, LoadingOnCLickDirective } from './loading.directive';
import { TooltipDirective } from './tooltip.directive';

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
    '(click)': 'log()',
  },
  hostDirectives: [LoadingOnCLickDirective, TooltipDirective],
})
export class HostOnClickComponent {
  hostDir = inject(LoadingOnCLickDirective);

  log() {
    console.log('dans Composant');
  }

  tooltip = inject(TooltipDirective);

  constructor() {
    this.tooltip.appTooltip.set('This button uses TooltipDirective!');
    this.tooltip.tooltipPosition.set('bottom');
  }
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
  //hostDirectives: [{ directive: LoadingInputDirective, inputs: ['loading: loadingAlias'], outputs: ['loadingChange'] }],
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
