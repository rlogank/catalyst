export const parseAccountFormData = (accountFormData: FormData): unknown =>
  [...accountFormData.entries()].reduce<
    Record<
      string,
      | FormDataEntryValue
      | Record<string, Array<Record<string, string | number | number[] | FormDataEntryValue>>>
    >
  >((parsedData, [name, value]) => {
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
          parsedData.formFields = {
            [customFieldType]: [
              {
                fieldEntityId: Number(key),
                fieldValueEntityIds: [Number(value)],
              },
            ],
          };
          break;
        }

        case 'multipleChoices': {
          parsedData.formFields = {
            [customFieldType]: [
              {
                fieldEntityId: Number(key),
                fieldValueEntityId: Number(value),
              },
            ],
          };
          break;
        }

        case 'numbers': {
          parsedData.formFields = {
            [customFieldType]: [
              {
                fieldEntityId: Number(key),
                [customFieldType.slice(0, -1)]: Number(value),
              },
            ],
          };
          break;
        }

        case 'dates': {
          parsedData.formFields = {
            [customFieldType]: [
              {
                fieldEntityId: Number(key),
                [customFieldType.slice(0, -1)]: value, // value.toISOString(),
              },
            ],
          };
          break;
        }

        // texts || passwords
        default: {
          parsedData.formFields = {
            [customFieldType]: [
              {
                fieldEntityId: Number(key),
                [customFieldType.slice(0, -1)]: String(value),
              },
            ],
          };
          break;
        }
      }
    }

    return parsedData;
  }, {});
