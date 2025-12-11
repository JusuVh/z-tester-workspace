import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EiIcon } from '@datanumia/etincelle-icons';

export type Pin = {
  x: number;
  y: number;
  color?: string;
  icon?: EiIcon;
}

@Injectable({providedIn: 'root'})
export class State {
  fc = new FormControl('');

  floorMap = new Map<string, Array<Pin>>();

  img: string = '';
  //'https://wpmedia.roomsketcher.com/content/uploads/2022/01/06145940/What-is-a-floor-plan-with-dimensions.png';
}
