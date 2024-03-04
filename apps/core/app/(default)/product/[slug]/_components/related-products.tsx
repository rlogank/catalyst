import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { ProductCard, ProductCardFragment } from '~/components/product-card';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

export const RelatedProductsFragment = graphql(
  `
    fragment RelatedProductsFragment on Product {
      relatedProducts(first: $firstRelatedProducts) {
        edges {
          node {
            ...ProductCardFragment
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

interface Props {
  data: FragmentOf<typeof RelatedProductsFragment>;
}

export const RelatedProducts = ({ data }: Props) => {
  const fragmentData = readFragment(RelatedProductsFragment, data);
  const relatedProducts = removeEdgesAndNodes(fragmentData.relatedProducts);

  return (
    <ProductCardCarousel title="Related Products">
      {relatedProducts.map((relatedProductsFragment, i) => (
        <ProductCard data={relatedProductsFragment} key={i} />
      ))}
    </ProductCardCarousel>
  );
};
