import { Route } from '@angular/router';
import { GridComponent } from './grid.component';
import { MapComponent } from './map.component';
import { SignalFormsMain } from './signal-forms/signal-forms.main';

export const routes: Array<Route> = [
  {
    path: 'grid',
    component: GridComponent,
  },
  {
    path: 'map',
    component: MapComponent,
  },
  {
    path: 'signal',
    component: SignalFormsMain,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'grid',
  },
];
