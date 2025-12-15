import { Component } from '@angular/core';
import { eiArticle, EtcIcon } from '@datanumia/etincelle-icons';
import { EtcCard, EtcCardHeaderH2 } from '@datanumia/etincelle/card';
import { EtcFormFieldModule } from '@datanumia/etincelle/form-field';
import { EtcPageHeader } from '@datanumia/etincelle/page-header';
import { EtcSelect } from '@datanumia/etincelle/select';
import { EtcOption, EtcSearchableOption } from '@datanumia/etincelle/shared';
import { Editor } from './editor/editor/editor';

@Component({
  selector: 'app-formula-editor',
  host: {
    class: 'etc-page-container',
  },
  templateUrl: 'formula-editor-main.component.html',
  styleUrl: 'formula-editor-main.component.scss',
  imports: [EtcCard, EtcCardHeaderH2, EtcFormFieldModule, EtcPageHeader, Editor, EtcIcon, EtcSelect, EtcOption],
})
export class FormulaEditorMain {
  protected readonly eiArticle = eiArticle;

  options: Array<EtcSearchableOption> = [
    { value: '1', label: 'Channel 1' },
    { value: '2', label: 'Channel 2' },
    { value: '3', label: 'Channel 3' },
  ];
}
