import { Route } from '@angular/router';
import { FormulaEditorMain } from './formula-editor/formula-editor-main.component';
import { GridComponent } from './grid.component';
import { HostDirectiveMain } from './host-directives/host-directive.main';
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
    path: 'host-directives',
    component: HostDirectiveMain,
  },
  {
    path: 'formula',
    component: FormulaEditorMain,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'grid',
  },
];
