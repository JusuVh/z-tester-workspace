import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { eiChauffageUrbain, eiEau, eiFroidUrbain, eiGaz, EiIcon, EtcIconsModule } from '@datanumia/etincelle-icons';
import { EtcButtonModule } from '@datanumia/etincelle/button';

@Component({
  selector: 'app-dialog',
  template: `
    <h3>Configurer mon élément</h3>
    <div style="display: flex; gap: 8px;">
      <div
        class="color-picker"
        [class.picker--selected]="color === '#1071F2'"
        style="background-color: var(--etc-color-blue-accent)"
        (click)="selectColor('#1071F2')"
      ></div>
      <div
        class="color-picker"
        [class.picker--selected]="color === '#ED0E05'"
        style="background-color: var(--etc-color-red-primary)"
        (click)="selectColor('#ED0E05')"
      ></div>
      <div
        class="color-picker"
        [class.picker--selected]="color === '#3C8711'"
        style="background-color: var(--etc-color-green-primary)"
        (click)="selectColor('#3C8711')"
      ></div>
      <div
        class="color-picker"
        [class.picker--selected]="color === '#FF5722'"
        style="background-color: var(--etc-color-orange-primary)"
        (click)="selectColor('#FF5722')"
      ></div>
    </div>
    <div style="display: flex; gap: 8px;">
      <div class="color-picker" [class.picker--selected]="icon === eiEau" (click)="selectIcon(eiEau)">
        <etc-icon [icon]="eiEau" />
      </div>
      <div class="color-picker" [class.picker--selected]="icon === eiGaz" (click)="selectIcon(eiGaz)">
        <etc-icon [icon]="eiGaz" />
      </div>
      <div class="color-picker" [class.picker--selected]="icon === eiChauff" (click)="selectIcon(eiChauff)">
        <etc-icon [icon]="eiChauff" />
      </div>
      <div class="color-picker" [class.picker--selected]="icon === eiFroid" (click)="selectIcon(eiFroid)">
        <etc-icon [icon]="eiFroid" />
      </div>
    </div>
    <div style="flex: 1; display: flex; justify-content: flex-end; align-items: flex-end;">
      <button etc-button (click)="close()">Ok</button>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 16px;
      }
    `,
  ],
  imports: [EtcButtonModule, EtcIconsModule],
  standalone: true,
})
export class DialogComponent {
  dialogRef = inject(DialogRef<{ color: string; icon: EiIcon }, DialogComponent>);
  data: { color: string; icon: EiIcon } = inject(DIALOG_DATA);

  eiEau = eiEau;
  eiGaz = eiGaz;
  eiChauff = eiChauffageUrbain;
  eiFroid = eiFroidUrbain;

  color = this.data.color || '';
  icon = this.data.icon || eiEau;

  selectColor(color: string) {
    this.color = color;
  }

  selectIcon(icon: EiIcon) {
    this.icon = icon;
  }

  close() {
    this.dialogRef.close({ color: this.color, icon: this.icon });
  }
}
