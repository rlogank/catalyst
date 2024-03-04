import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { PRODUCT_DETAILS_FRAGMENT } from '../fragments/product-details';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

import { PRICES_FRAGMENT } from './get-product';

const GET_FEATURED_PRODUCTS_QUERY = /* GraphQL */ `
  query getFeaturedProducts($first: Int, $imageHeight: Int!, $imageWidth: Int!) {
    site {
      featuredProducts(first: $first) {
        edges {
          node {
            ...ProductDetails
          }
        }
      }
    }
  }
`;

interface Options {
  first?: number;
  imageWidth?: number;
  imageHeight?: number;
}

export const getFeaturedProducts = cache(
  async ({ first = 12, imageHeight = 300, imageWidth = 300 }: Options = {}) => {
    const query = graphql(GET_FEATURED_PRODUCTS_QUERY, [
      graphql(PRODUCT_DETAILS_FRAGMENT),
      graphql(PRICES_FRAGMENT),
    ]);
    const customerId = await getSessionCustomerId();

    const response = await client.fetch({
      document: query,
      variables: { first, imageWidth, imageHeight },
      customerId,
      fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const { site } = response.data;

    return removeEdgesAndNodes(site.featuredProducts).map((featuredProduct) => ({
      ...featuredProduct,
      productOptions: removeEdgesAndNodes(featuredProduct.productOptions),
    }));
  },
);
