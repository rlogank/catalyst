import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { DatePicker } from '~/components/ui/date-picker';
import { Field, FieldControl, FieldLabel, FieldMessage } from '~/components/ui/form';

import { AddressFields } from '..';

const getDisabledDays = ({
  earliest,
  latest,
}: {
  earliest: string | null;
  latest: string | null;
}) => {
  if (earliest && latest) {
    return [{ before: new Date(earliest), after: new Date(latest) }];
  }

  if (earliest) {
    return [{ before: new Date(earliest) }];
  }

  if (latest) {
    return [{ after: new Date(latest) }];
  }

  return [];
};

type DateType = Extract<NonNullable<AddressFields>[number], { __typename: 'DateFormField' }>;

interface DateProps {
  defaultValue?: Date | string;
  field: DateType;
  isValid?: boolean;
  name: string;
  onSelect?: (d: Date) => void;
}

export const DateField = ({ defaultValue, field, name }: DateProps) => {
  const selectedDate = defaultValue || field.defaultDate || undefined;
  const [date, setDate] = useState<Date | string | undefined>(selectedDate);
  const t = useTranslations('Account.Register.validationMessages');
  const disabledDays = getDisabledDays({ earliest: field.minDate, latest: field.maxDate });

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <DatePicker
          disabledDays={disabledDays}
          id={`${field.entityId}`}
          onSelect={setDate}
          selected={date ? new Date(date) : undefined}
          variant={field.isRequired && !date ? 'error' : undefined}
        />
      </FieldControl>
      {field.isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error-secondary"
          match="valueMissing"
        >
          {t('empty')}
        </FieldMessage>
      )}
    </Field>
  );
};
