import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { ProductCardFragment } from '~/components/product-card';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

export const RelatedProductsFragment = graphql(
  `
    fragment RelatedProductsFragment on Site {
      product(entityId: $entityId) {
        relatedProducts(first: $first) {
          edges {
            node {
              ...ProductCardFragment
            }
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
  const product = fragmentData.product;

  if (!product) {
    return null;
  }

  const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

  return <ProductCardCarousel data={relatedProducts} title="Related Products" />;
};
