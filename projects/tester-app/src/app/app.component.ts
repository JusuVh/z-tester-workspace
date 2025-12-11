import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { eiHome, eiList, eiPin, EtcIconsModule } from '@datanumia/etincelle-icons';
import { EtcFormFieldModule } from '@datanumia/etincelle/form-field';
import { EtcNavigationModule } from '@datanumia/etincelle/navigation';
import { EtcSelectableCardModule } from '@datanumia/etincelle/selectable-card';

@Component({
  selector: 'app-root-tester',
  template: `
    <div>
      <header etc-app-header style="background-color: var(--etc-sidenav--background-color);">
        <span>The beautiful world of the Tester App</span>
      </header>
    </div>
    <div class="etc-sidenav-container">
      <etc-sidenav>
        <a etc-sidenav-item [routerLink]="['grid']">
          <etc-icon [icon]="eiHome" />
          Accueil
        </a>
        <!--<a etc-sidenav-item [routerLink]="['map']">
          <etc-icon [icon]="eiPin"></etc-icon>
          Map
        </a>-->
        <a etc-sidenav-item [routerLink]="['signal']">
          <etc-icon [icon]="eiList" />
          Signal Forms
        </a>
      </etc-sidenav>
      <main>
        <router-outlet class="etc-main-router-outlet" />
      </main>
    </div>
  `,
  styles: ``,
  standalone: true,
  imports: [
    RouterOutlet,
    EtcIconsModule,
    EtcSelectableCardModule,
    ReactiveFormsModule,
    EtcNavigationModule,
    EtcFormFieldModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly eiHome = eiHome;
  protected readonly eiPin = eiPin;
  protected readonly eiList = eiList;
}
