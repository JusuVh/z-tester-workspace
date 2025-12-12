import { Component, signal } from '@angular/core';
import { EtcCard, EtcCardHeaderH2 } from '@datanumia/etincelle/card';
import { EtcPageHeader } from '@datanumia/etincelle/page-header';
import { HostOnClickComponent } from './host-directives.components';

@Component({
  selector: 'app-host-directive-main',
  template: `
    <etc-page-header>
      <h1>Angular Host Directives 🎯</h1>
      <p class="description">Composez en gardant votre héritage ! 🥸</p>
    </etc-page-header>
    <etc-card>
      <etc-card-header-h2>
        <h2>Are you crazy ?!? 🤪</h2>
      </etc-card-header-h2>
      <div style="display: grid; grid-template-columns: 2fr 4fr 1fr 1fr; align-items: center; gap: 32px">
        <h4>1️⃣ Loading on click</h4>
        <app-host-on-click #hostOnClick><span>Le background s'anime quand on me click !</span></app-host-on-click>
        <div></div>
        <div>{{ hostOnClick.hostDir.loading() ? '✅' : '❌' }}</div>

        <!--        <h4>2️⃣ Exposing Input/Output</h4>-->
        <!--        <app-host-input #hostInput [loading]="hostInputComponentLoading()" (loadingChange)="log($event)">-->
        <!--          <span>Le background est animé lorsque je click ici =></span>-->
        <!--        </app-host-input>-->
        <!--        <div><button etc-button squared variation="secondary" (click)="toggleLoading()">Click Me !</button></div>-->
        <!--        <div>{{ hostInput.isLoading() }}</div>-->

        <!--        <h4>3️⃣ With directive injection</h4>-->
        <!--        <app-host-injection #hostInjection><span>Le background s'anime quand on me click</span></app-host-injection>-->
        <!--        <div></div>-->
        <!--        <div>{{ hostInjection.isLoading() }}</div>-->
      </div>
    </etc-card>
  `,
  host: {
    class: 'etc-page-container',
  },
  imports: [EtcCard, EtcCardHeaderH2, EtcPageHeader, HostOnClickComponent],
})
export class HostDirectiveMain {
  hostInputComponentLoading = signal(false);

  toggleLoading() {
    this.hostInputComponentLoading.set(!this.hostInputComponentLoading());
  }

  protected log(event: unknown) {
    console.log(event);
  }
}
