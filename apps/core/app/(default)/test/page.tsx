import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { execute, FragmentOf, graphql, readFragment } from '~/tada/graphql';

const FeaturedProductsFragment = graphql(`
  fragment FeaturedProductsFragment on Site {
    featuredProducts {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`);

const RootQuery = graphql(
  `
    query RootQuery {
      site {
        ...FeaturedProductsFragment
      }
    }
  `,
  [FeaturedProductsFragment],
);

const Content = ({ data }: { data: FragmentOf<typeof FeaturedProductsFragment> }) => {
  const rng = readFragment(FeaturedProductsFragment, data);
  const best = removeEdgesAndNodes(rng.featuredProducts).slice(0, 3);

  return <pre>{JSON.stringify(best, null, 2)}</pre>;
};

export default async function TestPage() {
  const data = await execute(RootQuery);

  return (
    <div>
      <Content data={data.site} />
    </div>
  );
}
