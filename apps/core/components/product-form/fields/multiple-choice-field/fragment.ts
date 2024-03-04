import { graphql } from '~/tada/graphql';

export const MultipleChoiceFieldFragment = graphql(`
  fragment MultipleChoiceFieldFragment on MultipleChoiceOption {
    __typename
    entityId
    displayName
    isRequired
    displayStyle
    values(first: 10) {
      edges {
        node {
          entityId
          label
          isDefault
          isSelected
          ... on SwatchOptionValue {
            __typename
            hexColors
            imageUrl(width: 36)
          }
          ... on ProductPickListOptionValue {
            __typename
            defaultImage {
              altText
              url(width: 48)
            }
            productId
          }
        }
      }
    }
  }
`);
