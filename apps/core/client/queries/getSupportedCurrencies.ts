import { cache } from 'react';

import { client } from '..';
import { graphql } from '../generated';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

export const GET_SUPPORTED_CURRENCIES_QUERY = /* GraphQL */ `
  query getSupportedCurrencies {
    site {
      currencies(first: 50) {
        edges {
          node {
            code
            name
            isActive
            isTransactional
            flagImage
          }
        }
      }
    }
  }
`;

export const getSupportedCurrencies = cache(async () => {
  const query = graphql(GET_SUPPORTED_CURRENCIES_QUERY);
  const response = await client.fetch({ document: query });

  return removeEdgesAndNodes(response.data.site.currencies);
});
