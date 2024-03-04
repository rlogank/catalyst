import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { PRODUCT_DETAILS_FRAGMENT } from '../fragments/product-details';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

import { GetProductOptions, PRICES_FRAGMENT } from './get-product';

const GET_RELATED_PRODUCTS = /* GraphQL */ `
  query getRelatedProducts(
    $entityId: Int!
    $optionValueIds: [OptionValueId!]
    $first: Int!
    $imageHeight: Int!
    $imageWidth: Int!
  ) {
    site {
      product(entityId: $entityId, optionValueIds: $optionValueIds) {
        relatedProducts(first: $first) {
          edges {
            node {
              ...ProductDetails
            }
          }
        }
      }
    }
  }
`;

export const getRelatedProducts = cache(
  async (
    options: GetProductOptions & {
      first?: number;
      imageWidth?: number;
      imageHeight?: number;
    },
  ) => {
    const { productId, optionValueIds, first = 12, imageWidth = 300, imageHeight = 300 } = options;

    const query = graphql(GET_RELATED_PRODUCTS, [
      graphql(PRODUCT_DETAILS_FRAGMENT),
      graphql(PRICES_FRAGMENT),
    ]);
    const customerId = await getSessionCustomerId();

    const response = await client.fetch({
      document: query,
      variables: { entityId: productId, optionValueIds, first, imageWidth, imageHeight },
      fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { product } = response.data.site;

    if (!product) {
      return [];
    }

    return removeEdgesAndNodes(product.relatedProducts).map((relatedProduct) => ({
      ...relatedProduct,
      productOptions: removeEdgesAndNodes(relatedProduct.productOptions),
    }));
  },
);
