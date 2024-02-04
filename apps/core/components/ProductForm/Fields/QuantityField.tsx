import { Counter } from '@bigcommerce/catalyst-components/Counter';
import { Label } from '@bigcommerce/catalyst-components/Label';

import { useProductFieldController } from '../useProductForm';

export const QuantityField = () => {
  const { field } = useProductFieldController({
    name: 'quantity',
    rules: { required: true, min: 1 },
    defaultValue: 1,
  });

  return (
    <div className="@md:w-32">
      <Label className="mb-2 inline-block font-semibold" htmlFor="quantity">
        Quantity
      </Label>
      <Counter
        id="quantity"
        min={1}
        name={field.name}
        onChange={field.onChange}
        value={Number(field.value)}
      />
    </div>
  );
};
