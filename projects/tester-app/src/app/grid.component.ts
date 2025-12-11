import { Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EtcCardModule } from '@datanumia/etincelle/card';
import { EtcPageHeaderModule } from '@datanumia/etincelle/page-header';
import { EtcSelectableCardModule } from '@datanumia/etincelle/selectable-card';
import { timer } from 'rxjs';

@Component({
  selector: 'app-grid',
  template: `
    <etc-page-header>
      <h1>The Frameless Grid</h1>
      <p class="description">Mon système de grille</p>
    </etc-page-header>

    <!--<form [formGroup]="formRoomProgramming" novalidate>
      <etc-selectable-group formControlName="weeklyScheduleIdentifier" column>
        @for (weeklySchedule of weeklySchedules; track weeklySchedule.identifier) {
          <etc-selectable-card [value]="weeklySchedule.identifier">
            <etc-selectable-card-title>{{ weeklySchedule.name }}</etc-selectable-card-title>
            <etc-selectable-card-description>{{ weeklySchedule.description }}</etc-selectable-card-description>
          </etc-selectable-card>
        }
      </etc-selectable-group>
    </form>-->

    <div class="etc-grid">
      <etc-card class="etc-grid--col-size--1-6th">
        <etc-card-header-h2>
          <h2>1 / 6</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--col-size--5-6th">
        <etc-card-header-h2>
          <h2>4 / 6</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--col-size--half">
        <etc-card-header-h2>
          <h2>First Half</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--col-size--half">
        <etc-card-header-h2>
          <h2>Second Half</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--col-size--half">
        <etc-card-header-h2>
          <h2>Half</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--start--first etc-grid--col-size--half">
        <etc-card-header-h2>
          <h2>Half New Row</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--start--1-3rd etc-grid--col-size--1-3rd">
        <etc-card-header-h2>
          <h2>1/3 - Start 1/3</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--start--first etc-grid--col-size--1-3rd">
        <etc-card-header-h2>
          <h2>1/3</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--col-size--1-3rd">
        <etc-card-header-h2>
          <h2>1/3</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--col-size--1-3rd">
        <etc-card-header-h2>
          <h2>1/3</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--start--first etc-grid--col-size--2-3rd">
        <etc-card-header-h2>
          <h2>2/3</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--start--1-4th etc-grid--col-size--half">
        <etc-card-header-h2>
          <h2>1/2 - Start 1/4</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--start--first etc-grid--col-size--1-4th">
        <etc-card-header-h2>
          <h2>1/4</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card class="etc-grid--col-size--3-4th">
        <etc-card-header-h2>
          <h2>3/4</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
      <etc-card>
        <etc-card-header-h2>
          <h2>Full Width</h2>
          <p class="description">Description</p>
        </etc-card-header-h2>
        <div style="height: 50px;"></div>
      </etc-card>
    </div>
  `,
  styleUrls: ['./grid.component.scss'],
  host: {
    class: 'etc-page-container',
  },
  standalone: true,
  imports: [EtcPageHeaderModule, EtcCardModule, EtcSelectableCardModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class GridComponent {
  weeklySchedules: Array<unknown> = [];

  getWeeklySched = timer(3000)
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.weeklySchedules = [
        {
          identifier: 'acbdb380-fe30-4c9e-a762-c1e71be6f79c',
          name: 'Inoccupé',
          description: 'Pour des pièces sans occupants',
          siteIdentifier: '17df96c3-3af7-4695-b1af-8c14279eaab2',
        },
        {
          identifier: 'b9c64255-1fa4-47e1-8529-42cd61870abd',
          name: 'Occupé',
          description: 'Pour des pièces avec occupants',
          siteIdentifier: '17df96c3-3af7-4695-b1af-8c14279eaab2',
        },
        {
          identifier: 'ec7ce351-3c18-4058-8e09-73a99f2033a0',
          name: 'Bureau',
          description: 'Pour des pièces de travail quotidiennes',
          siteIdentifier: '17df96c3-3af7-4695-b1af-8c14279eaab2',
        },
      ];
    });

  protected formRoomProgramming = new FormGroup({
    weeklyScheduleIdentifier: new FormControl<string | undefined>(undefined, { nonNullable: true }),
  });

  constructor() {
    this.formRoomProgramming.setErrors({ toto: true });
    setTimeout(() => {
      console.log('patched !');
      this.patch();
    }, 2000);
  }

  patch() {
    this.formRoomProgramming.patchValue({
      weeklyScheduleIdentifier: 'b9c64255-1fa4-47e1-8529-42cd61870abd',
    });
  }
}
