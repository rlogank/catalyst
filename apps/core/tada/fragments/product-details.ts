import { graphql } from '../graphql';

import { PricesFragment } from './prices';

export const ProductDetailsFragment = graphql(
  `
    fragment ProductDetailsFragment on Product {
      entityId
      name
      description
      path
      ...PricesFragment
      brand {
        name
        path
      }
      defaultImage {
        url(width: $imageWidth, height: $imageHeight)
        altText
      }
      availabilityV2 {
        status
      }
      inventory {
        aggregated {
          availableToSell
        }
      }
      reviewSummary {
        averageRating
        numberOfReviews
      }
      categories {
        edges {
          node {
            name
            path
          }
        }
      }
      productOptions(first: 3) {
        edges {
          node {
            entityId
          }
        }
      }
    }
  `,
  [PricesFragment],
);
