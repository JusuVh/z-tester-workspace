import { DialogRef } from '@angular/cdk/dialog';
import { CdkDragEnd, DragDropModule, DragRef, Point } from '@angular/cdk/drag-drop';

import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { EiIcon, eiPlus, EtcIconsModule } from '@datanumia/etincelle-icons';
import { EtcDialog, EtcDialogModule } from '@datanumia/etincelle/dialog';
import { EtcFormFieldInput, EtcFormFieldModule } from '@datanumia/etincelle/form-field';
import { EtcRadioModule } from '@datanumia/etincelle/radio';
import { DialogComponent } from './dialog.component';
import { Pin, State } from './state';
import { minmax } from './tools';

@Component({
  selector: 'app-map',
  template: `
    <div style="display: flex; flex-direction: column; width: 100%;">
      <div
        class="etc-shadow--primary"
        style="width: 100%; padding: 16px; background-color: white; display: flex; justify-content: space-between; z-index: 1;"
      >
        <etc-form-field style="width: 500px;">
          <etc-label>Nouveau plan</etc-label>
          <input etc-input placeholder="Floor image" [formControl]="state.fc" />
        </etc-form-field>
        @if (Array.from(state.floorMap.keys()).length > 0) {
          <etc-radio-group [value]="state.img" (selectionChange)="state.img = $event.value || ''">
            <label etcRadioGroupLabel>Plans existants</label>
            @for (map of Array.from(state.floorMap.keys()); track map) {
              <etc-radio-button [value]="map">{{ map }}</etc-radio-button>
            }
          </etc-radio-group>
        }
      </div>
      <div cdkDrag style="padding: 40px;">
        <div class="map-container" #container (contextmenu)="onRightClick($event)" [style.scale]="_scale">
          <img [src]="_state.img" alt="" />

          @for (area of _state.floorMap.get(_state.img || ''); track area; let i = $index) {
            <div
              class="my-point"
              #draggable="cdkDrag"
              [class.pointer-events-none]="draggable._dragRef.isDragging()"
              [style.top.px]="area.y"
              [style.left.px]="area.x"
              [style.background-color]="area.color || null"
              cdkDrag
              cdkDragBoundary=".map-container"
              [cdkDragConstrainPosition]="dragConstrainPosition"
              (click)="pinClick(area)"
              (cdkDragEnded)="savePin($event, i)"
            >
              <etc-icon [icon]="area.icon || eiPlus" />
            </div>
          }
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [DragDropModule, EtcDialogModule, EtcIconsModule, EtcFormFieldInput, EtcFormFieldModule, EtcRadioModule, ReactiveFormsModule],
  host: {
    '(wheel)': 'zoom($event)',
  },
})
export class MapComponent {
  state = inject(State);
  protected readonly Array = Array;

  @ViewChild('container')
  container!: ElementRef;

  protected _state = inject(State);
  private readonly _dialog = inject(EtcDialog);

  protected _scale = 1;
  private readonly _padding = 0;

  constructor() {
    this._state.fc.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      if (value && (value.includes('.jpg') || value.includes('.png'))) {
        if (!this._state.floorMap.has(value)) {
          this._state.floorMap.set(value, []);
        }
        this._state.img = value;
      }
    });
  }

  zoom(event: WheelEvent) {
    if (event.deltaY > 0) {
      this._scale = Math.min(this._scale + 0.1, 3);
    } else {
      this._scale = Math.max(this._scale - 0.1, 0.2);
    }
  }

  pinClick(area: Pin) {
    const dialogRef: DialogRef<{ color: string; icon: EiIcon }, DialogComponent> = this._dialog.open(DialogComponent, {
      width: '400px',
      height: '300px',
      data: {
        color: area.color,
        icon: area.icon,
      },
    });

    dialogRef.closed.subscribe((retour: { color: string; icon: EiIcon } | undefined) => {
      area.color = retour?.color;
      area.icon = retour?.icon;
    });
  }

  savePin(cdkDragEnd: CdkDragEnd, index: number) {
    const map = this._state.floorMap.get(this._state.img);
    const maxX = this.container.nativeElement.clientWidth - this._padding;
    const maxY = this.container.nativeElement.clientHeight - this._padding;
    if (map) {
      map[index] = {
        x: minmax(this._padding, maxX, map[index].x + cdkDragEnd.distance.x),
        y: minmax(this._padding, maxY, map[index].y + cdkDragEnd.distance.y),
        color: map[index].color,
        icon: map[index].icon,
      };
    }
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    const newPin: Pin = {
      x: event.offsetX + this._padding,
      y: event.offsetY + this._padding,
    };

    const map = this._state.floorMap.get(this._state.img || '');
    if (this._state.img && map) {
      map.push(newPin);
    }
  }

  dragConstrainPosition = (point: Point, dragRef: DragRef) => {
    const zoomMoveXDifference = (1 - this._scale) * dragRef.getFreeDragPosition().x;
    const zoomMoveYDifference = (1 - this._scale) * dragRef.getFreeDragPosition().y;
    return {
      x: point.x + zoomMoveXDifference - 25, // half the size of the pin
      y: point.y + zoomMoveYDifference - 25,
    };
  };

  protected readonly eiPlus = eiPlus;
}
