import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { debounce, disabled, Field, form, required } from '@angular/forms/signals';
import { EtcCard, EtcCardHeaderH2 } from '@datanumia/etincelle/card';
import { EtcFormFieldModule } from '@datanumia/etincelle/form-field';
import { EtcPageHeader } from '@datanumia/etincelle/page-header';
import { Point, Resource } from './data.model';

const getEmptyPoint = (): Required<Point> => ({
  uuid: crypto.randomUUID(),
  siteUuid: '',
  zoneUuid: '',
  usageUuid: '',
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
  imports: [
    EtcCard,
    EtcCardHeaderH2,
    EtcFormFieldModule,
    EtcPageHeader,
    Field,
    JsonPipe,
    ReactiveFormsModule,
  ]
})
export class SignalFormsMain {
  // 🎯 Create a signal with the initial model
  initialPoint = signal<Required<Point>>(getEmptyPoint());

  formDisabled = signal(false);

  // 🎯 NEW: Pass the signal directly to form() - it creates controls automatically!
  pointForm = form(this.initialPoint, (schemaPath) => {
    debounce(schemaPath.generalInformation.name, 500);
    required(schemaPath.generalInformation.name);
    required(schemaPath.siteUuid);
    disabled(schemaPath.siteUuid)
    disabled(schemaPath, () => this.formDisabled())
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
      generalInformation: {
        name: 'Main Distribution Point',
        externalIdentifier: 'EXT-001',
        referenceIdentifier: 'REF-2024-001',
        networkManager: 'Acme Networks',
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
