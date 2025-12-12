import { Directive, input, signal } from '@angular/core';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';
import { map, skip } from 'rxjs';

/* ************************ */
/**
 * on click
 */
/* ************************ */
@Directive({
  selector: '[appLoadingClick]',
  host: {
    class: 'loading',
    '[class.loading-on]': 'loading()',
    '(click)': 'toggle()',
  },
})
export class LoadingOnCLickDirective {
  loading = signal(false);

  toggle() {
    this.loading.set(!this.loading());
    console.log('toggle on click directive');
  }
}

/* ************************ */
/**
 * with input
 */
/* ************************ */
@Directive({
  selector: '[appLoadingInput]',
  host: {
    class: 'loading',
    '[class.loading-on]': 'loading()',
  },
})
export class LoadingInputDirective {
  loading = input.required<boolean>();

  loadingChange = outputFromObservable(
    toObservable(this.loading).pipe(
      skip(1),
      map(loading => `${loading ? '⏳' : '❌'} Loading changed in directive to : ${loading}`),
    ),
  );
}

/* ************************ */
/**
 * through host inject()
 */
/* ************************ */
@Directive({
  host: {
    class: 'loading',
    '[class.loading-on]': 'loading()',
  },
})
export class LoadingFromHostDirective {
  loading = signal(false);

  directiveToggle() {
    this.loading.set(!this.loading());
  }
}
