import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { debounce, disabled, Field, form, minLength, pattern, required, validate } from '@angular/forms/signals';
import { EtcCard, EtcCardHeaderH2 } from '@datanumia/etincelle/card';
import { EtcFormFieldModule } from '@datanumia/etincelle/form-field';
import { EtcPageHeader } from '@datanumia/etincelle/page-header';
import { Point, Resource } from './data.model';
import { referenceId } from './signal-forms.validators';

const getEmptyPoint = (): Required<Point> => ({
  uuid: crypto.randomUUID(),
  siteUuid: '',
  zoneUuid: '',
  usageUuid: '',
  postalCode: '',
  generalInformation: {
    name: '',
    externalIdentifier: '',
    referenceIdentifier: '',
    networkManager: '',
    resource: '' as Resource,
    quotationIdentifier: '',
  },
});

@Component({
  selector: 'app-signal-forms-main',
  host: {
    class: 'etc-page-container',
  },
  templateUrl: 'signal-forms.main.html',
  styleUrl: 'signal-forms.main.scss',
  imports: [EtcCard, EtcCardHeaderH2, EtcFormFieldModule, EtcPageHeader, Field, JsonPipe, ReactiveFormsModule],
})
export class SignalFormsMain {
  // 🎯 Create a signal with the initial model
  initialPoint = signal<Required<Point>>(getEmptyPoint());

  formDisabled = signal(false);

  // 🎯 NEW: Pass the signal directly to form() - it creates controls automatically!
  pointForm = form(this.initialPoint, schemaPath => {
    debounce(schemaPath.generalInformation.name, 500);
    required(schemaPath.generalInformation.name, { message: 'Required, message setup in validator' });

    required(schemaPath.siteUuid);
    disabled(schemaPath.siteUuid);

    debounce(schemaPath.zoneUuid, () => new Promise<void>(() => {}));
    minLength(schemaPath.zoneUuid, 5, { message: 'Min 5' });

    disabled(schemaPath, () => this.formDisabled());

    pattern(schemaPath.postalCode, /^\d{5}$/, { message: 'Postal code must be 5 digits' });

    validate(schemaPath.generalInformation.externalIdentifier, ({ value }) => {
      if (!value().startsWith('EXT-')) {
        return {
          kind: 'externalIdPrefix',
          message: 'externalIdentifier must start with EXT-',
        };
      }
      return null;
    });

    referenceId(schemaPath.generalInformation.referenceIdentifier);
  });

  nameFieldState = this.pointForm.generalInformation.name();

  // 🎯 Computed signals based on form signals
  formSummary = computed(() => {
    const name = this.nameFieldState.value();
    const resource = this.pointForm.generalInformation.resource().value();
    const isValid = this.pointForm().valid();
    const isDirty = this.pointForm().dirty();

    if (!name && !resource) {
      return '⏳ Start filling the form to see the magic!';
    }

    if (!isValid) {
      return `⚠️ Form incomplete: ${name || 'no name'} needs more data`;
    }

    if (!isDirty) {
      return `✨ Fresh point: "${name}" using ${resource}`;
    }

    return `✅ Valid point: "${name}" using ${resource} (modified)`;
  });

  resourceIcon = computed(() => {
    const resource = this.pointForm.generalInformation.resource().value();
    switch (resource) {
      case 'ELECTRICITY':
        return '⚡ ELECTRICITY';
      case 'TEMP':
        return '🌡️ TEMPERATURE';
      case 'GAS':
        return '🔥 GAS';
      default:
        return '❓ Select a resource type';
    }
  });

  fillSampleData() {
    // 🎯 Update the signal - form automatically syncs!
    this.initialPoint.set({
      uuid: crypto.randomUUID(),
      siteUuid: crypto.randomUUID(),
      zoneUuid: crypto.randomUUID(),
      usageUuid: crypto.randomUUID(),
      postalCode: '01630',
      generalInformation: {
        name: 'PDM conso',
        externalIdentifier: 'EXT-001',
        referenceIdentifier: 'REF-2024-001',
        networkManager: 'ENEDIS',
        resource: 'ELECTRICITY',
        quotationIdentifier: 'QUOT-2024-123',
      },
    });
  }

  resetForm() {
    this.pointForm().reset(getEmptyPoint());
  }

  disableForm() {
    this.formDisabled.set(true);
  }

  enableForm() {
    this.formDisabled.set(false);
  }
}
