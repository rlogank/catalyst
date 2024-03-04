import { graphql } from '~/tada/graphql';

import { MultipleChoiceFieldFragment } from './fields/multiple-choice-field/fragment';

export const ProductFormFragment = graphql(
  `
    fragment ProductFormFragment on Product {
      entityId
      availabilityV2 {
        status
      }
      productOptions {
        edges {
          node {
            __typename
            entityId
            ...MultipleChoiceFieldFragment
          }
        }
      }
    }
  `,
  [MultipleChoiceFieldFragment],
);
