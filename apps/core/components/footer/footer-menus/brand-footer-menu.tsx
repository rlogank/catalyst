import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { FragmentOf, readFragment } from 'gql.tada';

import { graphql } from '~/tada/graphql';

import { BaseFooterMenu } from './base-footer-menu';

export const BrandFooterMenuFragment = graphql(`
  fragment BrandFooterMenuFragment on Site {
    brands(first: 5) {
      edges {
        node {
          entityId
          name
          path
        }
      }
    }
  }
`);

interface Props {
  data: FragmentOf<typeof BrandFooterMenuFragment>;
}

export const BrandFooterMenu = ({ data }: Props) => {
  const fragmentData = readFragment(BrandFooterMenuFragment, data);
  const brands = removeEdgesAndNodes(fragmentData.brands);

  if (!brands.length) {
    return null;
  }

  return <BaseFooterMenu items={brands} title="Brands" />;
};
