import { ProductFormFragment } from '~/components/product-form/fragment';
import { graphql } from '~/tada/graphql';

import { ProductSchemaFragment } from '../product-schema';
import { ReviewSummaryFragment } from '../review-summary';

export const ProductDetailsFragment = graphql(
  `
    fragment ProductDetailsFragment on Product {
      entityId
      name
      sku
      upc
      minPurchaseQuantity
      maxPurchaseQuantity
      condition
      weight {
        value
        unit
      }
      availabilityV2 {
        description
      }
      brand {
        name
      }
      prices {
        priceRange {
          min {
            value
          }
          max {
            value
          }
        }
        retailPrice {
          value
        }
        salePrice {
          value
        }
        basePrice {
          value
        }
        price {
          value
        }
      }
      customFields {
        edges {
          node {
            entityId
            name
            value
          }
        }
      }
      reviewSummary {
        ...ReviewSummaryFragment
      }
      ...ProductSchemaFragment
      ...ProductFormFragment
    }
  `,
  [ReviewSummaryFragment, ProductSchemaFragment, ProductFormFragment],
);
