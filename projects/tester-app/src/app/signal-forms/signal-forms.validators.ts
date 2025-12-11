import { SchemaPath, validate } from '@angular/forms/signals';

export function referenceId(field: SchemaPath<string>, options?: { message?: string }) {
  validate(field, ({ value }) => {
    if (!value().startsWith('REF-')) {
      return {
        kind: 'referenceIdPrefix',
        message: options?.message ?? 'referenceId must start with REF-',
      };
    }
    return null;
  });
}
