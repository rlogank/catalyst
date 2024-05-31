import { UpdateCustomerAddressInput } from '~/client/mutations/update-customer-address';

type FormFieldsType = UpdateCustomerAddressInput['data']['formFields'];
type CustomFormField = keyof NonNullable<FormFieldsType>;
type CustomFieldValueType = NonNullable<NonNullable<FormFieldsType>[CustomFormField]>[number];
type ReturnedFormData = Record<string, unknown>;

const updateFormFields = (
  formFields: FormFieldsType,
  fieldType: CustomFormField,
  fieldData: CustomFieldValueType,
) => {
  const customFormFields = formFields ?? {};

  if (customFormFields[fieldType]) {
    customFormFields[fieldType]?.push(fieldData);
  } else {
    customFormFields[fieldType] = [fieldData];
  }

  return customFormFields;
};

export const parseAccountFormData = (accountFormData: FormData): unknown =>
  [...accountFormData.entries()].reduce<ReturnedFormData>((parsedData, [name, value]) => {
    const key = name.split('-').at(-1) ?? '';
    const sections = name.split('-').slice(0, -1);

    if (sections.includes('customer')) {
      parsedData[key] = value;

      return parsedData;
    }

    if (sections.includes('address')) {
      parsedData[key] = value;

      return parsedData;
    }

    // merchant defined form fields
    if (sections.every((section) => section.startsWith('custom_'))) {
      const customFieldType = sections[0]?.split('_').at(-1) ?? '';

      switch (customFieldType) {
        case 'checkboxes': {
          parsedData.formFields = updateFormFields(parsedData.formFields ?? null, customFieldType, {
            fieldEntityId: Number(key),
            fieldValueEntityIds: [Number(value)],
          });

          break;
        }

        case 'multipleChoices': {
          parsedData.formFields = updateFormFields(parsedData.formFields ?? null, customFieldType, {
            fieldEntityId: Number(key),
            fieldValueEntityId: Number(value),
          });

          break;
        }

        case 'numbers': {
          parsedData.formFields = updateFormFields(parsedData.formFields ?? null, customFieldType, {
            fieldEntityId: Number(key),
            number: Number(value),
          });

          break;
        }

        case 'dates': {
          if (typeof value !== 'string') {
            break;
          }

          const [day, mm, year] = value.split('/');

          const month = Number(mm) - 1;
          const date = new Date(Date.UTC(Number(year), month, Number(day))).toISOString();

          parsedData.formFields = updateFormFields(parsedData.formFields ?? null, customFieldType, {
            fieldEntityId: Number(key),
            date,
          });

          break;
        }

        case 'texts': {
          parsedData.formFields = updateFormFields(parsedData.formFields ?? null, customFieldType, {
            fieldEntityId: Number(key),
            text: String(value),
          });

          break;
        }

        case 'passwords': {
          parsedData.formFields = updateFormFields(parsedData.formFields ?? null, customFieldType, {
            fieldEntityId: Number(key),
            password: String(value),
          });

          break;
        }
      }
    }

    return parsedData;
  }, {});
