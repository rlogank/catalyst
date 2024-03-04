import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { ProductForm } from '~/components/product-form';
import { FragmentOf, readFragment } from '~/tada/graphql';

import { ProductSchema } from '../product-schema';
import { ReviewSummary } from '../review-summary';

import { ProductDetailsFragment } from './fragment';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface Props {
  data: FragmentOf<typeof ProductDetailsFragment>;
}

export const ProductDetails = ({ data }: Props) => {
  const product = readFragment(ProductDetailsFragment, data);
  const customFields = removeEdgesAndNodes(product.customFields);

  const showPriceRange =
    product.prices?.priceRange.min.value !== product.prices?.priceRange.max.value;

  return (
    <div>
      {product.brand && (
        <p className="mb-2 font-semibold uppercase text-gray-500">{product.brand.name}</p>
      )}

      <h1 className="mb-4 text-h2">{product.name}</h1>

      <ReviewSummary data={product.reviewSummary} />

      {product.prices && (
        <div className="my-6 text-h4">
          {showPriceRange ? (
            <span>
              {currencyFormatter.format(product.prices.priceRange.min.value)} -{' '}
              {currencyFormatter.format(product.prices.priceRange.max.value)}
            </span>
          ) : (
            <>
              {product.prices.retailPrice?.value !== undefined && (
                <span>
                  MSRP:{' '}
                  <span className="line-through">
                    {currencyFormatter.format(product.prices.retailPrice.value)}
                  </span>
                  <br />
                </span>
              )}
              {product.prices.salePrice?.value !== undefined &&
              product.prices.basePrice?.value !== undefined ? (
                <>
                  <span>
                    Was:{' '}
                    <span className="line-through">
                      {currencyFormatter.format(product.prices.basePrice.value)}
                    </span>
                  </span>
                  <br />
                  <span>Now: {currencyFormatter.format(product.prices.salePrice.value)}</span>
                </>
              ) : (
                product.prices.price.value && (
                  <span>{currencyFormatter.format(product.prices.price.value)}</span>
                )
              )}
            </>
          )}
        </div>
      )}

      <ProductForm data={product} />

      <div className="my-12">
        <h2 className="mb-4 text-h5">Additional details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Boolean(product.sku) && (
            <div>
              <h3 className="text-base font-bold">SKU</h3>
              <p>{product.sku}</p>
            </div>
          )}
          {Boolean(product.upc) && (
            <div>
              <h3 className="text-base font-bold">UPC</h3>
              <p>{product.upc}</p>
            </div>
          )}
          {Boolean(product.minPurchaseQuantity) && (
            <div>
              <h3 className="text-base font-bold">Minimum purchase</h3>
              <p>{product.minPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.maxPurchaseQuantity) && (
            <div>
              <h3 className="text-base font-bold">Maxiumum purchase</h3>
              <p>{product.maxPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.availabilityV2.description) && (
            <div>
              <h3 className="text-base font-bold">Availability</h3>
              <p>{product.availabilityV2.description}</p>
            </div>
          )}
          {Boolean(product.condition) && (
            <div>
              <h3 className="text-base font-bold">Condition</h3>
              <p>{product.condition}</p>
            </div>
          )}
          {Boolean(product.weight) && (
            <div>
              <h3 className="text-base font-bold">Weight</h3>
              <p>
                {product.weight?.value} {product.weight?.unit}
              </p>
            </div>
          )}
          {Boolean(customFields) &&
            customFields.map((customField) => (
              <div key={customField.entityId}>
                <h3 className="text-base font-bold">{customField.name}</h3>
                <p>{customField.value}</p>
              </div>
            ))}
        </div>
      </div>

      <ProductSchema data={product} />
    </div>
  );
};
