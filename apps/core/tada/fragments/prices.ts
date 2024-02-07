import { graphql } from '../graphql';

export const PricesFragment = graphql(`
  fragment PricesFragment on Product {
    prices {
      basePrice {
        currencyCode
        value
      }
      price {
        currencyCode
        value
      }
      retailPrice {
        currencyCode
        value
      }
      salePrice {
        currencyCode
        value
      }
      priceRange {
        min {
          value
          currencyCode
        }
        max {
          value
          currencyCode
        }
      }
    }
  }
`);
