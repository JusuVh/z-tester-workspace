import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { eiDashboard, eiList, eiPlus, eiTarget, EtcIconsModule } from '@datanumia/etincelle-icons';
import { EtcFormFieldModule } from '@datanumia/etincelle/form-field';
import { EtcNavigationModule } from '@datanumia/etincelle/navigation';
import { EtcSelectableCardModule } from '@datanumia/etincelle/selectable-card';

@Component({
  selector: 'app-root-tester',
  template: `
    <div>
      <header etc-app-header style="background-color: var(--etc-sidenav--background-color);">
        <img
          etcAppHeaderLogo
          ngSrc="../assets/unicorn.webp"
          alt=""
          width="42"
          height="32"
          priority
          style="margin: -40px; height: 80px;  width: 100px;"
        />
        <span>🌈 The beautiful world of the Tester App <span style="display: inline-block; rotate: 90deg">🌈</span></span>
      </header>
    </div>
    <div class="etc-sidenav-container">
      <etc-sidenav>
        <a etc-sidenav-item [routerLink]="['grid']">
          <etc-icon [icon]="eiDashboard" />
          Grid
        </a>
        <!--<a etc-sidenav-item [routerLink]="['map']">
          <etc-icon [icon]="eiPin"></etc-icon>
          Map
        </a>-->
        <a etc-sidenav-item [routerLink]="['signal']">
          <etc-icon [icon]="eiList" />
          Signal Forms
        </a>
        <a etc-sidenav-item [routerLink]="['host-directives']">
          <etc-icon [icon]="eiTarget" />
          Host Directives
        </a>
        <a etc-sidenav-item [routerLink]="['formula']">
          <etc-icon [icon]="eiPlus" />
          Formula Editor
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
    NgOptimizedImage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly eiList = eiList;
  protected readonly eiTarget = eiTarget;
  protected readonly eiDashboard = eiDashboard;
  protected readonly eiPlus = eiPlus;
}
