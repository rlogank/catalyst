import { FragmentOf, graphql, readFragment } from '~/tada/graphql';

import { BaseFooterMenu } from './base-footer-menu';

export const CategoryFooterMenuFragment = graphql(`
  fragment CategoryFooterMenuFragment on Site {
    categoryTree {
      name
      path
    }
  }
`);

interface Props {
  data: FragmentOf<typeof CategoryFooterMenuFragment>;
}

export const CategoryFooterMenu = ({ data }: Props) => {
  const { categoryTree } = readFragment(CategoryFooterMenuFragment, data);

  if (!categoryTree.length) {
    return null;
  }

  return <BaseFooterMenu items={categoryTree} title="Categories" />;
};
